from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.db.session import get_db

router = APIRouter()


@router.get("/health", summary="System Health & Diagnostic Check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Returns system status, active database dialect, vector readiness, and version info.
    """
    db_status = "connected"
    vector_support = False
    try:
        # Check DB connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        # Check if running postgresql and pgvector is enabled
        if "postgresql" in settings.DATABASE_URL:
            vec_check = await db.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'"))
            if vec_check.scalar():
                vector_support = True
        else:
            # SQLite fallback mode has built-in JSON vector support
            vector_support = True
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "app_name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "vector_support": vector_support,
        "ai_provider": settings.AI_PROVIDER,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
