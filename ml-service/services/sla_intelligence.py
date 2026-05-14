import math
import time
from typing import Any
import numpy as np
from models.registry import model_registry
from schemas.sla import SLAPredictionRequest, SLAPredictionResponse, SLAModelScore
from services.calibration import confidence_calibrator
from pipelines.feature_pipeline import enterprise_feature_pipeline, FEATURE_COLUMNS
from schemas.features import FeatureContext

class SLAIntelligenceEngine:
    model_weights = {
        "xgboost": 0.50,
        "random_forest": 0.30,
        "heuristic": 0.20,
    }

    def predict(self, request: SLAPredictionRequest) -> SLAPredictionResponse:
        features = self._prepare_features(request)
        model_results = self._get_model_predictions(request, features)
        
        breach_prob = self._weighted_average(model_results, "breach_probability")
        resolution_time = self._weighted_average(model_results, "predicted_resolution_time")
        containment_eta = self._weighted_average(model_results, "containment_eta")
        
        analyst_load = min(1.0, (request.active_incidents / 10.0) * 0.6 + request.analyst_workload * 0.4)
        queue_risk = min(1.0, (request.queue_size / 50.0) * 0.7 + breach_prob * 0.3)
        
        confidence = self._calculate_confidence(model_results, features)

        return SLAPredictionResponse(
            breach_probability=round(breach_prob, 4),
            predicted_resolution_time=round(resolution_time, 2),
            containment_eta=round(containment_eta, 2),
            analyst_load_score=round(analyst_load, 4),
            queue_risk=round(queue_risk, 4),
            regression_confidence=round(confidence, 4),
            model_scores=model_results,
            explanations=self._generate_explanations(request, breach_prob, resolution_time),
            metadata={
                "feature_count": len(features),
                "timestamp": time.time()
            }
        )

    def _prepare_features(self, request: SLAPredictionRequest) -> dict[str, float]:
        context = FeatureContext(
            domain="incidents",
            payload={
                "severity": request.severity,
                "incident_type": request.incident_type,
                "active_incidents": request.active_incidents,
                "queue_size": request.queue_size,
                "analyst_workload": request.analyst_workload,
                **request.raw_data
            }
        )
        vector = enterprise_feature_pipeline.build_one(context)
        vals = dict(vector.values)
        vals["mitre_complexity"] = request.mitre_complexity
        vals["historical_mttr_norm"] = min(request.historical_mttr / 86400.0, 1.0)
        return vals

    def _get_model_predictions(self, request: SLAPredictionRequest, features: dict[str, float]) -> list[SLAModelScore]:
        results: list[SLAModelScore] = []
        feature_vector = np.asarray([[features.get(name, 0.0) for name in FEATURE_COLUMNS]], dtype=float)

        for model_name in ["xgboost", "random_forest"]:
            adapter = model_registry.get_adapter(model_name)
            if adapter:
                # Mocking regression outputs as adapter usually does predict_proba for classification
                # In a real system, we'd have RegressorAdapters
                raw_score = float(np.mean(adapter.predict_proba(feature_vector)[0]))
                results.append(SLAModelScore(
                    model_name=model_name,
                    breach_probability=min(0.99, raw_score * 1.2),
                    predicted_resolution_time=request.historical_mttr * (0.8 + raw_score * 0.5),
                    containment_eta=(request.historical_mttr * 0.4) * (0.9 + raw_score * 0.3)
                ))

        # Heuristic fallback
        h_breach = min(0.95, (features["severity_score"] * 0.4 + features["analyst_workload"] * 0.4 + request.mitre_complexity * 0.2))
        results.append(SLAModelScore(
            model_name="heuristic",
            breach_probability=h_breach,
            predicted_resolution_time=request.historical_mttr * (1.0 + (h_breach - 0.5)),
            containment_eta=request.historical_mttr * 0.35 * (1.0 + (h_breach - 0.5))
        ))
        return results

    def _weighted_average(self, results: list[SLAModelScore], field: str) -> float:
        total_weight = 0.0
        weighted_sum = 0.0
        for res in results:
            weight = self.model_weights.get(res.model_name, 0.1)
            weighted_sum += getattr(res, field) * weight
            total_weight += weight
        return weighted_sum / total_weight if total_weight > 0 else 0.0

    def _calculate_confidence(self, results: list[SLAModelScore], features: dict[str, float]) -> float:
        if len(results) <= 1: return 0.5
        probs = [r.breach_probability for r in results]
        agreement = 1.0 - float(np.std(probs))
        return min(1.0, max(0.0, agreement * 0.8 + (1.0 - features["analyst_workload"]) * 0.2))

    def _generate_explanations(self, request: SLAPredictionRequest, breach_prob: float, res_time: float) -> list[str]:
        reasons = []
        if breach_prob > 0.7: reasons.append("High breach probability due to analyst saturation and incident complexity.")
        if request.active_incidents > 5: reasons.append(f"Queue congestion ({request.active_incidents} active) is delaying response.")
        if request.severity in ["critical", "high"]: reasons.append(f"Severity '{request.severity}' requires extensive investigation time.")
        reasons.append(f"Estimated resolution: {round(res_time / 60, 1)} minutes.")
        return reasons

sla_intelligence_engine = SLAIntelligenceEngine()
