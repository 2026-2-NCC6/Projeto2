from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.usuario import UsuarioResponse
from app.services.auth_service import AuthServiceDep, CurrentUserDep

router = APIRouter(prefix="/auth", tags=["Autenticação (JWT)"])


@router.post("/login", response_model=TokenResponse)
def login_mobile(dados: LoginRequest, service: AuthServiceDep):
    """Endpoint JSON ideal para o App Mobile (React Native / Expo)."""
    return service.realizar_login(dados.identificador, dados.senha)


@router.post("/token", response_model=TokenResponse)
def login_swagger(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
):
    """Endpoint OAuth2 compatível com o botão 'Authorize' (cadeado) do Swagger (/docs)."""
    return service.realizar_login(form_data.username, form_data.password)


@router.get("/me", response_model=UsuarioResponse)
def obter_usuario_logado(usuario_atual: CurrentUserDep):
    """Retorna os dados do usuário autenticado a partir do token JWT enviado no header."""
    return usuario_atual

