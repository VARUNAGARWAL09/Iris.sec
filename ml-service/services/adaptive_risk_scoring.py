import math
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import numpy as np

from models.registry import model_registry
from schemas.features import FeatureContext
from schemas.risk import AdaptiveRiskRequest, AdaptiveRiskResponse, ModelScore, RiskMetadata
from services.calibration import confidence_calibrator
from services.priority import priority_service
from pipelines.feature_pipeline import FEATURE_COLUMNS, enterprise_feature_pipeline


@dataclass(frozen=True)
class RiskFeatureSet:
    values: dict[str, float]
    vector: np.ndarray
    names: list[str]
    evidence_strength: float


class AdaptiveThreatRiskScoringEngine:
    model_weights = {
        "xgboost": 0.45,
        "lightgbm": 0.35,
        "heuristic": 0.20,
    }

    def score(self, request: AdaptiveRiskRequest) -> AdaptiveRiskResponse:
        features = self._features(request)
        model_scores = self._model_scores(request, features)
        risk_score = self._weighted_average(model_scores, "risk_score")
        escalation_probability = self._weighted_average(model_scores, "escalation_probability")
        false_positive_probability = self._weighted_average(model_scores, "false_positive_probability")
        agreement = self._agreement([score.risk_score for score in model_scores])
        confidence = confidence_calibrator.calibrate(risk_score, agreement, features.evidence_strength)
        predicted_priority = priority_service.predict(risk_score, escalation_probability)
        explanations = self._explanations(request, features, model_scores, risk_score, escalation_probability, false_positive_probability)

        return AdaptiveRiskResponse(
            risk_score=round(risk_score, 2),
            confidence=round(confidence, 4),
            escalation_probability=round(escalation_probability, 4),
            false_positive_probability=round(false_positive_probability, 4),
            predicted_priority=predicted_priority,
            model_scores=model_scores,
            explanations=explanations,
            features_used=features.names,
            metadata=RiskMetadata(
                feature_contributions=self._feature_contributions(features),
                model_agreement=round(agreement, 4),
                evidence_strength=round(features.evidence_strength, 4),
                inference_timestamp=datetime.now(timezone.utc).isoformat(),
            ),
        )

    def _feature_contributions(self, features: RiskFeatureSet) -> dict[str, float]:
        # Estimate contributions based on heuristic weights as a fallback for explainability
        weights = {
            "severity_score": 0.22,
            "mitre_technique_count": 0.16,
            "ioc_count": 0.14,
            "source_reputation": 0.16,
            "incident_history": 0.08,
            "analyst_actions": 0.05,
            "attack_frequency_raw": 0.12,
            "threat_intelligence_confidence": 0.07,
        }
        contributions = {name: features.values.get(name, 0.0) * weight for name, weight in weights.items()}
        total = sum(contributions.values())
        if total > 0:
            return {name: round(val / total, 4) for name, val in contributions.items()}
        return {name: 0.0 for name in weights}

    def _features(self, request: AdaptiveRiskRequest) -> RiskFeatureSet:
        payload: dict[str, Any] = {
            "severity": request.telemetry_severity,
            "mitre_techniques": request.mitre_techniques,
            "ioc_count": request.ioc_count,
            "source_reputation": request.source_reputation,
            "incident_history": request.incident_history,
            "analyst_actions": request.analyst_actions,
            "attack_frequency": request.attack_frequency,
            "threat_intelligence_confidence": request.threat_intelligence_confidence,
            **request.raw_data,
        }
        context = FeatureContext(
            domain="threat_intelligence",
            payload=payload,
            related={
                "incidents": [{} for _ in range(request.incident_history)],
                "analyst_actions": [{} for _ in range(request.analyst_actions)],
                "alerts": [{} for _ in range(request.attack_frequency)],
                "mitre_mappings": [{"technique": technique} for technique in request.mitre_techniques],
                "evidence": [{} for _ in range(request.ioc_count)],
            },
            cache_key=request.request_id,
        )
        vector = enterprise_feature_pipeline.build_one(context)
        values = dict(vector.values)
        values["mitre_technique_count"] = min(len(request.mitre_techniques) / 20.0, 1.0)
        values["ioc_count"] = min(request.ioc_count / 50.0, 1.0)
        values["incident_history"] = min(request.incident_history / 50.0, 1.0)
        values["attack_frequency_raw"] = min(request.attack_frequency / 100.0, 1.0)
        values["threat_intelligence_confidence"] = request.threat_intelligence_confidence
        names = FEATURE_COLUMNS + [
            "mitre_technique_count",
            "ioc_count",
            "incident_history",
            "attack_frequency_raw",
            "threat_intelligence_confidence",
        ]
        matrix = np.asarray([[values.get(name, 0.0) for name in FEATURE_COLUMNS]], dtype=float)
        evidence_strength = min(
            1.0,
            0.25 * values["mitre_technique_count"]
            + 0.25 * values["ioc_count"]
            + 0.25 * request.threat_intelligence_confidence
            + 0.25 * request.source_reputation,
        )
        return RiskFeatureSet(values=values, vector=matrix, names=names, evidence_strength=evidence_strength)

    def _model_scores(self, request: AdaptiveRiskRequest, features: RiskFeatureSet) -> list[ModelScore]:
        scores: list[ModelScore] = []
        for model_name in ("xgboost", "lightgbm"):
            adapter = model_registry.get_adapter(model_name)
            if adapter is None:
                continue
            probabilities = self._normalize_probabilities(adapter.predict_proba(features.vector)[0])
            scores.append(self._score_from_probabilities(model_name, adapter.loaded_model.version, probabilities, request, features))

        scores.append(self._heuristic_score(request, features))
        return scores

    def _score_from_probabilities(
        self,
        model_name: str,
        version: str,
        probabilities: np.ndarray,
        request: AdaptiveRiskRequest,
        features: RiskFeatureSet,
    ) -> ModelScore:
        risk_score = float(np.dot(probabilities, np.asarray([10.0, 30.0, 55.0, 75.0, 95.0])))
        confidence = float(np.max(probabilities))
        escalation = confidence_calibrator.probability_from_score(
            risk_score + 10.0 * request.source_reputation + 8.0 * request.threat_intelligence_confidence,
            midpoint=72.0,
        )
        false_positive = confidence_calibrator.false_positive_probability(
            risk_score,
            request.source_reputation,
            features.evidence_strength,
        )
        priority_prob = priority_service.probabilities(risk_score)
        return ModelScore(
            model_name=model_name,
            model_version=version,
            risk_score=round(risk_score, 2),
            confidence=round(confidence, 4),
            escalation_probability=round(escalation, 4),
            false_positive_probability=round(false_positive, 4),
            priority_probability={key: round(value, 4) for key, value in priority_prob.items()},
        )

    def _heuristic_score(self, request: AdaptiveRiskRequest, features: RiskFeatureSet) -> ModelScore:
        values = features.values
        risk_score = 0.0
        risk_score += values["severity_score"] * 22.0
        risk_score += values["mitre_technique_count"] * 16.0
        risk_score += values["ioc_count"] * 14.0
        risk_score += request.source_reputation * 16.0
        risk_score += values["incident_history"] * 8.0
        risk_score += min(request.analyst_actions / 20.0, 1.0) * 5.0
        risk_score += values["attack_frequency_raw"] * 12.0
        risk_score += request.threat_intelligence_confidence * 7.0
        risk_score = max(0.0, min(100.0, risk_score))
        escalation = confidence_calibrator.probability_from_score(
            risk_score + 8.0 * values["incident_history"] + 6.0 * values["attack_frequency_raw"],
            midpoint=68.0,
        )
        false_positive = confidence_calibrator.false_positive_probability(
            risk_score,
            request.source_reputation,
            features.evidence_strength,
        )
        confidence = confidence_calibrator.calibrate(risk_score, 0.75, features.evidence_strength)
        return ModelScore(
            model_name="heuristic",
            model_version="1.0.0",
            risk_score=round(risk_score, 2),
            confidence=round(confidence, 4),
            escalation_probability=round(escalation, 4),
            false_positive_probability=round(false_positive, 4),
            priority_probability={key: round(value, 4) for key, value in priority_service.probabilities(risk_score).items()},
        )

    def _normalize_probabilities(self, probabilities: np.ndarray) -> np.ndarray:
        arr = np.asarray(probabilities, dtype=float).flatten()
        if arr.size == 2:
            low, high = arr
            arr = np.asarray([low * 0.55, low * 0.35, low * 0.1 + high * 0.2, high * 0.45, high * 0.35])
        if arr.size < 5:
            arr = np.pad(arr, (0, 5 - arr.size), constant_values=0.0)
        arr = arr[:5]
        total = float(arr.sum())
        if total <= 0 or math.isnan(total):
            return np.asarray([0.05, 0.1, 0.35, 0.3, 0.2])
        return arr / total

    def _weighted_average(self, scores: list[ModelScore], field: str) -> float:
        weighted_sum = 0.0
        total_weight = 0.0
        for score in scores:
            weight = self.model_weights.get(score.model_name, self.model_weights["heuristic"])
            weighted_sum += float(getattr(score, field)) * weight
            total_weight += weight
        if total_weight <= 0:
            return 0.0
        return weighted_sum / total_weight

    def _agreement(self, risk_scores: list[float]) -> float:
        if len(risk_scores) <= 1:
            return 0.75
        std = float(np.std(np.asarray(risk_scores, dtype=float)))
        return max(0.0, min(1.0, 1.0 - std / 50.0))

    def _explanations(
        self,
        request: AdaptiveRiskRequest,
        features: RiskFeatureSet,
        model_scores: list[ModelScore],
        risk_score: float,
        escalation_probability: float,
        false_positive_probability: float,
    ) -> list[str]:
        explanations: list[str] = []
        if request.mitre_techniques:
            explanations.append(f"{len(request.mitre_techniques)} MITRE techniques contributed to attack-chain depth.")
        if request.ioc_count > 0:
            explanations.append(f"{request.ioc_count} IOCs increased evidence density.")
        if request.source_reputation >= 0.75:
            explanations.append("High source reputation risk increased the score.")
        if request.incident_history > 0:
            explanations.append("Incident history increased recurrence risk.")
        if request.attack_frequency > 1:
            explanations.append("Attack frequency increased escalation likelihood.")
        if request.threat_intelligence_confidence >= 0.75:
            explanations.append("Threat intelligence confidence strengthened the prediction.")
        if len(model_scores) > 1:
            explanations.append("Weighted ensemble combined available XGBoost, LightGBM, and baseline scores.")
        explanations.append(f"Final risk score: {round(risk_score, 2)}.")
        explanations.append(f"Escalation probability: {round(escalation_probability, 4)}.")
        explanations.append(f"False-positive probability: {round(false_positive_probability, 4)}.")
        return explanations


adaptive_threat_risk_engine = AdaptiveThreatRiskScoringEngine()
