from backend.app.schemas.document import DocumentBase, DocumentCreate, DocumentResponse
from backend.app.schemas.signal import SignalBase, SignalCreate, SignalResponse
from backend.app.schemas.opportunity import (
    OpportunityBase,
    OpportunityResponse,
    OpportunityDetailResponse,
    OpportunityListResponse,
    OpportunityScoreBreakdown,
    OpportunityEvidenceItem
)
from backend.app.schemas.job import IngestionJobCreate, IngestionJobResponse
from backend.app.schemas.dashboard import (
    DashboardStatsResponse,
    TrendsAnalyticsResponse,
    SourceBreakdownItem,
    SignalTypeBreakdownItem
)

__all__ = [
    "DocumentBase",
    "DocumentCreate",
    "DocumentResponse",
    "SignalBase",
    "SignalCreate",
    "SignalResponse",
    "OpportunityBase",
    "OpportunityResponse",
    "OpportunityDetailResponse",
    "OpportunityListResponse",
    "OpportunityScoreBreakdown",
    "OpportunityEvidenceItem",
    "IngestionJobCreate",
    "IngestionJobResponse",
    "DashboardStatsResponse",
    "TrendsAnalyticsResponse",
    "SourceBreakdownItem",
    "SignalTypeBreakdownItem",
]
