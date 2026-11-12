import os
from datetime import timedelta
from jose import jwt
from app.models import User
from tests.conftest import create_test_jwt, make_test_user


def test_register_flow_creates_user(client, db):
    """Registering with a new email and password returns success and sets cookies."""
    payload = {
        "email": "newuser@nexus.ai",
        "password": "StrongPassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Registered successfully"

    # Verify user exists in database
    user = db.query(User).filter(User.email == "newuser@nexus.ai").first()
    assert user is not None
    assert user.email == "newuser@nexus.ai"


def test_register_duplicate_email_fails(client, db):
    """Registering with an already existing email returns 400 Bad Request."""
    make_test_user(db, email="existing@nexus.ai")

    payload = {
        "email": "existing@nexus.ai",
        "password": "Password123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Registration failed" in response.json()["detail"]


def test_login_flow_with_valid_credentials(client, db):
    """Logging in with valid credentials sets auth cookies and returns success."""
    make_test_user(db, email="loginuser@nexus.ai", password="SecretPassword123!")

    response = client.post("/api/auth/login", json={
        "email": "loginuser@nexus.ai",
        "password": "SecretPassword123!",
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies


def test_login_flow_with_invalid_password(client, db):
    """Logging in with incorrect password returns 401 Unauthorized."""
    make_test_user(db, email="loginuser@nexus.ai", password="SecretPassword123!")

    response = client.post("/api/auth/login", json={
        "email": "loginuser@nexus.ai",
        "password": "WrongPassword!",
    })
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


def test_jwt_validation_valid_token(client, db):
    """Request with valid JWT cookie successfully returns current user."""
    user = make_test_user(db, email="validjwt@nexus.ai")
    token = create_test_jwt(str(user.id), user.email)

    client.cookies.set("access_token", token)
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "validjwt@nexus.ai"
    assert response.json()["id"] == str(user.id)


def test_jwt_validation_expired_token(client, db):
    """Request with an expired JWT cookie returns 401 Unauthorized."""
    user = make_test_user(db, email="expired@nexus.ai")
    # Expired 1 hour ago
    expired_token = create_test_jwt(str(user.id), user.email, expires_delta=timedelta(hours=-1))

    client.cookies.set("access_token", expired_token)
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Invalid or expired token" in response.json()["detail"]


def test_jwt_validation_tampered_token(client, db):
    """Request with invalid signature returns 401 Unauthorized."""
    user = make_test_user(db, email="tampered@nexus.ai")
    # Signed with wrong secret
    tampered = jwt.encode(
        {"sub": str(user.id), "email": user.email, "type": "access"},
        "wrong-secret-key-1234567890",
        algorithm="HS256"
    )

    client.cookies.set("access_token", tampered)
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_jwt_validation_invalid_token_type(client, db):
    """Request with a refresh token in place of an access token returns 401."""
    user = make_test_user(db, email="tokentype@nexus.ai")
    refresh_token = create_test_jwt(str(user.id), user.email, token_type="refresh")

    client.cookies.set("access_token", refresh_token)
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Invalid token type" in response.json()["detail"]

