from typing import Any, Literal

from pydantic import BaseModel, Field

FeatureDomain = Literal[
    "incidents",
    "alerts",
    "mitre_mappings",
    "analyst_actions",
    "playbooks",
    "telemetry",
    "evidence",
    "threat_intelligence",
]


class FeatureContext(BaseModel):
    domain: FeatureDomain
    entity_id: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    related: dict[str, list[dict[str, Any]]] = Field(default_factory=dict)
    cache_key: str | None = None


class FeatureVector(BaseModel):
    domain: FeatureDomain
    feature_names: list[str]
    values: dict[str, float]
    categorical_values: dict[str, str] = Field(default_factory=dict)
    validation_warnings: list[str] = Field(default_factory=list)
    cache_hit: bool = False


class FeaturePipelineResult(BaseModel):
    vectors: list[FeatureVector]
    feature_names: list[str]
    matrix: list[list[float]]
