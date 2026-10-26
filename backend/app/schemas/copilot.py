from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CopilotCitedQuote(BaseModel):
    id: Optional[str] = None
    author: Optional[str] = None
    source: str
    quote: str
    sentiment: Optional[float] = None
    opportunity_id: Optional[str] = None
    opportunity_title: Optional[str] = None


class CopilotRelevantOpportunity(BaseModel):
    id: str
    title: str
    category: str
    overall_score: float
    status: str


class CopilotAskRequest(BaseModel):
    query: str = Field(..., description="User prompt or question to the copilot")
    opportunity_id: Optional[str] = Field(None, description="Optional opportunity context ID")
    api_key: Optional[str] = Field(None, description="Optional custom Gemini or OpenAI API key")
    provider: Optional[str] = Field(default="gemini", description="gemini | openai | local")


class CopilotAskResponse(BaseModel):
    answer: str
    cited_quotes: List[CopilotCitedQuote] = []
    relevant_opportunities: List[CopilotRelevantOpportunity] = []
    suggested_followups: List[str] = []
    provider_used: str = "local"


class OpportunitySynthesizeResponse(BaseModel):
    opportunity_id: str
    executive_summary: str
    strategic_angles: List[str]
    target_icp: str
    pricing_strategy: str
    validation_experiments: List[str]
