from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from app.core.nosql import get_circuit_document_db, get_nosql_storage_dir


class MovimentoNoSQLRepository:
    """
    Repositório Não Relacional Particionado (TinyDB por documento):
    Cada circuito gera seu próprio arquivo de documento isolado em `storage/movimentos_nosql/`,
    garantindo leitura e escrita O(1) sem gargalo de arquivo único.
    """

    def __init__(self, storage_dir: Optional[Path] = None) -> None:
        self.storage_dir = storage_dir or get_nosql_storage_dir()

    @staticmethod
    def gerar_doc_id(id_circuito: str) -> str:
        return f"mov_{id_circuito}"

    def salvar_movimentos_circuito(
        self,
        id_sessao: str,
        id_circuito: str,
        versao_modelo_ia: Optional[str],
        movimentos: list[dict[str, Any]],
    ) -> str:
        """Cria um documento NoSQL exclusivo para o circuito e retorna seu identificador (id_nosql)."""
        doc_id = self.gerar_doc_id(id_circuito)
        total = len(movimentos)
        precisao_media = (
            round(sum(float(m.get("precisao", 0.0)) for m in movimentos) / total, 4)
            if total > 0
            else 0.0
        )

        documento = {
            "id_nosql": doc_id,
            "id_sessao": id_sessao,
            "id_circuito": id_circuito,
            "versao_modelo_ia": versao_modelo_ia or "1.0.0",
            "total_movimentos": total,
            "precisao_media": precisao_media,
            "registrado_em": datetime.now(timezone.utc).isoformat(),
            "movimentos": movimentos,
        }

        with get_circuit_document_db(doc_id) as db:
            db.truncate()
            db.insert(documento)

        return doc_id

    def buscar_por_doc_id(self, id_movimentos_nosql: str) -> Optional[dict[str, Any]]:
        """Lê diretamente o arquivo isolado do circuito (O(1)) pelo id_movimentos_nosql."""
        if not id_movimentos_nosql:
            return None

        caminho = self.storage_dir / f"{id_movimentos_nosql}.json"
        if not caminho.exists():
            return None

        with get_circuit_document_db(id_movimentos_nosql) as db:
            registros = db.all()
            if not registros:
                return None
            return dict(registros[0])

    def buscar_por_circuito(self, id_circuito: str) -> Optional[dict[str, Any]]:
        """Busca diretamente pelo id_circuito em O(1)."""
        return self.buscar_por_doc_id(self.gerar_doc_id(id_circuito))

    def remover_por_doc_id(self, id_movimentos_nosql: Optional[str]) -> bool:
        """Remove o arquivo de documento NoSQL do circuito caso exista."""
        if not id_movimentos_nosql:
            return False

        caminho = self.storage_dir / f"{id_movimentos_nosql}.json"
        if caminho.exists():
            caminho.unlink(missing_ok=True)
            return True
        return False

    def remover_por_circuito(self, id_circuito: str) -> bool:
        """Remove o documento NoSQL diretamente pelo id_circuito."""
        return self.remover_por_doc_id(self.gerar_doc_id(id_circuito))

    def listar_todos(self) -> list[dict[str, Any]]:
        """Percorre todos os documentos particionados para exportar o dataset de treino da IA."""
        documentos: list[dict[str, Any]] = []
        for arquivo in sorted(self.storage_dir.glob("mov_*.json")):
            doc_id = arquivo.stem
            doc = self.buscar_por_doc_id(doc_id)
            if doc:
                documentos.append(doc)
        return documentos
