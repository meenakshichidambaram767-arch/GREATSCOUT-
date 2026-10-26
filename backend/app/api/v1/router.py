from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    health,
    dashboard,
    opportunities,
    jobs,
    signals,
    ai_copilot
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router, tags=["Dashboard & Analytics"])
api_router.include_router(opportunities.router, tags=["Opportunities"])
api_router.include_router(jobs.router, tags=["Ingestion & Jobs"])
api_router.include_router(signals.router, tags=["Signals & Documents"])
api_router.include_router(ai_copilot.router, tags=["AI Copilot & Intelligence"])

