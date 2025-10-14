"""Prompt Pydantic models"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date, datetime


class PromptBase(BaseModel):
    """Base prompt model"""
    text: str = Field(..., min_length=1)
    intent: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, pattern="^(P0|P1|P2)$")
    score: Optional[int] = Field(None, ge=0, le=100)
    status: str = Field(default="active", pattern="^(active|pending|paused)$")


class PromptCreate(PromptBase):
    """Create prompt request"""
    project_id: str = Field(..., max_length=50)
    platforms: List[str] = Field(default_factory=list)
    citation_rate: Optional[float] = Field(None, ge=0, le=1)
    created_date: Optional[date] = None


class PromptUpdate(BaseModel):
    """Update prompt request"""
    text: Optional[str] = Field(None, min_length=1)
    intent: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, pattern="^(P0|P1|P2)$")
    score: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(active|pending|paused)$")
    citation_rate: Optional[float] = Field(None, ge=0, le=1)


class PromptResponse(PromptBase):
    """Prompt response"""
    id: int
    project_id: str
    citation_rate: Optional[float] = None
    platforms: List[str] = []
    created_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
