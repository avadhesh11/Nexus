from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
from ..database import get_db
from ..models import User, Task, WorkspaceMember, TaskStatus, TaskPriority,RoleEnum
from ..schemas import TaskCreate, TaskUpdate, TaskOut
from ..dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


def check_workspace_member(workspace_id: str, user_id: str, db: Session):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a workspace member")
    return member


@router.post("/",response_model=TaskOut,status_code=201)
def create_task(
    body: TaskCreate,
    current_user:User=Depends(get_current_user),
    db:Session=Depends(get_db)
):
    check_workspace_member(body.workspace_id, str(current_user.id), db)
    if body.assigned_to:
        assignee = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == body.workspace_id,
            WorkspaceMember.user_id == body.assigned_to
        ).first()
        if not assignee:
            raise HTTPException(
                status_code=400,
                detail="Assigned user is not a workspace member"
            )
        member = check_workspace_member(body.workspace_id, str(current_user.id), db)

        if member.role != RoleEnum.admin:
            raise HTTPException(
                status_code=403,
                detail="Only workspace admins can create tasks"
            )
        
    task = Task(
        title=body.title,
        description=body.description,
        priority=body.priority,
        workspace_id=body.workspace_id,
        created_by=current_user.id,
        assigned_to=body.assigned_to,
        due_date=body.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/",response_model=list[TaskOut])
def fetch_tasks(
    workspace_id: str = Query(...),
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks=db.query(Task).filter(
        Task.workspace_id==workspace_id
    )
    if status:
        tasks=tasks.filter(Task.status==status)

    return tasks

@router.patch("/{task_id}",response_model=TaskOut)
def update_task(
task_id:str,
body:TaskUpdate,
db: Session = Depends(get_db),
current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    check_workspace_member(str(task.workspace_id), str(current_user.id), db)

    if body.title is not None:
        task.title = body.title
    if body.description is not None:
        task.description = body.description
    if body.status is not None:
        task.status = body.status
    if body.priority is not None:
        task.priority = body.priority
    if body.assigned_to is not None:
        task.assigned_to = body.assigned_to
    if body.due_date is not None:
        task.due_date = body.due_date

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    member = check_workspace_member(str(task.workspace_id), str(current_user.id), db)

    
    if str(task.created_by) != str(current_user.id) and member.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed to delete this task")

    db.delete(task)
    db.commit()