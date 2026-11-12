import uuid
from app.models import Workspace, WorkspaceMember, RoleEnum, Task, TaskStatus, TaskPriority
from tests.conftest import create_test_jwt, make_test_user


def test_task_crud_lifecycle(client, db):
    """
    Validates complete CRUD lifecycle for tasks:
    1. CREATE: Admin creates a new task in workspace (201).
    2. READ: Workspace member lists tasks (200).
    3. UPDATE: Update task status to done (200).
    4. DELETE: Admin deletes the task (204).
    """
    owner = make_test_user(db, email="task_owner@nexus.ai")
    token = create_test_jwt(str(owner.id), owner.email)
    client.cookies.set("access_token", token)

    # 1. Setup workspace & owner membership
    ws = Workspace(
        name="Task Project Workspace",
        invite_code="tasks-code-01",
        owner_id=owner.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    member = WorkspaceMember(workspace_id=ws.id, user_id=owner.id, role=RoleEnum.admin)
    db.add(member)
    db.commit()

    # --- CREATE TASK ---
    create_payload = {
        "title": "Build CI/CD pipeline",
        "description": "Add GitHub Actions workflow and tests",
        "priority": "high",
        "workspace_id": str(ws.id),
        "assigned_to": str(owner.id),
    }
    create_res = client.post("/api/tasks/", json=create_payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    task_id = created_data["id"]
    assert created_data["title"] == "Build CI/CD pipeline"
    assert created_data["priority"] == "high"
    assert created_data["status"] == "todo"

    # --- READ TASKS ---
    list_res = client.get(f"/api/tasks/?workspace_id={ws.id}")
    assert list_res.status_code == 200
    tasks = list_res.json()
    assert len(tasks) == 1
    assert tasks[0]["id"] == task_id
    assert tasks[0]["title"] == "Build CI/CD pipeline"

    # --- UPDATE TASK ---
    update_payload = {
        "status": "done",
        "priority": "medium",
    }
    update_res = client.patch(f"/api/tasks/{task_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["status"] == "done"
    assert updated_data["priority"] == "medium"

    # --- DELETE TASK ---
    delete_res = client.delete(f"/api/tasks/{task_id}")
    assert delete_res.status_code == 204

    # Verify task no longer in db
    assert db.query(Task).filter(Task.id == uuid.UUID(task_id)).first() is None


def test_create_task_forbidden_for_non_member(client, db):
    """Users who do not belong to the workspace cannot create tasks (403)."""
    owner = make_test_user(db, email="real_owner2@nexus.ai")
    stranger = make_test_user(db, email="stranger@nexus.ai")

    ws = Workspace(
        name="Private Workspace",
        invite_code="private-code-02",
        owner_id=owner.id,
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    # Stranger tries to create task in ws
    token = create_test_jwt(str(stranger.id), stranger.email)
    client.cookies.set("access_token", token)

    payload = {
        "title": "Unauthorized Task",
        "workspace_id": str(ws.id),
    }
    res = client.post("/api/tasks/", json=payload)
    assert res.status_code == 403

