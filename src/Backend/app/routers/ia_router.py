from typing import Any, Optional

from fastapi import APIRouter, File, Form, Query, Response, UploadFile, status
from fastapi.responses import FileResponse

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
    EstatisticasDatasetResponse,
    ModeloIAResponse,
    ProjetoModeloCreate,
    ReiniciarDatasetRequest,
    TestarInferenciaRequest,
    TreinarModeloRequest,
)
from app.services.auth_service import CurrentUserDep, DevUserDep
from app.services.ia_service import ModeloIAServiceDep

router = APIRouter(prefix="/modelos-ia", tags=["Modelos de IA (OTA & MLOps)"])


# ============================================================================
# OTA & MODELOS TREINADOS
# ============================================================================


@router.post("/upload", response_model=ModeloIAResponse, status_code=status.HTTP_201_CREATED)
def publicar_modelo_ia(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
    arquivo: UploadFile = File(..., description="Arquivo do modelo treinado (.tflite, .onnx, .json)"),
    versao: str = Form(..., description="Versão semântica do modelo (ex: 1.2.0)"),
    modalidade: str = Form(default="tenis", description="Modalidade (tenis | musculacao)"),
    formato: str = Form(default="tflite", description="Formato do modelo (tflite | onnx | tfjs)"),
    acuracia: Optional[float] = Form(default=None, description="Acurácia obtida no treino (0.0 a 1.0)"),
    changelog: Optional[str] = Form(default=None, description="Notas da versão / melhorias"),
    ativar_imediatamente: bool = Form(default=True),
):
    """Usado por desenvolvedores para subir uma nova versão treinada do modelo de IA (Restrito a Dev)."""
    return service.publicar_novo_modelo(
        arquivo=arquivo,
        versao=versao,
        modalidade=modalidade,
        formato=formato,
        acuracia=acuracia,
        changelog=changelog,
        ativar_imediatamente=ativar_imediatamente,
    )


@router.get("/", response_model=list[ModeloIAResponse])
def listar_versoes_modelos(
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
    modalidade: Optional[str] = Query(default=None, description="Filtrar por modalidade"),
):
    """Lista todas as versões de modelos de IA cadastradas (histórico MLOps)."""
    return service.listar_modelos(modalidade)


@router.get("/mais-recente", response_model=ModeloIAResponse)
def verificar_modelo_mais_recente(
    service: ModeloIAServiceDep,
    modalidade: str = Query(default="tenis", description="Modalidade para checar atualização OTA"),
):
    """
    Consultado pelo App Mobile para verificar se existe uma versão mais nova do modelo de IA
    do que a versão armazenada localmente no celular.
    """
    return service.obter_modelo_ativo(modalidade)


@router.get("/{id_modelo}/download")
def baixar_arquivo_modelo(
    id_modelo: str,
    service: ModeloIAServiceDep,
):
    """Baixa o arquivo binário/pesos do modelo de IA para execução offline no App Mobile."""
    caminho, modelo = service.obter_caminho_download(id_modelo)
    return FileResponse(
        path=caminho,
        filename=caminho.name,
        media_type="application/octet-stream",
        headers={"X-Model-Version": modelo.versao, "X-Model-Modality": modelo.modalidade},
    )


@router.patch("/{id_modelo}/ativar", response_model=ModeloIAResponse)
def ativar_versao_modelo(
    id_modelo: str,
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
):
    """Permite promover ou fazer rollback de qual versão do modelo está ativa para os celulares."""
    return service.ativar_versao(id_modelo)


