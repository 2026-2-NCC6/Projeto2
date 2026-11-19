import csv
from io import StringIO
import json
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.datalab_database import DataLabBase, datalab_engine
from app.models.datalab_entities import (
    AgenteTesteEntity,
    AmostraTreinoEntity,
    ArticulacaoEntity,
    EsporteEntity,
    MovimentoEntity,
)


class DataLabRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    @classmethod
    def inicializar_banco_e_seeds(cls) -> None:
        """Cria as tabelas no SQLite paralelo e popula os seeds padrão caso vazio."""
        DataLabBase.metadata.create_all(bind=datalab_engine)

        with Session(datalab_engine) as session:
            # 1. Articulações padrão
            articulacoes_existentes = session.scalars(select(ArticulacaoEntity)).all()
            if not articulacoes_existentes:
                articulacoes_iniciais = [
                    ArticulacaoEntity(id="pulso", nome="Pulso", icone="✋", possui_lateralidade=True, descricao="Articulação distal do membro superior (bracelete padrão)"),
                    ArticulacaoEntity(id="cotovelo", nome="Cotovelo", icone="💪", possui_lateralidade=True, descricao="Articulação intermediária do braço"),
                    ArticulacaoEntity(id="tornozelo", nome="Tornozelo", icone="🦶", possui_lateralidade=True, descricao="Articulação distal do membro inferior"),
                    ArticulacaoEntity(id="joelho", nome="Joelho", icone="🦿", possui_lateralidade=True, descricao="Articulação intermediária da perna"),
                    ArticulacaoEntity(id="quadril", nome="Quadril / Pelve", icone="🥋", possui_lateralidade=False, descricao="Centro de massa e rotação do tronco"),
                    ArticulacaoEntity(id="peito", nome="Peito / Tórax", icone="🫀", possui_lateralidade=False, descricao="Região central do tórax"),
                    ArticulacaoEntity(id="cabeca", nome="Cabeça", icone="🪖", possui_lateralidade=False, descricao="Topo do eixo vertical"),
                ]
                session.add_all(articulacoes_iniciais)
                session.commit()

            # 2. Esporte padrão: Tênis
            esporte_tenis = session.scalar(select(EsporteEntity).where(EsporteEntity.id == "tenis"))
            if not esporte_tenis:
                esporte_tenis = EsporteEntity(
                    id="tenis",
                    nome="Tênis",
                    icone="🎾",
                    descricao="Tênis de quadra tradicional (golpes de raquete)",
                    ativo=True,
                )
                session.add(esporte_tenis)
                session.commit()

            # 3. Movimentos do Tênis
            movimentos_existentes = session.scalars(
                select(MovimentoEntity).where(MovimentoEntity.esporte_id == "tenis")
            ).all()
            if not movimentos_existentes:
                golpes_tenis = [
                    MovimentoEntity(id="tenis_forehand", nome="Forehand", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Golpe de direita"),
                    MovimentoEntity(id="tenis_backhand", nome="Backhand", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Golpe de esquerda"),
                    MovimentoEntity(id="tenis_saque", nome="Saque", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Serviço inicial por cima da cabeça"),
                    MovimentoEntity(id="tenis_smash", nome="Smash", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Golpe aéreo potente"),
                    MovimentoEntity(id="tenis_slice", nome="Slice", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Golpe cortado com efeito"),
                    MovimentoEntity(id="tenis_repouso", nome="Repouso", esporte_id="tenis", articulacao_padrao_id="pulso", descricao="Postura neutra de espera"),
                ]
                session.add_all(golpes_tenis)
                session.commit()

            # 4. Agente de Teste Padrão (Dev)
            agente_existente = session.scalar(select(AgenteTesteEntity).limit(1))
            if not agente_existente:
                agente_padrao = AgenteTesteEntity(
                    id="dev-agente-01",
                    nome="Atleta Padrão (Dev)",
                    sexo_biologico="masculino",
                    idade=25,
                    peso_kg=75.0,
                    altura_cm=178.0,
                    braco_direito_cm=65.0,
                    braco_esquerdo_cm=65.0,
                    perna_direita_cm=90.0,
                    perna_esquerda_cm=90.0,
                    torax_cm=96.0,
                    peito_cm=98.0,
                    cabeca_cm=57.0,
                    notas="Perfil de referência antropométrica inicial para validação dos algoritmos de IA",
                )
                session.add(agente_padrao)
                session.commit()

    # ==========================
    # ESPORTES
    # ==========================
    def listar_esportes(self) -> list[EsporteEntity]:
        stmt = select(EsporteEntity).where(EsporteEntity.ativo.is_(True)).order_by(EsporteEntity.nome)
        return list(self.session.scalars(stmt).all())

    def buscar_esporte_por_id(self, id_esporte: str) -> Optional[EsporteEntity]:
        return self.session.get(EsporteEntity, id_esporte)

    def criar_esporte(self, id_esporte: str, nome: str, icone: str, descricao: Optional[str] = None) -> EsporteEntity:
        esporte = EsporteEntity(id=id_esporte, nome=nome, icone=icone, descricao=descricao, ativo=True)
        self.session.add(esporte)
        self.session.commit()
        self.session.refresh(esporte)
        return esporte

    # ==========================
    # ARTICULAÇÕES
    # ==========================
    def listar_articulacoes(self) -> list[ArticulacaoEntity]:
        stmt = select(ArticulacaoEntity)
        return list(self.session.scalars(stmt).all())

    def buscar_articulacao_por_id(self, id_articulacao: str) -> Optional[ArticulacaoEntity]:
        return self.session.get(ArticulacaoEntity, id_articulacao)

    # ==========================
    # MOVIMENTOS (1:N com Esporte)
    # ==========================
    def listar_movimentos(self, esporte_id: Optional[str] = None) -> list[MovimentoEntity]:
        stmt = select(MovimentoEntity).where(MovimentoEntity.ativo.is_(True))
        if esporte_id:
            stmt = stmt.where(MovimentoEntity.esporte_id == esporte_id)
        stmt = stmt.order_by(MovimentoEntity.nome)
        return list(self.session.scalars(stmt).all())

    def buscar_movimento_por_id(self, id_movimento: str) -> Optional[MovimentoEntity]:
        return self.session.get(MovimentoEntity, id_movimento)

    def criar_movimento(
        self, id_movimento: str, nome: str, esporte_id: str, articulacao_padrao_id: Optional[str] = "pulso", descricao: Optional[str] = None
    ) -> MovimentoEntity:
        mov = MovimentoEntity(
            id=id_movimento,
            nome=nome,
            esporte_id=esporte_id,
            articulacao_padrao_id=articulacao_padrao_id,
            descricao=descricao,
            ativo=True,
        )
        self.session.add(mov)
        self.session.commit()
        self.session.refresh(mov)
        return mov

    # ==========================
    # AGENTES DE TESTE
    # ==========================
    def listar_agentes(self) -> list[AgenteTesteEntity]:
        stmt = select(AgenteTesteEntity).order_by(AgenteTesteEntity.nome)
        return list(self.session.scalars(stmt).all())

    def buscar_agente_por_id(self, id_agente: str) -> Optional[AgenteTesteEntity]:
        return self.session.get(AgenteTesteEntity, id_agente)

    def criar_agente(self, dados: dict) -> AgenteTesteEntity:
        agente = AgenteTesteEntity(**dados)
        self.session.add(agente)
        self.session.commit()
        self.session.refresh(agente)
        return agente

    # ==========================
    # AMOSTRAS DE TREINO (DATASET)
    # ==========================
    def salvar_amostra(self, dados: dict) -> AmostraTreinoEntity:
        amostra = AmostraTreinoEntity(
            agente_id=dados["agente_id"],
            esporte_id=dados["esporte_id"],
            movimento_id=dados["movimento_id"],
            articulacao_id=dados["articulacao_id"],
            posicao_lateralidade=dados.get("posicao_lateralidade", "direita"),
            taxa_amostragem_hz=dados.get("taxa_amostragem_hz", 20.0),
            duracao_ms=dados["duracao_ms"],
            total_frames=len(dados["frames"]),
            frames_json=json.dumps(dados["frames"], ensure_ascii=False),
            notas=dados.get("notas"),
            autor_id=dados["autor_id"],
            autor_username=dados.get("autor_username"),
        )
        self.session.add(amostra)
        self.session.commit()
        self.session.refresh(amostra)
        return amostra

    def listar_amostras(
        self,
        esporte_id: Optional[str] = None,
        movimento_id: Optional[str] = None,
        agente_id: Optional[str] = None,
        limite: int = 100,
    ) -> list[AmostraTreinoEntity]:
        stmt = (
            select(AmostraTreinoEntity)
            .options(
                joinedload(AmostraTreinoEntity.agente),
                joinedload(AmostraTreinoEntity.esporte),
                joinedload(AmostraTreinoEntity.movimento),
                joinedload(AmostraTreinoEntity.articulacao),
            )
            .order_by(AmostraTreinoEntity.coletado_em.desc())
        )
        if esporte_id:
            stmt = stmt.where(AmostraTreinoEntity.esporte_id == esporte_id)
        if movimento_id:
            stmt = stmt.where(AmostraTreinoEntity.movimento_id == movimento_id)
        if agente_id:
            stmt = stmt.where(AmostraTreinoEntity.agente_id == agente_id)

        stmt = stmt.limit(limite)
        return list(self.session.scalars(stmt).all())

    def buscar_amostra_por_id(self, id_amostra: str) -> Optional[AmostraTreinoEntity]:
        stmt = (
            select(AmostraTreinoEntity)
            .options(
                joinedload(AmostraTreinoEntity.agente),
                joinedload(AmostraTreinoEntity.esporte),
                joinedload(AmostraTreinoEntity.movimento),
                joinedload(AmostraTreinoEntity.articulacao),
            )
            .where(AmostraTreinoEntity.id == id_amostra)
        )
        return self.session.scalar(stmt)

    def excluir_amostra(self, id_amostra: str) -> bool:
        amostra = self.session.get(AmostraTreinoEntity, id_amostra)
        if not amostra:
            return False
        self.session.delete(amostra)
        self.session.commit()
        return True

    def excluir_amostras_lote(
        self,
        ids: Optional[list[str]] = None,
        esporte_id: Optional[str] = None,
        movimento_id: Optional[str] = None,
        articulacao_id: Optional[str] = None,
        agente_id: Optional[str] = None,
    ) -> int:
        """Exclui amostras de treino em lote respeitando filtros opcionais."""
        from sqlalchemy import delete

        stmt = delete(AmostraTreinoEntity)
        if ids:
            stmt = stmt.where(AmostraTreinoEntity.id.in_(ids))
        if esporte_id:
            stmt = stmt.where(AmostraTreinoEntity.esporte_id == esporte_id)
        if movimento_id:
            stmt = stmt.where(AmostraTreinoEntity.movimento_id == movimento_id)
        if articulacao_id:
            stmt = stmt.where(AmostraTreinoEntity.articulacao_id == articulacao_id)
        if agente_id:
            stmt = stmt.where(AmostraTreinoEntity.agente_id == agente_id)

        res = self.session.execute(stmt)
        self.session.commit()
        return res.rowcount

    def obter_estatisticas(self) -> dict:
        total_amostras = self.session.scalar(select(func.count(AmostraTreinoEntity.id))) or 0
        total_frames = self.session.scalar(select(func.sum(AmostraTreinoEntity.total_frames))) or 0

        # Agrupamento por movimento
        movimentos_stmt = (
            select(MovimentoEntity.nome, func.count(AmostraTreinoEntity.id))
            .join(AmostraTreinoEntity, AmostraTreinoEntity.movimento_id == MovimentoEntity.id)
            .group_by(MovimentoEntity.nome)
        )
        por_movimento = {nome: qtd for nome, qtd in self.session.execute(movimentos_stmt).all()}

        # Agrupamento por esporte
        esportes_stmt = (
            select(EsporteEntity.nome, func.count(AmostraTreinoEntity.id))
            .join(AmostraTreinoEntity, AmostraTreinoEntity.esporte_id == EsporteEntity.id)
            .group_by(EsporteEntity.nome)
        )
        por_esporte = {nome: qtd for nome, qtd in self.session.execute(esportes_stmt).all()}

        return {
            "total_amostras": total_amostras,
            "total_frames": total_frames,
            "distribuicao_movimentos": por_movimento,
            "distribuicao_esportes": por_esporte,
        }

    # ==========================
    # EXPORTAÇÃO CSV E JSON
    # ==========================
    def exportar_dataset_csv(self) -> str:
        """
        Gera um CSV tabular com cada frame de leitura desnormalizado com metadados
        do golpe, esporte, posição do sensor e perfil antropométrico completo do atleta.
        """
        amostras = self.listar_amostras(limite=5000)

        output = StringIO()
        writer = csv.writer(output)

        cabecalho = [
            "amostra_id",
            "agente_id",
            "agente_nome",
            "sexo_biologico",
            "idade",
            "peso_kg",
            "altura_cm",
            "braco_direito_cm",
            "braco_esquerdo_cm",
            "perna_direita_cm",
            "perna_esquerda_cm",
            "torax_cm",
            "peito_cm",
            "cabeca_cm",
            "esporte",
            "movimento",
            "articulacao",
            "posicao_lateralidade",
            "taxa_hz",
            "duracao_ms",
            "frame_id",
            "timestamp_ms",
            "ax",
            "ay",
            "az",
            "gx",
            "gy",
            "gz",
            "resultante_accel",
            "temperatura",
        ]
        writer.writerow(cabecalho)

        for a in amostras:
            ag = a.agente
            frames = json.loads(a.frames_json) if a.frames_json else []

            for f in frames:
                writer.writerow([
                    a.id,
                    ag.id if ag else "",
                    ag.nome if ag else "",
                    ag.sexo_biologico if ag else "",
                    ag.idade if ag else "",
                    ag.peso_kg if ag else "",
                    ag.altura_cm if ag else "",
                    ag.braco_direito_cm if ag else "",
                    ag.braco_esquerdo_cm if ag else "",
                    ag.perna_direita_cm if ag else "",
                    ag.perna_esquerda_cm if ag else "",
                    ag.torax_cm if ag else "",
                    ag.peito_cm if ag else "",
                    ag.cabeca_cm if ag else "",
                    a.esporte.nome if a.esporte else a.esporte_id,
                    a.movimento.nome if a.movimento else a.movimento_id,
                    a.articulacao.nome if a.articulacao else a.articulacao_id,
                    a.posicao_lateralidade,
                    a.taxa_amostragem_hz,
                    a.duracao_ms,
                    f.get("frame_id", 0),
                    f.get("timestamp_ms", 0),
                    f.get("ax", 0.0),
                    f.get("ay", 0.0),
                    f.get("az", 0.0),
                    f.get("gx", 0.0),
                    f.get("gy", 0.0),
                    f.get("gz", 0.0),
                    f.get("resultante_accel", ""),
                    f.get("temperatura", ""),
                ])

        return output.getvalue()

