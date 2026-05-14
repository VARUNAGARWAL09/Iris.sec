import hashlib
import json
import math
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd

from schemas.features import FeatureContext, FeaturePipelineResult, FeatureVector
from services.categorical_encoding import categorical_encoder
from services.feature_cache import feature_cache
from services.feature_validation import feature_validator
from services.normalization import feature_normalizer

FEATURE_COLUMNS = [
    "severity_score",
    "mitre_density",
    "escalation_frequency",
    "analyst_workload",
    "response_latency",
    "incident_frequency",
    "source_reputation",
    "ioc_density",
    "attack_chain_depth",
    "alert_similarity_score",
    "failed_login_count",
    "bytes_transferred",
    "alert_frequency",
    "time_window",
    "text_length",
    "suspicious_keyword_count",
    "domain_encoded",
    "source_encoded",
]

SEVERITY_SCORE = {
    "info": 10.0,
    "low": 30.0,
    "medium": 50.0,
    "high": 75.0,
    "critical": 95.0,
}

SUSPICIOUS_KEYWORDS = (
    "brute",
    "failed",
    "malware",
    "ransomware",
    "exfil",
    "phishing",
    "credential",
    "mimikatz",
    "sql",
    "injection",
    "unauthorized",
    "privilege",
    "lateral",
    "beacon",
    "c2",
)


