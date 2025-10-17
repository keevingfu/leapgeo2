"""User Pydantic models"""

from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Create user request"""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """Login request"""
    username: str
    password: str


class UserResponse(UserBase):
    """User response"""
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # 1 hour


class TokenData(BaseModel):
    """Token data"""
    user_id: Optional[int] = None
    username: Optional[str] = None
