from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class SignalBase(BaseModel):
    signal_type: str = Field(..., description="pain_point | complaint | feature_request | unmet_need | workflow_problem")
    summary: str = Field(..., max_length=500)
    raw_quote: str
    severity: int = Field(default=3, ge=1, le=5)
    sentiment_score: float = Field(default=-0.5, ge=-1.0, le=1.0)
    urgency_score: float = Field(default=0.5, ge=0.0, le=1.0)
    commercial_intent_score: float = Field(default=0.0, ge=0.0, le=1.0)
    competitor_mentioned: Optional[str] = None


class SignalCreate(SignalBase):
    document_id: str
    cluster_id: Optional[str] = None
    embedding: Optional[List[float]] = None


class SignalResponse(SignalBase):
    id: str
    document_id: str
    cluster_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    opportunity_title: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