@router.get("/telemetria", response_model=list[dict[str, Any]])
def exportar_telemetria_para_treino(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    """Exporta todos os movimentos do TinyDB para a equipe retreinar e aperfeiçoar o modelo no Desktop."""
    return service.exportar_telemetria_para_treino()


# ============================================================================
# CATÁLOGO DO LABORATÓRIO (ESPORTES, ARTICULAÇÕES, MOVIMENTOS, AGENTES)
# ============================================================================


@router.get(
    "/catalogo/esportes",
    response_model=list[EsporteResponse],
    summary="Listar Esportes Cadastrados no Banco Paralelo",
)
def listar_esportes(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.listar_esportes()


@router.post(
    "/catalogo/esportes",
    response_model=EsporteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Esporte",
)
def cadastrar_esporte(
    dados: EsporteCreate,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.criar_esporte(dados)


@router.get(
    "/catalogo/articulacoes",
    response_model=list[ArticulacaoResponse],
    summary="Listar Articulações e Locais de Fixação do Sensor",
)
def listar_articulacoes(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.listar_articulacoes()


@router.get(
    "/catalogo/movimentos",
    response_model=list[MovimentoResponse],
    summary="Listar Movimentos (com filtro por Esporte)",
)
def listar_movimentos(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
    esporte_id: Optional[str] = Query(default=None, description="Filtrar por ID do esporte (ex: tenis)"),
):
    return service.listar_movimentos(esporte_id=esporte_id)


@router.post(
    "/catalogo/movimentos",
    response_model=MovimentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Movimento em um Esporte",
)
def cadastrar_movimento(
    dados: MovimentoCreate,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.criar_movimento(dados)


@router.get(
    "/catalogo/agentes",
    response_model=list[AgenteTesteResponse],
    summary="Listar Perfis de Agentes de Teste (Ficha Antropométrica)",
)
def listar_agentes(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.listar_agentes()


@router.post(
    "/catalogo/agentes",
    response_model=AgenteTesteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Agente de Teste com Medidas Corporais",
)
def cadastrar_agente(
    dados: AgenteTesteCreate,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.criar_agente(dados)


# ============================================================================
# DATASET DE TREINO (AMOSTRAS BIOMECÂNICAS ROTULADAS)
# ============================================================================


@router.post(
    "/dataset/amostras",
    response_model=AmostraDatalabResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar Amostra de Treino no Banco Paralelo",
)
def registrar_amostra_dataset(
    dados: AmostraDatalabCreate,
    usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.salvar_amostra_datalab(
        dados=dados,
        autor_id=usuario_dev.id,
        autor_username=usuario_dev.username,
    )


@router.get(
    "/dataset/amostras",
    response_model=list[AmostraDatalabResponse],
    summary="Listar Amostras Coletadas no Banco Paralelo",
)
def listar_amostras_dataset(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
    esporte_id: Optional[str] = Query(default=None, description="Filtrar por esporte"),
    movimento_id: Optional[str] = Query(default=None, description="Filtrar por movimento"),
    agente_id: Optional[str] = Query(default=None, description="Filtrar por agente"),
):
    return service.listar_amostras_datalab(
        esporte_id=esporte_id,
        movimento_id=movimento_id,
        agente_id=agente_id,
    )


@router.get(
    "/dataset/estatisticas",
    response_model=EstatisticasDatasetResponse,
    summary="Estatísticas do Dataset Paralelo de IA",
)
def obter_estatisticas_dataset(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    return service.obter_estatisticas_datalab()


@router.delete(
    "/dataset/amostras/{id_amostra}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir Amostra do Dataset Paralelo",
)
def excluir_amostra_dataset(
    id_amostra: str,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    service.excluir_amostra_datalab(id_amostra)


@router.post(
    "/dataset/reiniciar",
    status_code=status.HTTP_200_OK,
    summary="Reiniciar Modelo ou Excluir Amostras em Lote Respeitando Filtros",
)
def reiniciar_dataset_modelo(
    dados: ReiniciarDatasetRequest,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    """
    Exclui amostras em lote (respeitando filtros de esporte, golpe, articulacao ou IDs específicos)
    e, se solicitado ou se todas as amostras forem limpas, reinicia o modelo de IA correspondente.
    """
    return service.reiniciar_ou_excluir_amostras(
        ids=dados.ids,
        esporte_id=dados.esporte_id,
        movimento_id=dados.movimento_id,
        articulacao_id=dados.articulacao_id,
        agente_id=dados.agente_id,
        reiniciar_modelo=dados.reiniciar_modelo,
    )


# ============================================================================
# EXPORTAÇÃO CSV E JSON PARA MODELOS DE MACHINE LEARNING
# ============================================================================


@router.get(
    "/dataset/exportar/csv",
    summary="Exportar Dataset Completo em CSV (Tabular por Frame)",
)
def exportar_dataset_csv(
    service: ModeloIAServiceDep,
    token: Optional[str] = Query(default=None, description="Token JWT opcional para download direto"),
):
    conteudo_csv = service.exportar_dataset_csv()
    return Response(
        content=conteudo_csv,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=flux_dataset_telemetria_ia.csv"},
    )


@router.get(
    "/dataset/exportar/json",
    summary="Exportar Dataset Completo em JSON (Hierárquico com Perfil Corporal)",
)
def exportar_dataset_json(
    service: ModeloIAServiceDep,
    token: Optional[str] = Query(default=None, description="Token JWT opcional para download direto"),
):
    return service.exportar_dataset_json()


# ============================================================================
# PIPELINE MLOPS & TREINAMENTO AUTOMATIZADO DE MODELOS (1-CLIQUE)
# ============================================================================


@router.get(
    "/projetos",
    summary="Listar Projetos de Modelos de IA e suas Versões na Infraestrutura de Armazenamento",
)
def listar_projetos_modelos(
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    """Retorna a árvore de modelos, versões e status a partir da infraestrutura de storage."""
    return service.listar_projetos_modelos()


@router.post(
    "/projetos",
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Projeto de Modelo de IA (Cria Diretório Padronizado)",
)
def criar_projeto_modelo(
    dados: ProjetoModeloCreate,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    """Cria a estrutura de pastas e arquivo de configuração para um novo modelo de IA."""
    return service.criar_projeto_modelo(dados)


@router.post(
    "/projetos/{modelo_id}/treinar",
    status_code=status.HTTP_200_OK,
    summary="Treinar Versão do Modelo com 1 Clique (Extrai Features, Gera Pesos e Salva Arquivos)",
)
def treinar_modelo_projeto(
    modelo_id: str,
    dados: TreinarModeloRequest,
    usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
):
    """
    Executa o treinamento automatizado:
    - Lê as amostras rotuladas do DataLab.
    - Extrai features estatísticas e biomecânicas.
    - Treina o classificador e avalia acurácia/matriz de confusão.
    - Salva na pasta versionada: metadata.json, model_weights.json, metrics.json, dataset_snapshot.json e dataset_export.csv.
    """
    return service.treinar_modelo_projeto(
        modelo_id=modelo_id,
        dados=dados,
        autor=usuario_dev.username,
    )


@router.post(
    "/projetos/{modelo_id}/testar",
    status_code=status.HTTP_200_OK,
    summary="Testar Inferência em Tempo Real com o Modelo Compilado",
)
def testar_inferencia_modelo(
    modelo_id: str,
    dados: TestarInferenciaRequest,
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
):
    """Classifica um movimento de teste contra os pesos do modelo versionado em disco."""
    return service.testar_inferencia_modelo(
        modelo_id=modelo_id,
        dados=dados,
    )


@router.post(
    "/classificar",
    status_code=status.HTTP_200_OK,
    summary="Classificar Movimento Biomecânico de Circuito de Treino com o Modelo de IA Ativo",
)
def classificar_movimento_circuito(
    dados: TestarInferenciaRequest,
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
):
    """Classifica frames de um circuito de treino ativo utilizando o modelo de IA em produção."""
    return service.testar_inferencia_modelo(
        modelo_id="flux_tenis",
        dados=dados,
    )


@router.get(
    "/projetos/{modelo_id}/avaliacao",
    response_model=AvaliacaoModeloResponse,
    status_code=status.HTTP_200_OK,
    summary="Painel de Avaliação, Matriz de Confusão e Progressão de Versões MLOps",
)
def obter_avaliacao_modelo(
    modelo_id: str,
    _usuario_dev: DevUserDep,
    service: ModeloIAServiceDep,
    versao: Optional[str] = Query(default=None, description="Versão específica para auditar"),
):
    """
    Retorna o relatório visual completo para auditoria do modelo:
    - Progressão de volume de amostras x acurácia por versão.
    - Matriz de confusão interativa e métricas por golpe (Precision, Recall, F1-Score).
    - Gráfico de importância das features biomecânicas determinantes.
    - Balanceamento de amostras do dataset.
    """
    return service.obter_avaliacao_modelo(modelo_id=modelo_id, versao=versao)
