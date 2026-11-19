from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.models.base import generate_uuid


class DataLabBase(DeclarativeBase):
    pass


class EsporteEntity(DataLabBase):
    __tablename__ = "esportes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    icone: Mapped[str] = mapped_column(String(20), default="🎾")
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    # 1:N com Movimentos (um movimento pertence a exatamente um esporte)
    movimentos: Mapped[list["MovimentoEntity"]] = relationship(
        back_populates="esporte", cascade="all, delete-orphan"
    )
    amostras: Mapped[list["AmostraTreinoEntity"]] = relationship(
        back_populates="esporte", cascade="all, delete-orphan"
    )


class ArticulacaoEntity(DataLabBase):
    __tablename__ = "articulacoes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # ex: pulso, cotovelo, tornozelo, peito
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    icone: Mapped[str] = mapped_column(String(20), default="✋")
    possui_lateralidade: Mapped[bool] = mapped_column(Boolean, default=True)  # True: membros (D/E), False: central
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    amostras: Mapped[list["AmostraTreinoEntity"]] = relationship(
        back_populates="articulacao"
    )


class MovimentoEntity(DataLabBase):
    __tablename__ = "movimentos"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    esporte_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("esportes.id", ondelete="CASCADE"), nullable=False
    )
    articulacao_padrao_id: Mapped[Optional[str]] = mapped_column(
        String(50), ForeignKey("articulacoes.id"), nullable=True
    )
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    esporte: Mapped["EsporteEntity"] = relationship(back_populates="movimentos")
    amostras: Mapped[list["AmostraTreinoEntity"]] = relationship(
        back_populates="movimento", cascade="all, delete-orphan"
    )


class AgenteTesteEntity(DataLabBase):
    __tablename__ = "agentes_teste"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    sexo_biologico: Mapped[str] = mapped_column(String(20), default="masculino")  # masculino | feminino
    idade: Mapped[int] = mapped_column(Integer, default=25)
    peso_kg: Mapped[float] = mapped_column(Float, default=70.0)
    altura_cm: Mapped[float] = mapped_column(Float, default=175.0)

    # Medidas antropométricas e de alavanca corporal (em cm)
    braco_direito_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    braco_esquerdo_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    perna_direita_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    perna_esquerda_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    torax_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    peito_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cabeca_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    amostras: Mapped[list["AmostraTreinoEntity"]] = relationship(
        back_populates="agente", cascade="all, delete-orphan"
    )


class AmostraTreinoEntity(DataLabBase):
    __tablename__ = "amostras_treino"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    agente_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("agentes_teste.id", ondelete="CASCADE"), nullable=False
    )
    esporte_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("esportes.id", ondelete="CASCADE"), nullable=False
    )
    movimento_id: Mapped[str] = mapped_column(
        String(60), ForeignKey("movimentos.id", ondelete="CASCADE"), nullable=False
    )
    articulacao_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("articulacoes.id"), nullable=False
    )
    posicao_lateralidade: Mapped[str] = mapped_column(
        String(20), default="direita"
    )  # direita | esquerda | central

    taxa_amostragem_hz: Mapped[float] = mapped_column(Float, default=20.0)
    duracao_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    total_frames: Mapped[int] = mapped_column(Integer, nullable=False)
    frames_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON serializado com os frames
    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    autor_id: Mapped[str] = mapped_column(String(36), nullable=False)
    autor_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    coletado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    # Relacionamentos
    agente: Mapped["AgenteTesteEntity"] = relationship(back_populates="amostras")
    esporte: Mapped["EsporteEntity"] = relationship(back_populates="amostras")
    movimento: Mapped["MovimentoEntity"] = relationship(back_populates="amostras")
    articulacao: Mapped["ArticulacaoEntity"] = relationship(back_populates="amostras")
