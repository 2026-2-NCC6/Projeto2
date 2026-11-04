from pydantic import BaseModel, Field

from app.schemas.usuario import UsuarioResponse


class LoginRequest(BaseModel):
    identificador: str = Field(..., min_length=1, description="E-mail ou username do usuário")
    senha: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
