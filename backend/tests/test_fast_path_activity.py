"""
Test Suite: Fast-Path Activity Endpoint & Security Eviction
1. Validates zero DB queries on warm cache hit via SQLAlchemy event listener.
2. Validates cache eviction and HTTP 403 enforcement upon workspace member removal.
"""

import os
import sys
import uuid
import json
import pytest
from datetime import datetime, UTC
from fastapi.testclient import TestClient
from sqlalchemy import event
from jose import jwt
from dotenv import load_dotenv

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(BACKEND_DIR, ".env.local"))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))
sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.database import engine, SessionLocal
from app.models import User, Workspace, WorkspaceMember, RoleEnum
from app.routes.auth import hash_password
from app.utils.redis_client import get_redis_client


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def db():
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


@pytest.fixture(scope="module")
def redis_conn():
    db_url = os.getenv("DATABASE_URL", "")
    if "sqlite" in db_url or not db_url:
        pytest.skip("Fast-path benchmark integration test requires cloud Supabase and Redis")
    r = get_redis_client()
    if r is None:
        pytest.skip("Redis Cloud connection must be available for fast-path tests")
    return r


def create_jwt_cookie(user_id: str, email: str) -> dict:
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "access",
        "exp": int(datetime.now(UTC).timestamp()) + 3600
    }
    secret = os.getenv("JWT_SECRET", "supersecretkey")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    token = jwt.encode(payload, secret, algorithm=algorithm)
    return {"access_token": token}


def test_cache_hit_executes_zero_db_queries(client, db, redis_conn):
    """
    Asserts that when the fast-path Redis key exists, the activity endpoint
    validates JWT statelessly and returns the cached feed with ZERO SQL queries.
    """
    user_id = uuid.uuid4()
    ws_id = uuid.uuid4()

    user = User(id=user_id, email=f"fastpath_{user_id.hex[:6]}@example.com", password=hash_password("Pass123!"))
    ws = Workspace(id=ws_id, name="Zero DB Workspace", owner_id=user.id, invite_code=uuid.uuid4().hex[:8])
    member = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role=RoleEnum.admin)

    db.add(user)
    db.commit()
    db.add(ws)
    db.commit()
    db.add(member)
    db.commit()

    cache_key = f"nexus:ws_activity:{ws_id}:{user_id}"
    mock_payload = {
        "workspace_id": str(ws_id),
        "activities": [
            {
                "id": "mock_event_1",
                "category": "task",
                "action": "Completed RFC",
                "title": "Fast Path Benchmark",
                "description": "Zero database query execution",
                "actor_email": user.email,
                "target_id": str(uuid.uuid4()),
                "target_link": "/dashboard/tasks",
                "created_at": datetime.now(UTC).isoformat()
            }
        ]
    }
    redis_conn.setex(cache_key, 15, json.dumps(mock_payload))

    cookies = create_jwt_cookie(str(user_id), user.email)
    client.cookies.set("access_token", cookies["access_token"])

    # Attach SQLAlchemy query counter
    sql_queries = []

    def capture_query(conn, cursor, statement, parameters, context, executemany):
        sql_queries.append(statement)

    event.listen(engine, "before_cursor_execute", capture_query)

    try:
        response = client.get(f"/api/workspaces/{ws_id}/activity")
    finally:
        event.remove(engine, "before_cursor_execute", capture_query)

    # Assertions
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert len(data.get("activities", [])) == 1
    assert data["activities"][0]["title"] == "Fast Path Benchmark"

    # CRITICAL ASSERTION: ZERO SQL queries on cache hit!
    assert len(sql_queries) == 0, f"Fast path failed: executed {len(sql_queries)} queries: {sql_queries}"

    # Cleanup in strict dependency order
    redis_conn.delete(cache_key)
    try:
        db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws_id).delete()
        db.commit()
        db.query(Workspace).filter(Workspace.id == ws_id).delete()
        db.commit()
        db.query(User).filter(User.id == user_id).delete()
        db.commit()
    except Exception as e:
        print(f"Cleanup warning: {e}")


def test_removed_member_eviction_and_403(client, db, redis_conn):
    """
    Asserts that:
    1. Member has cached activity in Redis.
    2. Admin removes member -> eviction hook purges Redis key.
    3. Removed member request now evaluates membership in DB and gets HTTP 403 Forbidden.
    """
    owner_id = uuid.uuid4()
    member_user_id = uuid.uuid4()
    ws_id = uuid.uuid4()

    owner = User(id=owner_id, email=f"owner_{owner_id.hex[:6]}@example.com", password=hash_password("Pass123!"))
    member_user = User(id=member_user_id, email=f"member_{member_user_id.hex[:6]}@example.com", password=hash_password("Pass123!"))
    db.add(owner)
    db.add(member_user)
    db.commit()

    ws = Workspace(id=ws_id, name="Eviction Workspace", owner_id=owner.id, invite_code=uuid.uuid4().hex[:8])
    db.add(ws)
    db.commit()

    owner_mem = WorkspaceMember(workspace_id=ws.id, user_id=owner.id, role=RoleEnum.admin)
    member_mem = WorkspaceMember(workspace_id=ws.id, user_id=member_user.id, role=RoleEnum.member)
    db.add(owner_mem)
    db.add(member_mem)
    db.commit()

    cache_key = f"nexus:ws_activity:{ws.id}:{member_user.id}"
    mock_payload = {
        "workspace_id": str(ws.id),
        "activities": []
    }
    # Pre-populate member's cache
    redis_conn.setex(cache_key, 15, json.dumps(mock_payload))
    assert redis_conn.exists(cache_key) == 1, "Cache key should exist before eviction"

    # Admin removes member via DELETE /api/workspaces/{ws_id}/members/{member_mem.id}
    owner_cookies = create_jwt_cookie(str(owner.id), owner.email)
    client.cookies.set("access_token", owner_cookies["access_token"])
    del_res = client.delete(f"/api/workspaces/{ws.id}/members/{member_mem.id}")
    assert del_res.status_code == 200, f"Delete member failed: {del_res.text}"

    # Verify Redis cache key was purged by the eviction hook
    assert redis_conn.exists(cache_key) == 0, "Security Violation: Cache key was not evicted on member removal!"

    # Removed member attempts to access activity feed -> should receive 403
    member_cookies = create_jwt_cookie(str(member_user.id), member_user.email)
    client.cookies.set("access_token", member_cookies["access_token"])
    act_res = client.get(f"/api/workspaces/{ws.id}/activity")
    assert act_res.status_code == 403, f"Expected 403 Forbidden, got {act_res.status_code}: {act_res.text}"
    assert "Not a workspace member" in act_res.json().get("detail", "")

    # Cleanup in strict dependency order
    try:
        db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == ws.id).delete()
        db.commit()
        db.query(Workspace).filter(Workspace.id == ws.id).delete()
        db.commit()
        db.query(User).filter(User.id.in_([owner_id, member_user_id])).delete()
        db.commit()
    except Exception as e:
        print(f"Cleanup warning: {e}")