class EnterpriseFeaturePipeline:
    def build_one(self, context: FeatureContext) -> FeatureVector:
        cache_key = context.cache_key or self._cache_key(context)
        cached = feature_cache.get(cache_key)
        if isinstance(cached, FeatureVector):
            return cached.model_copy(update={"cache_hit": True})

        payload = context.payload or {}
        related = context.related or {}
        values = self._base_features(payload, related)

        domain_values = {
            "incidents": self._incident_features,
            "alerts": self._alert_features,
            "mitre_mappings": self._mitre_features,
            "analyst_actions": self._analyst_action_features,
            "playbooks": self._playbook_features,
            "telemetry": self._telemetry_features,
            "evidence": self._evidence_features,
            "threat_intelligence": self._threat_intel_features,
        }[context.domain](payload, related)
        values.update(domain_values)

        categorical_values = {
            "domain": context.domain,
            "source": str(payload.get("source") or payload.get("vendor") or "unknown"),
        }
        values["domain_encoded"] = categorical_encoder.encode("feature_domain", categorical_values["domain"])
        values["source_encoded"] = categorical_encoder.encode("source", categorical_values["source"])
        values = self._normalize(values)
        warnings = feature_validator.validate(values, FEATURE_COLUMNS)

        vector = FeatureVector(
            domain=context.domain,
            feature_names=FEATURE_COLUMNS.copy(),
            values={name: float(values[name]) for name in FEATURE_COLUMNS},
            categorical_values=categorical_values,
            validation_warnings=warnings,
        )
        feature_cache.set(cache_key, vector)
        return vector

    def build_many(self, contexts: list[FeatureContext]) -> FeaturePipelineResult:
        vectors = [self.build_one(context) for context in contexts]
        matrix = [[vector.values[name] for name in FEATURE_COLUMNS] for vector in vectors]
        return FeaturePipelineResult(vectors=vectors, feature_names=FEATURE_COLUMNS.copy(), matrix=matrix)

    def to_frame(self, vectors: list[FeatureVector]) -> pd.DataFrame:
        return pd.DataFrame([vector.values for vector in vectors], columns=FEATURE_COLUMNS).fillna(0.0)

    def to_numpy(self, vectors: list[FeatureVector]) -> np.ndarray:
        return self.to_frame(vectors).to_numpy(dtype=float)

    def _base_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        text = self._text(payload)
        alerts = related.get("alerts", [])
        incidents = related.get("incidents", [])
        actions = related.get("analyst_actions", [])
        evidence = related.get("evidence", [])
        mitre = related.get("mitre_mappings", []) or self._as_list(payload.get("mitre_techniques") or payload.get("mitre_attack"))

        return {
            "severity_score": SEVERITY_SCORE.get(str(payload.get("severity", "medium")).lower(), 50.0),
            "mitre_density": self._density(len(mitre), max(len(alerts), 1)),
            "escalation_frequency": self._frequency(payload, "escalation_count", related.get("escalations", [])),
            "analyst_workload": self._density(len(actions), 24.0),
            "response_latency": self._latency(payload),
            "incident_frequency": self._density(len(incidents), 30.0),
            "source_reputation": self._number(payload, "source_reputation", "ip_reputation", "ip_reputation_score", default=0.5),
            "ioc_density": self._density(self._ioc_count(payload) + len(evidence), max(len(alerts) + len(incidents), 1)),
            "attack_chain_depth": float(len(set(self._extract_mitre_tactics(mitre)))),
            "alert_similarity_score": self._similarity_score(payload, alerts),
            "failed_login_count": self._number(payload, "failed_login_count", "failed_logins", default=0.0),
            "bytes_transferred": self._number(payload, "bytes_transferred", "transfer_size_bytes", default=0.0),
            "alert_frequency": self._number(payload, "alert_frequency", "count", "detection_count", default=max(len(alerts), 1)),
            "time_window": self._number(payload, "time_window", "duration_minutes", default=15.0),
            "text_length": float(len(text)),
            "suspicious_keyword_count": float(sum(1 for keyword in SUSPICIOUS_KEYWORDS if keyword in text.lower())),
        }

    def _incident_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        return {
            "response_latency": self._latency(payload),
            "incident_frequency": self._density(len(related.get("incidents", [])) + 1, 30.0),
            "attack_chain_depth": max(float(len(self._as_list(payload.get("tags")))), 1.0),
        }

    def _alert_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        return {
            "alert_frequency": self._number(payload, "alert_frequency", "count", default=max(len(related.get("alerts", [])), 1)),
            "alert_similarity_score": self._similarity_score(payload, related.get("alerts", [])),
        }

    def _mitre_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        techniques = self._as_list(payload.get("techniques") or payload.get("mitre_techniques"))
        tactics = self._as_list(payload.get("tactics"))
        return {
            "mitre_density": self._density(len(techniques), max(len(tactics), 1)),
            "attack_chain_depth": float(len(tactics) or len(set(self._extract_mitre_tactics(techniques)))),
        }

    def _analyst_action_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        actions = related.get("analyst_actions", [])
        return {
            "analyst_workload": self._density(len(actions) + 1, 24.0),
            "response_latency": self._latency(payload),
            "escalation_frequency": self._frequency(payload, "escalation_count", related.get("escalations", [])),
        }

    def _playbook_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        steps = self._as_list(payload.get("steps"))
        automated_steps = [step for step in steps if isinstance(step, dict) and step.get("actionType") == "automated"]
        return {
            "attack_chain_depth": float(len(steps)),
            "response_latency": self._number(payload, "estimatedDuration", "estimated_duration", default=30.0),
            "analyst_workload": 1.0 - self._density(len(automated_steps), max(len(steps), 1)),
        }

    def _telemetry_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        events = related.get("telemetry", [])
        return {
            "incident_frequency": self._density(len(events) + 1, 100.0),
            "ioc_density": self._density(self._ioc_count(payload), max(len(events), 1)),
            "bytes_transferred": self._number(payload, "bytes_transferred", "network_bytes", default=0.0),
        }

    def _evidence_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        classification = str(payload.get("classification", "unknown")).lower()
        classification_score = {"benign": 10.0, "unknown": 35.0, "suspicious": 70.0, "malicious": 95.0}.get(classification, 35.0)
        return {
            "severity_score": max(SEVERITY_SCORE.get(str(payload.get("severity", "info")).lower(), 10.0), classification_score),
            "ioc_density": self._density(self._ioc_count(payload) + 1, max(len(related.get("evidence", [])) + 1, 1)),
        }

    def _threat_intel_features(self, payload: dict[str, Any], related: dict[str, list[dict[str, Any]]]) -> dict[str, float]:
        reputation = self._number(payload, "reputation", "source_reputation", "abuse_score", default=50.0)
        if reputation > 1.0:
            reputation = reputation / 100.0
        return {
            "source_reputation": reputation,
            "ioc_density": self._density(self._ioc_count(payload), max(len(related.get("threat_intelligence", [])) + 1, 1)),
        }

    def _normalize(self, values: dict[str, float]) -> dict[str, float]:
        normalized = dict(values)
        normalized["severity_score"] = feature_normalizer.minmax(values.get("severity_score", 0.0), 0.0, 100.0)
        normalized["mitre_density"] = feature_normalizer.bounded(values.get("mitre_density", 0.0))
        normalized["escalation_frequency"] = feature_normalizer.bounded(values.get("escalation_frequency", 0.0))
        normalized["analyst_workload"] = feature_normalizer.bounded(values.get("analyst_workload", 0.0))
        normalized["response_latency"] = feature_normalizer.log_scale(values.get("response_latency", 0.0), 8.0)
        normalized["incident_frequency"] = feature_normalizer.bounded(values.get("incident_frequency", 0.0))
        normalized["source_reputation"] = feature_normalizer.bounded(values.get("source_reputation", 0.0))
        normalized["ioc_density"] = feature_normalizer.bounded(values.get("ioc_density", 0.0))
        normalized["attack_chain_depth"] = feature_normalizer.minmax(values.get("attack_chain_depth", 0.0), 0.0, 12.0)
        normalized["alert_similarity_score"] = feature_normalizer.bounded(values.get("alert_similarity_score", 0.0))
        normalized["failed_login_count"] = feature_normalizer.log_scale(values.get("failed_login_count", 0.0), 8.0)
        normalized["bytes_transferred"] = feature_normalizer.log_scale(values.get("bytes_transferred", 0.0), 24.0)
        normalized["alert_frequency"] = feature_normalizer.log_scale(values.get("alert_frequency", 0.0), 8.0)
        normalized["time_window"] = feature_normalizer.minmax(values.get("time_window", 15.0), 1.0, 1440.0)
        normalized["text_length"] = feature_normalizer.minmax(values.get("text_length", 0.0), 0.0, 5000.0)
        normalized["suspicious_keyword_count"] = feature_normalizer.minmax(values.get("suspicious_keyword_count", 0.0), 0.0, 12.0)
        normalized["domain_encoded"] = feature_normalizer.log_scale(values.get("domain_encoded", 0.0), 8.0)
        normalized["source_encoded"] = feature_normalizer.log_scale(values.get("source_encoded", 0.0), 8.0)
        return normalized

    def _cache_key(self, context: FeatureContext) -> str:
        raw = context.model_dump(mode="json")
        encoded = json.dumps(raw, sort_keys=True, default=str).encode("utf-8")
        return hashlib.sha256(encoded).hexdigest()

    def _number(self, payload: dict[str, Any], *keys: str, default: float) -> float:
        for key in keys:
            value = payload.get(key)
            if isinstance(value, (int, float)):
                return float(value)
            if isinstance(value, str):
                try:
                    return float(value)
                except ValueError:
                    continue
        raw_data = payload.get("raw_data")
        if isinstance(raw_data, dict):
            return self._number(raw_data, *keys, default=default)
        return default

    def _as_list(self, value: Any) -> list[Any]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    def _density(self, numerator: float, denominator: float) -> float:
        return feature_normalizer.ratio(float(numerator), float(denominator))

    def _frequency(self, payload: dict[str, Any], key: str, related_items: list[dict[str, Any]]) -> float:
        explicit = self._number(payload, key, default=-1.0)
        if explicit >= 0:
            return self._density(explicit, 30.0)
        return self._density(len(related_items), 30.0)

    def _latency(self, payload: dict[str, Any]) -> float:
        explicit = self._number(payload, "response_latency", "response_latency_seconds", default=-1.0)
        if explicit >= 0:
            return explicit
        created = payload.get("created_at")
        acknowledged = payload.get("acknowledged_at") or payload.get("updated_at") or payload.get("resolved_at")
        created_dt = self._parse_datetime(created)
        acknowledged_dt = self._parse_datetime(acknowledged)
        if created_dt and acknowledged_dt:
            return max(0.0, (acknowledged_dt - created_dt).total_seconds())
        return 0.0

    def _parse_datetime(self, value: Any) -> datetime | None:
        if not isinstance(value, str):
            return None
        try:
            if value.endswith("Z"):
                value = value[:-1] + "+00:00"
            parsed = datetime.fromisoformat(value)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except ValueError:
            return None

    def _ioc_count(self, payload: dict[str, Any]) -> float:
        values = " ".join(str(value) for value in payload.values())
        ip_count = values.count(".")
        url_count = values.lower().count("http://") + values.lower().count("https://")
        hash_like = sum(1 for token in values.split() if 32 <= len(token.strip()) <= 64 and all(c in "0123456789abcdefABCDEF" for c in token.strip()))
        return float(min(ip_count + url_count + hash_like, 100))

    def _extract_mitre_tactics(self, techniques: list[Any]) -> list[str]:
        tactics: list[str] = []
        for item in techniques:
            if isinstance(item, dict):
                tactic = item.get("tactic") or item.get("phase")
                if tactic:
                    tactics.append(str(tactic))
            elif isinstance(item, str) and "." in item:
                tactics.append(item.split(".")[0])
        return tactics

    def _similarity_score(self, payload: dict[str, Any], alerts: list[dict[str, Any]]) -> float:
        if not alerts:
            return 0.0
        current = set(self._text(payload).lower().split())
        if not current:
            return 0.0
        scores: list[float] = []
        for alert in alerts[:50]:
            other = set(self._text(alert).lower().split())
            if not other:
                continue
            scores.append(len(current & other) / len(current | other))
        return max(scores) if scores else 0.0

    def _text(self, payload: dict[str, Any]) -> str:
        parts = [
            payload.get("title"),
            payload.get("name"),
            payload.get("description"),
            payload.get("source"),
            payload.get("category"),
            payload.get("type"),
        ]
        raw_data = payload.get("raw_data")
        if isinstance(raw_data, dict):
            parts.extend(str(value) for value in raw_data.values())
        return " ".join(str(part) for part in parts if part is not None)


enterprise_feature_pipeline = EnterpriseFeaturePipeline()
