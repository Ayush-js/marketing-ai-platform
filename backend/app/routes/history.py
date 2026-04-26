from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.vectordb.history_store import (
    get_all_sessions,
    search_sessions,
    get_session_by_id,
    delete_session,
)

router = APIRouter()


@router.get("/sessions")
async def list_sessions(
    type: str = Query("all", description="Filter by type: content | campaign | all"),
    limit: int = Query(50, ge=1, le=200, description="Max results"),
):
    """List all saved sessions, newest first."""
    try:
        sessions = get_all_sessions(collection_type=type, limit=limit)
        return {"sessions": sessions, "count": len(sessions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1, description="Search query"),
    type: str = Query("all", description="Filter by type: content | campaign | all"),
    limit: int = Query(10, ge=1, le=50, description="Max results"),
):
    """Semantic search across session history using ChromaDB vector similarity."""
    try:
        results = search_sessions(query_text=q, collection_type=type, n_results=limit)
        return {"results": results, "query": q, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    type: str = Query("all", description="Collection type: content | campaign | all"),
):
    """Get a single session by ID."""
    try:
        session = get_session_by_id(session_id=session_id, collection_type=type)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_id}")
async def remove_session(
    session_id: str,
    type: str = Query("all", description="Collection type: content | campaign | all"),
):
    """Delete a session by ID."""
    try:
        deleted = delete_session(session_id=session_id, collection_type=type)
        if not deleted:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"deleted": True, "id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
