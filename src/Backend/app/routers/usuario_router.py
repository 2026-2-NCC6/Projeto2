from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.services.auth_service import CurrentUserDep
from app.services.usuario_service import UsuarioServiceDep

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(dados: UsuarioCreate, service: UsuarioServiceDep):
    return service.criar_usuario(dados)


@router.get("/buscar", response_model=list[UsuarioResponse])
def pesquisar_usuarios(
    q: str = Query(..., min_length=1, description="Nome ou @username para busca"),
    service: UsuarioServiceDep = None,
    _usuario_atual: CurrentUserDep = None,
):
    return service.buscar_usuarios(q)


@router.patch("/me", response_model=UsuarioResponse)
def atualizar_meu_perfil(
    dados: UsuarioUpdate,
    usuario_atual: CurrentUserDep,
    service: UsuarioServiceDep,
):
    return service.atualizar_perfil(usuario_atual, dados)


@router.get("/{id_usuario}", response_model=UsuarioResponse)
def buscar_usuario(
    id_usuario: str,
    service: UsuarioServiceDep,
    _usuario_atual: CurrentUserDep,
):
    usuario = service.repo.get_by_id(id_usuario)
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return usuario
