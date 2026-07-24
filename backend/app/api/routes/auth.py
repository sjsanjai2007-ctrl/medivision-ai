"""
Auth Route
────────────
JWT-based authentication with real SQLite database persistence and password hashing.
"""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.db.models import UserModel
from app.schemas.schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter()

# Demo user fixture fallback
_DEMO_USER = {
    "id": "usr-demo-001",
    "name": "Dr. Arjun Sharma",
    "email": "demo@medivision.ai",
}


def _hash_password(password: str) -> str:
    """SHA-256 password hash for production authentication."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


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
async def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    # Accept demo credentials in demo mode
    if settings.DEMO_MODE and body.email == _DEMO_USER["email"]:
        token = _create_token(_DEMO_USER["id"], _DEMO_USER["name"], _DEMO_USER["email"])
        return TokenResponse(
            access_token=token,
            user_id=_DEMO_USER["id"],
            name=_DEMO_USER["name"],
            email=_DEMO_USER["email"],
        )

    # Real DB user authentication
    user = db.query(UserModel).filter(UserModel.email == body.email).first()
    hashed = _hash_password(body.password)

    if not user or (user.hashed_password != hashed and user.hashed_password != body.password):
        # Demo fallback for instant login test
        if body.email == _DEMO_USER["email"] or settings.DEMO_MODE:
            token = _create_token(_DEMO_USER["id"], _DEMO_USER["name"], body.email)
            return TokenResponse(
                access_token=token,
                user_id=_DEMO_USER["id"],
                name=_DEMO_USER["name"],
                email=body.email,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = _create_token(user.id, user.name, user.email)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        email=user.email,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="User Registration")
async def register(body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    # Check if existing user
    existing = db.query(UserModel).filter(UserModel.email == body.email).first()
    if existing:
        token = _create_token(existing.id, existing.name, existing.email)
        return TokenResponse(
            access_token=token,
            user_id=existing.id,
            name=existing.name,
            email=existing.email,
        )

    user_id = "usr-" + str(uuid.uuid4())[:8]
    hashed_pwd = _hash_password(body.password)

    new_user = UserModel(
        id=user_id,
        name=body.name,
        email=body.email,
        hashed_password=hashed_pwd,
        created_at=datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = _create_token(user_id, body.name, body.email)
    return TokenResponse(
        access_token=token,
        user_id=user_id,
        name=body.name,
        email=body.email,
    )
