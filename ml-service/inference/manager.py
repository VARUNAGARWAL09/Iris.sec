import asyncio
import time

from pipelines.prediction_pipeline import prediction_pipeline
from schemas.common import ApiResponse, ResponseMetadata
from schemas.prediction import BatchPredictionRequest, BatchPredictionResult, PredictionRequest, PredictionResult
from schemas.risk import AdaptiveRiskRequest, AdaptiveRiskResponse
from schemas.sla import SLAPredictionRequest, SLAPredictionResponse
from schemas.intent import IntentRecognitionRequest, IntentRecognitionResponse
from schemas.correlation import CorrelationRequest, CorrelationResponse
from schemas.ueba import UEBARequest, UEBAResponse
from schemas.mitre import MitrePredictionRequest, MitrePredictionResponse
from schemas.classification import ThreatClassificationRequest, ThreatClassificationResponse
from services.adaptive_risk_scoring import adaptive_threat_risk_engine
from services.sla_intelligence import sla_intelligence_engine
from services.intent_recognition import intent_recognition_engine
from services.correlation_engine import correlation_engine
from services.ueba_engine import ueba_anomaly_engine
from services.mitre_prediction import mitre_prediction_engine
from services.threat_classification import threat_classification_engine
from services.inference_logger import inference_logger
from utils.config import settings


class InferenceManager:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()

    async def predict(self, request: PredictionRequest) -> ApiResponse[PredictionResult]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(prediction_pipeline.predict, request.alert, request.include_embeddings),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_success(request, result, latency_ms)
        return ApiResponse[PredictionResult](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                model_version=result.model_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def score_risk(self, request: AdaptiveRiskRequest) -> ApiResponse[AdaptiveRiskResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(adaptive_threat_risk_engine.score, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_risk_success(request, result, latency_ms)
        return ApiResponse[AdaptiveRiskResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def predict_sla(self, request: SLAPredictionRequest) -> ApiResponse[SLAPredictionResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(sla_intelligence_engine.predict, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_sla_success(request, result, latency_ms)
        return ApiResponse[SLAPredictionResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def recognize_intent(self, request: IntentRecognitionRequest) -> ApiResponse[IntentRecognitionResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(intent_recognition_engine.recognize, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_intent_success(request, result, latency_ms)
        return ApiResponse[IntentRecognitionResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def correlate_incidents(self, request: CorrelationRequest) -> ApiResponse[CorrelationResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(correlation_engine.correlate, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_correlation_success(request, result, latency_ms)
        return ApiResponse[CorrelationResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def detect_anomalies(self, request: UEBARequest) -> ApiResponse[UEBAResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(ueba_anomaly_engine.detect, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_ueba_success(request, result, latency_ms)
        return ApiResponse[UEBAResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def predict_mitre(self, request: MitrePredictionRequest) -> ApiResponse[MitrePredictionResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(mitre_prediction_engine.predict, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_mitre_success(request, result, latency_ms)
        return ApiResponse[MitrePredictionResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def classify_threat(self, request: ThreatClassificationRequest) -> ApiResponse[ThreatClassificationResponse]:
        started = time.perf_counter()
        async with self._lock:
            result = await asyncio.wait_for(
                asyncio.to_thread(threat_classification_engine.classify, request),
                timeout=settings.inference_timeout_seconds,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        inference_logger.log_classification_success(request, result, latency_ms)
        return ApiResponse[ThreatClassificationResponse](
            success=True,
            data=result,
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )

    async def predict_batch(self, request: BatchPredictionRequest) -> ApiResponse[BatchPredictionResult]:
        started = time.perf_counter()
        predictions: list[PredictionResult] = []
        for alert in request.alerts:
            child = PredictionRequest(alert=alert, include_embeddings=request.include_embeddings, request_id=request.request_id)
            prediction_response = await self.predict(child)
            if prediction_response.data:
                predictions.append(prediction_response.data)
        latency_ms = (time.perf_counter() - started) * 1000
        return ApiResponse[BatchPredictionResult](
            success=True,
            data=BatchPredictionResult(predictions=predictions, count=len(predictions)),
            metadata=ResponseMetadata(
                service_version=settings.service_version,
                request_id=request.request_id,
                latency_ms=round(latency_ms, 2),
            ),
        )


inference_manager = InferenceManager()

