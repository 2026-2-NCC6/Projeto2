import csv
from datetime import datetime
import json
from pathlib import Path
import re
import shutil
from typing import Annotated, Any, Optional

from fastapi import Depends, HTTPException, UploadFile, status

from app.core.database import SessionDep
from app.core.datalab_database import DataLabSessionDep
from app.models.entities import ModeloIA
from app.repositories.datalab_repository import DataLabRepository
from app.repositories.ia_repository import ModeloIARepository
from app.repositories.movimento_nosql_repository import MovimentoNoSQLRepository
from app.schemas.datalab import (
    AgenteTesteCreate,
    AgenteTesteResponse,
    AmostraDatalabCreate,
    AmostraDatalabResponse,
    ArticulacaoResponse,
    EsporteCreate,
    EsporteResponse,
    MovimentoCreate,
    MovimentoResponse,
)
from app.schemas.ia import (
    AvaliacaoModeloResponse,
    ProjetoModeloCreate,
    TestarInferenciaRequest,
    TreinarModeloRequest,
)
from app.services.ml_training_engine import ml_engine

STORAGE_MODELOS_DIR = Path("./storage/modelos")


def slugify(texto: str) -> str:
    texto = texto.lower().strip()
    texto = re.sub(r"[^\w\s-]", "", texto)
    return re.sub(r"[\s_-]+", "_", texto)


