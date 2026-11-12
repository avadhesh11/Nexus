import uuid
from app.models import Workspace, WorkspaceMember, RoleEnum
from tests.conftest import create_test_jwt, make_test_user


def test_create_workspace(client, db):
    """Creating a workspace sets the owner, generates an invite code, and returns 201."""
    owner = make_test_user(db, email="owner@nexus.ai")
    token = create_test_jwt(str(owner.id), owner.email)
    client.cookies.set("access_token", token)

    payload = {
        "name": "Engineering Team",
        "description": "Core platform engineering",
    }
    response = client.post("/api/workspaces/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Engineering Team"
    assert data["description"] == "Core platform engineering"
    assert data["invite_code"] is not None
    assert str(data["owner_id"]) == str(owner.id)

    # Verify admin membership created for owner
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == uuid.UUID(data["id"]),
        WorkspaceMember.user_id == owner.id,
    ).first()
    assert membership is not None
    assert membership.role == RoleEnum.admin


def test_join_workspace_by_invite_code(client, db):
    """User can join an existing workspace via its invite code."""
    owner = make_test_user(db, email="owner_join@nexus.ai")
    joiner = make_test_user(db, email="joiner@nexus.ai")

    # Create workspace directly in db
    ws = Workspace(
        name="Collaboration Space",
        invite_code="join-code-1234",
        owner_id=owner.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    # Join as joiner
    token = create_test_jwt(str(joiner.id), joiner.email)
    client.cookies.set("access_token", token)

    response = client.post(f"/api/workspaces/join/{ws.invite_code}")
    assert response.status_code == 200
    assert response.json()["id"] == str(ws.id)

    # Verify membership created with member role
    membership = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == ws.id,
        WorkspaceMember.user_id == joiner.id,
    ).first()
    assert membership is not None
    assert membership.role == RoleEnum.member


def test_join_workspace_invalid_code_returns_404(client, db):
    """Joining with an invalid invite code returns 404 Not Found."""
    user = make_test_user(db, email="user_inv@nexus.ai")
    token = create_test_jwt(str(user.id), user.email)
    client.cookies.set("access_token", token)

    response = client.post("/api/workspaces/join/non-existent-code")
    assert response.status_code == 404
    assert "Invalid invite code" in response.json()["detail"]


def test_delete_workspace_non_owner_forbidden(client, db):
    """A non-owner user attempting to delete a workspace receives 403 Forbidden."""
    owner = make_test_user(db, email="real_owner@nexus.ai")
    intruder = make_test_user(db, email="intruder@nexus.ai")

    ws = Workspace(
        name="Protected Workspace",
        invite_code="protect-123",
        owner_id=owner.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    token = create_test_jwt(str(intruder.id), intruder.email)
    client.cookies.set("access_token", token)

    response = client.delete(f"/api/workspaces/{ws.id}")
    assert response.status_code == 403
    assert "Only owner can delete" in response.json()["detail"]

    # Verify workspace still exists
    assert db.query(Workspace).filter(Workspace.id == ws.id).first() is not None


def test_delete_workspace_owner_success(client, db):
    """Workspace owner can successfully delete their workspace (204 No Content)."""
    owner = make_test_user(db, email="del_owner@nexus.ai")

    ws = Workspace(
        name="Workspace To Delete",
        invite_code="delete-me-123",
        owner_id=owner.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    token = create_test_jwt(str(owner.id), owner.email)
    client.cookies.set("access_token", token)

    response = client.delete(f"/api/workspaces/{ws.id}")
    assert response.status_code == 204

    # Verify workspace removed
    assert db.query(Workspace).filter(Workspace.id == ws.id).first() is None

