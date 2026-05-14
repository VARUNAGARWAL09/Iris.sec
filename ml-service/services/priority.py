from typing import Literal

Priority = Literal["p4", "p3", "p2", "p1"]


class PriorityService:
    def predict(self, risk_score: float, escalation_probability: float) -> Priority:
        if risk_score >= 85 or escalation_probability >= 0.85:
            return "p1"
        if risk_score >= 70 or escalation_probability >= 0.65:
            return "p2"
        if risk_score >= 45 or escalation_probability >= 0.35:
            return "p3"
        return "p4"

    def probabilities(self, risk_score: float) -> dict[str, float]:
        anchors = {"p4": 20.0, "p3": 50.0, "p2": 72.0, "p1": 90.0}
        raw = {priority: max(0.001, 1.0 / (1.0 + abs(risk_score - anchor))) for priority, anchor in anchors.items()}
        total = sum(raw.values())
        return {priority: value / total for priority, value in raw.items()}


priority_service = PriorityService()
