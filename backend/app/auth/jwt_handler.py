"""
JSON Web Token utilities.

Provides two pure functions:
- create_access_token: encode a payload into a signed JWT
- decode_access_token: verify signature and expiry, return payload or raise

This module deliberately knows nothing about users, databases, or HTTP.
Route handlers consume these functions through dependencies (see Commit 10).
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt.exceptions import InvalidTokenError

from app.config import settings


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """
    Encode a signed JWT containing the subject (typically a user email or id)
    plus any extra claims, and an expiry timestamp.

    The 'sub' (subject) and 'exp' (expiry) claims are JWT standard fields
    defined in RFC 7519 — using the standard names means any JWT library
    on any platform will understand the token.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Verify a JWT's signature and expiry. Returns the decoded payload on success.

    Raises InvalidTokenError (or a subclass) on any failure — expired token,
    bad signature, malformed structure. Route dependencies translate these
    into HTTP 401 responses.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


__all__ = ["create_access_token", "decode_access_token", "InvalidTokenError"]
