from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorBody(BaseModel):
    code: str
    message: str


class ResponseMetadata(BaseModel):
    service_version: str = "unknown"
    model_version: str | None = None
    request_id: str | None = None
    latency_ms: float | None = None


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: ErrorBody | None = None
    metadata: ResponseMetadata = Field(default_factory=ResponseMetadata)
