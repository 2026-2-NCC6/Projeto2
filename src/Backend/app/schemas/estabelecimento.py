from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EstabelecimentoCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=150)
    cnpj: str = Field(..., min_length=14, max_length=18)
    endereco: str = Field(..., max_length=255)
    cidade: str = Field(..., max_length=100)
    estado: str = Field(..., min_length=2, max_length=2)
    telefone: Optional[str] = None
    parceiro_ativo: bool = True


class EstabelecimentoResponse(BaseModel):
    id: str
    nome: str
    cnpj: str
    endereco: str
    cidade: str
    estado: str
    telefone: Optional[str]
    parceiro_ativo: bool

    model_config = ConfigDict(from_attributes=True)


class FavoritoToggleResponse(BaseModel):
    favoritado: bool
    id_estabelecimento: str
    favoritado_em: Optional[datetime] = None

