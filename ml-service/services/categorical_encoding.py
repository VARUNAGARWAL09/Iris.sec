from collections import defaultdict


class CategoricalEncoder:
    def __init__(self) -> None:
        self._maps: dict[str, dict[str, int]] = defaultdict(dict)

    def encode(self, namespace: str, value: str | None) -> float:
        token = (value or "unknown").strip().lower() or "unknown"
        mapping = self._maps[namespace]
        if token not in mapping:
            mapping[token] = len(mapping) + 1
        return float(mapping[token])

    def encode_known(self, value: str | None, mapping: dict[str, float], default: float = 0.0) -> float:
        token = (value or "unknown").strip().lower()
        return mapping.get(token, default)


categorical_encoder = CategoricalEncoder()
