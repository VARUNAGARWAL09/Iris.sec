from fastapi import APIRouter

from pipelines.feature_pipeline import enterprise_feature_pipeline
from schemas.common import ApiResponse, ResponseMetadata
from schemas.features import FeatureContext, FeaturePipelineResult, FeatureVector
from utils.config import settings

router = APIRouter(prefix="/features", tags=["features"])


@router.post("/extract", response_model=ApiResponse[FeatureVector])
async def extract_features(context: FeatureContext) -> ApiResponse[FeatureVector]:
    vector = enterprise_feature_pipeline.build_one(context)
    return ApiResponse[FeatureVector](
        success=True,
        data=vector,
        metadata=ResponseMetadata(service_version=settings.service_version),
    )


@router.post("/batch", response_model=ApiResponse[FeaturePipelineResult])
async def extract_feature_batch(contexts: list[FeatureContext]) -> ApiResponse[FeaturePipelineResult]:
    result = enterprise_feature_pipeline.build_many(contexts)
    return ApiResponse[FeaturePipelineResult](
        success=True,
        data=result,
        metadata=ResponseMetadata(service_version=settings.service_version),
    )
