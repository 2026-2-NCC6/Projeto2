from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class ClienteCreate(BaseModel):
    id_aluno: str
    observacoes: Optional[str] = None


class ClienteUpdate(BaseModel):
    status: Optional[Literal["ativo", "inativo"]] = None
    observacoes: Optional[str] = None


class ClienteResponse(BaseModel):
    id: str
    id_personal: str
    id_aluno: str
    status: str
    observacoes: Optional[str]
    data_vinculo: datetime

    model_config = ConfigDict(from_attributes=True)

