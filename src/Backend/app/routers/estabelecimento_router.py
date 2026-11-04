from typing import Optional

from fastapi import APIRouter, Query, status

from app.schemas.estabelecimento import (
    EstabelecimentoCreate,
    EstabelecimentoResponse,
    FavoritoToggleResponse,
)
from app.services.auth_service import CurrentUserDep
from app.services.estabelecimento_service import EstabelecimentoServiceDep

router = APIRouter(prefix="/estabelecimentos", tags=["Estabelecimentos e Favoritos"])


@router.post("/", response_model=EstabelecimentoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_estabelecimento(
    dados: EstabelecimentoCreate,
    _usuario_atual: CurrentUserDep,
    service: EstabelecimentoServiceDep,
):
    return service.cadastrar(dados)


@router.get("/", response_model=list[EstabelecimentoResponse])
def listar_estabelecimentos(
    _usuario_atual: CurrentUserDep,
    service: EstabelecimentoServiceDep,
    cidade: Optional[str] = Query(default=None, description="Filtrar por cidade"),
):
    return service.listar_ativos(cidade)


@router.get("/meus-favoritos", response_model=list[EstabelecimentoResponse])
def listar_meus_favoritos(
    usuario_atual: CurrentUserDep,
    service: EstabelecimentoServiceDep,
):
    return service.listar_meus_favoritos(usuario_atual.id)


@router.post("/{id_estabelecimento}/favoritar", response_model=FavoritoToggleResponse)
def favoritar_estabelecimento(
    id_estabelecimento: str,
    usuario_atual: CurrentUserDep,
    service: EstabelecimentoServiceDep,
):
    return service.alternar_favorito(usuario_atual.id, id_estabelecimento)

