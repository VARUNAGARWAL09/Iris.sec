from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

import numpy as np


@dataclass(frozen=True)
class LoadedModel:
    name: str
    version: str
    framework: str
    estimator: Any
    artifact_path: str | None = None
    trained_at: str | None = None
    metrics: dict[str, float] = field(default_factory=dict)


class ModelAdapter(ABC):
    def __init__(self, loaded_model: LoadedModel) -> None:
        self.loaded_model = loaded_model

    @abstractmethod
    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        raise NotImplementedError


class SklearnModelAdapter(ModelAdapter):
    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        estimator = self.loaded_model.estimator
        if hasattr(estimator, "predict_proba"):
            return estimator.predict_proba(features)
        predictions = estimator.predict(features)
        return np.asarray([[1.0 - float(p), float(p)] for p in predictions])


class XGBoostModelAdapter(ModelAdapter):
    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        estimator = self.loaded_model.estimator
        if hasattr(estimator, "predict_proba"):
            return estimator.predict_proba(features)
        predictions = estimator.predict(features)
        return np.asarray(predictions)


class LightGBMModelAdapter(ModelAdapter):
    def predict_proba(self, features: np.ndarray) -> np.ndarray:
        estimator = self.loaded_model.estimator
        if hasattr(estimator, "predict_proba"):
            return estimator.predict_proba(features)
        predictions = estimator.predict(features)
        return np.asarray([[1.0 - float(p), float(p)] for p in predictions])

