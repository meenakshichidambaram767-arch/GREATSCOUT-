from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.models.signal import Signal
from backend.app.models.document import Document
from backend.app.models.opportunity import Opportunity, OpportunityEvidence
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
    """Browse extracted atomic friction signals with mapped solution opportunities."""
    query = (
        select(Signal, Opportunity.id.label("opp_id"), Opportunity.title.label("opp_title"))
        .outerjoin(OpportunityEvidence, Signal.id == OpportunityEvidence.signal_id)
        .outerjoin(Opportunity, OpportunityEvidence.opportunity_id == Opportunity.id)
    )
    if signal_type and signal_type != "all":
        query = query.where(Signal.signal_type == signal_type)
    if severity:
        query = query.where(Signal.severity >= severity)

    query = query.order_by(desc(Signal.severity), desc(Signal.created_at)).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    signals = []
    for sig, opp_id, opp_title in rows:
        sig_data = {
            "id": sig.id,
            "document_id": sig.document_id,
            "cluster_id": sig.cluster_id,
            "signal_type": sig.signal_type,
            "summary": sig.summary,
            "raw_quote": sig.raw_quote,
            "severity": sig.severity,
            "sentiment_score": sig.sentiment_score,
            "urgency_score": sig.urgency_score,
            "commercial_intent_score": sig.commercial_intent_score,
            "competitor_mentioned": sig.competitor_mentioned,
            "created_at": sig.created_at,
            "opportunity_id": opp_id,
            "opportunity_title": opp_title
        }
        signals.append(SignalResponse(**sig_data))
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
