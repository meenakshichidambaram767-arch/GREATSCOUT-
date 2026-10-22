from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class SourceBreakdownItem(BaseModel):
    source: str
    count: int
    percentage: float


class SignalTypeBreakdownItem(BaseModel):
    type: str
    count: int


class RecentActivityItem(BaseModel):
    id: str
    timestamp: datetime
    action: str
    description: str


class DashboardStatsResponse(BaseModel):
    total_documents: int
    total_signals: int
    total_clusters: int
    total_opportunities: int
    average_opportunity_score: float
    sources_breakdown: List[SourceBreakdownItem]
    signal_types_breakdown: List[SignalTypeBreakdownItem]
    recent_activity: List[RecentActivityItem]


class CategoryTrendItem(BaseModel):
    category: str
    count: int
    avg_score: float


class SentimentTimelineItem(BaseModel):
    date: str
    negative_signals: int
    critical_urgency: int


class TrendsAnalyticsResponse(BaseModel):
    category_distribution: List[CategoryTrendItem]
    sentiment_timeline: List[SentimentTimelineItem]
