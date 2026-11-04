from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    senha: str = Field(..., min_length=6)
    tipo_perfil: Literal["atleta", "personal", "iniciante"] = "iniciante"
    foto_perfil_url: Optional[str] = None
    bio: Optional[str] = None
    privado: bool = False


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=120)
    tipo_perfil: Optional[Literal["atleta", "personal", "iniciante"]] = None
    foto_perfil_url: Optional[str] = None
    bio: Optional[str] = None
    privado: Optional[bool] = None


class UsuarioResponse(BaseModel):
    id: str
    nome: str
    username: str
    email: EmailStr
    tipo_perfil: str
    foto_perfil_url: Optional[str]
    bio: Optional[str]
    privado: bool
    xp_total: int
    nivel: int
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
