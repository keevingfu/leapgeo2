"""Redis caching service"""

import redis
import json
from typing import Optional, Any
from functools import lru_cache
from ..config import get_settings

settings = get_settings()


class CacheService:
    """Service for Redis caching operations"""

    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            db=settings.redis_db,
            decode_responses=True
        )

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None
        """
        value = self.redis_client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """
        Set value in cache with TTL

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: 1 hour)

        Returns:
            True if successful
        """
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        return self.redis_client.setex(key, ttl, value)

    def delete(self, key: str) -> bool:
        """
        Delete key from cache

        Args:
            key: Cache key

        Returns:
            True if key was deleted
        """
        return bool(self.redis_client.delete(key))

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern

        Args:
            pattern: Key pattern (e.g., "geo:project:*")

        Returns:
            Number of keys deleted
        """
        keys = list(self.redis_client.scan_iter(match=pattern))
        if keys:
            return self.redis_client.delete(*keys)
        return 0

    def get_project_info(self, project_id: str) -> Optional[dict]:
        """Get cached project information"""
        return self.get(f"geo:project:{project_id}:info")

    def set_project_info(self, project_id: str, data: dict, ttl: int = 3600) -> bool:
        """Cache project information"""
        return self.set(f"geo:project:{project_id}:info", data, ttl)

    def get_citation_rate(self, project_id: str) -> Optional[float]:
        """Get cached citation rate"""
        rate = self.get(f"geo:project:{project_id}:citation_rate")
        return float(rate) if rate else None

    def set_citation_rate(self, project_id: str, rate: float, ttl: int = 1800) -> bool:
        """Cache citation rate"""
        return self.set(f"geo:project:{project_id}:citation_rate", rate, ttl)

    def get_leaderboard(self) -> list:
        """Get citation rate leaderboard"""
        results = self.redis_client.zrevrange(
            "geo:citation_rate_leaderboard",
            0, -1,
            withscores=True
        )
        return [
            {"project_id": project_id, "citation_rate": score}
            for project_id, score in results
        ]

    def update_leaderboard(self, project_id: str, citation_rate: float) -> bool:
        """Update project position in leaderboard"""
        return bool(self.redis_client.zadd(
            "geo:citation_rate_leaderboard",
            {project_id: citation_rate}
        ))

    def invalidate_project_cache(self, project_id: str) -> int:
        """Invalidate all cache for a project"""
        return self.delete_pattern(f"geo:project:{project_id}:*")


@lru_cache()
def get_cache_service() -> CacheService:
    """Get cached Redis service instance"""
    return CacheService()
