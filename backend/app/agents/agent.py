from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage
from .tools import (
    search_workspace,
    get_tasks,
    create_task,
    update_task,
    send_task_reminder_email,
    send_deadline_alert_email,
    get_recent_chat,
    send_important_info_email
)
from functools import partial
import os


def get_agent_tools(is_admin: bool, workspace_id: str, user_id: str):
    """Return tools with context baked in via partial functions."""

    # Wrap tools to inject workspace context automatically
    def wrap(tool_fn, **defaults):
        from langchain_core.tools import tool as make_tool

        @make_tool
        def wrapped(**kwargs):
            return tool_fn(**{**defaults, **kwargs})

        wrapped.name = tool_fn.name
        wrapped.description = tool_fn.description
        return wrapped

    tools = [
        search_workspace,
        get_tasks,
        get_recent_chat,
    ]

    # Admin-only tools
    if is_admin:
        tools += [
            create_task,
            update_task,
            send_task_reminder_email,
            send_deadline_alert_email,
            send_important_info_email
        ]

    return tools


async def run_agent(
    message: str,
    workspace_id: str,
    user_id: str,
    user_email: str,
    is_admin: bool,
    history: list = []
) -> dict:

    llm = ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3,
    )

    tools = get_agent_tools(is_admin, workspace_id, user_id)

    admin_note = """You have ADMIN privileges. You can:
- Create and update tasks
- Send reminder emails to team members
- Send deadline alert emails
""" if is_admin else """You have MEMBER access. You can:
- Search workspace documents
- View tasks
- Read recent chat
Note: Task creation, updates, and emails require admin access."""

    system = f"""You are Nexus AI — an intelligent workspace assistant.

Current session:
- Workspace ID: {workspace_id}
- User: {user_email}
- User ID: {user_id}
- Is Admin: {is_admin}

{admin_note}

Guidelines:
1. Always search workspace docs before answering questions
2. When asked to send emails, check is_admin first — always pass is_admin={str(is_admin).lower()} to email tools
3. When creating/updating tasks always pass workspace_id="{workspace_id}", created_by="{user_id}", is_admin={str(is_admin).lower()}
4. Be concise and action-oriented
5. After taking actions, confirm what was done
"""

    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=system,
    )

    # Build message history
    messages = []
    for h in history:
        role = "human" if h["role"] == "user" else "ai"
        messages.append({"role": role, "content": h["content"]})
    messages.append({"role": "human", "content": message})

    result = await agent.ainvoke({"messages": messages})

    final = result["messages"][-1]
    tools_used = list(set([
        m.name for m in result["messages"]
        if hasattr(m, "name") and m.name
    ]))

    return {
        "response": final.content,
        "tools_used": tools_used,
        "role": "model",
        "is_admin": is_admin
    }