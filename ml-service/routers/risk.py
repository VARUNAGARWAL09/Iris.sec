import time

from fastapi import APIRouter

from schemas.common import ApiResponse, ResponseMetadata
from schemas.risk import AdaptiveRiskRequest, AdaptiveRiskResponse
from inference.manager import inference_manager
from utils.config import settings

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/adaptive", response_model=ApiResponse[AdaptiveRiskResponse])
async def adaptive_risk(request: AdaptiveRiskRequest) -> ApiResponse[AdaptiveRiskResponse]:
    return await inference_manager.score_risk(request)
