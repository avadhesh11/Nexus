from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, WorkspaceMember
from ..schemas import MessageOut,MessageCreate
from ..dependencies import get_current_user
from ..supabase_client import supabase  

router = APIRouter(prefix="/chat", tags=["chat"])

def is_workspace_member(workspace_id: str, user_id: str, db: Session):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403,detail="Not a workspace member")
    return member 

@router.post("/{workspace_id}/messages",response_model=MessageOut,status_code=201)
def send_message(
    workspace_id:str,
    body:MessageCreate,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    is_workspace_member(workspace_id,current_user.id,db)
    result = supabase.table("messages").insert({
        "content": body.content,
        "workspace_id": workspace_id,
        "sender_id": str(current_user.id),
        "sender_email": current_user.email
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    return result.data[0]

@router.get("/{workspace_id}/messages")
def get_messages(
    workspace_id: str,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not is_workspace_member(workspace_id, str(current_user.id), db):
        raise HTTPException(status_code=403, detail="Not a workspace member")

    result = supabase.table("messages") \
        .select("*") \
        .eq("workspace_id", workspace_id) \
        .order("created_at", desc=False) \
        .limit(limit) \
        .execute()

    return result.data

       