"""Application configuration"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Application
    app_name: str = "GEO Platform API"
    app_version: str = "1.0.0"
    debug: bool = True

    # PostgreSQL
    postgres_host: str = "localhost"
    postgres_port: int = 5437
    postgres_user: str = "claude"
    postgres_password: str = "claude_dev_2025"
    postgres_db: str = "claude_dev"

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def sync_database_url(self) -> str:
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    # Neo4j
    neo4j_uri: str = "bolt://localhost:7688"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "claude_neo4j_2025"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6382
    redis_password: str = "claude_redis_2025"
    redis_db: int = 0

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
