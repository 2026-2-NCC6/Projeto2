from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.database import SessionDep
from app.core.security import gerar_hash_senha
from app.models.entities import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


class UsuarioService:
    """Camada de Regra de Negócios (SRP/DIP) para Usuários e Gamificação (XP/Nível)."""

    XP_POR_NIVEL = 1000

    def __init__(self, repo: UsuarioRepository) -> None:
        self.repo = repo

    def criar_usuario(self, dados: UsuarioCreate) -> Usuario:
        if self.repo.get_by_email(dados.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado.",
            )
        if self.repo.get_by_username(dados.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username já está em uso.",
            )

        senha_hash = gerar_hash_senha(dados.senha)
        novo_usuario = Usuario(
            nome=dados.nome,
            username=dados.username,
            email=dados.email,
            senha_hash=senha_hash,
            tipo_perfil=dados.tipo_perfil,
            foto_perfil_url=dados.foto_perfil_url,
            bio=dados.bio,
            privado=dados.privado,
        )
        return self.repo.create(novo_usuario)

    def atualizar_perfil(self, usuario: Usuario, dados: UsuarioUpdate) -> Usuario:
        campos = dados.model_dump(exclude_unset=True)
        novo_username = campos.get("username")
        if novo_username and novo_username != usuario.username:
            existente = self.repo.get_by_username(novo_username)
            if existente and existente.id != usuario.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username já está em uso.",
                )

        for campo, valor in campos.items():
            setattr(usuario, campo, valor)

        self.repo.session.commit()
        self.repo.session.refresh(usuario)
        return usuario

    def buscar_usuarios(self, termo: str) -> list[Usuario]:
        return self.repo.search_by_name_or_username(termo)

    def adicionar_xp(self, id_usuario: str, pontos_ganhos: int) -> Usuario:
        usuario = self.repo.get_by_id(id_usuario)
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")

        usuario.xp_total += max(0, pontos_ganhos)
        usuario.nivel = 1 + (usuario.xp_total // self.XP_POR_NIVEL)
        self.repo.session.commit()
        self.repo.session.refresh(usuario)
        return usuario


def get_usuario_service(session: SessionDep) -> UsuarioService:
    return UsuarioService(UsuarioRepository(session))


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
