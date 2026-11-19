from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


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


class TelemetriaFrameItem(BaseModel):
    frame_id: int
    timestamp_ms: int
    ax: float
    ay: float
    az: float
    gx: float
    gy: float
    gz: float
    resultante_accel: Optional[float] = None
    temperatura: Optional[float] = None


class AmostraTreinoCreate(BaseModel):
    esporte: str = Field(default="Tênis", description="Modalidade esportiva: Tênis, Beach Tennis, etc.")
    tipo_movimento: str = Field(..., description="Classe do golpe: Forehand, Backhand, Saque, Smash, Slice, Repouso")
    lateralidade: str = Field(default="destro", description="destro | canhoto")
    empunhadura: Optional[str] = Field(default=None, description="continental | eastern | semi-western | western")
    taxa_amostragem_hz: float = Field(default=20.0, description="Frequência nominal em Hz (Arduino Uno R4 = 20 Hz)")
    duracao_ms: int = Field(..., description="Duração total da janela capturada em ms")
    frames: list[TelemetriaFrameItem] = Field(..., min_length=5, description="Série temporal de leituras do sensor MPU6050")
    notas: Optional[str] = None


class AmostraTreinoResponse(BaseModel):
    id: str
    esporte: str = "Tênis"
    tipo_movimento: str
    lateralidade: str
    empunhadura: Optional[str]
    taxa_amostragem_hz: float
    duracao_ms: int
    total_frames: int
    frames: list[TelemetriaFrameItem]
    notas: Optional[str]
    autor_id: str
    autor_username: Optional[str] = None
    coletado_em: str


class EstatisticasDatasetResponse(BaseModel):
    total_amostras: int
    total_frames: int
    distribuicao_movimentos: dict[str, int]
    distribuicao_esportes: Optional[dict[str, int]] = None


class ProjetoModeloCreate(BaseModel):
    modelo_id: str = Field(..., description="Identificador único (slug) do projeto de modelo (ex: flux_tenis_stroke)")
    nome: str = Field(..., description="Nome amigável de exibição")
    esporte_id: str = Field(default="tenis", description="Esporte alvo do modelo")
    descricao: Optional[str] = Field(default="", description="Descrição do propósito do modelo")
    classes_alvo: list[str] = Field(default_factory=list, description="Lista de IDs de movimentos suportados")


class TreinarModeloRequest(BaseModel):
    versao: str = Field(default="v1.0.0", description="Versão semântica do modelo a ser gerado")
    esporte_id: Optional[str] = Field(default="tenis", description="Filtrar amostras por esporte")
    classes: Optional[list[str]] = Field(default=None, description="Classes específicas de movimentos a incluir no treino")


class TestarInferenciaRequest(BaseModel):
    versao: Optional[str] = Field(default=None, description="Versão do modelo a testar (padrão: mais recente)")
    frames: Optional[list[TelemetriaFrameItem]] = Field(default=None, description="Frames opcionais de teste (gera sintético se vazio)")


class ReiniciarDatasetRequest(BaseModel):
    ids: Optional[list[str]] = Field(default=None, description="Lista opcional de IDs de amostras específicas para excluir")
    esporte_id: Optional[str] = Field(default=None, description="Filtrar por esporte")
    movimento_id: Optional[str] = Field(default=None, description="Filtrar por movimento")
    articulacao_id: Optional[str] = Field(default=None, description="Filtrar por articulação")
    agente_id: Optional[str] = Field(default=None, description="Filtrar por agente")
    reiniciar_modelo: bool = Field(default=True, description="Se verdadeiro, reseta as versões geradas do modelo caso as amostras sejam zeradas")


# ============================================================================
# SCHEMAS DE AVALIAÇÃO DE MODELO E MÉTRICAS MLOPS
# ============================================================================


class MetricaClasseAvaliacao(BaseModel):
    classe: str
    nome: str
    precisao: float
    revocacao: float
    f1_score: float
    amostras: int


class ImportanciaFeatureAvaliacao(BaseModel):
    feature: str
    label: str
    importancia: float


class DistribuicaoClasseAvaliacao(BaseModel):
    classe: str
    nome: str
    quantidade: int
    percentual: float


class VersaoProgressaoItem(BaseModel):
    versao: str
    criado_em: str
    total_amostras: int
    acuracia: float
    f1_score: float
    latencia_ms: float
    is_ativa: bool = False


class PontoAmostraScatter(BaseModel):
    id: str
    classe: str
    x: float
    y: float
    is_outlier: bool = False
    classe_predita: Optional[str] = None


class CentroideScatter(BaseModel):
    classe: str
    nome: str
    x: float
    y: float
    std_x: float
    std_y: float
    total: int


class ProjecaoScatterItem(BaseModel):
    id: str
    titulo: str
    eixo_x_nome: str
    eixo_x_unidade: str
    eixo_y_nome: str
    eixo_y_unidade: str
    min_x: float
    max_x: float
    min_y: float
    max_y: float
    distancia_centroides: float
    centroides: list[CentroideScatter]
    pontos: list[PontoAmostraScatter]


class MetricasVersaoDetalhada(BaseModel):
    versao: str
    acuracia: float
    f1_score: float
    total_amostras: int
    tempo_treinamento_ms: int
    latencia_media_inferencia_ms: float
    avaliado_em: str
    classes: list[str]
    matriz_confusao: dict[str, dict[str, int]]
    metricas_por_classe: list[MetricaClasseAvaliacao]
    importancia_features: list[ImportanciaFeatureAvaliacao]
    distribuicao_amostras: list[DistribuicaoClasseAvaliacao]
    projecoes_scatter: list[ProjecaoScatterItem] = Field(default_factory=list)


class AvaliacaoModeloResponse(BaseModel):
    modelo_id: str
    nome: str
    esporte_id: str
    versao_ativa: Optional[str] = None
    versao_selecionada: str
    todas_versoes: list[str]
    progressao_versoes: list[VersaoProgressaoItem]
    metricas_versao: MetricasVersaoDetalhada



