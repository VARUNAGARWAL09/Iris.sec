from typing import Any, Literal
from pydantic import BaseModel, Field

class UEBARequest(BaseModel):
    entity_id: str
    entity_type: Literal["user", "analyst", "host", "service"]
    activity_type: str
    timestamp: str
    features: dict[str, float]
    historical_baseline: list[dict[str, float]] = Field(default_factory=list)
    request_id: str | None = None

class UEBAResponse(BaseModel):
    anomaly_score: float = Field(ge=0.0, le=1.0)
    anomaly_type: str
    confidence: float = Field(ge=0.0, le=1.0)
    affected_entity: str
    severity: Literal["info", "low", "medium", "high", "critical"]
    explanation: str
    metadata: dict[str, Any] = Field(default_factory=dict)
