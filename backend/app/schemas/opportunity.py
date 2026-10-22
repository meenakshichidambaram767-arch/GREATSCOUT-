from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class OpportunityScoreBreakdown(BaseModel):
    overall_score: float
    demand_score: float
    pain_intensity_score: float
    willingness_to_pay_score: float
    competitive_vacuum_score: float
    evidence_strength_score: float = 75.0
    feasibility_score: float = 85.0
    recency_score: float = 85.0
    metadata: Optional[Dict[str, Any]] = None


class OpportunityBase(BaseModel):
    title: str = Field(..., max_length=255)
    target_audience: str = Field(..., max_length=255)
    category: str = Field(default="General SaaS", max_length=100)
    problem_thesis: str
    why_current_solutions_fail: str
    suggested_solution: str
    confidence_level: str = "medium"
    status: str = "active"


class OpportunityResponse(OpportunityBase):
    id: str
    cluster_id: str
    scores: OpportunityScoreBreakdown
    signal_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceSourceInfo(BaseModel):
    platform: str
    title: str
    url: str
    author: Optional[str] = None
    is_synthetic: bool = False
    published_at: Optional[datetime] = None


class OpportunityEvidenceItem(BaseModel):
    signal_id: str
    signal_type: str
    severity: int
    sentiment_score: float
    urgency_score: float
    highlight_quote: str
    relevance_score: float
    source: EvidenceSourceInfo


class OpportunityClusterInfo(BaseModel):
    id: str
    label: str
    category: str
    coherence_score: float
    signal_count: int


class OpportunityDetailResponse(OpportunityResponse):
    cluster: Optional[OpportunityClusterInfo] = None
    evidence: List[OpportunityEvidenceItem] = []


class OpportunityListResponse(BaseModel):
    items: List[OpportunityResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
