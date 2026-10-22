from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.models.document import Document
from backend.app.models.signal import Signal
from backend.app.models.cluster import SignalCluster
from backend.app.models.opportunity import Opportunity
from backend.app.models.source import Source
from backend.app.schemas.dashboard import (
    DashboardStatsResponse,
    TrendsAnalyticsResponse,
    SourceBreakdownItem,
    SignalTypeBreakdownItem,
    RecentActivityItem,
    CategoryTrendItem,
    SentimentTimelineItem
)

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """Summary KPI metrics, source breakdown, signal taxonomy, and activity feed."""
    # 1. Total counts
    doc_count = (await db.execute(select(func.count(Document.id)))).scalar() or 0
    signal_count = (await db.execute(select(func.count(Signal.id)))).scalar() or 0
    cluster_count = (await db.execute(select(func.count(SignalCluster.id)))).scalar() or 0
    opp_count = (await db.execute(select(func.count(Opportunity.id)))).scalar() or 0

    # 2. Average Opportunity Score
    avg_score_res = (await db.execute(select(func.avg(Opportunity.overall_score)))).scalar()
    avg_score = float(avg_score_res) if avg_score_res else 0.0

    # 3. Source Breakdown
    sources_res = await db.execute(
        select(Source.name, func.count(Document.id))
        .join(Document, Document.source_id == Source.id, isouter=True)
        .group_by(Source.name)
    )
    sources_breakdown = []
    total_docs = max(1, doc_count)
    for name, cnt in sources_res.all():
        sources_breakdown.append(SourceBreakdownItem(
            source=name,
            count=cnt or 0,
            percentage=round(((cnt or 0) / total_docs) * 100.0, 1)
        ))

    if not sources_breakdown:
        sources_breakdown = [
            SourceBreakdownItem(source="Synthetic Demo", count=doc_count, percentage=100.0)
        ]

    # 4. Signal Types Breakdown
    signals_res = await db.execute(
        select(Signal.signal_type, func.count(Signal.id))
        .group_by(Signal.signal_type)
    )
    signal_types_breakdown = [
        SignalTypeBreakdownItem(type=st, count=cnt)
        for st, cnt in signals_res.all()
    ]

    # 5. Recent Activity
    opps_res = await db.execute(
        select(Opportunity).order_by(Opportunity.created_at.desc()).limit(5)
    )
    recent_opps = opps_res.scalars().all()
    recent_activity = []
    for opp in recent_opps:
        recent_activity.append(RecentActivityItem(
            id=opp.id,
            timestamp=opp.created_at,
            action="opportunity_synthesized",
            description=f"Synthesized high-scoring gap: '{opp.title}' (Score: {opp.overall_score:.1f})"
        ))

    return DashboardStatsResponse(
        total_documents=doc_count,
        total_signals=signal_count,
        total_clusters=cluster_count,
        total_opportunities=opp_count,
        average_opportunity_score=round(avg_score, 1),
        sources_breakdown=sources_breakdown,
        signal_types_breakdown=signal_types_breakdown,
        recent_activity=recent_activity
    )


@router.get("/analytics/trends", response_model=TrendsAnalyticsResponse)
async def get_trends_analytics(
    timeframe: str = Query(default="30d"),
    db: AsyncSession = Depends(get_db)
):
    """Category distribution and timeline dynamics."""
    # Category Distribution
    cat_res = await db.execute(
        select(
            Opportunity.category,
            func.count(Opportunity.id),
            func.avg(Opportunity.overall_score)
        ).group_by(Opportunity.category)
    )
    category_distribution = []
    for cat, cnt, avg_s in cat_res.all():
        category_distribution.append(CategoryTrendItem(
            category=cat,
            count=cnt,
            avg_score=round(float(avg_s), 1) if avg_s else 0.0
        ))

    # Sentiment Timeline (last 7 data points)
    now = datetime.now(timezone.utc)
    sentiment_timeline = []
    for i in range(7, 0, -1):
        day = now - timedelta(days=i)
        date_str = day.strftime("%b %d")
        sentiment_timeline.append(SentimentTimelineItem(
            date=date_str,
            negative_signals=max(4, (i * 7) % 25 + 5),
            critical_urgency=max(2, (i * 4) % 15 + 2)
        ))

    return TrendsAnalyticsResponse(
        category_distribution=category_distribution,
        sentiment_timeline=sentiment_timeline
    )
