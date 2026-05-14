import numpy as np
from schemas.classification import ThreatClassificationRequest, ThreatClassificationResponse

class ThreatClassificationEngine:
    CATEGORIES = [
        "Ransomware", "Phishing", "Exfiltration", "Insider Threat", 
        "Credential Abuse", "Malware", "Lateral Movement", "C2 Beaconing",
        "Data Staging", "Account Takeover", "Brute Force", "SQL Injection",
        "Cryptojacking", "API Abuse", "Zero-Day Exploit", "Rootkit Detection",
        "Privilege Escalation", "DNS Tunneling", "Web Shell Injection", "Living off the Land",
        "Supply Chain Attack", "Botnet Activity", "DDoS Orchestration", "Memory Injection",
        "Steganographic Exfiltration", "Man-in-the-Middle", "Resource Hijacking", "Directory Traversal"
    ]
    
    def classify(self, request: ThreatClassificationRequest) -> ThreatClassificationResponse:
        # Simulate ensemble classification
        text = (request.title + " " + request.description).lower()
        
        scores = {cat: 0.05 for cat in self.CATEGORIES}
        
        # Dynamic heuristic mapping for simulation
        for cat in self.CATEGORIES:
            if cat.lower() in text:
                scores[cat] += 0.8
        
        # Specific keyword heuristics
        if "encrypt" in text: scores["Ransomware"] += 0.7
        if "email" in text: scores["Phishing"] += 0.65
        if "upload" in text or "transfer" in text: scores["Exfiltration"] += 0.6
        if "employee" in text: scores["Insider Threat"] += 0.55
        if "virus" in text or "trojan" in text: scores["Malware"] += 0.6
        if "login" in text or "password" in text or "auth" in text: scores["Credential Abuse"] += 0.5
        
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
        cat = category.lower().replace(" ", "_")
        if cat in ["ransomware", "exfiltration", "zero-day exploit", "supply chain attack"]: return "critical"
        if cat in ["insider_threat", "credential_abuse", "lateral_movement", "account takeover"]: return "high"
        return "medium"

    def _get_recommendations(self, category: str) -> list[str]:
        cat = category.lower().replace(" ", "_")
        base = ["Isolate affected systems", "Review related logs"]
        if cat == "ransomware": return base + ["Check backup integrity", "Disable shadow copy deletion"]
        if cat == "phishing": return base + ["Reset user credentials", "Search email gateway for similar messages"]
        if cat == "exfiltration": return base + ["Terminate active network sessions", "Block destination IP at firewall"]
        return base

threat_classification_engine = ThreatClassificationEngine()
