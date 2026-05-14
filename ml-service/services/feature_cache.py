from collections import OrderedDict
from threading import RLock
from time import monotonic
from typing import Generic, TypeVar

T = TypeVar("T")


class TTLFeatureCache(Generic[T]):
    def __init__(self, max_size: int = 2048, ttl_seconds: float = 300.0) -> None:
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._items: OrderedDict[str, tuple[float, T]] = OrderedDict()
        self._lock = RLock()

    def get(self, key: str) -> T | None:
        now = monotonic()
        with self._lock:
            item = self._items.get(key)
            if item is None:
                return None
            created_at, value = item
            if now - created_at > self.ttl_seconds:
                self._items.pop(key, None)
                return None
            self._items.move_to_end(key)
            return value

    def set(self, key: str, value: T) -> None:
        with self._lock:
            self._items[key] = (monotonic(), value)
            self._items.move_to_end(key)
            while len(self._items) > self.max_size:
                self._items.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._items.clear()


feature_cache: TTLFeatureCache[object] = TTLFeatureCache()
