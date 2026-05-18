"""
Password hashing utilities.

Uses Passlib's CryptContext with bcrypt as the hashing scheme.
Bcrypt is the industry-standard choice for password storage as of 2026:
it includes a built-in salt, is intentionally slow to resist brute-force,
and has a tunable work factor (rounds) that scales with hardware.

This module exposes only pure functions — no database access, no I/O.
"""

from passlib.context import CryptContext


# Single shared context. Bcrypt's default of 12 rounds (~250ms per hash on
# modern hardware) is the recommended balance between security and UX.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Hash a plaintext password for storage in the database.

    Bcrypt generates a unique salt per hash, so the same password
    will produce different hashes on different calls — this is correct
    and prevents rainbow-table attacks.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify that a plaintext password matches a previously stored hash.

    Returns True on match, False otherwise. Uses constant-time comparison
    internally to prevent timing-attack leakage.
    """
    return pwd_context.verify(plain_password, hashed_password)
