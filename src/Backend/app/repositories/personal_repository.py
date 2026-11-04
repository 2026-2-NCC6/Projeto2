from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Cliente
from app.repositories.base_repository import BaseRepository


class PersonalRepository(BaseRepository[Cliente]):
    """Repositório especializado para vínculo de Clientes do Personal."""

    def __init__(self, session: Session) -> None:
        super().__init__(Cliente, session)

    def get_vinculo(self, id_personal: str, id_aluno: str) -> Optional[Cliente]:
        stmt = select(Cliente).where(
            Cliente.id_personal == id_personal,
            Cliente.id_aluno == id_aluno,
        )
        return self.session.scalar(stmt)

    def list_by_personal(self, id_personal: str) -> list[Cliente]:
        stmt = (
            select(Cliente)
            .where(Cliente.id_personal == id_personal)
            .order_by(Cliente.data_vinculo.desc())
        )
        return list(self.session.scalars(stmt).all())

