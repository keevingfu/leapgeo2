"""Citation Pydantic models"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class CitationBase(BaseModel):
    """Base citation model"""
    platform: str = Field(..., max_length=50)
    prompt: Optional[str] = None
    source: Optional[str] = Field(None, max_length=500)
    position: Optional[int] = Field(None, ge=1)
    snippet: Optional[str] = None


class CitationCreate(CitationBase):
    """Create citation request"""
    project_id: str = Field(..., max_length=50)
    detected_at: datetime = Field(default_factory=datetime.now)


class CitationResponse(CitationBase):
    """Citation response"""
    id: int
    project_id: str
    detected_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
