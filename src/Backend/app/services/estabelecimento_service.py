from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status

from app.core.database import SessionDep
from app.models.entities import Estabelecimento, EstabelecimentoFavorito
from app.repositories.estabelecimento_repository import EstabelecimentoRepository
from app.schemas.estabelecimento import EstabelecimentoCreate, FavoritoToggleResponse


class EstabelecimentoService:
    """Camada de Regra de Negócios para Estabelecimentos Parceiros e Favoritos."""

    def __init__(self, repo: EstabelecimentoRepository) -> None:
        self.repo = repo

    def cadastrar(self, dados: EstabelecimentoCreate) -> Estabelecimento:
        if self.repo.get_by_cnpj(dados.cnpj):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="CNPJ já cadastrado.",
            )
        novo = Estabelecimento(**dados.model_dump())
        return self.repo.create(novo)

    def listar_ativos(self, cidade: Optional[str] = None) -> list[Estabelecimento]:
        return self.repo.list_ativos(cidade)

    def alternar_favorito(self, id_usuario: str, id_estabelecimento: str) -> FavoritoToggleResponse:
        estabelecimento = self.repo.get_by_id(id_estabelecimento)
        if not estabelecimento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estabelecimento não encontrado.",
            )

        fav_existente = self.repo.get_favorito(id_usuario, id_estabelecimento)
        if fav_existente:
            self.repo.session.delete(fav_existente)
            self.repo.session.commit()
            return FavoritoToggleResponse(favoritado=False, id_estabelecimento=id_estabelecimento)

        novo_fav = EstabelecimentoFavorito(
            id_usuario=id_usuario,
            id_estabelecimento=id_estabelecimento,
        )
        self.repo.session.add(novo_fav)
        self.repo.session.commit()
        self.repo.session.refresh(novo_fav)
        return FavoritoToggleResponse(
            favoritado=True,
            id_estabelecimento=id_estabelecimento,
            favoritado_em=novo_fav.favoritado_em,
        )

    def listar_meus_favoritos(self, id_usuario: str) -> list[Estabelecimento]:
        return self.repo.list_favoritos_usuario(id_usuario)


def get_estabelecimento_service(session: SessionDep) -> EstabelecimentoService:
    return EstabelecimentoService(EstabelecimentoRepository(session))


EstabelecimentoServiceDep = Annotated[EstabelecimentoService, Depends(get_estabelecimento_service)]

