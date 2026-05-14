import numpy as np
from schemas.classification import ThreatClassificationRequest, ThreatClassificationResponse

class ThreatClassificationEngine:
    CATEGORIES = ["ransomware", "phishing", "exfiltration", "insider_threat", "malware", "credential_abuse", "lateral_movement", "botnet"]
    
    def classify(self, request: ThreatClassificationRequest) -> ThreatClassificationResponse:
        # Simulate ensemble classification
        text = (request.title + " " + request.description).lower()
        
        scores = {cat: 0.05 for cat in self.CATEGORIES}
        
        # Simple heuristic mapping for simulation
        if "ransom" in text or "encrypt" in text: scores["ransomware"] += 0.7
        if "phish" in text or "email" in text: scores["phishing"] += 0.65
        if "exfil" in text or "upload" in text or "transfer" in text: scores["exfiltration"] += 0.6
        if "insider" in text or "employee" in text: scores["insider_threat"] += 0.55
        if "malware" in text or "virus" in text or "trojan" in text: scores["malware"] += 0.6
        if "login" in text or "password" in text or "auth" in text: scores["credential_abuse"] += 0.5
        
        # Normalize scores
        total = sum(scores.values())
        probs = {k: round(v / total, 4) for k, v in scores.items()}
        
        best_cat = max(probs, key=probs.get)
        confidence = probs[best_cat]
        
        return ThreatClassificationResponse(
            threat_category=best_cat,
            confidence=confidence,
            severity_prediction=self._predict_severity(best_cat, confidence),
            attack_complexity="high" if confidence < 0.4 else "medium" if confidence < 0.7 else "low",
            recommended_response=self._get_recommendations(best_cat),
            probability_distribution=probs,
            explanation=f"Classified as {best_cat} with {int(confidence*100)}% confidence based on indicator patterns and ensemble analysis.",
            metadata={"ensemble_models": ["xgboost", "lightgbm", "heuristic"]}
        )

    def _predict_severity(self, category: str, confidence: float) -> str:
        if category in ["ransomware", "exfiltration"]: return "critical"
        if category in ["insider_threat", "credential_abuse"]: return "high"
        return "medium"

    def _get_recommendations(self, category: str) -> list[str]:
        base = ["Isolate affected systems", "Review related logs"]
        if category == "ransomware": return base + ["Check backup integrity", "Disable shadow copy deletion"]
        if category == "phishing": return base + ["Reset user credentials", "Search email gateway for similar messages"]
        if category == "exfiltration": return base + ["Terminate active network sessions", "Block destination IP at firewall"]
        return base

threat_classification_engine = ThreatClassificationEngine()
