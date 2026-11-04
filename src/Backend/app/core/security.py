from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings

# Algoritmo de hash recomendado pela documentação oficial do FastAPI (Argon2id com salt automático)
password_hash = PasswordHash.recommended()

# Hash dummy usado para evitar timing attacks quando o usuário não existe no banco
DUMMY_HASH = password_hash.hash("dummypassword")


def gerar_hash_senha(senha: str) -> str:
    """Gera o hash seguro (Argon2) de uma senha em texto plano."""
    return password_hash.hash(senha)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Compara uma senha em texto plano com o hash salvo no banco."""
    return password_hash.verify(senha_plana, senha_hash)


def criar_access_token(
    subject: str,
    extra_claims: Optional[dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Assina e retorna um JWT contendo o ID do usuário (sub) e tempo de expiração."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decodificar_access_token(token: str) -> dict[str, Any]:
    """Decodifica e valida a assinatura e expiração de um JWT."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


__all__ = [
    "DUMMY_HASH",
    "InvalidTokenError",
    "gerar_hash_senha",
    "verificar_senha",
    "criar_access_token",
    "decodificar_access_token",
]

