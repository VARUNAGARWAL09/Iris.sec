from typing import Any, Literal
from pydantic import BaseModel, Field

class SLAPredictionRequest(BaseModel):
    incident_id: str | None = None
    severity: Literal["info", "low", "medium", "high", "critical"] = "medium"
    incident_type: str = "unknown"
    analyst_workload: float = Field(default=0.5, ge=0.0, le=1.0)
    active_incidents: int = Field(default=0, ge=0)
    queue_size: int = Field(default=0, ge=0)
    mitre_complexity: float = Field(default=0.0, ge=0.0, le=1.0)
    historical_mttr: float = Field(default=3600.0, ge=0.0) # in seconds
    request_id: str | None = None
    raw_data: dict[str, Any] = Field(default_factory=dict)

class SLAModelScore(BaseModel):
    model_name: str
    breach_probability: float = Field(ge=0.0, le=1.0)
    predicted_resolution_time: float # seconds
    containment_eta: float # seconds

class SLAPredictionResponse(BaseModel):
    breach_probability: float = Field(ge=0.0, le=1.0)
    predicted_resolution_time: float # seconds
    containment_eta: float # seconds
    analyst_load_score: float = Field(ge=0.0, le=1.0)
    queue_risk: float = Field(ge=0.0, le=1.0)
    regression_confidence: float = Field(ge=0.0, le=1.0)
    model_scores: list[SLAModelScore]
    explanations: list[str]
    metadata: dict[str, Any] = Field(default_factory=dict)
