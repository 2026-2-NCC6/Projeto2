from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.database import SessionDep
from app.models.entities import Comentario, Curtida, Postagem, Seguidor
from app.repositories.social_repository import SocialRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.social import (
    ComentarioCreate,
    CurtidaToggleResponse,
    PostagemCreate,
    SeguidoresResumoResponse,
    SeguirToggleResponse,
)


class SocialService:
    """Camada de Regra de Negócios para Rede Social (Seguidores, Postagens, Curtidas e Comentários)."""

    def __init__(self, social_repo: SocialRepository, usuario_repo: UsuarioRepository) -> None:
        self.social_repo = social_repo
        self.usuario_repo = usuario_repo

    def alternar_seguir(self, id_seguidor: str, id_seguido: str) -> SeguirToggleResponse:
        if id_seguidor == id_seguido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode seguir a si mesmo.",
            )

        alvo = self.usuario_repo.get_by_id(id_seguido)
        if not alvo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado.",
            )

        relacao = self.social_repo.get_relacao_seguidor(id_seguidor, id_seguido)
        if relacao:
            self.social_repo.session.delete(relacao)
            self.social_repo.session.commit()
            return SeguirToggleResponse(seguindo=False, id_seguido=id_seguido, status=None)

        status_inicial = "pendente" if alvo.privado else "aceito"
        nova_relacao = Seguidor(
            id_seguidor=id_seguidor,
            id_seguido=id_seguido,
            status=status_inicial,
        )
        self.social_repo.session.add(nova_relacao)
        self.social_repo.session.commit()
        return SeguirToggleResponse(seguindo=True, id_seguido=id_seguido, status=status_inicial)

    def obter_resumo_seguidores(self, id_usuario: str) -> SeguidoresResumoResponse:
        seguidores = self.social_repo.list_seguidores_ids(id_usuario)
        seguindo = self.social_repo.list_seguindo_ids(id_usuario)
        return SeguidoresResumoResponse(
            id_usuario=id_usuario,
            total_seguidores=len(seguidores),
            total_seguindo=len(seguindo),
            seguidores_ids=seguidores,
            seguindo_ids=seguindo,
        )

    def criar_postagem(self, id_usuario: str, dados: PostagemCreate) -> Postagem:
        if not dados.id_sessao:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Toda publicação deve estar vinculada a uma sessão de treino.",
            )
        nova_postagem = Postagem(
            id_usuario=id_usuario,
            id_sessao=dados.id_sessao,
            legenda=dados.legenda,
            midia_url=dados.midia_url,
            visibilidade=dados.visibilidade,
        )
        return self.social_repo.create(nova_postagem)

    def listar_feed(self, id_usuario: str) -> list[Postagem]:
        return self.social_repo.list_feed_for_usuario(id_usuario)

    def listar_postagens_usuario(
        self, id_usuario_alvo: str, id_usuario_logado: str
    ) -> list[Postagem]:
        incluir_privadas = id_usuario_alvo == id_usuario_logado
        return self.social_repo.list_by_usuario(
            id_usuario=id_usuario_alvo, incluir_privadas=incluir_privadas
        )

    def alternar_curtida(self, id_usuario: str, id_postagem: str) -> CurtidaToggleResponse:
        postagem = self.social_repo.get_by_id(id_postagem)
        if not postagem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada.",
            )

        curtida_existente = self.social_repo.get_curtida(id_postagem, id_usuario)
        if curtida_existente:
            self.social_repo.session.delete(curtida_existente)
            self.social_repo.session.commit()
            total = self.social_repo.count_curtidas(id_postagem)
            return CurtidaToggleResponse(curtido=False, id_postagem=id_postagem, total_curtidas=total)

        nova_curtida = Curtida(id_postagem=id_postagem, id_usuario=id_usuario)
        self.social_repo.session.add(nova_curtida)
        self.social_repo.session.commit()
        total = self.social_repo.count_curtidas(id_postagem)
        return CurtidaToggleResponse(curtido=True, id_postagem=id_postagem, total_curtidas=total)

    def adicionar_comentario(
        self, id_usuario: str, id_postagem: str, dados: ComentarioCreate
    ) -> Comentario:
        postagem = self.social_repo.get_by_id(id_postagem)
        if not postagem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada.",
            )

        comentario = Comentario(
            id_postagem=id_postagem,
            id_usuario=id_usuario,
            texto=dados.texto,
        )
        return self.social_repo.add_comentario(comentario)


def get_social_service(session: SessionDep) -> SocialService:
    return SocialService(SocialRepository(session), UsuarioRepository(session))


SocialServiceDep = Annotated[SocialService, Depends(get_social_service)]

