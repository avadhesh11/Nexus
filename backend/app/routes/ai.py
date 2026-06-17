from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, WorkspaceMember, RoleEnum
from ..schemas import AIChatRequest
from ..dependencies import get_current_user
from ..agents.agent import run_agent
import json

router = APIRouter(prefix="/ai", tags=["ai"])


def get_member_role(workspace_id: str, user_id: str, db: Session):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a workspace member")
    return member


@router.post("/chat")
async def chat(
    body: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = get_member_role(body.workspace_id, str(current_user.id), db)
    is_admin = member.role == RoleEnum.admin

    result = await run_agent(
        message=body.message,
        workspace_id=body.workspace_id,
        user_id=str(current_user.id),
        user_email=current_user.email,
        is_admin=is_admin,
        history=[{"role": m.role, "content": m.content} for m in body.history]
    )
    print(result)
    return result