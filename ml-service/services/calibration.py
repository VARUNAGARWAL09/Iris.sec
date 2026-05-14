import math


class ConfidenceCalibrator:
    def calibrate(self, score: float, agreement: float, evidence_strength: float) -> float:
        score_component = abs(score - 50.0) / 50.0
        calibrated = 0.35 + 0.35 * score_component + 0.2 * agreement + 0.1 * evidence_strength
        return self._bounded(calibrated)

    def probability_from_score(self, score: float, midpoint: float = 65.0, steepness: float = 0.09) -> float:
        return self._bounded(1.0 / (1.0 + math.exp(-steepness * (score - midpoint))))

    def false_positive_probability(self, risk_score: float, source_reputation: float, evidence_strength: float) -> float:
        low_evidence = 1.0 - evidence_strength
        low_reputation = 1.0 - source_reputation
        probability = 0.55 * low_evidence + 0.35 * low_reputation + 0.1 * (1.0 - risk_score / 100.0)
        return self._bounded(probability)

    def _bounded(self, value: float) -> float:
        if math.isnan(value) or math.isinf(value):
            return 0.0
        return max(0.0, min(1.0, value))


confidence_calibrator = ConfidenceCalibrator()
