from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/peruanos"
    REDIS_URL: str = "redis://localhost:6379"
    TURNSTILE_SECRET_KEY: str = "1x0000000000000000000000000000000AA"
    ADMIN_API_KEY: str = "change-this-in-production"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    DNI_API_URL: str = "https://api.apis.net.pe/v2/reniec/dni"
    DNI_API_TOKEN: str = ""
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
