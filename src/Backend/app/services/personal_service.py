from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.database import SessionDep
from app.models.entities import Cliente, Sessao, Usuario
from app.repositories.personal_repository import PersonalRepository
from app.repositories.sessao_repository import SessaoRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.personal import ClienteCreate, ClienteUpdate


class PersonalService:
    """Camada de Regra de Negócios para Personal Trainers e Gestão de Clientes."""

    def __init__(
        self,
        personal_repo: PersonalRepository,
        usuario_repo: UsuarioRepository,
        sessao_repo: SessaoRepository,
    ) -> None:
        self.personal_repo = personal_repo
        self.usuario_repo = usuario_repo
        self.sessao_repo = sessao_repo

    def vincular_cliente(self, personal: Usuario, dados: ClienteCreate) -> Cliente:
        if personal.id == dados.id_aluno:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode adicionar a si mesmo como cliente.",
            )

        aluno = self.usuario_repo.get_by_id(dados.id_aluno)
        if not aluno:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário aluno não encontrado.",
            )

        if self.personal_repo.get_vinculo(personal.id, dados.id_aluno):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este aluno já está vinculado à sua lista de clientes.",
            )

        novo_cliente = Cliente(
            id_personal=personal.id,
            id_aluno=dados.id_aluno,
            observacoes=dados.observacoes,
        )
        return self.personal_repo.create(novo_cliente)

    def listar_clientes(self, id_personal: str) -> list[Cliente]:
        return self.personal_repo.list_by_personal(id_personal)

    def atualizar_cliente(self, id_personal: str, id_cliente: str, dados: ClienteUpdate) -> Cliente:
        cliente = self.personal_repo.get_by_id(id_cliente)
        if not cliente or cliente.id_personal != id_personal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vínculo de cliente não encontrado.",
            )

        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(cliente, campo, valor)

        self.personal_repo.session.commit()
        self.personal_repo.session.refresh(cliente)
        return cliente

    def listar_sessoes_do_cliente(self, id_personal: str, id_cliente: str) -> list[Sessao]:
        cliente = self.personal_repo.get_by_id(id_cliente)
        if not cliente or cliente.id_personal != id_personal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vínculo de cliente não encontrado.",
            )
        return self.sessao_repo.list_by_usuario(cliente.id_aluno)


def get_personal_service(session: SessionDep) -> PersonalService:
    return PersonalService(
        PersonalRepository(session),
        UsuarioRepository(session),
        SessaoRepository(session),
    )


PersonalServiceDep = Annotated[PersonalService, Depends(get_personal_service)]

