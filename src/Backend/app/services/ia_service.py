from pathlib import Path
import shutil
from typing import Annotated, Any, Optional

from fastapi import Depends, HTTPException, UploadFile, status

from app.core.database import SessionDep
from app.models.entities import ModeloIA
from app.repositories.ia_repository import ModeloIARepository
from app.repositories.movimento_nosql_repository import MovimentoNoSQLRepository

STORAGE_MODELOS_DIR = Path("./storage/modelos")


class ModeloIAService:
    """
    Camada de Regra de Negócios para MLOps: upload de novas versões treinadas no Desktop,
    distribuição OTA para o App Mobile (Offline-First) e exportação de dataset do TinyDB.
    """

    def __init__(
        self,
        ia_repo: ModeloIARepository,
        nosql_repo: MovimentoNoSQLRepository,
    ) -> None:
        self.ia_repo = ia_repo
        self.nosql_repo = nosql_repo
        STORAGE_MODELOS_DIR.mkdir(parents=True, exist_ok=True)

    def publicar_novo_modelo(
        self,
        arquivo: UploadFile,
        versao: str,
        modalidade: str,
        formato: str,
        acuracia: Optional[float],
        changelog: Optional[str],
        ativar_imediatamente: bool = True,
    ) -> ModeloIA:
        if self.ia_repo.get_by_versao_e_modalidade(versao, modalidade):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A versão '{versao}' já existe para a modalidade '{modalidade}'.",
            )

        extensao = Path(arquivo.filename or "modelo.bin").suffix or f".{formato}"
        nome_seguro = f"flux_{modalidade}_v{versao.replace('.', '_')}{extensao}"
        destino = STORAGE_MODELOS_DIR / nome_seguro

        with destino.open("wb") as buffer:
            shutil.copyfileobj(arquivo.file, buffer)

        if ativar_imediatamente:
            self.ia_repo.desativar_todos_da_modalidade(modalidade)

        novo_modelo = ModeloIA(
            versao=versao,
            modalidade=modalidade,
            formato=formato,
            acuracia=acuracia,
            caminho_arquivo=str(destino),
            changelog=changelog,
            ativo=ativar_imediatamente,
        )
        return self.ia_repo.create(novo_modelo)

    def obter_modelo_ativo(self, modalidade: str) -> ModeloIA:
        modelo = self.ia_repo.get_ativo_por_modalidade(modalidade)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Nenhum modelo de IA ativo encontrado para a modalidade '{modalidade}'.",
            )
        return modelo

    def listar_modelos(self, modalidade: Optional[str] = None) -> list[ModeloIA]:
        return self.ia_repo.list_por_modalidade(modalidade)

    def ativar_versao(self, id_modelo: str) -> ModeloIA:
        modelo = self.ia_repo.get_by_id(id_modelo)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Modelo de IA não encontrado.",
            )

        self.ia_repo.desativar_todos_da_modalidade(modelo.modalidade)
        modelo.ativo = True
        self.ia_repo.session.commit()
        self.ia_repo.session.refresh(modelo)
        return modelo

    def obter_caminho_download(self, id_modelo: str) -> tuple[Path, ModeloIA]:
        modelo = self.ia_repo.get_by_id(id_modelo)
        if not modelo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Modelo de IA não encontrado.",
            )

        caminho = Path(modelo.caminho_arquivo)
        if not caminho.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo binário do modelo não encontrado no armazenamento do servidor.",
            )
        return caminho, modelo

    def exportar_telemetria_para_treino(self) -> list[dict[str, Any]]:
        return self.nosql_repo.listar_todos()


def get_ia_service(session: SessionDep) -> ModeloIAService:
    return ModeloIAService(ModeloIARepository(session), MovimentoNoSQLRepository())


ModeloIAServiceDep = Annotated[ModeloIAService, Depends(get_ia_service)]

