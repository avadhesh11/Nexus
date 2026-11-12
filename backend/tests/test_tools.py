from unittest.mock import patch
from app.agents.tools import search_workspace


def test_search_workspace_tool_returns_formatted_chunks():
    """search_workspace tool formats retrieved vector store chunks with double newlines."""
    mock_chunks = [
        {"content": "Nexus AI supports real-time multi-agent workflows.", "chunk_index": 0},
        {"content": "Authentication is powered by JWT stored in HTTP-only cookies.", "chunk_index": 1},
    ]

    with patch("app.agents.tools.search_similar", return_value=mock_chunks) as mock_search:
        result = search_workspace.invoke({
            "query": "authentication architecture",
            "workspace_id": "ws-999",
        })

        mock_search.assert_called_once_with(
            workspace_id="ws-999",
            query="authentication architecture",
            limit=5,
        )
        assert "Nexus AI supports real-time multi-agent workflows." in result
        assert "Authentication is powered by JWT" in result
        assert "\n\n" in result


def test_search_workspace_tool_empty_results():
    """search_workspace tool returns friendly fallback when no documents match."""
    with patch("app.agents.tools.search_similar", return_value=[]):
        result = search_workspace.invoke({
            "query": "non-existent concept",
            "workspace_id": "ws-empty",
        })
        assert result == "No relevant information found in workspace."

