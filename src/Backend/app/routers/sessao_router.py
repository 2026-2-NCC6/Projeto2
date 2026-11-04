from fastapi import APIRouter, status

from app.schemas.sessao import (
    CircuitoCreate,
    CircuitoResponse,
    MovimentosCircuitoNoSQLResponse,
    SessaoCreate,
    SessaoOfflineSyncRequest,
    SessaoResponse,
)
from app.services.auth_service import CurrentUserDep
from app.services.sessao_service import SessaoServiceDep

router = APIRouter(prefix="/sessoes", tags=["Sessões e Circuitos"])


@router.post("/", response_model=SessaoResponse, status_code=status.HTTP_201_CREATED)
def iniciar_sessao(
    dados: SessaoCreate,
    usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    return service.criar_sessao(dados, usuario_atual.id)


@router.post(
    "/sincronizar",
    response_model=SessaoResponse,
    status_code=status.HTTP_201_CREATED,
)
def sincronizar_sessao_offline(
    dados: SessaoOfflineSyncRequest,
    usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    """Sincroniza uma sessão inteira (com circuitos e movimentos da IA) gravada offline no app."""
    return service.sincronizar_sessao_offline(usuario_atual.id, dados)


@router.patch("/{id_sessao}/finalizar", response_model=SessaoResponse)
def finalizar_sessao(
    id_sessao: str,
    _usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    return service.finalizar_sessao(id_sessao)


@router.post(
    "/{id_sessao}/circuitos",
    response_model=CircuitoResponse,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_circuito(
    id_sessao: str,
    dados: CircuitoCreate,
    _usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    return service.registrar_circuito(id_sessao, dados)


@router.get(
    "/circuitos/{id_circuito}/movimentos",
    response_model=MovimentosCircuitoNoSQLResponse,
)
def consultar_movimentos_circuito(
    id_circuito: str,
    _usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    """Busca no banco NoSQL (TinyDB) os movimentos detectados pela IA e a precisão de um circuito."""
    return service.obter_movimentos_do_circuito(id_circuito)


@router.get("/usuario/{id_usuario}", response_model=list[SessaoResponse])
def listar_sessoes_usuario(
    id_usuario: str,
    _usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    return service.listar_por_usuario(id_usuario)


@router.get("/{id_sessao}", response_model=SessaoResponse)
def detalhar_sessao(
    id_sessao: str,
    _usuario_atual: CurrentUserDep,
    service: SessaoServiceDep,
):
    return service.buscar_por_id(id_sessao)
