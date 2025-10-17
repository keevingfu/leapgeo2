"""Authentication API router"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

from ..database import get_db
from ..models.user import UserLogin, Token, UserResponse
from ..services.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()
security = HTTPBearer()


@router.post("/auth/login", response_model=Token)
async def login(
    user_login: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login endpoint"""
    # Get user by username
    result = await db.execute(
        text("SELECT * FROM users WHERE username = :username"),
        {"username": user_login.username}
    )
    user = result.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(user_login.password, user._mapping['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user._mapping['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Update last login
    await db.execute(
        text("UPDATE users SET last_login = :now WHERE id = :user_id"),
        {"now": datetime.utcnow(), "user_id": user._mapping['id']}
    )
    await db.commit()

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user._mapping['id']), "username": user._mapping['username']}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Get current user info"""
    token = credentials.credentials

    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    result = await db.execute(
        text("SELECT * FROM users WHERE id = :user_id"),
        {"user_id": int(user_id)}
    )
    user = result.fetchone()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(**user._mapping)


@router.post("/auth/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Logout endpoint (client should remove token)"""
    # In a production app, you might want to add the token to a blacklist
    # For now, we'll just return success and let the client remove the token
    return {"message": "Successfully logged out"}


@router.post("/auth/verify")
async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Verify if token is valid"""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return {"valid": True, "user_id": payload.get("sub")}
