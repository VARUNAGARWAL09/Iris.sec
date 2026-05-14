from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.classification import ThreatClassificationRequest, ThreatClassificationResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/classification", tags=["classification"])

@router.post("/classify", response_model=ApiResponse[ThreatClassificationResponse])
async def classify_threat(request: ThreatClassificationRequest) -> ApiResponse[ThreatClassificationResponse]:
    return await inference_manager.classify_threat(request)
