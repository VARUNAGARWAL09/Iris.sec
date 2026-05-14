from dataclasses import dataclass

import numpy as np
import pandas as pd

from pipelines.feature_pipeline import FEATURE_COLUMNS, enterprise_feature_pipeline
from schemas.features import FeatureContext
from schemas.prediction import ThreatSignal


@dataclass(frozen=True)
class FeatureBundle:
    frame: pd.DataFrame
    vector: np.ndarray
    feature_names: list[str]
    reasons: list[str]


class FeatureEngineeringService:
    def transform(self, alert: ThreatSignal) -> FeatureBundle:
        context = FeatureContext(
            domain="alerts",
            payload={
                "title": alert.title,
                "description": alert.description,
                "source": alert.source,
                "severity": alert.severity,
                "raw_data": alert.raw_data,
                **(alert.raw_data or {}),
            },
        )
        vector = enterprise_feature_pipeline.build_one(context)
        frame = enterprise_feature_pipeline.to_frame([vector])
        reasons = self._reasons(vector.values, alert)
        return FeatureBundle(
            frame=frame,
            vector=frame.to_numpy(dtype=float),
            feature_names=FEATURE_COLUMNS.copy(),
            reasons=reasons,
        )

    def _reasons(self, values: dict[str, float], alert: ThreatSignal) -> list[str]:
        reasons: list[str] = []
        if values["failed_login_count"] >= 0.35:
            reasons.append("Failed-login activity is elevated.")
        if values["bytes_transferred"] >= 0.45:
            reasons.append("Transfer volume is elevated.")
        if values["source_reputation"] >= 0.75:
            reasons.append("Source reputation is high risk.")
        if values["ioc_density"] >= 0.35:
            reasons.append("IOC density is elevated.")
        if values["attack_chain_depth"] >= 0.35:
            reasons.append("Multiple attack-chain stages are represented.")
        if values["alert_similarity_score"] >= 0.45:
            reasons.append("Alert resembles recent activity.")
        if alert.severity in {"critical", "high"}:
            reasons.append(f"Incoming severity is {alert.severity}.")
        return reasons or ["Risk estimated from normalized enterprise features."]


feature_engineering_service = FeatureEngineeringService()
