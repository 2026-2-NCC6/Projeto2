from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.entities import Comentario, Curtida, Postagem, Seguidor, Sessao
from app.repositories.base_repository import BaseRepository


class SocialRepository(BaseRepository[Postagem]):
    """Repositório especializado para Grafo Social (Seguidores) e Feed (Postagens, Curtidas, Comentários)."""

    def __init__(self, session: Session) -> None:
        super().__init__(Postagem, session)

    def get_relacao_seguidor(self, id_seguidor: str, id_seguido: str) -> Optional[Seguidor]:
        stmt = select(Seguidor).where(
            Seguidor.id_seguidor == id_seguidor,
            Seguidor.id_seguido == id_seguido,
        )
        return self.session.scalar(stmt)

    def list_seguidores_ids(self, id_usuario: str) -> list[str]:
        stmt = select(Seguidor.id_seguidor).where(
            Seguidor.id_seguido == id_usuario,
            Seguidor.status == "aceito",
        )
        return list(self.session.scalars(stmt).all())

    def list_seguindo_ids(self, id_usuario: str) -> list[str]:
        stmt = select(Seguidor.id_seguido).where(
            Seguidor.id_seguidor == id_usuario,
            Seguidor.status == "aceito",
        )
        return list(self.session.scalars(stmt).all())

    def list_feed_for_usuario(self, id_usuario: str, limit: int = 50) -> list[Postagem]:
        # Limpa automaticamente eventuais postagens órfãs (cuja sessão já foi apagada ou está sem vínculo)
        ids_sessoes_ativas = select(Sessao.id)
        stmt_orfas = select(Postagem).where(
            or_(
                Postagem.id_sessao.is_(None),
                ~Postagem.id_sessao.in_(ids_sessoes_ativas),
            )
        )
        orfas = list(self.session.scalars(stmt_orfas).all())
        if orfas:
            for post_orfao in orfas:
                self.session.delete(post_orfao)
            self.session.commit()

        seguindo_ids = self.list_seguindo_ids(id_usuario)
        autores_visiveis = set(seguindo_ids + [id_usuario])
        stmt = (
            select(Postagem)
            .where(
                Postagem.id_sessao.is_not(None),
                Postagem.id_sessao.in_(ids_sessoes_ativas),
                Postagem.visibilidade != "privado",
                or_(
                    Postagem.id_usuario.in_(autores_visiveis),
                    Postagem.visibilidade == "publico",
                ),
            )
            .order_by(Postagem.criado_em.desc())
            .limit(limit)
        )
        return list(self.session.scalars(stmt).all())

    def list_by_usuario(
        self, id_usuario: str, incluir_privadas: bool = False, limit: int = 100
    ) -> list[Postagem]:
        ids_sessoes_ativas = select(Sessao.id)
        filtros = [
            Postagem.id_usuario == id_usuario,
            Postagem.id_sessao.is_not(None),
            Postagem.id_sessao.in_(ids_sessoes_ativas),
        ]
        if not incluir_privadas:
            filtros.append(Postagem.visibilidade != "privado")

        stmt = (
            select(Postagem)
            .where(*filtros)
            .order_by(Postagem.criado_em.desc())
            .limit(limit)
        )
        return list(self.session.scalars(stmt).all())

    def get_curtida(self, id_postagem: str, id_usuario: str) -> Optional[Curtida]:
        stmt = select(Curtida).where(
            Curtida.id_postagem == id_postagem,
            Curtida.id_usuario == id_usuario,
        )
        return self.session.scalar(stmt)

    def count_curtidas(self, id_postagem: str) -> int:
        stmt = select(func.count()).select_from(Curtida).where(Curtida.id_postagem == id_postagem)
        return int(self.session.scalar(stmt) or 0)

    def add_comentario(self, comentario: Comentario) -> Comentario:
        self.session.add(comentario)
        self.session.commit()
        self.session.refresh(comentario)
        return comentario

