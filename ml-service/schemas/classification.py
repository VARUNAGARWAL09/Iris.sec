from typing import Any, Literal
from pydantic import BaseModel, Field

class ThreatClassificationRequest(BaseModel):
    title: str
    description: str
    raw_data: dict[str, Any] = Field(default_factory=dict)
    features: dict[str, float] = Field(default_factory=dict)
    request_id: str | None = None

class ThreatClassificationResponse(BaseModel):
    threat_category: Literal[
        "ransomware", "phishing", "exfiltration", "insider_threat", 
        "malware", "credential_abuse", "lateral_movement", "botnet", "unknown"
    ]
    confidence: float = Field(ge=0.0, le=1.0)
    severity_prediction: Literal["info", "low", "medium", "high", "critical"]
    attack_complexity: Literal["low", "medium", "high"]
    recommended_response: list[str]
    probability_distribution: dict[str, float]
    explanation: str
    metadata: dict[str, Any] = Field(default_factory=dict)
