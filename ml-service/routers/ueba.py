from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.ueba import UEBARequest, UEBAResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/ueba", tags=["ueba"])

@router.post("/detect", response_model=ApiResponse[UEBAResponse])
async def detect_anomalies(request: UEBARequest) -> ApiResponse[UEBAResponse]:
    return await inference_manager.detect_anomalies(request)
