from pathlib import Path

from tinydb import TinyDB

from app.core.config import settings


def get_nosql_storage_dir() -> Path:
    """Garante a existência do diretório de documentos NoSQL particionados."""
    diretorio = Path(settings.NOSQL_STORAGE_DIR)
    diretorio.mkdir(parents=True, exist_ok=True)
    return diretorio


def get_circuit_document_db(doc_id: str) -> TinyDB:
    """
    Abre ou cria uma instância TinyDB isolada para um único documento de circuito (O(1)),
    evitando reescrever um arquivo monolítico a cada treino.
    """
    caminho_arquivo = get_nosql_storage_dir() / f"{doc_id}.json"
    return TinyDB(caminho_arquivo, indent=2, ensure_ascii=False)
