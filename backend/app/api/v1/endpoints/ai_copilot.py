from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.schemas.copilot import (
    CopilotAskRequest,
    CopilotAskResponse,
    OpportunitySynthesizeResponse
)
from backend.app.services.ai.copilot import EvidenceCopilotService

router = APIRouter(prefix="/ai", tags=["AI Copilot & Intelligence"])


@router.post("/ask", response_model=CopilotAskResponse)
async def ask_evidence_copilot(
    payload: CopilotAskRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    RAG evidence copilot: interrogates real customer signals, verbatim quotes,
    and competitor data to answer product discovery and validation questions.
    """
    try:
        response = await EvidenceCopilotService.answer_query(
            db=db,
            query=payload.query,
            opportunity_id=payload.opportunity_id,
            custom_api_key=payload.api_key,
            provider=payload.provider or "gemini"
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot inference error: {str(e)}")


@router.get("/suggested-prompts", response_model=List[str])
async def get_suggested_prompts():
    """Returns dynamic starter questions for the Copilot."""
    return [
        "Which opportunities show the highest commercial willingness to pay?",
        "What are the most severe complaints about Shopify and Jira?",
        "What evidence exists for debugging serverless webhooks?",
        "Compare the top 3 SaaS opportunities by customer demand",
        "How can a new entrant unbundle incumbent project management tools?"
    ]


@router.post("/synthesize-opportunity/{id}", response_model=OpportunitySynthesizeResponse)
async def synthesize_opportunity(
    id: str = Path(..., description="Opportunity ID"),
    db: AsyncSession = Depends(get_db)
):
    """Generates an executive validation brief and actionable experiments for an opportunity."""
    try:
        return await EvidenceCopilotService.synthesize_opportunity_deepdive(db=db, opportunity_id=id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
