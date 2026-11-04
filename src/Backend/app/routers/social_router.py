from fastapi import APIRouter, status

from app.schemas.social import (
    ComentarioCreate,
    ComentarioResponse,
    CurtidaToggleResponse,
    PostagemCreate,
    PostagemResponse,
    SeguidoresResumoResponse,
    SeguirToggleResponse,
)
from app.services.auth_service import CurrentUserDep
from app.services.social_service import SocialServiceDep

router = APIRouter(prefix="/social", tags=["Rede Social e Feed"])


@router.post("/seguir/{id_usuario}", response_model=SeguirToggleResponse)
def seguir_ou_deixar_de_seguir(
    id_usuario: str,
    usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.alternar_seguir(usuario_atual.id, id_usuario)


@router.get("/seguidores/{id_usuario}", response_model=SeguidoresResumoResponse)
def listar_seguidores(
    id_usuario: str,
    _usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.obter_resumo_seguidores(id_usuario)


@router.post("/postagens", response_model=PostagemResponse, status_code=status.HTTP_201_CREATED)
def publicar_postagem(
    dados: PostagemCreate,
    usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.criar_postagem(usuario_atual.id, dados)


@router.get("/feed", response_model=list[PostagemResponse])
def carregar_feed(
    usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.listar_feed(usuario_atual.id)


@router.post("/postagens/{id_postagem}/curtir", response_model=CurtidaToggleResponse)
def curtir_postagem(
    id_postagem: str,
    usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.alternar_curtida(usuario_atual.id, id_postagem)


@router.post(
    "/postagens/{id_postagem}/comentarios",
    response_model=ComentarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def comentar_postagem(
    id_postagem: str,
    dados: ComentarioCreate,
    usuario_atual: CurrentUserDep,
    service: SocialServiceDep,
):
    return service.adicionar_comentario(usuario_atual.id, id_postagem, dados)

