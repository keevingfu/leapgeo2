"""Project Pydantic models"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class ProjectBase(BaseModel):
    """Base project model"""
    name: str = Field(..., min_length=1, max_length=200)
    industry: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: str = Field(default="active", pattern="^(active|paused|completed)$")


class ProjectCreate(ProjectBase):
    """Create project request"""
    id: str = Field(..., min_length=1, max_length=50)
    platforms: List[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    """Update project request"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    industry: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|paused|completed)$")
    citation_rate: Optional[float] = Field(None, ge=0, le=1)
    total_prompts: Optional[int] = Field(None, ge=0)
    content_published: Optional[int] = Field(None, ge=0)


class ProjectResponse(ProjectBase):
    """Project response"""
    id: str
    citation_rate: Optional[float] = None
    total_prompts: int = 0
    content_published: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(ProjectResponse):
    """Detailed project response with knowledge graph"""
    platforms: List[str] = []
    knowledge_graph: Optional[dict] = None
