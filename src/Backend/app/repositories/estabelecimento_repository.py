from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Estabelecimento, EstabelecimentoFavorito
from app.repositories.base_repository import BaseRepository


class EstabelecimentoRepository(BaseRepository[Estabelecimento]):
    """Repositório especializado para Estabelecimentos e Estabelecimentos Favoritos."""

    def __init__(self, session: Session) -> None:
        super().__init__(Estabelecimento, session)

    def get_by_cnpj(self, cnpj: str) -> Optional[Estabelecimento]:
        stmt = select(Estabelecimento).where(Estabelecimento.cnpj == cnpj)
        return self.session.scalar(stmt)

    def list_ativos(self, cidade: Optional[str] = None) -> list[Estabelecimento]:
        stmt = select(Estabelecimento).where(Estabelecimento.parceiro_ativo.is_(True))
        if cidade:
            stmt = stmt.where(Estabelecimento.cidade.ilike(f"%{cidade}%"))
        return list(self.session.scalars(stmt).all())

    def get_favorito(
        self, id_usuario: str, id_estabelecimento: str
    ) -> Optional[EstabelecimentoFavorito]:
        stmt = select(EstabelecimentoFavorito).where(
            EstabelecimentoFavorito.id_usuario == id_usuario,
            EstabelecimentoFavorito.id_estabelecimento == id_estabelecimento,
        )
        return self.session.scalar(stmt)

    def list_favoritos_usuario(self, id_usuario: str) -> list[Estabelecimento]:
        stmt = (
            select(Estabelecimento)
            .join(
                EstabelecimentoFavorito,
                EstabelecimentoFavorito.id_estabelecimento == Estabelecimento.id,
            )
            .where(EstabelecimentoFavorito.id_usuario == id_usuario)
        )
        return list(self.session.scalars(stmt).all())

