"""
User domain model and database schema helpers.

Defines:
- UserRole enum (user / admin) for role-based access control
- UserCreate: input schema for registration (plain password)
- UserLogin: input schema for login
- UserInDB: internal representation stored in MongoDB (hashed password)
- UserPublic: response schema returned to clients (no password fields)
"""

from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """Role-based access control roles."""
    USER = "user"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """Schema for incoming registration requests."""
    email: EmailStr
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Schema for incoming login requests."""
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    """Internal user representation stored in MongoDB."""
    email: EmailStr
    username: str
    hashed_password: str
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserPublic(BaseModel):
    """Safe user representation returned to clients (no password fields)."""
    email: EmailStr
    username: str
    role: UserRole
    created_at: datetime