class ModeloIAService:
    """
    Camada de Regra de Negócios para MLOps:
    - Gerenciamento de versões treinadas de modelos de IA e distribuição OTA (SQLite principal).
    - Catálogo e dataset de treino paralelo: Esportes, Articulações, Movimentos, Agentes de Teste
      com perfil biométrico e Amostras de telemetria com exportação CSV/JSON (datalab_ia.db).
    """

    def __init__(
        self,
        ia_repo: ModeloIARepository,
        nosql_repo: MovimentoNoSQLRepository,
        datalab_repo: DataLabRepository,
    ) -> None:
        self.ia_repo = ia_repo
        self.nosql_repo = nosql_repo
        self.datalab_repo = datalab_repo
        STORAGE_MODELOS_DIR.mkdir(parents=True, exist_ok=True)

    # ==========================
    # MODELOS DE IA (OTA)
    # ==========================
    def publicar_novo_modelo(
        self,
        arquivo: UploadFile,
        versao: str,
        modalidade: str,
        formato: str,
        acuracia: Optional[float],
        changelog: Optional[str],
        ativar_imediatamente: bool = True,
    ) -> ModeloIA:
        if self.ia_repo.get_by_versao_e_modalidade(versao, modalidade):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A versão '{versao}' já existe para a modalidade '{modalidade}'.",
            )

        extensao = Path(arquivo.filename or "modelo.bin").suffix or f".{formato}"
        nome_seguro = f"flux_{modalidade}_v{versao.replace('.', '_')}{extensao}"
        destino = STORAGE_MODELOS_DIR / nome_seguro

        with destino.open("wb") as buffer:
            shutil.copyfileobj(arquivo.file, buffer)

        if ativar_imediatamente:
            self.ia_repo.desativar_todos_da_modalidade(modalidade)

        novo_modelo = ModeloIA(
            versao=versao,
            modalidade=modalidade,
            formato=formato,
            acuracia=acuracia,
            caminho_arquivo=str(destino),
            changelog=changelog,
            ativo=ativar_imediatamente,
        )
        return self.ia_repo.create(novo_modelo)

    def listar_modelos(self, modalidade: Optional[str] = None) -> list[ModeloIA]:
        return self.ia_repo.list_all(modalidade)

    def obter_modelo_ativo(self, modalidade: str) -> ModeloIA:
        modelo = self.ia_repo.get_ativo_by_modalidade(modalidade)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Nenhum modelo de IA ativo para a modalidade '{modalidade}'.",
            )
        return modelo

    def ativar_versao(self, id_modelo: str) -> ModeloIA:
        modelo = self.ia_repo.get_by_id(id_modelo)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Modelo de IA não encontrado.",
            )

        self.ia_repo.desativar_todos_da_modalidade(modelo.modalidade)
        modelo.ativo = True
        self.ia_repo.session.commit()
        self.ia_repo.session.refresh(modelo)
        return modelo

    def obter_caminho_download(self, id_modelo: str) -> tuple[Path, ModeloIA]:
        modelo = self.ia_repo.get_by_id(id_modelo)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Modelo de IA não encontrado.",
            )

        caminho = Path(modelo.caminho_arquivo)
        if not caminho.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo binário do modelo não encontrado no armazenamento do servidor.",
            )
        return caminho, modelo

    def exportar_telemetria_para_treino(self) -> list[dict[str, Any]]:
        return self.nosql_repo.listar_todos()

    # ==========================
    # CATÁLOGO: ESPORTES
    # ==========================
    def listar_esportes(self) -> list[EsporteResponse]:
        return [EsporteResponse.model_validate(e) for e in self.datalab_repo.listar_esportes()]

    def criar_esporte(self, dados: EsporteCreate) -> EsporteResponse:
        id_slug = dados.id or slugify(dados.nome)
        existente = self.datalab_repo.buscar_esporte_por_id(id_slug)
        if existente:
            return EsporteResponse.model_validate(existente)
        esporte = self.datalab_repo.criar_esporte(
            id_esporte=id_slug,
            nome=dados.nome,
            icone=dados.icone,
            descricao=dados.descricao,
        )
        return EsporteResponse.model_validate(esporte)

    # ==========================
    # CATÁLOGO: ARTICULAÇÕES
    # ==========================
    def listar_articulacoes(self) -> list[ArticulacaoResponse]:
        return [ArticulacaoResponse.model_validate(a) for a in self.datalab_repo.listar_articulacoes()]

    # ==========================
    # CATÁLOGO: MOVIMENTOS (1:N com Esporte)
    # ==========================
    def listar_movimentos(self, esporte_id: Optional[str] = None) -> list[MovimentoResponse]:
        return [
            MovimentoResponse.model_validate(m)
            for m in self.datalab_repo.listar_movimentos(esporte_id=esporte_id)
        ]

    def criar_movimento(self, dados: MovimentoCreate) -> MovimentoResponse:
        esporte = self.datalab_repo.buscar_esporte_por_id(dados.esporte_id)
        if not esporte:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Esporte '{dados.esporte_id}' não encontrado no catálogo.",
            )

        id_slug = dados.id or f"{dados.esporte_id}_{slugify(dados.nome)}"
        existente = self.datalab_repo.buscar_movimento_por_id(id_slug)
        if existente:
            return MovimentoResponse.model_validate(existente)

        mov = self.datalab_repo.criar_movimento(
            id_movimento=id_slug,
            nome=dados.nome,
            esporte_id=dados.esporte_id,
            articulacao_padrao_id=dados.articulacao_padrao_id or "pulso",
            descricao=dados.descricao,
        )
        return MovimentoResponse.model_validate(mov)

    # ==========================
    # CATÁLOGO: AGENTES DE TESTE (PERFIL CORPORAL / ANTROPOMÉTRICO)
    # ==========================
    def listar_agentes(self) -> list[AgenteTesteResponse]:
        return [AgenteTesteResponse.model_validate(a) for a in self.datalab_repo.listar_agentes()]

    def criar_agente(self, dados: AgenteTesteCreate) -> AgenteTesteResponse:
        agente = self.datalab_repo.criar_agente(dados.model_dump())
        return AgenteTesteResponse.model_validate(agente)

    # ==========================
    # DATASET: AMOSTRAS ROTULADAS
    # ==========================
    def salvar_amostra_datalab(
        self,
        dados: AmostraDatalabCreate,
        autor_id: str,
        autor_username: Optional[str] = None,
    ) -> AmostraDatalabResponse:
        # 1. Validação de Articulação e regra de lateralidade
        articulacao = self.datalab_repo.buscar_articulacao_por_id(dados.articulacao_id)
        if not articulacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Articulação '{dados.articulacao_id}' não encontrada.",
            )

        # Regra de lateralidade: se a articulação não possui lateralidade (ex: peito, cabeça), fixa 'central'
        posicao = dados.posicao_lateralidade.lower()
        if not articulacao.possui_lateralidade:
            posicao = "central"
        elif posicao not in ("direita", "esquerda"):
            posicao = "direita"

        payload = dados.model_dump()
        payload["posicao_lateralidade"] = posicao
        payload["autor_id"] = autor_id
        payload["autor_username"] = autor_username

        entidade = self.datalab_repo.salvar_amostra(payload)
        self._sincronizar_arquivos_dataset_disco()
        return self._formatar_amostra_response(entidade)

    def listar_amostras_datalab(
        self,
        esporte_id: Optional[str] = None,
        movimento_id: Optional[str] = None,
        agente_id: Optional[str] = None,
    ) -> list[AmostraDatalabResponse]:
        entidades = self.datalab_repo.listar_amostras(
            esporte_id=esporte_id,
            movimento_id=movimento_id,
            agente_id=agente_id,
        )
        return [self._formatar_amostra_response(e) for e in entidades]

    def excluir_amostra_datalab(self, id_amostra: str) -> bool:
        ok = self.datalab_repo.excluir_amostra(id_amostra)
        if not ok:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Amostra de treino não encontrada.",
            )
        self._sincronizar_arquivos_dataset_disco()
        return True

    def reiniciar_ou_excluir_amostras(
        self,
        ids: Optional[list[str]] = None,
        esporte_id: Optional[str] = None,
        movimento_id: Optional[str] = None,
        articulacao_id: Optional[str] = None,
        agente_id: Optional[str] = None,
        reiniciar_modelo: bool = True,
    ) -> dict[str, Any]:
        """
        Exclui amostras em lote (respeitando filtros) e, caso solicitado ou caso todas
        as amostras do modelo tenham sido excluídas, reinicia o modelo em disco.
        """
        total_removidas = self.datalab_repo.excluir_amostras_lote(
            ids=ids,
            esporte_id=esporte_id,
            movimento_id=movimento_id,
            articulacao_id=articulacao_id,
            agente_id=agente_id,
        )

        # Sincroniza arquivos do dataset em disco
        self._sincronizar_arquivos_dataset_disco()

        modelo_reiniciado = False
        esp_alvo = esporte_id or "tenis"
        modelo_id = f"flux_{esp_alvo}"
        amostras_restantes = self.datalab_repo.listar_amostras(esporte_id=esp_alvo, limite=1)

        if reiniciar_modelo or len(amostras_restantes) == 0:
            import shutil
            # Reseta as pastas de modelos para este modelo_id
            pasta_modelo = Path("./storage/models") / modelo_id
            if pasta_modelo.exists():
                for item in pasta_modelo.iterdir():
                    if item.is_dir():
                        shutil.rmtree(item, ignore_errors=True)

                proj_file = pasta_modelo / "project_info.json"
                info = {
                    "modelo_id": modelo_id,
                    "nome": modelo_id,
                    "esporte_id": esp_alvo,
                    "descricao": "Classificador Biomecânico",
                    "classes_alvo": ["tenis_forehand", "tenis_backhand", "tenis_saque"],
                    "criado_em": datetime.now().isoformat(),
                    "versao_ativa": None,
                }
                proj_file.write_text(json.dumps(info, indent=2, ensure_ascii=False), encoding="utf-8")
                modelo_reiniciado = True

            # Se não sobrou nenhuma amostra, limpa pasta datasets do modelo
            pasta_dataset_mod = Path("./storage/datasets") / modelo_id
            if len(amostras_restantes) == 0 and pasta_dataset_mod.exists():
                pasta_amostras = pasta_dataset_mod / "amostras"
                if pasta_amostras.exists():
                    shutil.rmtree(pasta_amostras, ignore_errors=True)
                    pasta_amostras.mkdir(parents=True, exist_ok=True)

                manifesto_file = pasta_dataset_mod / "manifesto.json"
                manifesto = {
                    "modelo_id": modelo_id,
                    "esporte_id": esp_alvo,
                    "atualizado_em": datetime.now().isoformat(),
                    "total_amostras": 0,
                    "total_frames": 0,
                    "duracao_media_ms": 0.0,
                    "amostras_por_golpe": {},
                    "arquivos_individuais": 0,
                }
                manifesto_file.write_text(json.dumps(manifesto, indent=2, ensure_ascii=False), encoding="utf-8")

                csv_consolidado = pasta_dataset_mod / "dataset_consolidado.csv"
                with open(csv_consolidado, "w", newline="", encoding="utf-8") as f_cons:
                    w = csv.writer(f_cons)
                    w.writerow(["amostra_id", "esporte", "movimento", "articulacao", "lateralidade", "frame_id", "timestamp_ms", "ax", "ay", "az", "gx", "gy", "gz", "resultante_accel", "temperatura", "coletado_em"])

        return {
            "sucesso": True,
            "total_excluidas": total_removidas,
            "modelo_reiniciado": modelo_reiniciado,
        }

    def obter_estatisticas_datalab(self) -> dict[str, Any]:
        return self.datalab_repo.obter_estatisticas()

    def _sincronizar_arquivos_dataset_disco(self) -> None:
        """
        Mantém os arquivos físicos do dataset segregados por modelo e por gravação em storage/datasets/{modelo_id}/:
        1. storage/datasets/{modelo_id}/amostras/{data}_{mov}_{id}.json e .csv
        2. storage/datasets/{modelo_id}/dataset_consolidado.csv
        3. storage/datasets/{modelo_id}/manifesto.json
        """
        try:
            amostras = self.datalab_repo.listar_amostras(limite=5000)
            base_datasets = Path("./storage/datasets")
            base_datasets.mkdir(parents=True, exist_ok=True)

            # Agrupa amostras por modelo_id
            amostras_por_modelo: dict[str, list[Any]] = {}
            for a in amostras:
                mod_id = f"flux_{a.esporte_id}"
                if mod_id not in amostras_por_modelo:
                    amostras_por_modelo[mod_id] = []
                amostras_por_modelo[mod_id].append(a)

            for mod_id, lista in amostras_por_modelo.items():
                pasta_mod = base_datasets / mod_id
                pasta_amostras = pasta_mod / "amostras"
                pasta_amostras.mkdir(parents=True, exist_ok=True)

                ids_atuais = set()

                for a in lista:
                    try:
                        dt = a.coletado_em if isinstance(a.coletado_em, datetime) else datetime.now()
                    except Exception:
                        dt = datetime.now()

                    dt_str = dt.strftime("%Y%m%d_%H%M%S")
                    mov_curto = a.movimento_id.replace("tenis_", "").replace("padel_", "")
                    id_curto = str(a.id)[:8]
                    prefixo = f"{dt_str}_{mov_curto}_{id_curto}"
                    ids_atuais.add(f"{prefixo}.json")
                    ids_atuais.add(f"{prefixo}.csv")

                    frames = json.loads(a.frames_json) if a.frames_json else []

                    # JSON individual
                    json_file = pasta_amostras / f"{prefixo}.json"
                    payload_indiv = {
                        "id": a.id,
                        "esporte_id": a.esporte_id,
                        "movimento_id": a.movimento_id,
                        "articulacao_id": a.articulacao_id,
                        "posicao_lateralidade": a.posicao_lateralidade,
                        "taxa_amostragem_hz": a.taxa_amostragem_hz,
                        "duracao_ms": a.duracao_ms,
                        "total_frames": len(frames),
                        "coletado_em": a.coletado_em.isoformat() if hasattr(a.coletado_em, "isoformat") else str(a.coletado_em),
                        "notas": a.notas,
                        "frames": frames,
                    }
                    json_file.write_text(json.dumps(payload_indiv, indent=2, ensure_ascii=False), encoding="utf-8")

                    # CSV individual
                    csv_file = pasta_amostras / f"{prefixo}.csv"
                    with open(csv_file, "w", newline="", encoding="utf-8") as f_indiv:
                        w = csv.writer(f_indiv)
                        w.writerow(["frame_id", "timestamp_ms", "ax", "ay", "az", "gx", "gy", "gz", "resultante_accel", "temperatura"])
                        for fr in frames:
                            w.writerow([
                                fr.get("frame_id", 0),
                                fr.get("timestamp_ms", 0),
                                fr.get("ax", 0.0), fr.get("ay", 0.0), fr.get("az", 0.0),
                                fr.get("gx", 0.0), fr.get("gy", 0.0), fr.get("gz", 0.0),
                                fr.get("resultante_accel", 0.0),
                                fr.get("temperatura", 0.0),
                            ])

                # Limpa arquivos órfãos (caso uma amostra tenha sido excluída)
                for arq_existente in pasta_amostras.iterdir():
                    if arq_existente.is_file() and arq_existente.name not in ids_atuais:
                        arq_existente.unlink()

                # dataset_consolidado.csv do modelo
                csv_consolidado = pasta_mod / "dataset_consolidado.csv"
                with open(csv_consolidado, "w", newline="", encoding="utf-8") as f_cons:
                    w = csv.writer(f_cons)
                    w.writerow(["amostra_id", "esporte", "movimento", "articulacao", "lateralidade", "frame_id", "timestamp_ms", "ax", "ay", "az", "gx", "gy", "gz", "resultante_accel", "temperatura", "coletado_em"])
                    for a in lista:
                        frames = json.loads(a.frames_json) if a.frames_json else []
                        for fr in frames:
                            w.writerow([
                                a.id, a.esporte_id, a.movimento_id, a.articulacao_id, a.posicao_lateralidade,
                                fr.get("frame_id", 0), fr.get("timestamp_ms", 0),
                                fr.get("ax", 0.0), fr.get("ay", 0.0), fr.get("az", 0.0),
                                fr.get("gx", 0.0), fr.get("gy", 0.0), fr.get("gz", 0.0),
                                fr.get("resultante_accel", 0.0), fr.get("temperatura", 0.0),
                                a.coletado_em.isoformat() if hasattr(a.coletado_em, "isoformat") else str(a.coletado_em),
                            ])

                # manifesto.json do modelo
                manifesto_file = pasta_mod / "manifesto.json"
                distrib = {}
                for a in lista:
                    distrib[a.movimento_id] = distrib.get(a.movimento_id, 0) + 1
                total_f = sum(a.total_frames for a in lista)
                dur_med = sum(a.duracao_ms for a in lista) / max(1, len(lista))
                manifesto = {
                    "modelo_id": mod_id,
                    "esporte_id": lista[0].esporte_id if lista else "",
                    "atualizado_em": datetime.now().isoformat(),
                    "total_amostras": len(lista),
                    "total_frames": total_f,
                    "duracao_media_ms": round(dur_med, 1),
                    "amostras_por_golpe": distrib,
                    "arquivos_individuais": len(lista) * 2,
                }
                manifesto_file.write_text(json.dumps(manifesto, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass

    # ==========================
    # EXPORTAÇÃO CSV E JSON
    # ==========================
    def exportar_dataset_csv(self) -> str:
        return self.datalab_repo.exportar_dataset_csv()

    def exportar_dataset_json(self) -> dict[str, Any]:
        amostras = self.datalab_repo.listar_amostras(limite=5000)
        estatisticas = self.datalab_repo.obter_estatisticas()

        itens = []
        for a in amostras:
            itens.append({
                "id": a.id,
                "agente": {
                    "id": a.agente.id if a.agente else None,
                    "nome": a.agente.nome if a.agente else None,
                    "sexo_biologico": a.agente.sexo_biologico if a.agente else None,
                    "idade": a.agente.idade if a.agente else None,
                    "peso_kg": a.agente.peso_kg if a.agente else None,
                    "altura_cm": a.agente.altura_cm if a.agente else None,
                    "braco_direito_cm": a.agente.braco_direito_cm if a.agente else None,
                    "braco_esquerdo_cm": a.agente.braco_esquerdo_cm if a.agente else None,
                    "perna_direita_cm": a.agente.perna_direita_cm if a.agente else None,
                    "perna_esquerda_cm": a.agente.perna_esquerda_cm if a.agente else None,
                    "torax_cm": a.agente.torax_cm if a.agente else None,
                    "peito_cm": a.agente.peito_cm if a.agente else None,
                    "cabeca_cm": a.agente.cabeca_cm if a.agente else None,
                },
                "esporte": a.esporte.nome if a.esporte else a.esporte_id,
                "movimento": a.movimento.nome if a.movimento else a.movimento_id,
                "articulacao": a.articulacao.nome if a.articulacao else a.articulacao_id,
                "posicao_lateralidade": a.posicao_lateralidade,
                "taxa_amostragem_hz": a.taxa_amostragem_hz,
                "duracao_ms": a.duracao_ms,
                "total_frames": a.total_frames,
                "frames": json.loads(a.frames_json) if a.frames_json else [],
                "notas": a.notas,
                "coletado_em": a.coletado_em.isoformat() if a.coletado_em else None,
            })

        return {
            "dataset_info": {
                "nome": "FLUX IMU Biomechanical Dataset",
                "versao": "2.0.0",
                "total_amostras": estatisticas["total_amostras"],
                "total_frames": estatisticas["total_frames"],
                "distribuicao_movimentos": estatisticas["distribuicao_movimentos"],
                "distribuicao_esportes": estatisticas["distribuicao_esportes"],
            },
            "amostras": itens,
        }

    def _formatar_amostra_response(self, entidade) -> AmostraDatalabResponse:
        frames_list = json.loads(entidade.frames_json) if entidade.frames_json else []
        return AmostraDatalabResponse(
            id=entidade.id,
            agente_id=entidade.agente_id,
            agente_nome=entidade.agente.nome if getattr(entidade, "agente", None) else None,
            esporte_id=entidade.esporte_id,
            esporte_nome=entidade.esporte.nome if getattr(entidade, "esporte", None) else None,
            movimento_id=entidade.movimento_id,
            movimento_nome=entidade.movimento.nome if getattr(entidade, "movimento", None) else None,
            articulacao_id=entidade.articulacao_id,
            articulacao_nome=entidade.articulacao.nome if getattr(entidade, "articulacao", None) else None,
            posicao_lateralidade=entidade.posicao_lateralidade,
            taxa_amostragem_hz=entidade.taxa_amostragem_hz,
            duracao_ms=entidade.duracao_ms,
            total_frames=entidade.total_frames,
            frames=frames_list,
            notas=entidade.notas,
            autor_id=entidade.autor_id,
            autor_username=entidade.autor_username,
            coletado_em=entidade.coletado_em,
        )

    # ==========================
    # PIPELINE MLOPS & TREINO
    # ==========================
    def listar_projetos_modelos(self) -> list[dict[str, Any]]:
        projetos = ml_engine.listar_projetos_modelos()
        # Se ainda não houver nenhum projeto criado, auto-inicializa o projeto de referência de tênis
        if not projetos:
            ml_engine.registrar_projeto_modelo(
                modelo_id="flux_tenis_v1",
                nome="Classificador de Golpes de Tênis",
                esporte_id="tenis",
                descricao="Modelo biomecânico multi-classe para detecção e classificação de Forehand, Backhand e Saque",
                classes_alvo=["tenis_forehand", "tenis_backhand", "tenis_saque"],
            )
            projetos = ml_engine.listar_projetos_modelos()
        return projetos

    def criar_projeto_modelo(self, dados: ProjetoModeloCreate) -> dict[str, Any]:
        return ml_engine.registrar_projeto_modelo(
            modelo_id=dados.modelo_id,
            nome=dados.nome,
            esporte_id=dados.esporte_id,
            descricao=dados.descricao or "",
            classes_alvo=dados.classes_alvo,
        )

    def treinar_modelo_projeto(
        self,
        modelo_id: str,
        dados: TreinarModeloRequest,
        autor: str = "Dev",
    ) -> dict[str, Any]:
        # Busca amostras coletadas no banco do DataLab
        amostras_entidades = self.datalab_repo.listar_amostras(esporte_id=dados.esporte_id, limite=1000)
        amostras_brutas = []
        for a in amostras_entidades:
            try:
                frames_list = json.loads(a.frames_json) if isinstance(a.frames_json, str) else []
            except Exception:
                frames_list = []
            amostras_brutas.append({
                "id": a.id,
                "agente_id": a.agente_id,
                "esporte_id": a.esporte_id,
                "movimento_id": a.movimento_id,
                "duracao_ms": a.duracao_ms,
                "frames": frames_list,
            })

        if not amostras_brutas:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Não é possível gerar o modelo: nenhuma amostra catalogada para o esporte '{dados.esporte_id or 'tenis'}'.",
            )

        # Validação: só permite treinar se a quantidade de amostras tiver aumentado em relação à versão anterior
        projetos = ml_engine.listar_projetos_modelos()
        proj = next((p for p in projetos if p["modelo_id"] == modelo_id), None)
        if proj and proj.get("versoes"):
            amostras_anteriores = [
                v.get("total_amostras", 0)
                for v in proj["versoes"]
                if v.get("status") == "pronto" and isinstance(v.get("total_amostras"), (int, float))
            ]
            maior_amostras_anterior = max(amostras_anteriores) if amostras_anteriores else 0
            if maior_amostras_anterior > 0 and len(amostras_brutas) <= maior_amostras_anterior:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Não é possível gerar um novo modelo: o dataset atual possui {len(amostras_brutas)} amostra(s), "
                        f"quantidade que não é superior à versão anterior ({maior_amostras_anterior} amostra(s)). "
                        f"Grave novos movimentos no Gravador de IA antes de gerar uma nova versão."
                    ),
                )

        resultado = ml_engine.treinar_versao_modelo(
            modelo_id=modelo_id,
            versao=dados.versao,
            esporte_id=dados.esporte_id or "tenis",
            amostras_brutas=amostras_brutas,
            autor=autor,
        )

        # Registra também no histórico de OTA do SQLite principal
        try:
            caminho_pesos = f"./storage/models/{modelo_id}/{dados.versao}/model_weights.json"
            self.ia_repo.create(
                ModeloIA(
                    versao=dados.versao,
                    modalidade=dados.esporte_id or "tenis",
                    formato="json_weights",
                    acuracia=resultado["acuracia"],
                    caminho_arquivo=caminho_pesos,
                    changelog=f"Treinamento automatizado via DataLab com {resultado['total_amostras']} amostras",
                    ativo=True,
                )
            )
        except Exception:
            pass

        return resultado

    def testar_inferencia_modelo(
        self,
        modelo_id: str,
        dados: TestarInferenciaRequest,
    ) -> dict[str, Any]:
        # Se não especificou versão, obtém a mais recente
        versao = dados.versao
        if not versao:
            projetos = ml_engine.listar_projetos_modelos()
            proj = next((p for p in projetos if p["modelo_id"] == modelo_id), None)
            if proj and proj.get("versoes"):
                versao = proj["versoes"][0]["versao"]
            else:
                versao = "v1.0.0"

        frames_dict = [f.model_dump() for f in (dados.frames or [])]
        return ml_engine.testar_inferencia(
            modelo_id=modelo_id,
            versao=versao,
            frames=frames_dict,
        )

    def obter_avaliacao_modelo(
        self,
        modelo_id: str,
        versao: Optional[str] = None,
    ) -> AvaliacaoModeloResponse:
        """
        Retorna o painel completo de avaliação MLOps:
        - Curvas de evolução histórica (acurácia e amostras por versão)
        - Matriz de confusão por classe
        - Precisão, Recall e F1 por golpe
        - Top features biomecânicas
        - Distribuição de classes
        """
        try:
            dados = ml_engine.obter_avaliacao_modelo(modelo_id=modelo_id, versao_desejada=versao)
            return AvaliacaoModeloResponse(**dados)
        except FileNotFoundError as e:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Falha ao gerar relatório de avaliação do modelo: {str(e)}",
            )


def get_ia_service(
    session: SessionDep,
    datalab_session: DataLabSessionDep,
) -> ModeloIAService:
    return ModeloIAService(
        ia_repo=ModeloIARepository(session),
        nosql_repo=MovimentoNoSQLRepository(),
        datalab_repo=DataLabRepository(datalab_session),
    )


ModeloIAServiceDep = Annotated[ModeloIAService, Depends(get_ia_service)]
