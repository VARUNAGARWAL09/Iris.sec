from typing import Any
from pydantic import BaseModel, Field

class CorrelationRequest(BaseModel):
    incident_id: str
    description: str
    mitre_techniques: list[str] = Field(default_factory=list)
    iocs: list[str] = Field(default_factory=list)
    timestamp: str | None = None
    threat_actor: str | None = None
    historical_incidents: list[dict[str, Any]] = Field(default_factory=list)
    request_id: str | None = None

class RelatedIncident(BaseModel):
    incident_id: str
    similarity_score: float = Field(ge=0.0, le=1.0)
    correlation_type: str # e.g., "semantic", "ioc", "mitre"

class CorrelationResponse(BaseModel):
    related_incidents: list[RelatedIncident]
    attack_cluster: list[str]
    campaign_id: str | None
    similarity_score: float = Field(ge=0.0, le=1.0)
    correlation_explanation: str
    metadata: dict[str, Any] = Field(default_factory=dict)
