from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class SeguirToggleResponse(BaseModel):
    seguindo: bool
    id_seguido: str
    status: Optional[str] = None


class SeguidoresResumoResponse(BaseModel):
    id_usuario: str
    total_seguidores: int
    total_seguindo: int
    seguidores_ids: list[str]
    seguindo_ids: list[str]


class ComentarioCreate(BaseModel):
    texto: str = Field(..., min_length=1, max_length=1000)


class ComentarioResponse(BaseModel):
    id: str
    id_postagem: str
    id_usuario: str
    texto: str
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class CurtidaToggleResponse(BaseModel):
    curtido: bool
    id_postagem: str
    total_curtidas: int


class PostagemCreate(BaseModel):
    id_sessao: Optional[str] = None
    legenda: Optional[str] = None
    midia_url: Optional[str] = None
    visibilidade: Literal["publico", "seguidores", "privado"] = "publico"


class PostagemResponse(BaseModel):
    id: str
    id_usuario: str
    id_sessao: Optional[str]
    legenda: Optional[str]
    midia_url: Optional[str]
    visibilidade: str
    criado_em: datetime
    comentarios: list[ComentarioResponse] = []

    model_config = ConfigDict(from_attributes=True)

