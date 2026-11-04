from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.entities import Usuario
from app.repositories.base_repository import BaseRepository


class UsuarioRepository(BaseRepository[Usuario]):
    """Repositório especializado para consultas da entidade Usuario."""

    def __init__(self, session: Session) -> None:
        super().__init__(Usuario, session)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.email == email)
        return self.session.scalar(stmt)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.username == username)
        return self.session.scalar(stmt)

    def search_by_name_or_username(self, termo: str, limit: int = 20) -> list[Usuario]:
        padrao = f"%{termo}%"
        stmt = (
            select(Usuario)
            .where(or_(Usuario.nome.ilike(padrao), Usuario.username.ilike(padrao)))
            .limit(limit)
        )
        return list(self.session.scalars(stmt).all())
