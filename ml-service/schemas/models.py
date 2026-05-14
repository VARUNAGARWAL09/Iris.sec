from pydantic import BaseModel


class ModelMetadata(BaseModel):
    name: str
    version: str
    framework: str
    loaded: bool
    artifact_path: str | None = None
    trained_at: str | None = None
    metrics: dict[str, float] = {}


class ModelStatusResponse(BaseModel):
    registry_version: str
    models: list[ModelMetadata]
    active_model: str | None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    models_loaded: int
