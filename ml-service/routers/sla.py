from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.sla import SLAPredictionRequest, SLAPredictionResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/sla", tags=["sla"])

@router.post("/predict", response_model=ApiResponse[SLAPredictionResponse])
async def predict_sla(request: SLAPredictionRequest) -> ApiResponse[SLAPredictionResponse]:
    return await inference_manager.predict_sla(request)
