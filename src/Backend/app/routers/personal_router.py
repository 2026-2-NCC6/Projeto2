from fastapi import APIRouter, status

from app.schemas.personal import ClienteCreate, ClienteResponse, ClienteUpdate
from app.schemas.sessao import SessaoResponse
from app.services.auth_service import CurrentUserDep
from app.services.personal_service import PersonalServiceDep

router = APIRouter(prefix="/personal", tags=["Personal e Clientes"])


@router.post("/clientes", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def adicionar_cliente(
    dados: ClienteCreate,
    usuario_atual: CurrentUserDep,
    service: PersonalServiceDep,
):
    return service.vincular_cliente(usuario_atual, dados)


@router.get("/clientes", response_model=list[ClienteResponse])
def listar_meus_clientes(
    usuario_atual: CurrentUserDep,
    service: PersonalServiceDep,
):
    return service.listar_clientes(usuario_atual.id)


@router.patch("/clientes/{id_cliente}", response_model=ClienteResponse)
def atualizar_cliente(
    id_cliente: str,
    dados: ClienteUpdate,
    usuario_atual: CurrentUserDep,
    service: PersonalServiceDep,
):
    return service.atualizar_cliente(usuario_atual.id, id_cliente, dados)


@router.get("/clientes/{id_cliente}/sessoes", response_model=list[SessaoResponse])
def listar_sessoes_do_cliente(
    id_cliente: str,
    usuario_atual: CurrentUserDep,
    service: PersonalServiceDep,
):
    return service.listar_sessoes_do_cliente(usuario_atual.id, id_cliente)

