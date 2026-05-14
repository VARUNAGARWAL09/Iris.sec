import numpy as np
from sklearn.cluster import DBSCAN
from embeddings.sentence_encoder import sentence_embedding_service
from schemas.correlation import CorrelationRequest, CorrelationResponse, RelatedIncident

class IncidentCorrelationEngine:
    def correlate(self, request: CorrelationRequest) -> CorrelationResponse:
        if not request.historical_incidents:
            return CorrelationResponse(
                related_incidents=[],
                attack_cluster=[],
                campaign_id=None,
                similarity_score=0.0,
                correlation_explanation="No historical incidents provided for correlation."
            )

        # 1. Semantic Correlation
        current_text = f"{request.description} {' '.join(request.mitre_techniques)}"
        hist_texts = [f"{h.get('description', '')} {' '.join(h.get('mitre_techniques', []))}" for h in request.historical_incidents]
        
        embeddings = sentence_embedding_service.encode([current_text] + hist_texts)
        current_emb = embeddings[0]
        hist_embs = embeddings[1:]
        
        similarities = np.dot(hist_embs, current_emb)
        
        # 2. IoC and MITRE overlap
        related = []
        for i, h in enumerate(request.historical_incidents):
            score = float(similarities[i])
            # Boost score based on IoC overlap
            ioc_overlap = set(request.iocs) & set(h.get("iocs", []))
            if ioc_overlap: score = min(1.0, score + 0.2)
            
            # Boost based on MITRE overlap
            mitre_overlap = set(request.mitre_techniques) & set(h.get("mitre_techniques", []))
            if mitre_overlap: score = min(1.0, score + 0.15)
            
            if score > 0.65:
                related.append(RelatedIncident(
                    incident_id=h.get("incident_id", "unknown"),
                    similarity_score=round(score, 4),
                    correlation_type="semantic+overlap" if ioc_overlap or mitre_overlap else "semantic"
                ))

        # 3. Clustering for Campaign Detection
        if len(hist_embs) > 2:
            clustering = DBSCAN(eps=0.3, min_samples=2, metric="cosine").fit(hist_embs)
            labels = clustering.labels_
            cluster_members = [request.historical_incidents[i]["incident_id"] for i, label in enumerate(labels) if label != -1]
        else:
            cluster_members = []

        top_score = max([r.similarity_score for r in related]) if related else 0.0
        
        return CorrelationResponse(
            related_incidents=sorted(related, key=lambda x: x.similarity_score, reverse=True)[:5],
            attack_cluster=cluster_members,
            campaign_id=f"CAMP-{abs(hash(str(cluster_members))) % 10000}" if cluster_members else None,
            similarity_score=round(top_score, 4),
            correlation_explanation=self._explain(related, request),
            metadata={"processed_count": len(request.historical_incidents)}
        )

    def _explain(self, related: list[RelatedIncident], request: CorrelationRequest) -> str:
        if not related: return "No strong correlations detected with historical incidents."
        top = related[0]
        explanation = f"Detected high similarity ({int(top.similarity_score*100)}%) with {top.incident_id}."
        if "overlap" in top.correlation_type:
            explanation += " Shared indicators or MITRE techniques suggest a common attack pattern."
        return explanation

correlation_engine = IncidentCorrelationEngine()
