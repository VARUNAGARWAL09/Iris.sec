from fastapi import APIRouter

from models.registry import model_registry
from schemas.common import ApiResponse, ResponseMetadata
from schemas.models import HealthResponse
from utils.config import settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse[HealthResponse])
async def health() -> ApiResponse[HealthResponse]:
    return ApiResponse[HealthResponse](
        success=True,
        data=HealthResponse(
            status="ok",
            service=settings.service_name,
            version=settings.service_version,
            models_loaded=model_registry.model_count(),
        ),
        metadata=ResponseMetadata(service_version=settings.service_version),
    )

