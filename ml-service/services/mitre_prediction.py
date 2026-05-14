import numpy as np
from schemas.mitre import MitrePredictionRequest, MitrePredictionResponse, PredictedTechnique

class MitrePredictionEngine:
    # Simplified transition matrix for demo purposes
    # In production, this would be derived from historical attack data
    TRANSITIONS = {
        "T1078": ["T1003", "T1059", "T1021"], # Valid Accounts -> OS Credential Dumping, Command/Scripting, Remote Services
        "T1059": ["T1021", "T1072", "T1570"], # Command/Scripting -> Remote Services, Software Deployment, Lateral Tool Transfer
        "T1021": ["T1003", "T1543", "T1083"], # Remote Services -> OS Credential Dumping, Create/Mod Process, File Discovery
        "T1003": ["T1547", "T1078", "T1021"], # Credential Dumping -> Boot/Logon Autostart, Valid Accounts, Remote Services
    }

    TECHNIQUE_NAMES = {
        "T1078": "Valid Accounts",
        "T1003": "OS Credential Dumping",
        "T1059": "Command and Scripting Interpreter",
        "T1021": "Remote Services",
        "T1072": "Software Deployment",
        "T1570": "Lateral Tool Transfer",
        "T1543": "Create or Modify System Process",
        "T1083": "File and Directory Discovery",
        "T1547": "Boot or Logon Autostart Execution",
    }

    def predict(self, request: MitrePredictionRequest) -> MitrePredictionResponse:
        last_tech = request.observed_techniques[-1]
        next_candidates = self.TRANSITIONS.get(last_tech, ["T1059", "T1021", "T1003"]) # Default candidates
        
        predictions = []
        for tech_id in next_candidates[:3]:
            predictions.append(PredictedTechnique(
                technique_id=tech_id,
                name=self.TECHNIQUE_NAMES.get(tech_id, "Unknown Technique"),
                confidence=round(0.8 / (next_candidates.index(tech_id) + 1), 4),
                tactic=self._get_tactic(tech_id)
            ))

        # Progression Probability (Markov-like)
        prog_prob = min(0.95, 0.3 + (len(request.observed_techniques) * 0.15))
        
        return MitrePredictionResponse(
            predicted_techniques=predictions,
            attack_path=request.observed_techniques + [p.technique_id for p in predictions[:1]],
            confidence_scores={p.technique_id: p.confidence for p in predictions},
            progression_probability=round(prog_prob, 4),
            lateral_movement_probability=0.65 if any(t in ["T1021", "T1570"] for t in next_candidates) else 0.2,
            privilege_escalation_likelihood=0.75 if any(t in ["T1078", "T1543"] for t in next_candidates) else 0.3,
            metadata={"observed_count": len(request.observed_techniques)}
        )

    def _get_tactic(self, tech_id: str) -> str:
        if tech_id in ["T1078", "T1543"]: return "Privilege Escalation"
        if tech_id in ["T1021", "T1570"]: return "Lateral Movement"
        if tech_id in ["T1003"]: return "Credential Access"
        return "Execution"

mitre_prediction_engine = MitrePredictionEngine()
