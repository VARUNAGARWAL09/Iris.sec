from schemas.prediction import PredictionRequest, PredictionResult
from schemas.risk import AdaptiveRiskRequest, AdaptiveRiskResponse
from schemas.sla import SLAPredictionRequest, SLAPredictionResponse
from schemas.intent import IntentRecognitionRequest, IntentRecognitionResponse
from schemas.correlation import CorrelationRequest, CorrelationResponse
from schemas.ueba import UEBARequest, UEBAResponse
from schemas.mitre import MitrePredictionRequest, MitrePredictionResponse
from schemas.classification import ThreatClassificationRequest, ThreatClassificationResponse
from utils.logging import get_logger

logger = get_logger(__name__)


class InferenceLogger:
    def log_success(self, request: PredictionRequest, result: PredictionResult, latency_ms: float) -> None:
        logger.info(
            "Inference completed",
            extra={
                "request_id": request.request_id,
                "model_name": result.model_name,
                "model_version": result.model_version,
                "risk_score": result.risk_score,
                "severity": result.severity,
                "confidence": result.confidence.score,
                "latency_ms": latency_ms,
            },
        )

    def log_risk_success(self, request: AdaptiveRiskRequest, result: AdaptiveRiskResponse, latency_ms: float) -> None:
        logger.info(
            "Adaptive risk scoring completed",
            extra={
                "request_id": request.request_id,
                "risk_score": result.risk_score,
                "confidence": result.confidence,
                "predicted_priority": result.predicted_priority,
                "escalation_probability": result.escalation_probability,
                "latency_ms": latency_ms,
            },
        )

    def log_sla_success(self, request: SLAPredictionRequest, result: SLAPredictionResponse, latency_ms: float) -> None:
        logger.info(
            "SLA prediction completed",
            extra={
                "request_id": request.request_id,
                "breach_probability": result.breach_probability,
                "resolution_time": result.predicted_resolution_time,
                "analyst_load": result.analyst_load_score,
                "latency_ms": latency_ms,
            },
        )

    def log_intent_success(self, request: IntentRecognitionRequest, result: IntentRecognitionResponse, latency_ms: float) -> None:
        logger.info(
            "Intent recognition completed",
            extra={
                "request_id": request.request_id,
                "detected_intent": result.detected_intent,
                "confidence": result.confidence,
                "entity_count": len(result.extracted_entities),
                "latency_ms": latency_ms,
            },
        )

    def log_correlation_success(self, request: CorrelationRequest, result: CorrelationResponse, latency_ms: float) -> None:
        logger.info(
            "Incident correlation completed",
            extra={
                "request_id": request.request_id,
                "incident_id": request.incident_id,
                "related_count": len(result.related_incidents),
                "similarity_score": result.similarity_score,
                "latency_ms": latency_ms,
            },
        )

    def log_ueba_success(self, request: UEBARequest, result: UEBAResponse, latency_ms: float) -> None:
        logger.info(
            "UEBA anomaly detection completed",
            extra={
                "request_id": request.request_id,
                "entity_id": request.entity_id,
                "anomaly_score": result.anomaly_score,
                "severity": result.severity,
                "latency_ms": latency_ms,
            },
        )

    def log_mitre_success(self, request: MitrePredictionRequest, result: MitrePredictionResponse, latency_ms: float) -> None:
        logger.info(
            "MITRE prediction completed",
            extra={
                "request_id": request.request_id,
                "observed_count": len(request.observed_techniques),
                "predicted_count": len(result.predicted_techniques),
                "progression_probability": result.progression_probability,
                "latency_ms": latency_ms,
            },
        )

    def log_classification_success(self, request: ThreatClassificationRequest, result: ThreatClassificationResponse, latency_ms: float) -> None:
        logger.info(
            "Threat classification completed",
            extra={
                "request_id": request.request_id,
                "category": result.threat_category,
                "confidence": result.confidence,
                "severity": result.severity_prediction,
                "latency_ms": latency_ms,
            },
        )

    def log_failure(self, request_id: str | None, message: str) -> None:
        logger.warning("Inference failed", extra={"request_id": request_id, "message": message})


inference_logger = InferenceLogger()

