from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ModeloIAResponse(BaseModel):
    id: str
    versao: str
    modalidade: str
    formato: str
    acuracia: Optional[float]
    caminho_arquivo: str
    changelog: Optional[str]
    ativo: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)

