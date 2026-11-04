from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.entities import ModeloIA
from app.repositories.base_repository import BaseRepository


class ModeloIARepository(BaseRepository[ModeloIA]):
    """Repositório especializado para versionamento e distribuição OTA de Modelos de IA."""

    def __init__(self, session: Session) -> None:
        super().__init__(ModeloIA, session)

    def get_by_versao_e_modalidade(self, versao: str, modalidade: str) -> Optional[ModeloIA]:
        stmt = select(ModeloIA).where(
            ModeloIA.versao == versao,
            ModeloIA.modalidade == modalidade,
        )
        return self.session.scalar(stmt)

    def get_ativo_por_modalidade(self, modalidade: str) -> Optional[ModeloIA]:
        stmt = (
            select(ModeloIA)
            .where(ModeloIA.modalidade == modalidade, ModeloIA.ativo.is_(True))
            .order_by(ModeloIA.criado_em.desc())
        )
        return self.session.scalar(stmt)

    def list_por_modalidade(self, modalidade: Optional[str] = None) -> list[ModeloIA]:
        stmt = select(ModeloIA).order_by(ModeloIA.criado_em.desc())
        if modalidade:
            stmt = stmt.where(ModeloIA.modalidade == modalidade)
        return list(self.session.scalars(stmt).all())

    def desativar_todos_da_modalidade(self, modalidade: str) -> None:
        stmt = (
            update(ModeloIA)
            .where(ModeloIA.modalidade == modalidade)
            .values(ativo=False)
        )
        self.session.execute(stmt)
        self.session.commit()

