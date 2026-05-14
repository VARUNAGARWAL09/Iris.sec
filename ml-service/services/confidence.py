import numpy as np

from schemas.prediction import PredictionConfidence


class ConfidenceService:
    def from_probabilities(self, probabilities: np.ndarray) -> PredictionConfidence:
        if probabilities.size == 0:
            score = 0.5
        else:
            score = float(np.max(probabilities))
        label = "high" if score >= 0.8 else "medium" if score >= 0.55 else "low"
        return PredictionConfidence(score=round(score, 4), label=label)


confidence_service = ConfidenceService()

