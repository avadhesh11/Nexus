from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
from dotenv import load_dotenv
from ..database import get_db
from ..models import User, WorkspaceMember
from ..schemas import AIChatRequest
from ..dependencies import get_current_user
from google import genai
from google.genai import types
from ..gemini_client import client, SYSTEM_PROMPT
from ..rag.vector_store import search_similar
import os
load_dotenv()
MODEL=os.getenv("GEMINI_MODEL")
router = APIRouter(prefix="/ai", tags=["ai"])

def check_workspace_member(workspace_id: str, user_id: str, db: Session):
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a workspace member")
    return member

def build_history(history: list):
    """Convert our history format to Gemini format."""
    return [
        {
            "role": msg.role,
            "parts": [{"text": msg.content}]
        }
        for msg in history
    ]
@router.post("/chat")
def chat(
    body: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_workspace_member(body.workspace_id, str(current_user.id), db)

    relevant_chunks = search_similar(
        workspace_id=body.workspace_id,
        query=body.message,
        limit=5
    )

    if relevant_chunks:
        context = "\n\n---\n\n".join([
            f"[{chunk['source_type'].upper()}]\n{chunk['content']}"
            for chunk in relevant_chunks
        ])
        user_message = f"""Use the following workspace context to answer the question.
If the context doesn't contain relevant information, answer from general knowledge.

WORKSPACE CONTEXT:
{context}

USER QUESTION:
{body.message}"""
    else:
        user_message = body.message
    history = [
        types.Content(
            role="model" if msg.role == "assistant" else "user",
            parts=[types.Part(text=msg.content)]
        )
        for msg in body.history
    ]

    response = client.models.generate_content(
        model=MODEL,
        contents=history + [
            types.Content(
                role="user",
                parts=[types.Part(text=user_message)]
            )
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        )
    )

    return {
        "response": response.text,
        "role": "model",
        "sources_used": len(relevant_chunks)
    }

@router.post("/chat/stream")
def chat_stream(
    body: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_workspace_member(body.workspace_id, str(current_user.id), db)

    relevant_chunks = search_similar(
        workspace_id=body.workspace_id,
        query=body.message,
        limit=5
    )

    user_message = body.message
    if relevant_chunks:
        context = "\n\n---\n\n".join([
            f"[{chunk['source_type'].upper()}]\n{chunk['content']}"
            for chunk in relevant_chunks
        ])
        user_message = f"""WORKSPACE CONTEXT:
{context}

USER QUESTION:
{body.message}"""

    history = [
        types.Content(
            role="model" if msg.role == "assistant" else "user",
            parts=[types.Part(text=msg.content)]
        )
        for msg in body.history
    ]

    def generate():
        try:
            for chunk in client.models.generate_content_stream(
                model=MODEL,
                contents=history + [
                    types.Content(
                        role="user",
                        parts=[types.Part(text=user_message)]
                    )
                ],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                )
            ):
                if chunk.text:
                    data = json.dumps({"chunk": chunk.text})
                    yield f"data: {data}\n\n"

            yield f"data: {json.dumps({'done': True, 'sources': len(relevant_chunks)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
      
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )