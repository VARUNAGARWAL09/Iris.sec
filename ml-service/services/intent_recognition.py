import re
from typing import Any
import numpy as np
from embeddings.sentence_encoder import sentence_embedding_service
from schemas.intent import IntentRecognitionRequest, IntentRecognitionResponse, IntentEntity

class IntentRecognitionEngine:
    INTENT_EXAMPLES = {
        "incident_lookup": ["find incident", "show me case", "get details for", "status of INC-"],
        "escalation_request": ["escalate this", "page the manager", "raise priority", "call for help"],
        "playbook_execution": ["run playbook", "execute response", "start remediation", "automate this"],
        "threat_intel_lookup": ["check threat intel", "is this IP malicious", "reputation of", "whois"],
        "mitre_query": ["mitre technique", "attack pattern", "tactic info", "T1059"],
        "compliance_query": ["compliance check", "is this HIPAA compliant", "GDPR status", "audit log"],
        "analyst_summary": ["summarize this", "what happened", "give me a brief", "case summary"],
        "mitigation_recommendation": ["how to fix", "remediation steps", "suggest actions", "what should I do"],
        "evidence_lookup": ["show evidence", "get artifacts", "attached files", "pcap details"]
    }

    def __init__(self):
        self._intent_embeddings = {}
        self._initialized = False

    def _initialize(self):
        if self._initialized: return
        for intent, examples in self.INTENT_EXAMPLES.items():
            self._intent_embeddings[intent] = sentence_embedding_service.encode(examples)
        self._initialized = True

    def recognize(self, request: IntentRecognitionRequest) -> IntentRecognitionResponse:
        self._initialize()
        query_embedding = sentence_embedding_service.encode([request.query])[0]
        
        scores = {}
        for intent, embeddings in self._intent_embeddings.items():
            # Max similarity across all examples for this intent
            similarities = np.dot(embeddings, query_embedding)
            scores[intent] = float(np.max(similarities))

        detected_intent = max(scores, key=scores.get)
        confidence = scores[detected_intent]
        
        # Entities extraction (simple regex for now as fallback)
        entities = self._extract_entities(request.query)
        
        return IntentRecognitionResponse(
            detected_intent=detected_intent,
            confidence=round(confidence, 4),
            extracted_entities=entities,
            suggested_actions=self._get_actions(detected_intent, entities),
            semantic_similarity_score=round(confidence, 4),
            metadata={"all_scores": {k: round(v, 4) for k, v in scores.items()}}
        )

    def _extract_entities(self, query: str) -> list[IntentEntity]:
        entities = []
        # Incident IDs
        for match in re.finditer(r"INC-\d+|CASE-\d+", query, re.I):
            entities.append(IntentEntity(type="incident_id", value=match.group(), confidence=0.95, start=match.start(), end=match.end()))
        # MITRE Techniques
        for match in re.finditer(r"T\d{4}(?:\.\d{3})?", query, re.I):
            entities.append(IntentEntity(type="mitre_id", value=match.group(), confidence=0.98, start=match.start(), end=match.end()))
        # IP Addresses
        for match in re.finditer(r"\d{1,3}(?:\.\d{1,3}){3}", query):
            entities.append(IntentEntity(type="ip_address", value=match.group(), confidence=0.9, start=match.start(), end=match.end()))
        return entities

    def _get_actions(self, intent: str, entities: list[IntentEntity]) -> list[str]:
        actions = []
        if intent == "incident_lookup": actions.append("Fetch incident details from database")
        elif intent == "escalation_request": actions.append("Notify on-call supervisor")
        elif intent == "playbook_execution": actions.append("List available playbooks for this incident")
        elif intent == "threat_intel_lookup": actions.append("Query threat intelligence providers")
        
        if any(e.type == "incident_id" for e in entities):
            actions.append("Navigate to incident detail page")
        return actions

intent_recognition_engine = IntentRecognitionEngine()
