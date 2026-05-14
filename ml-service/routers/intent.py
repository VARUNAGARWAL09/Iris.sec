from fastapi import APIRouter
from schemas.common import ApiResponse
from schemas.intent import IntentRecognitionRequest, IntentRecognitionResponse
from inference.manager import inference_manager

router = APIRouter(prefix="/intent", tags=["intent"])

@router.post("/recognize", response_model=ApiResponse[IntentRecognitionResponse])
async def recognize_intent(request: IntentRecognitionRequest) -> ApiResponse[IntentRecognitionResponse]:
    return await inference_manager.recognize_intent(request)
