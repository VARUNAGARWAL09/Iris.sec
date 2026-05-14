from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    service_name: str = "iris-sec-ml-service"
    service_version: str = "1.0.0"
    environment: str = Field(default="development", alias="ML_ENV")
    model_dir: Path = Field(default=Path("artifacts"), alias="ML_MODEL_DIR")
    log_level: str = Field(default="INFO", alias="ML_LOG_LEVEL")
    allowed_origins: list[str] = ["*"]
    inference_timeout_seconds: float = 10.0
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

