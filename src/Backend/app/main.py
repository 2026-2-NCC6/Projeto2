from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.routers import (
    auth_router,
    estabelecimento_router,
    ia_router,
    personal_router,
    sessao_router,
    social_router,
    usuario_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria todas as tabelas no SQLite e garante os usuários iniciais (user_seed)
    Base.metadata.create_all(bind=engine)
    from user_seed import seed_usuarios

    seed_usuarios()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(usuario_router.router)
app.include_router(sessao_router.router)
app.include_router(estabelecimento_router.router)
app.include_router(personal_router.router)
app.include_router(social_router.router)
app.include_router(ia_router.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
