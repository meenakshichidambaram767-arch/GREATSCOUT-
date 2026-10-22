import sys
from pathlib import Path

# Ensure workspace root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import asyncio
from backend.app.db.session import init_db, AsyncSessionLocal
from backend.app.models.job import IngestionJob
from backend.app.services.jobs.job_runner import JobRunner


async def main():
    print("Initializing GreatScout database schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        print("Ensuring baseline sources exist...")
        await JobRunner.ensure_sources(db)

        # Create demo job
        job = IngestionJob(
            job_type="full_pipeline",
            status="pending",
            documents_processed=0,
            signals_extracted=0,
            opportunities_generated=0,
            logs=["CLI Seed initiated"]
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)

        print(f"Executing initial demo pipeline seed (Job ID: {job.id})...")
        await JobRunner.run_pipeline(
            job_id=job.id,
            source_code="demo",
            category="all",
            limit=50,
            run_full_pipeline=True
        )

        await db.refresh(job)
        print(f"Seed complete! Status: {job.status}")
        print(f"  - Documents: {job.documents_processed}")
        print(f"  - Signals: {job.signals_extracted}")
        print(f"  - Opportunities: {job.opportunities_generated}")


if __name__ == "__main__":
    asyncio.run(main())
