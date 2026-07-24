"""
Auth Route
────────────
JWT-based authentication with demo mode bypass.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from jose import jwt

from app.core.config import settings
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter()

# Demo user fixture
_DEMO_USER = {
    "id": "usr-demo-001",
    "name": "Dr. Arjun Sharma",
    "email": "demo@medivision.ai",
    "password_hash": "demo",   # No real hashing in demo mode
}


def _create_token(user_id: str, name: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "name": name,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/login", response_model=TokenResponse, summary="User Login")
async def login(body: LoginRequest) -> TokenResponse:
    # Demo mode: accept demo credentials
    if settings.DEMO_MODE or body.email == _DEMO_USER["email"]:
        token = _create_token(_DEMO_USER["id"], _DEMO_USER["name"], _DEMO_USER["email"])
        return TokenResponse(
            access_token=token,
            user_id=_DEMO_USER["id"],
            name=_DEMO_USER["name"],
            email=_DEMO_USER["email"],
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="User Registration")
async def register(body: RegisterRequest) -> TokenResponse:
    user_id = "usr-" + body.email.split("@")[0][:8]
    token = _create_token(user_id, body.name, body.email)
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=body.name,
        email=body.email,
    )
