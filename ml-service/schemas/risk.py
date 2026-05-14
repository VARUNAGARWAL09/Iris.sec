from typing import Any, Literal

from pydantic import BaseModel, Field


class AdaptiveRiskRequest(BaseModel):
    mitre_techniques: list[str] = Field(default_factory=list)
    ioc_count: int = Field(default=0, ge=0)
    source_reputation: float = Field(default=0.5, ge=0.0, le=1.0)
    incident_history: int = Field(default=0, ge=0)
    analyst_actions: int = Field(default=0, ge=0)
    attack_frequency: int = Field(default=1, ge=0)
    telemetry_severity: Literal["info", "low", "medium", "high", "critical"] = "medium"
    threat_intelligence_confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    raw_data: dict[str, Any] = Field(default_factory=dict)
    request_id: str | None = None


class ModelScore(BaseModel):
    model_name: str
    model_version: str
    risk_score: float = Field(ge=0.0, le=100.0)
    confidence: float = Field(ge=0.0, le=1.0)
    escalation_probability: float = Field(ge=0.0, le=1.0)
    false_positive_probability: float = Field(ge=0.0, le=1.0)
    priority_probability: dict[str, float]


class RiskMetadata(BaseModel):
    feature_contributions: dict[str, float]
    model_agreement: float
    evidence_strength: float
    inference_timestamp: str


class AdaptiveRiskResponse(BaseModel):
    risk_score: float = Field(ge=0.0, le=100.0)
    confidence: float = Field(ge=0.0, le=1.0)
    escalation_probability: float = Field(ge=0.0, le=1.0)
    false_positive_probability: float = Field(ge=0.0, le=1.0)
    predicted_priority: Literal["p4", "p3", "p2", "p1"]
    model_scores: list[ModelScore]
    explanations: list[str]
    features_used: list[str]
    metadata: RiskMetadata
