from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.app.core.config import settings

# Determine dialect connect arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and settings.ENVIRONMENT == "development",
    connect_args=connect_args,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for injecting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create tables if they do not exist (useful for testing and initial SQLite bootstrap)."""
    from backend.app.db.base import Base
    # Import all models to ensure they are registered with Base.metadata
    from backend.app.models.source import Source
    from backend.app.models.document import Document
    from backend.app.models.processed_document import ProcessedDocument
    from backend.app.models.signal import Signal
    from backend.app.models.cluster import SignalCluster
    from backend.app.models.opportunity import Opportunity, OpportunityEvidence
    from backend.app.models.job import IngestionJob

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
