from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FLUX API - Smart Tennis Arena"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite:///./flux.db"
    NOSQL_STORAGE_DIR: str = "./storage/movimentos_nosql"

    # Configurações de Segurança e JWT
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias (ideal para App Mobile)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
