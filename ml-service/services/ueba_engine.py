import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from schemas.ueba import UEBARequest, UEBAResponse

class UEBAAnomalyEngine:
    def detect(self, request: UEBARequest) -> UEBAResponse:
        if not request.historical_baseline:
            return self._fallback_response(request)

        # 1. Prepare data
        df_baseline = pd.DataFrame(request.historical_baseline)
        current_features = pd.DataFrame([request.features])
        
        # 2. Isolation Forest for Anomaly Detection
        model = IsolationForest(n_estimators=100, contamination='auto', random_state=42)
        model.fit(df_baseline)
        
        # Score_samples returns opposite of anomaly score (lower is more anomalous)
        raw_score = model.score_samples(current_features)[0]
        # Normalize to 0-1 where 1 is highly anomalous
        anomaly_score = float(1.0 - (raw_score + 1.0) / 2.0)
        anomaly_score = max(0.0, min(1.0, anomaly_score))

        # 3. Determine Severity
        if anomaly_score > 0.85: severity = "critical"
        elif anomaly_score > 0.7: severity = "high"
        elif anomaly_score > 0.5: severity = "medium"
        else: severity = "low"

        return UEBAResponse(
            anomaly_score=round(anomaly_score, 4),
            anomaly_type=self._classify_type(request, anomaly_score),
            confidence=0.85, # Confidence in the model
            affected_entity=request.entity_id,
            severity=severity,
            explanation=self._generate_explanation(request, anomaly_score),
            metadata={"baseline_size": len(request.historical_baseline)}
        )

    def _fallback_response(self, request: UEBARequest) -> UEBAResponse:
        # Heuristic fallback if no baseline
        return UEBAResponse(
            anomaly_score=0.1,
            anomaly_type="baseline_missing",
            confidence=0.5,
            affected_entity=request.entity_id,
            severity="info",
            explanation="Insufficient historical data to establish a baseline for anomaly detection.",
            metadata={}
        )

    def _classify_type(self, request: UEBARequest, score: float) -> str:
        if score < 0.5: return "normal"
        if "login" in request.activity_type.lower(): return "suspicious_login"
        if "access" in request.activity_type.lower(): return "access_pattern_anomaly"
        return "behavioral_deviation"

    def _generate_explanation(self, request: UEBARequest, score: float) -> str:
        if score < 0.5: return f"Activity for {request.entity_id} is within normal parameters."
        return f"Activity detected for {request.entity_id} deviates significantly from established historical baseline."

ueba_anomaly_engine = UEBAAnomalyEngine()
