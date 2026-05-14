from typing import Any, Literal
from pydantic import BaseModel, Field

class IntentRecognitionRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    user_context: dict[str, Any] = Field(default_factory=dict)
    request_id: str | None = None

class IntentEntity(BaseModel):
    type: str
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    start: int | None = None
    end: int | None = None

class IntentRecognitionResponse(BaseModel):
    detected_intent: str
    confidence: float = Field(ge=0.0, le=1.0)
    extracted_entities: list[IntentEntity]
    suggested_actions: list[str]
    semantic_similarity_score: float = Field(ge=0.0, le=1.0)
    metadata: dict[str, Any] = Field(default_factory=dict)
