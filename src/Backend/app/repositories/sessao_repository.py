from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Circuito, Sessao
from app.repositories.base_repository import BaseRepository


class SessaoRepository(BaseRepository[Sessao]):
    """Repositório especializado para Sessao e seus Circuitos."""

    def __init__(self, session: Session) -> None:
        super().__init__(Sessao, session)

    def list_by_usuario(self, id_usuario: str) -> list[Sessao]:
        stmt = (
            select(Sessao)
            .where(Sessao.id_usuario == id_usuario)
            .order_by(Sessao.data_inicio.desc())
        )
        return list(self.session.scalars(stmt).all())

    def add_circuito(self, circuito: Circuito) -> Circuito:
        self.session.add(circuito)
        self.session.commit()
        self.session.refresh(circuito)
        return circuito

