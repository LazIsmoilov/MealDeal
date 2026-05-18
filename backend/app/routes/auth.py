"""
Authentication routes: register and login.

Endpoints:
- POST /auth/register  → create a new user account, return access token
- POST /auth/login     → verify credentials, return access token

Both endpoints return the same shape: { access_token, token_type, user }.
This lets the frontend treat registration as an implicit login —
no need for the user to log in again right after signing up.
"""

from fastapi import APIRouter, HTTPException, status

from app.database import get_db
from app.models.user import UserCreate, UserLogin, UserInDB, UserPublic, UserRole
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    """
    Register a new user.

    - Hashes the password before storage
    - Rejects duplicate emails or usernames with 409 Conflict
    - Returns an access token so the user is immediately logged in
    """
    db = get_db()
    users = db["users"]

    # Reject duplicates early — Mongo will also enforce this via a unique index
    # added in a later commit, but rejecting here gives a clearer error message.
    if users.find_one({"email": payload.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    if users.find_one({"username": payload.username}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )

    user_in_db = UserInDB(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=UserRole.USER,
    )

    users.insert_one(user_in_db.model_dump())

    token = create_access_token(
        subject=user_in_db.email,
        extra_claims={"role": user_in_db.role.value},
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserPublic(**user_in_db.model_dump()).model_dump(mode="json"),
    }


@router.post("/login")
def login(payload: UserLogin):
    """
    Authenticate an existing user.

    - Looks up the user by email
    - Verifies the password against the stored bcrypt hash
    - Returns an access token on success, 401 otherwise

    Returns 401 (not 404) when the email doesn't exist — this prevents
    user enumeration attacks where someone probes for valid email addresses.
    """
    db = get_db()
    users = db["users"]

    user_doc = users.find_one({"email": payload.email})
    if not user_doc or not verify_password(payload.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        subject=user_doc["email"],
        extra_claims={"role": user_doc["role"]},
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserPublic(**user_doc).model_dump(mode="json"),
    }


# --- Protected routes below this line ---

from fastapi import Depends
from app.auth.dependencies import get_current_user


@router.get("/me", response_model=UserPublic)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return the current authenticated user's public profile.

    Requires a valid JWT in the Authorization header. The actual auth
    check happens in the get_current_user dependency — this handler
    only runs if authentication succeeds.
    """
    return UserPublic(**current_user)
