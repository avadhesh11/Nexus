from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.orm import Session
import uuid
from datetime import datetime,timedelta,UTC
from ..database import get_db
from ..models import User,Document,WorkspaceMember
from ..schemas import DocumentCreate,DocumentOut,DocumentUpdate
from ..dependencies import get_current_user
from ..rag.vector_store import store_embeddings
from uuid import UUID
router=APIRouter(prefix="/documents",tags=["documents"])

def check_member(workspace_id: str, user_id: str, db: Session):
    member=db.query(WorkspaceMember).filter(
        WorkspaceMember.user_id==user_id,
        WorkspaceMember.workspace_id==workspace_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a workspace member")
    return member

@router.post("/", response_model=DocumentOut, status_code=201)
def create_document(
    body: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_member(body.workspace_id, str(current_user.id), db)

    doc=Document(
        title=body.title,
        content=body.content,
        workspace_id=body.workspace_id,
        created_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # embed the document content
    if body.content:
        store_embeddings(
            workspace_id=str(body.workspace_id),
            source_type="document",
            source_id=str(doc.id),
            content=f"{body.title}\n\n{body.content}"  # include title for context
        )

    return doc

@router.get("/",response_model=list[DocumentOut])
def get_alldocuments(
    workspace_id: str = Query(..., description="Workspace ID"),
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user),
):   
    check_member(workspace_id,str(current_user.id),db)
    documents=db.query(Document).filter(
        Document.workspace_id==workspace_id
    ).order_by(Document.updated_at.desc()).all()

    return documents

@router.get("/{doc_id}",response_model=DocumentOut)
def fetch_doc(
    doc_id:str,
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)
): 
    print(doc_id)
    doc=db.query(Document).filter(
        Document.id==doc_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    check_member(str(doc.workspace_id), str(current_user.id), db)
    return doc


@router.delete("/{doc_id}")
def delete_doc(
    doc_id:str,
    db:Session=Depends(get_db),
    current_user=Depends(get_current_user)
):
    doc=db.query(Document).filter(
        Document.id==doc_id
    ).first()

    member=check_member(str(doc.workspace_id), str(current_user.id), db)

    if str(doc.created_by)!=str(current_user.id) and member.role!="admin":
        raise HTTPException(status_code=403, detail="Not allowed to delete this document")
    db.delete(doc)
    db.commit()
@router.patch("/{doc_id}", response_model=DocumentOut)
def update_document(
    doc_id: str,
    body: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc=db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    check_member(str(doc.workspace_id), str(current_user.id), db)

    if body.title is not None:
        doc.title = body.title
    if body.content is not None:
        doc.content = body.content

    doc.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(doc)

    # re-embed updated content
    if doc.content:
        store_embeddings(
            workspace_id=str(doc.workspace_id),
            source_type="document",
            source_id=str(doc.id),
            content=f"{doc.title}\n\n{doc.content}"
        )

    return doc