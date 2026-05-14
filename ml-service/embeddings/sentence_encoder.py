from functools import lru_cache
from typing import Any

import numpy as np
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except Exception:
    HAS_SENTENCE_TRANSFORMERS = False

from utils.config import settings


@lru_cache
def get_sentence_model() -> Any:
    if not HAS_SENTENCE_TRANSFORMERS:
        return None
    return SentenceTransformer(settings.embedding_model_name)


class SentenceEmbeddingService:
    def encode(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 0))
        
        model = get_sentence_model()
        if model is None:
            # Fallback to dummy embeddings (normalized random vectors)
            # This ensures the rest of the app doesn't crash
            return np.random.randn(len(texts), 384).astype(np.float32)
            
        return model.encode(texts, normalize_embeddings=True)


sentence_embedding_service = SentenceEmbeddingService()

