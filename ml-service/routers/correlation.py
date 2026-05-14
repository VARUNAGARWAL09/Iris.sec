from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.correlation import CorrelationRequest, CorrelationResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/correlation", tags=["correlation"])

@router.post("/correlate", response_model=ApiResponse[CorrelationResponse])
async def correlate_incidents(request: CorrelationRequest) -> ApiResponse[CorrelationResponse]:
    return await inference_manager.correlate_incidents(request)
