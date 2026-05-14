from fastapi import APIRouter

from models.registry import model_registry
from schemas.common import ApiResponse, ResponseMetadata
from schemas.models import ModelStatusResponse
from utils.config import settings

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/status", response_model=ApiResponse[ModelStatusResponse])
async def model_status() -> ApiResponse[ModelStatusResponse]:
    status = model_registry.status()
    return ApiResponse[ModelStatusResponse](
        success=True,
        data=status,
        metadata=ResponseMetadata(
            service_version=settings.service_version,
            model_version=status.registry_version,
        ),
    )

