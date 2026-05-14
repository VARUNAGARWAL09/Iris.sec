from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["info", "low", "medium", "high", "critical"]


class ThreatSignal(BaseModel):
    title: str = Field(default="", max_length=512)
    description: str = Field(default="", max_length=4000)
    source: str = Field(default="", max_length=256)
    severity: Severity | None = None
    raw_data: dict = Field(default_factory=dict)


class PredictionRequest(BaseModel):
    alert: ThreatSignal
    include_embeddings: bool = False
    request_id: str | None = None


class PredictionConfidence(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    label: Literal["low", "medium", "high"]
    calibration: str = "heuristic"


class PredictionResult(BaseModel):
    risk_score: float = Field(ge=0.0, le=100.0)
    severity: Severity
    confidence: PredictionConfidence
    probabilities: dict[str, float]
    reasons: list[str]
    model_name: str
    model_version: str
    features_used: list[str]


class BatchPredictionRequest(BaseModel):
    alerts: list[ThreatSignal] = Field(min_length=1, max_length=100)
    include_embeddings: bool = False
    request_id: str | None = None


class BatchPredictionResult(BaseModel):
    predictions: list[PredictionResult]
    count: int

