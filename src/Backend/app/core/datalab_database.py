from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models.datalab_entities import DataLabBase

datalab_engine = create_engine(
    settings.DATALAB_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)


@event.listens_for(datalab_engine, "connect")
def set_datalab_sqlite_pragma(dbapi_connection, connection_record) -> None:
    """Ativa integridade referencial de Foreign Keys no SQLite paralelo de IA."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


DataLabSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=datalab_engine)


def get_datalab_session() -> Generator[Session, None, None]:
    """Dependency FastAPI que fornece uma sessão do banco paralelo de IA."""
    with DataLabSessionLocal() as session:
        yield session


DataLabSessionDep = Annotated[Session, Depends(get_datalab_session)]
