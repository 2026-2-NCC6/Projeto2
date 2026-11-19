from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
import uuid

from tinydb import Query, TinyDB

from app.core.config import settings


class DatasetNoSQLRepository:
    """
    Repositório NoSQL via TinyDB para armazenamento e exportação do dataset
    de treinamento supervisionado de Inteligência Artificial (golpes de tênis).
    """

    def __init__(self, storage_path: Optional[Path] = None) -> None:
        if storage_path:
            self.db_path = storage_path
        else:
            base_dir = Path(settings.NOSQL_STORAGE_DIR).parent / "dataset_treino"
            base_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = base_dir / "amostras_rotuladas.json"

    def _get_db(self) -> TinyDB:
        return TinyDB(self.db_path, indent=2, ensure_ascii=False)

    def salvar_amostra(self, dados: dict[str, Any]) -> dict[str, Any]:
        doc_id = str(uuid.uuid4())
        registro = {
            "id": doc_id,
            "esporte": dados.get("esporte", "Tênis"),
            "tipo_movimento": dados["tipo_movimento"],
            "lateralidade": dados.get("lateralidade", "destro"),
            "empunhadura": dados.get("empunhadura"),
            "taxa_amostragem_hz": dados.get("taxa_amostragem_hz", 20.0),
            "duracao_ms": dados["duracao_ms"],
            "total_frames": len(dados.get("frames", [])),
            "frames": dados.get("frames", []),
            "notas": dados.get("notas"),
            "autor_id": dados["autor_id"],
            "autor_username": dados.get("autor_username"),
            "coletado_em": datetime.now(timezone.utc).isoformat(),
        }

        with self._get_db() as db:
            db.insert(registro)

        return registro

    def listar_amostras(
        self,
        tipo_movimento: Optional[str] = None,
        esporte: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        with self._get_db() as db:
            todos = db.all()

        filtrados = todos
        if esporte:
            filtrados = [a for a in filtrados if a.get("esporte", "").lower() == esporte.lower()]
        if tipo_movimento:
            filtrados = [a for a in filtrados if a.get("tipo_movimento", "").lower() == tipo_movimento.lower()]
        return filtrados

    def buscar_por_id(self, id_amostra: str) -> Optional[dict[str, Any]]:
        Amostra = Query()
        with self._get_db() as db:
            resultado = db.search(Amostra.id == id_amostra)
        return resultado[0] if resultado else None

    def excluir_amostra(self, id_amostra: str) -> bool:
        Amostra = Query()
        with self._get_db() as db:
            removidos = db.remove(Amostra.id == id_amostra)
        return len(removidos) > 0

    def obter_estatisticas(self) -> dict[str, Any]:
        with self._get_db() as db:
            amostras = db.all()

        distribuicao_mov: dict[str, int] = {}
        distribuicao_esp: dict[str, int] = {}
        total_frames = 0

        for a in amostras:
            esp = a.get("esporte", "Tênis")
            distribuicao_esp[esp] = distribuicao_esp.get(esp, 0) + 1

            tipo = a.get("tipo_movimento", "Desconhecido")
            distribuicao_mov[tipo] = distribuicao_mov.get(tipo, 0) + 1
            total_frames += a.get("total_frames", 0)

        return {
            "total_amostras": len(amostras),
            "total_frames": total_frames,
            "distribuicao_movimentos": distribuicao_mov,
            "distribuicao_esportes": distribuicao_esp,
        }

