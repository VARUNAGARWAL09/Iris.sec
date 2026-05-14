from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.mitre import MitrePredictionRequest, MitrePredictionResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/mitre", tags=["mitre"])

@router.post("/predict", response_model=ApiResponse[MitrePredictionResponse])
async def predict_mitre(request: MitrePredictionRequest) -> ApiResponse[MitrePredictionResponse]:
    return await inference_manager.predict_mitre(request)
