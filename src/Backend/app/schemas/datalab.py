from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.ia import TelemetriaFrameItem


class EsporteCreate(BaseModel):
    id: Optional[str] = None
    nome: str = Field(..., min_length=2, max_length=100, description="Nome da modalidade (ex: Tênis)")
    icone: str = Field(default="🎾", max_length=20)
    descricao: Optional[str] = None


class EsporteResponse(BaseModel):
    id: str
    nome: str
    icone: str
    descricao: Optional[str] = None
    ativo: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class ArticulacaoResponse(BaseModel):
    id: str
    nome: str
    icone: str
    possui_lateralidade: bool
    descricao: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MovimentoCreate(BaseModel):
    id: Optional[str] = None
    nome: str = Field(..., min_length=2, max_length=100, description="Nome do golpe/movimento (ex: Forehand)")
    esporte_id: str = Field(..., description="ID do esporte a que o movimento pertence")
    articulacao_padrao_id: Optional[str] = Field(default="pulso", description="Articulação recomendada para o sensor")
    descricao: Optional[str] = None


class MovimentoResponse(BaseModel):
    id: str
    nome: str
    esporte_id: str
    articulacao_padrao_id: Optional[str] = None
    descricao: Optional[str] = None
    ativo: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class AgenteTesteCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120, description="Nome do atleta de teste")
    sexo_biologico: str = Field(default="masculino", description="masculino | feminino")
    idade: int = Field(default=25, ge=5, le=100)
    peso_kg: float = Field(default=70.0, ge=20.0, le=250.0)
    altura_cm: float = Field(default=175.0, ge=50.0, le=250.0)

    # Medidas antropométricas
    braco_direito_cm: Optional[float] = Field(default=None, description="Comprimento braço direito (cm)")
    braco_esquerdo_cm: Optional[float] = Field(default=None, description="Comprimento braço esquerdo (cm)")
    perna_direita_cm: Optional[float] = Field(default=None, description="Comprimento perna direita (cm)")
    perna_esquerda_cm: Optional[float] = Field(default=None, description="Comprimento perna esquerda (cm)")
    torax_cm: Optional[float] = Field(default=None, description="Circunferência do tórax (cm)")
    peito_cm: Optional[float] = Field(default=None, description="Medida do peito (cm)")
    cabeca_cm: Optional[float] = Field(default=None, description="Circunferência da cabeça (cm)")
    notas: Optional[str] = None


class AgenteTesteResponse(BaseModel):
    id: str
    nome: str
    sexo_biologico: str
    idade: int
    peso_kg: float
    altura_cm: float
    braco_direito_cm: Optional[float] = None
    braco_esquerdo_cm: Optional[float] = None
    perna_direita_cm: Optional[float] = None
    perna_esquerda_cm: Optional[float] = None
    torax_cm: Optional[float] = None
    peito_cm: Optional[float] = None
    cabeca_cm: Optional[float] = None
    notas: Optional[str] = None
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class AmostraDatalabCreate(BaseModel):
    agente_id: str = Field(..., description="ID do Agente de Teste cadastrado")
    esporte_id: str = Field(..., description="ID do esporte (ex: tenis)")
    movimento_id: str = Field(..., description="ID do movimento (ex: forehand)")
    articulacao_id: str = Field(..., description="ID da articulação onde o wearable está (ex: pulso)")
    posicao_lateralidade: str = Field(default="direita", description="direita | esquerda | central")
    taxa_amostragem_hz: float = Field(default=20.0)
    duracao_ms: int = Field(..., ge=200, le=10000)
    frames: list[TelemetriaFrameItem] = Field(..., min_length=3)
    notas: Optional[str] = None


class AmostraDatalabResponse(BaseModel):
    id: str
    agente_id: str
    agente_nome: Optional[str] = None
    esporte_id: str
    esporte_nome: Optional[str] = None
    movimento_id: str
    movimento_nome: Optional[str] = None
    articulacao_id: str
    articulacao_nome: Optional[str] = None
    posicao_lateralidade: str
    taxa_amostragem_hz: float
    duracao_ms: int
    total_frames: int
    frames: list[TelemetriaFrameItem]
    notas: Optional[str] = None
    autor_id: str
    autor_username: Optional[str] = None
    coletado_em: datetime

    model_config = ConfigDict(from_attributes=True)

