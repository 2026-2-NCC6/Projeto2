from typing import Any, Optional

from fastapi import APIRouter, File, Form, Query, UploadFile, status
from fastapi.responses import FileResponse

from app.schemas.ia import ModeloIAResponse
from app.services.auth_service import CurrentUserDep
from app.services.ia_service import ModeloIAServiceDep

router = APIRouter(prefix="/modelos-ia", tags=["Modelos de IA (OTA & MLOps)"])


@router.post("/upload", response_model=ModeloIAResponse, status_code=status.HTTP_201_CREATED)
def publicar_modelo_ia(
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
    arquivo: UploadFile = File(..., description="Arquivo do modelo treinado (.tflite, .onnx, .json)"),
    versao: str = Form(..., description="Versão semântica do modelo (ex: 1.2.0)"),
    modalidade: str = Form(default="tenis", description="Modalidade (tenis | musculacao)"),
    formato: str = Form(default="tflite", description="Formato do modelo (tflite | onnx | tfjs)"),
    acuracia: Optional[float] = Form(default=None, description="Acurácia obtida no treino (0.0 a 1.0)"),
    changelog: Optional[str] = Form(default=None, description="Notas da versão / melhorias"),
    ativar_imediatamente: bool = Form(default=True),
):
    """Usado pelo ambiente Desktop da equipe para subir uma nova versão treinada do modelo de IA."""
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
def exportar_dataset_movimentos(
    _usuario_atual: CurrentUserDep,
    service: ModeloIAServiceDep,
):
    """Exporta todos os movimentos do TinyDB para a equipe retreinar e aperfeiçoar o modelo no Desktop."""
    return service.exportar_telemetria_para_treino()

