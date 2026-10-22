from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.models.signal import Signal
from backend.app.models.document import Document
from backend.app.schemas.signal import SignalResponse
from backend.app.schemas.document import DocumentResponse

router = APIRouter()


@router.get("/signals", response_model=List[SignalResponse])
async def list_signals(
    signal_type: Optional[str] = Query(default=None),
    severity: Optional[int] = Query(default=None, ge=1, le=5),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Browse extracted atomic friction signals with type and severity filters."""
    query = select(Signal)
    if signal_type and signal_type != "all":
        query = query.where(Signal.signal_type == signal_type)
    if severity:
        query = query.where(Signal.severity >= severity)

    query = query.order_by(desc(Signal.severity), desc(Signal.created_at)).limit(limit)
    result = await db.execute(query)
    signals = result.scalars().all()
    return signals


@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(
    source_code: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Browse ingested raw forum posts and discussion threads."""
    query = select(Document).order_by(desc(Document.ingested_at)).limit(limit)
    result = await db.execute(query)
    docs = result.scalars().all()
    return docs
