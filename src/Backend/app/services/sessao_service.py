from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status

from app.core.database import SessionDep
from app.models.entities import Circuito, Postagem, Sessao
from app.repositories.movimento_nosql_repository import MovimentoNoSQLRepository
from app.repositories.sessao_repository import SessaoRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.sessao import (
    CircuitoCreate,
    MovimentosCircuitoNoSQLResponse,
    SessaoCreate,
    SessaoOfflineSyncRequest,
)
from app.services.usuario_service import UsuarioService


class SessaoService:
    """
    Camada de Regra de Negócios para Sessões de Treino e Circuitos,
    orquestrando a persistência híbrida SQLite (relacional) + TinyDB (NoSQL de movimentos).
    """

    def __init__(
        self,
        sessao_repo: SessaoRepository,
        nosql_repo: MovimentoNoSQLRepository,
        usuario_service: UsuarioService,
    ) -> None:
        self.sessao_repo = sessao_repo
        self.nosql_repo = nosql_repo
        self.usuario_service = usuario_service

    def criar_sessao(self, dados: SessaoCreate, id_usuario_logado: str) -> Sessao:
        id_alvo = dados.id_usuario or id_usuario_logado
        nova_sessao = Sessao(
            id_usuario=id_alvo,
            id_estabelecimento=dados.id_estabelecimento,
            id_cliente=dados.id_cliente,
            modalidade=dados.modalidade,
        )
        return self.sessao_repo.create(nova_sessao)

    def buscar_por_id(self, id_sessao: str) -> Sessao:
        sessao = self.sessao_repo.get_by_id(id_sessao)
        if not sessao:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada.")
        return sessao

    def finalizar_sessao(self, id_sessao: str) -> Sessao:
        sessao = self.buscar_por_id(id_sessao)
        sessao.data_fim = datetime.now(timezone.utc)
        self.sessao_repo.session.commit()
        self.sessao_repo.session.refresh(sessao)
        return sessao

    def registrar_circuito(self, id_sessao: str, dados: CircuitoCreate) -> Circuito:
        sessao = self.buscar_por_id(id_sessao)

        circuito = Circuito(
            id_sessao=id_sessao,
            numero_rodada=dados.numero_rodada,
            hora_inicio=dados.hora_inicio,
            hora_fim=dados.hora_fim,
            pontuacao=dados.pontuacao,
        )
        circuito_criado = self.sessao_repo.add_circuito(circuito)

        # Persiste a lista de movimentos e precisão no TinyDB (NoSQL) e vincula o doc_id no SQLite
        if dados.movimentos:
            movimentos_serializados = [m.model_dump(mode="json") for m in dados.movimentos]
            doc_id = self.nosql_repo.salvar_movimentos_circuito(
                id_sessao=id_sessao,
                id_circuito=circuito_criado.id,
                versao_modelo_ia=dados.versao_modelo_ia,
                movimentos=movimentos_serializados,
            )
            circuito_criado.id_movimentos_nosql = doc_id

        # Atualiza pontuação acumulada da sessão e XP/Nível do usuário
        sessao.pontuacao_total += dados.pontuacao
        self.sessao_repo.session.commit()
        self.sessao_repo.session.refresh(circuito_criado)
        self.usuario_service.adicionar_xp(sessao.id_usuario, dados.pontuacao)

        return circuito_criado

    def sincronizar_sessao_offline(
        self, id_usuario: str, dados: SessaoOfflineSyncRequest
    ) -> Sessao:
        """Recebe uma sessão completa realizada offline no app e persiste no SQLite + TinyDB."""
        nova_sessao = Sessao(
            id_usuario=id_usuario,
            id_estabelecimento=dados.id_estabelecimento,
            id_cliente=dados.id_cliente,
            modalidade=dados.modalidade,
            data_inicio=dados.data_inicio,
            data_fim=dados.data_fim or datetime.now(timezone.utc),
            pontuacao_total=0,
        )
        sessao_criada = self.sessao_repo.create(nova_sessao)

        for circuito_dados in dados.circuitos:
            self.registrar_circuito(sessao_criada.id, circuito_dados)

        self.sessao_repo.session.refresh(sessao_criada)
        return sessao_criada

    def obter_movimentos_do_circuito(self, id_circuito: str) -> MovimentosCircuitoNoSQLResponse:
        circuito = self.sessao_repo.session.get(Circuito, id_circuito)
        if not circuito:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circuito não encontrado no banco relacional.",
            )

        doc = None
        if circuito.id_movimentos_nosql:
            doc = self.nosql_repo.buscar_por_doc_id(circuito.id_movimentos_nosql)
        if not doc:
            doc = self.nosql_repo.buscar_por_circuito(id_circuito)

        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nenhum registro de movimentos encontrado no banco NoSQL para este circuito.",
            )

        return MovimentosCircuitoNoSQLResponse(**doc)

    def listar_por_usuario(self, id_usuario: str) -> list[Sessao]:
        return self.sessao_repo.list_by_usuario(id_usuario)

    def excluir_sessao(self, id_sessao: str, id_usuario_logado: str) -> None:
        sessao = self.buscar_por_id(id_sessao)
        if sessao.id_usuario != id_usuario_logado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para excluir esta sessão.",
            )

        for circuito in sessao.circuitos:
            if circuito.id_movimentos_nosql:
                self.nosql_repo.remover_por_doc_id(circuito.id_movimentos_nosql)
            else:
                self.nosql_repo.remover_por_circuito(circuito.id)

        # Remove todas as postagens vinculadas à sessão (e eventuais postagens órfãs sem sessão do usuário)
        for post in list(sessao.postagens):
            self.sessao_repo.session.delete(post)

        postagens_orfas = (
            self.sessao_repo.session.query(Postagem)
            .filter(
                Postagem.id_usuario == id_usuario_logado,
                (Postagem.id_sessao == id_sessao) | (Postagem.id_sessao.is_(None)),
            )
            .all()
        )
        for post_orfao in postagens_orfas:
            self.sessao_repo.session.delete(post_orfao)

        self.sessao_repo.delete(sessao)


def get_sessao_service(session: SessionDep) -> SessaoService:
    sessao_repo = SessaoRepository(session)
    nosql_repo = MovimentoNoSQLRepository()
    usuario_service = UsuarioService(UsuarioRepository(session))
    return SessaoService(sessao_repo, nosql_repo, usuario_service)


SessaoServiceDep = Annotated[SessaoService, Depends(get_sessao_service)]
