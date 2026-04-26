"""
History Store — ChromaDB-backed persistent chat/session history.

Stores Content Studio generations and Campaign Planner results
in separate ChromaDB collections with full metadata for filtering
and semantic search.
"""

import json
import uuid
from datetime import datetime, timezone
from app.vectordb.chroma_client import get_chroma_client

_content_collection = None
_campaign_collection = None


def _get_content_collection():
    """Get or create the content_history collection."""
    global _content_collection
    if _content_collection is None:
        client = get_chroma_client()
        _content_collection = client.get_or_create_collection(
            name="content_history",
            metadata={"description": "Content Studio generation history"},
        )
    return _content_collection


def _get_campaign_collection():
    """Get or create the campaign_history collection."""
    global _campaign_collection
    if _campaign_collection is None:
        client = get_chroma_client()
        _campaign_collection = client.get_or_create_collection(
            name="campaign_history",
            metadata={"description": "Campaign Planner session history"},
        )
    return _campaign_collection


# ── Save helpers ──────────────────────────────────────────────

def save_content_session(
    topic: str,
    content_type: str,
    tone: str,
    text_content: str,
    image_url: str | None = None,
    banner_url: str | None = None,
    image_prompt: str | None = None,
    content_id: str | None = None,
) -> str:
    """Save a Content Studio generation to history. Returns session_id."""
    col = _get_content_collection()
    session_id = content_id or str(uuid.uuid4())[:12]
    now = datetime.now(timezone.utc).isoformat()

    # The document is the text content (used for semantic search)
    document = f"Topic: {topic}\nType: {content_type}\nTone: {tone}\n\n{text_content}"

    metadata = {
        "session_type": "content",
        "topic": topic,
        "content_type": content_type,
        "tone": tone,
        "timestamp": now,
        "image_url": image_url or "",
        "banner_url": banner_url or "",
        "image_prompt": image_prompt or "",
        "preview": text_content[:200],
    }

    col.add(
        ids=[session_id],
        documents=[document],
        metadatas=[metadata],
    )
    return session_id


def save_campaign_session(
    goal: str,
    content_type: str,
    plan: str,
    steps: list,
    campaign_id: str | None = None,
) -> str:
    """Save a Campaign Planner result to history. Returns session_id."""
    col = _get_campaign_collection()
    session_id = campaign_id or str(uuid.uuid4())[:12]
    now = datetime.now(timezone.utc).isoformat()

    # The document is the plan text (used for semantic search)
    document = f"Goal: {goal}\nType: {content_type}\n\n{plan}"

    metadata = {
        "session_type": "campaign",
        "goal": goal,
        "content_type": content_type,
        "timestamp": now,
        "steps_count": len(steps),
        "steps_json": json.dumps(steps)[:2000],  # store serialized steps (capped)
        "preview": plan[:200],
    }

    col.add(
        ids=[session_id],
        documents=[document],
        metadatas=[metadata],
    )
    return session_id


# ── Query helpers ─────────────────────────────────────────────

def get_all_sessions(collection_type: str = "all", limit: int = 50) -> list:
    """
    Get all sessions, newest first.
    collection_type: 'content' | 'campaign' | 'all'
    """
    results = []

    if collection_type in ("content", "all"):
        col = _get_content_collection()
        if col.count() > 0:
            data = col.get(
                limit=limit,
                include=["metadatas", "documents"],
            )
            for i, sid in enumerate(data["ids"]):
                results.append({
                    "id": sid,
                    "type": "content",
                    "metadata": data["metadatas"][i],
                    "document": data["documents"][i],
                })

    if collection_type in ("campaign", "all"):
        col = _get_campaign_collection()
        if col.count() > 0:
            data = col.get(
                limit=limit,
                include=["metadatas", "documents"],
            )
            for i, sid in enumerate(data["ids"]):
                results.append({
                    "id": sid,
                    "type": "campaign",
                    "metadata": data["metadatas"][i],
                    "document": data["documents"][i],
                })

    # Sort by timestamp descending
    results.sort(
        key=lambda x: x["metadata"].get("timestamp", ""),
        reverse=True,
    )
    return results[:limit]


def search_sessions(
    query_text: str,
    collection_type: str = "all",
    n_results: int = 10,
) -> list:
    """Semantic search across sessions using ChromaDB vector similarity."""
    results = []

    if collection_type in ("content", "all"):
        col = _get_content_collection()
        if col.count() > 0:
            data = col.query(
                query_texts=[query_text],
                n_results=min(n_results, col.count()),
                include=["metadatas", "documents", "distances"],
            )
            for i, sid in enumerate(data["ids"][0]):
                results.append({
                    "id": sid,
                    "type": "content",
                    "metadata": data["metadatas"][0][i],
                    "document": data["documents"][0][i],
                    "distance": data["distances"][0][i],
                })

    if collection_type in ("campaign", "all"):
        col = _get_campaign_collection()
        if col.count() > 0:
            data = col.query(
                query_texts=[query_text],
                n_results=min(n_results, col.count()),
                include=["metadatas", "documents", "distances"],
            )
            for i, sid in enumerate(data["ids"][0]):
                results.append({
                    "id": sid,
                    "type": "campaign",
                    "metadata": data["metadatas"][0][i],
                    "document": data["documents"][0][i],
                    "distance": data["distances"][0][i],
                })

    # Sort by distance (lower = more relevant)
    results.sort(key=lambda x: x.get("distance", 999))
    return results[:n_results]


def get_session_by_id(session_id: str, collection_type: str = "all") -> dict | None:
    """Fetch a single session by its ID."""
    if collection_type in ("content", "all"):
        col = _get_content_collection()
        try:
            data = col.get(ids=[session_id], include=["metadatas", "documents"])
            if data["ids"]:
                return {
                    "id": data["ids"][0],
                    "type": "content",
                    "metadata": data["metadatas"][0],
                    "document": data["documents"][0],
                }
        except Exception:
            pass

    if collection_type in ("campaign", "all"):
        col = _get_campaign_collection()
        try:
            data = col.get(ids=[session_id], include=["metadatas", "documents"])
            if data["ids"]:
                return {
                    "id": data["ids"][0],
                    "type": "campaign",
                    "metadata": data["metadatas"][0],
                    "document": data["documents"][0],
                }
        except Exception:
            pass

    return None


def delete_session(session_id: str, collection_type: str = "all") -> bool:
    """Delete a session by ID. Returns True if found and deleted."""
    deleted = False

    if collection_type in ("content", "all"):
        col = _get_content_collection()
        try:
            existing = col.get(ids=[session_id])
            if existing["ids"]:
                col.delete(ids=[session_id])
                deleted = True
        except Exception:
            pass

    if collection_type in ("campaign", "all"):
        col = _get_campaign_collection()
        try:
            existing = col.get(ids=[session_id])
            if existing["ids"]:
                col.delete(ids=[session_id])
                deleted = True
        except Exception:
            pass

    return deleted
