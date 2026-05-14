import asyncio

from fastapi import APIRouter

from inference.manager import inference_manager
from schemas.common import ApiResponse, ErrorBody, ResponseMetadata
from schemas.prediction import BatchPredictionRequest, BatchPredictionResult, PredictionRequest, PredictionResult
from services.inference_logger import inference_logger
from utils.config import settings

router = APIRouter(prefix="/inference", tags=["inference"])


@router.post("/predict", response_model=ApiResponse[PredictionResult])
async def predict(request: PredictionRequest) -> ApiResponse[PredictionResult]:
    try:
        return await inference_manager.predict(request)
    except TimeoutError:
        inference_logger.log_failure(request.request_id, "Inference timed out")
        return ApiResponse[PredictionResult](
            success=False,
            data=None,
            error=ErrorBody(code="inference_timeout", message="Inference timed out."),
            metadata=ResponseMetadata(service_version=settings.service_version, request_id=request.request_id),
        )
    except asyncio.TimeoutError:
        inference_logger.log_failure(request.request_id, "Inference timed out")
        return ApiResponse[PredictionResult](
            success=False,
            data=None,
            error=ErrorBody(code="inference_timeout", message="Inference timed out."),
            metadata=ResponseMetadata(service_version=settings.service_version, request_id=request.request_id),
        )


@router.post("/batch", response_model=ApiResponse[BatchPredictionResult])
async def predict_batch(request: BatchPredictionRequest) -> ApiResponse[BatchPredictionResult]:
    return await inference_manager.predict_batch(request)

