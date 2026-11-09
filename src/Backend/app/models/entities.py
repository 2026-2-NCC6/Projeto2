from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, generate_uuid


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    tipo_perfil: Mapped[str] = mapped_column(String(30), default="atleta")  # atleta | personal
    foto_perfil_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    privado: Mapped[bool] = mapped_column(Boolean, default=False)
    xp_total: Mapped[int] = mapped_column(Integer, default=0)
    nivel: Mapped[int] = mapped_column(Integer, default=1)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    # Relacionamentos
    sessoes: Mapped[list["Sessao"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    favoritos: Mapped[list["EstabelecimentoFavorito"]] = relationship(
        back_populates="usuario", cascade="all, delete-orphan"
    )
    postagens: Mapped[list["Postagem"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")


class Seguidor(Base):
    __tablename__ = "seguidores"
    __table_args__ = (UniqueConstraint("id_seguidor", "id_seguido", name="uq_seguidor_seguido"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_seguidor: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    id_seguido: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="aceito")  # aceito | pendente
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())


class Cliente(Base):
    __tablename__ = "clientes"
    __table_args__ = (UniqueConstraint("id_personal", "id_aluno", name="uq_personal_aluno"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_personal: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    id_aluno: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), default="ativo")  # ativo | inativo
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data_vinculo: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    sessoes_acompanhadas: Mapped[list["Sessao"]] = relationship(back_populates="cliente")


class Estabelecimento(Base):
    __tablename__ = "estabelecimento"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(18), unique=True, nullable=False)
    endereco: Mapped[str] = mapped_column(String(255), nullable=False)
    cidade: Mapped[str] = mapped_column(String(100), nullable=False)
    estado: Mapped[str] = mapped_column(String(2), nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    parceiro_ativo: Mapped[bool] = mapped_column(Boolean, default=True)

    sessoes: Mapped[list["Sessao"]] = relationship(back_populates="estabelecimento")
    favoritado_por: Mapped[list["EstabelecimentoFavorito"]] = relationship(
        back_populates="estabelecimento", cascade="all, delete-orphan"
    )


class EstabelecimentoFavorito(Base):
    __tablename__ = "estabelecimentos_favoritos"
    __table_args__ = (UniqueConstraint("id_usuario", "id_estabelecimento", name="uq_usuario_estabelecimento_fav"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_usuario: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    id_estabelecimento: Mapped[str] = mapped_column(
        String(36), ForeignKey("estabelecimento.id", ondelete="CASCADE"), nullable=False
    )
    favoritado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    usuario: Mapped["Usuario"] = relationship(back_populates="favoritos")
    estabelecimento: Mapped["Estabelecimento"] = relationship(back_populates="favoritado_por")


class Sessao(Base):
    __tablename__ = "sessoes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_usuario: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    id_estabelecimento: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("estabelecimento.id", ondelete="SET NULL"), nullable=True
    )
    id_cliente: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("clientes.id", ondelete="SET NULL"), nullable=True
    )
    modalidade: Mapped[str] = mapped_column(String(50), default="tenis")  # tenis | musculacao
    data_inicio: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())
    data_fim: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    pontuacao_total: Mapped[int] = mapped_column(Integer, default=0)

    usuario: Mapped["Usuario"] = relationship(back_populates="sessoes")
    estabelecimento: Mapped[Optional["Estabelecimento"]] = relationship(back_populates="sessoes")
    cliente: Mapped[Optional["Cliente"]] = relationship(back_populates="sessoes_acompanhadas")
    circuitos: Mapped[list["Circuito"]] = relationship(
        back_populates="sessao", cascade="all, delete-orphan"
    )
    postagens: Mapped[list["Postagem"]] = relationship(
        back_populates="sessao", cascade="all, delete-orphan"
    )


class Circuito(Base):
    __tablename__ = "circuitos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_sessao: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessoes.id", ondelete="CASCADE"), nullable=False
    )
    id_movimentos_nosql: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    numero_rodada: Mapped[int] = mapped_column(Integer, nullable=False)
    hora_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    hora_fim: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    pontuacao: Mapped[int] = mapped_column(Integer, default=0)

    sessao: Mapped["Sessao"] = relationship(back_populates="circuitos")


class Postagem(Base):
    __tablename__ = "postagens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_usuario: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    id_sessao: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("sessoes.id", ondelete="CASCADE"), nullable=True
    )
    legenda: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    midia_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visibilidade: Mapped[str] = mapped_column(String(20), default="publico")  # publico | seguidores | privado
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    usuario: Mapped["Usuario"] = relationship(back_populates="postagens")
    sessao: Mapped[Optional["Sessao"]] = relationship(back_populates="postagens")
    curtidas: Mapped[list["Curtida"]] = relationship(
        back_populates="postagem", cascade="all, delete-orphan"
    )
    comentarios: Mapped[list["Comentario"]] = relationship(
        back_populates="postagem", cascade="all, delete-orphan"
    )


class Curtida(Base):
    __tablename__ = "curtidas"
    __table_args__ = (UniqueConstraint("id_postagem", "id_usuario", name="uq_postagem_usuario_curtida"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_postagem: Mapped[str] = mapped_column(
        String(36), ForeignKey("postagens.id", ondelete="CASCADE"), nullable=False
    )
    id_usuario: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    postagem: Mapped["Postagem"] = relationship(back_populates="curtidas")


class Comentario(Base):
    __tablename__ = "comentarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    id_postagem: Mapped[str] = mapped_column(
        String(36), ForeignKey("postagens.id", ondelete="CASCADE"), nullable=False
    )
    id_usuario: Mapped[str] = mapped_column(
        String(36), ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False
    )
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())

    postagem: Mapped["Postagem"] = relationship(back_populates="comentarios")


class ModeloIA(Base):
    __tablename__ = "modelos_ia"
    __table_args__ = (UniqueConstraint("versao", "modalidade", name="uq_versao_modalidade_ia"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    versao: Mapped[str] = mapped_column(String(30), nullable=False)
    modalidade: Mapped[str] = mapped_column(String(50), default="tenis", nullable=False)
    formato: Mapped[str] = mapped_column(String(30), default="tflite", nullable=False)
    acuracia: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    caminho_arquivo: Mapped[str] = mapped_column(String(500), nullable=False)
    changelog: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now())


