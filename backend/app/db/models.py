"""
SQLAlchemy Database Models
──────────────────────────
Defines persistent tables for Users and Diagnostic Reports.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("ReportModel", back_populates="user", cascade="all, delete-orphan")


class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    category = Column(String, nullable=False, index=True)
    condition = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    heatmap_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserModel", back_populates="reports")
