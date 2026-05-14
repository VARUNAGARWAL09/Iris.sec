from typing import Any
from pydantic import BaseModel, Field

class MitrePredictionRequest(BaseModel):
    observed_techniques: list[str] = Field(..., min_length=1)
    incident_context: dict[str, Any] = Field(default_factory=dict)
    request_id: str | None = None

class PredictedTechnique(BaseModel):
    technique_id: str
    name: str
    confidence: float = Field(ge=0.0, le=1.0)
    tactic: str

class MitrePredictionResponse(BaseModel):
    predicted_techniques: list[PredictedTechnique]
    attack_path: list[str]
    confidence_scores: dict[str, float]
    progression_probability: float = Field(ge=0.0, le=1.0)
    lateral_movement_probability: float = Field(ge=0.0, le=1.0)
    privilege_escalation_likelihood: float = Field(ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)
