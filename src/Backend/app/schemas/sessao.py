from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class MovimentoItem(BaseModel):
    tipo_movimento: str = Field(
        ...,
        description="Golpe ou exercício detectado pela IA (ex: forehand, backhand, saque, smash)",
    )
    precisao: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Grau de precisão/confiança da execução (0.0 a 1.0)",
    )
    velocidade_pico: Optional[float] = Field(default=None, description="Velocidade de pico (km/h ou rad/s)")
    aceleracao_max: Optional[float] = Field(default=None, description="Aceleração máxima (m/s²)")
    timestamp_execucao: Optional[datetime] = None
    metadados_extras: Optional[dict[str, Any]] = None


class MovimentosCircuitoNoSQLResponse(BaseModel):
    id_nosql: str
    id_sessao: str
    id_circuito: str
    versao_modelo_ia: str
    total_movimentos: int
    precisao_media: float
    registrado_em: str
    movimentos: list[dict[str, Any]]


class CircuitoCreate(BaseModel):
    numero_rodada: int = Field(..., ge=1)
    hora_inicio: datetime
    hora_fim: Optional[datetime] = None
    pontuacao: int = Field(default=0, ge=0)
    versao_modelo_ia: Optional[str] = "1.0.0"
    movimentos: list[MovimentoItem] = Field(
        default_factory=list,
        description="Lista de movimentos classificados pela IA que serão salvos no TinyDB (NoSQL)",
    )


class CircuitoResponse(BaseModel):
    id: str
    id_sessao: str
    id_movimentos_nosql: Optional[str]
    numero_rodada: int
    hora_inicio: datetime
    hora_fim: Optional[datetime]
    pontuacao: int

    model_config = ConfigDict(from_attributes=True)


class SessaoCreate(BaseModel):
    id_usuario: Optional[str] = Field(
        default=None,
        description="Opcional: se omitido, usa o ID do usuário autenticado pelo JWT",
    )
    id_estabelecimento: Optional[str] = None
    id_cliente: Optional[str] = None
    modalidade: Literal["tenis", "musculacao"] = "tenis"


class SessaoOfflineSyncRequest(BaseModel):
    """Payload para sincronizar de uma só vez uma sessão inteira gravada offline no celular."""

    id_estabelecimento: Optional[str] = None
    id_cliente: Optional[str] = None
    modalidade: Literal["tenis", "musculacao"] = "tenis"
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    circuitos: list[CircuitoCreate] = Field(default_factory=list)


class SessaoResponse(BaseModel):
    id: str
    id_usuario: str
    id_estabelecimento: Optional[str]
    id_cliente: Optional[str]
    modalidade: str
    data_inicio: datetime
    data_fim: Optional[datetime]
    pontuacao_total: int
    circuitos: list[CircuitoResponse] = []

    model_config = ConfigDict(from_attributes=True)
