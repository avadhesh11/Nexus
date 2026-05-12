from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import secrets

from ..database import get_db
from ..models import User, Workspace, WorkspaceMember, RoleEnum
from ..schemas import WorkspaceCreate, WorkspaceOut
from ..dependencies import get_current_user

router=APIRouter(prefix="/workspaces",tags=["workspaces"])
def generate_invite_code() -> str:
    return secrets.token_urlsafe(8) 

@router.post("/", response_model=WorkspaceOut, status_code=201)
def create_workspace(
    body: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # print(current_user.__dict__)
    workspace = Workspace(
        name=body.name,
        description=body.description,
        invite_code=generate_invite_code(),
        owner_id=current_user.id
    )
    db.add(workspace)
    db.flush() #flush becoz to get workspace id before commiting final change to db otherwise it would be null after commiting

    # to make creator as admin
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role=RoleEnum.admin
    )
    db.add(member)
    db.commit()
    db.refresh(workspace)
    return workspace


# LIST my workspaces
@router.get("/", response_model=list[WorkspaceOut])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # memberships = db.query(WorkspaceMember).filter(
    #     WorkspaceMember.user_id == current_user.id
    # ).all()

    # workspace_ids = [m.workspace_id for m in memberships]
    # workspaces = db.query(Workspace).filter(
    #     Workspace.id.in_(workspace_ids)
    # ).all()

    workspaces=db.query(Workspace).join(WorkspaceMember,Workspace.id==WorkspaceMember.workspace_id).filter(WorkspaceMember.user_id==current_user.id).all()
    
     
    return workspaces


# GET single workspace
@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id
    ).first()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    return workspace


# JOIN via invite code
@router.post("/join/{invite_code}", response_model=WorkspaceOut)
def join_workspace(
    invite_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(
        Workspace.invite_code == invite_code
    ).first()

    if not workspace:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    # check already a member
    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role=RoleEnum.member
    )
    db.add(member)
    db.commit()
    db.refresh(workspace)
    return workspace


# DELETE workspace (admin only)
@router.delete("/{workspace_id}", status_code=204)
def delete_workspace(
    workspace_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id
    ).first()

    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if str(workspace.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only owner can delete")

    db.delete(workspace)
    db.commit()