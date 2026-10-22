import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import get_db
from backend.app.models.job import IngestionJob
from backend.app.models.source import Source
from backend.app.schemas.job import IngestionJobCreate, IngestionJobResponse
from backend.app.services.jobs.job_runner import JobRunner

router = APIRouter()


@router.get("/sources", response_model=List[dict])
async def list_sources(db: AsyncSession = Depends(get_db)):
    """List configured sources (demo, product_hunt, reddit)."""
    # Ensure baseline sources exist
    await JobRunner.ensure_sources(db)
    result = await db.execute(select(Source).order_by(Source.name))
    sources = result.scalars().all()
    return [s.to_dict() for s in sources]


@router.post("/jobs/ingest", status_code=status.HTTP_202_ACCEPTED)
async def trigger_ingestion_job(
    payload: IngestionJobCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger a bounded background data ingestion and opportunity discovery job.
    Runs asynchronously and logs progress.
    """
    # Create IngestionJob record
    job = IngestionJob(
        job_type="full_pipeline" if payload.run_pipeline else "ingest_only",
        status="pending",
        documents_processed=0,
        signals_extracted=0,
        opportunities_generated=0,
        logs=[f"Job queued for source: {payload.source_code}"]
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Launch background async task
    asyncio.create_task(
        JobRunner.run_pipeline(
            job_id=job.id,
            source_code=payload.source_code,
            category=payload.category or "all",
            limit=payload.limit,
            run_full_pipeline=payload.run_pipeline
        )
    )

    return {
        "job_id": job.id,
        "status": "pending",
        "message": f"Pipeline queued for source '{payload.source_code}' (limit={payload.limit})."
    }


@router.get("/jobs", response_model=List[IngestionJobResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    """List recent ingestion and AI analysis jobs."""
    result = await db.execute(select(IngestionJob).order_by(IngestionJob.created_at.desc()).limit(30))
    jobs = result.scalars().all()
    return jobs


@router.get("/jobs/{id}", response_model=IngestionJobResponse)
async def get_job(
    id: str = Path(...),
    db: AsyncSession = Depends(get_db)
):
    """Get status and logs for a specific ingestion job."""
    result = await db.execute(select(IngestionJob).where(IngestionJob.id == id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
