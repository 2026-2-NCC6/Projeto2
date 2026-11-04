from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import SessionDep
from app.core.security import (
    DUMMY_HASH,
    InvalidTokenError,
    criar_access_token,
    decodificar_access_token,
    verificar_senha,
)
from app.models.entities import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import TokenResponse
from app.schemas.usuario import UsuarioResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class AuthService:
    """Camada de Regra de Negócios (SRP/DIP) para Autenticação e Validação de JWT."""

    def __init__(self, repo: UsuarioRepository) -> None:
        self.repo = repo

    def autenticar_usuario(self, identificador: str, senha: str) -> Usuario:
        usuario = self.repo.get_by_email(identificador) or self.repo.get_by_username(identificador)

        if not usuario:
            # Executa verificação contra DUMMY_HASH para evitar timing attack
            verificar_senha(senha, DUMMY_HASH)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas (usuário ou senha incorretos).",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verificar_senha(senha, usuario.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas (usuário ou senha incorretos).",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return usuario

    def realizar_login(self, identificador: str, senha: str) -> TokenResponse:
        usuario = self.autenticar_usuario(identificador, senha)
        token = criar_access_token(
            subject=usuario.id,
            extra_claims={
                "username": usuario.username,
                "tipo_perfil": usuario.tipo_perfil,
            },
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            usuario=UsuarioResponse.model_validate(usuario),
        )


def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(UsuarioRepository(session))


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: SessionDep,
) -> Usuario:
    """Dependency que extrai o token Bearer, valida o JWT e retorna o Usuário autenticado."""
    credenciais_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decodificar_access_token(token)
        id_usuario: str | None = payload.get("sub")
        if id_usuario is None:
            raise credenciais_exception
    except InvalidTokenError:
        raise credenciais_exception

    repo = UsuarioRepository(session)
    usuario = repo.get_by_id(id_usuario)
    if usuario is None:
        raise credenciais_exception
    return usuario


CurrentUserDep = Annotated[Usuario, Depends(get_current_user)]

