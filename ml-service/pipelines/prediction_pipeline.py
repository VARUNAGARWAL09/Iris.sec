import numpy as np

from embeddings.sentence_encoder import sentence_embedding_service
from models.registry import model_registry
from schemas.prediction import PredictionResult, Severity, ThreatSignal
from services.confidence import confidence_service
from services.feature_engineering import FeatureBundle, feature_engineering_service

SEVERITY_LABELS: list[Severity] = ["info", "low", "medium", "high", "critical"]


class PredictionPipeline:
    def predict(self, alert: ThreatSignal, include_embeddings: bool = False) -> PredictionResult:
        bundle = feature_engineering_service.transform(alert)
        adapter = model_registry.active_adapter()

        if adapter is None:
            probabilities = self._heuristic_probabilities(bundle)
            model_name = "heuristic-risk-baseline"
            model_version = "1.0.0"
        else:
            probabilities = adapter.predict_proba(bundle.vector)[0]
            model_name = adapter.loaded_model.name
            model_version = adapter.loaded_model.version

        probabilities = self._normalize_probabilities(probabilities)
        class_index = int(np.argmax(probabilities))
        severity = SEVERITY_LABELS[min(class_index, len(SEVERITY_LABELS) - 1)]
        confidence = confidence_service.from_probabilities(probabilities)
        risk_score = self._risk_score(probabilities)
        reasons = bundle.reasons

        if include_embeddings:
            embedding = sentence_embedding_service.encode([self._alert_text(alert)])
            reasons.append(f"Embedding dimension: {int(embedding.shape[1]) if embedding.ndim == 2 else 0}.")

        return PredictionResult(
            risk_score=round(risk_score, 2),
            severity=severity,
            confidence=confidence,
            probabilities={label: round(float(probabilities[idx]), 4) for idx, label in enumerate(SEVERITY_LABELS)},
            reasons=reasons,
            model_name=model_name,
            model_version=model_version,
            features_used=bundle.feature_names,
        )

    def _heuristic_probabilities(self, bundle: FeatureBundle) -> np.ndarray:
        row = bundle.frame.iloc[0]
        score = 0.0
        score += min(row["failed_login_count"] / 50.0, 1.0) * 22.0
        score += min(row["bytes_transferred"] / 1_000_000_000.0, 1.0) * 18.0
        score += row["ip_reputation"] * 20.0
        score += min(row["alert_frequency"] / 25.0, 1.0) * 14.0
        score += row["severity_weight"] * 18.0
        score += min(row["suspicious_keyword_count"] / 4.0, 1.0) * 8.0
        score = max(0.0, min(100.0, float(score)))
        center = score / 25.0
        logits = np.asarray([-abs(i - center) for i in range(5)], dtype=float)
        return np.exp(logits) / np.exp(logits).sum()

    def _normalize_probabilities(self, probabilities: np.ndarray) -> np.ndarray:
        arr = np.asarray(probabilities, dtype=float).flatten()
        if arr.size == 2:
            low_risk, high_risk = arr
            arr = np.asarray([low_risk * 0.6, low_risk * 0.4, high_risk * 0.35, high_risk * 0.4, high_risk * 0.25])
        if arr.size < 5:
            arr = np.pad(arr, (0, 5 - arr.size), constant_values=0.0)
        arr = arr[:5]
        total = float(arr.sum())
        if total <= 0:
            return np.asarray([0.05, 0.1, 0.35, 0.3, 0.2])
        return arr / total

    def _risk_score(self, probabilities: np.ndarray) -> float:
        weights = np.asarray([10, 30, 55, 75, 95], dtype=float)
        return float(np.dot(probabilities, weights))

    def _alert_text(self, alert: ThreatSignal) -> str:
        return f"{alert.title} {alert.description} {alert.source}".strip()


prediction_pipeline = PredictionPipeline()

