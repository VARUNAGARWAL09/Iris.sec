import json
from pathlib import Path
from typing import Any

import joblib

from models.base import LightGBMModelAdapter, LoadedModel, ModelAdapter, SklearnModelAdapter, XGBoostModelAdapter
from schemas.models import ModelMetadata, ModelStatusResponse
from utils.config import settings
from utils.logging import get_logger

logger = get_logger(__name__)


class ModelRegistry:
    def __init__(self, model_dir: Path) -> None:
        self.model_dir = model_dir
        self.registry_version = "1.0.0"
        self._models: dict[str, LoadedModel] = {}
        self._adapters: dict[str, ModelAdapter] = {}
        self._active_model: str | None = None

    def load_all(self) -> None:
        self.model_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = self.model_dir / "manifest.json"
        manifest = self._read_manifest(manifest_path)
        self.registry_version = str(manifest.get("registry_version", self.registry_version))

        for item in manifest.get("models", []):
            self._load_model(item)

        active = manifest.get("active_model")
        if active in self._adapters:
            self._active_model = active
        elif self._adapters:
            self._active_model = next(iter(self._adapters))

    def _read_manifest(self, manifest_path: Path) -> dict[str, Any]:
        if not manifest_path.exists():
            return {"registry_version": self.registry_version, "models": [], "active_model": None}
        with manifest_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _load_model(self, item: dict[str, Any]) -> None:
        name = item["name"]
        framework = item.get("framework", "sklearn")
        artifact_path = self.model_dir / item["artifact"]

        if not artifact_path.exists():
            logger.warning("Model artifact missing", extra={"model": name, "path": str(artifact_path)})
            return

        estimator = joblib.load(artifact_path)
        loaded_model = LoadedModel(
            name=name,
            version=str(item.get("version", "0.0.0")),
            framework=framework,
            estimator=estimator,
            artifact_path=str(artifact_path),
            trained_at=item.get("trained_at"),
            metrics=item.get("metrics", {}),
        )
        adapter = self._adapter_for(loaded_model)
        self._models[name] = loaded_model
        self._adapters[name] = adapter

    def _adapter_for(self, loaded_model: LoadedModel) -> ModelAdapter:
        framework = loaded_model.framework.lower()
        if framework == "xgboost":
            return XGBoostModelAdapter(loaded_model)
        if framework == "lightgbm":
            return LightGBMModelAdapter(loaded_model)
        return SklearnModelAdapter(loaded_model)

    @property
    def active_model_name(self) -> str | None:
        return self._active_model

    def active_adapter(self) -> ModelAdapter | None:
        if not self._active_model:
            return None
        return self._adapters.get(self._active_model)

    def get_adapter(self, name: str | None = None) -> ModelAdapter | None:
        if name is None:
            return self.active_adapter()
        return self._adapters.get(name)

    def model_count(self) -> int:
        return len(self._adapters)

    def status(self) -> ModelStatusResponse:
        models = [
            ModelMetadata(
                name=model.name,
                version=model.version,
                framework=model.framework,
                loaded=name in self._adapters,
                artifact_path=model.artifact_path,
                trained_at=model.trained_at,
                metrics=model.metrics,
            )
            for name, model in self._models.items()
        ]
        return ModelStatusResponse(
            registry_version=self.registry_version,
            models=models,
            active_model=self._active_model,
        )


model_registry = ModelRegistry(settings.model_dir)
model_registry.load_all()

