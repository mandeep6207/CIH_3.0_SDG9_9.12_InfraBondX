import jwt
from flask import request
import os
import uuid

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")


def create_jwt(user_id, role):
    return jwt.encode(
        {"user_id": user_id, "role": str(role).upper()},
        JWT_SECRET,
        algorithm="HS256"
    )


def get_auth_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "role": (payload.get("role") or "").upper()
        }
    except Exception:
        return None


def generate_tx_hash():
    return "0x" + uuid.uuid4().hex
