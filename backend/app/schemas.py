from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from typing import Optional
from datetime import datetime
# --- Auth schemas (already exist) ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    email: str

    class Config:
        from_attributes = True

# --- Workspace schemas ---

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None

class WorkspaceMemberOut(BaseModel):
    user_id: UUID
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True

class WorkspaceOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    invite_code: str
    owner_id: UUID
    created_at: datetime
    members: list[WorkspaceMemberOut] = []

    class Config:
        from_attributes = True


# --- Document schemas ---

class DocumentCreate(BaseModel):
    title: str = "Untitled"
    content: Optional[str] = ""
    workspace_id: UUID

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class DocumentOut(BaseModel):
    id: UUID
    title: str
    content: Optional[str]
    workspace_id: UUID
    created_by:UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Message schemas ---

class MessageOut(BaseModel):
    id:UUID
    content: str
    workspace_id: UUID
    sender_id: UUID
    sender_email: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content:str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    workspace_id: UUID
    assigned_to: Optional[UUID] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: str
    priority: str
    workspace_id:UUID
    created_by: UUID
    assigned_to: Optional[UUID]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



class ChatMessage(BaseModel):
    role: str        # "user" or "model"
    content: str

class AIChatRequest(BaseModel):
    message: str
    workspace_id: str
    history: list[ChatMessage] = []
    