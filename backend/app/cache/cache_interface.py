"""Cache abstraction. No-op in local dev (no Redis per project constraints);
a real implementation can be swapped in later without touching callers."""
from typing import Any, Optional


class CacheInterface:
    def get(self, key: str) -> Optional[Any]:
        return None

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        return None

    def delete(self, key: str) -> None:
        return None


cache = CacheInterface()
