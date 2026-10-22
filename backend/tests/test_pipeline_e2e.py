import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.models.job import IngestionJob
from backend.app.models.opportunity import Opportunity, OpportunityEvidence
from backend.app.models.signal import Signal
from backend.app.models.cluster import SignalCluster
from backend.app.models.document import Document
from backend.app.services.jobs.job_runner import JobRunner


@pytest.mark.asyncio
async def test_full_pipeline_execution(db_session, monkeypatch):
    """
    Tests end-to-end ingestion and synthesis:
    SyntheticDemoAdapter -> Cleaner -> Extractor -> Embedder -> Clusterer -> Scorer -> Synthesizer -> DB
    """
    # Create an IngestionJob
    job = IngestionJob(
        job_type="full_pipeline",
        status="pending",
        documents_processed=0,
        signals_extracted=0,
        opportunities_generated=0,
        logs=["Queued"]
    )
    db_session.add(job)
    await db_session.commit()
    await db_session.refresh(job)

    # Patch AsyncSessionLocal inside JobRunner so it uses the test DB session
    class MockSessionContext:
        async def __aenter__(self):
            return db_session
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    monkeypatch.setattr(
        "backend.app.services.jobs.job_runner.AsyncSessionLocal",
        lambda: MockSessionContext()
    )

    # Run the pipeline synchronously for testing
    await JobRunner.run_pipeline(
        job_id=job.id,
        source_code="demo",
        category="all",
        limit=10,
        run_full_pipeline=True
    )

    # Check job status
    res = await db_session.execute(select(IngestionJob).where(IngestionJob.id == job.id))
    completed_job = res.scalar_one()

    assert completed_job.status == "completed"
    assert completed_job.documents_processed > 0
    assert completed_job.signals_extracted > 0
    assert completed_job.opportunities_generated > 0

    # Verify opportunities exist and have complete evidence links
    opp_res = await db_session.execute(
        select(Opportunity).options(
            selectinload(Opportunity.cluster),
            selectinload(Opportunity.evidence).selectinload(OpportunityEvidence.signal)
        )
    )
    opportunities = opp_res.scalars().all()
    assert len(opportunities) > 0

    for opp in opportunities:
        assert opp.title
        assert opp.target_audience
        assert opp.problem_thesis
        assert opp.why_current_solutions_fail
        assert opp.suggested_solution
        assert opp.overall_score > 0
        assert opp.cluster is not None
        assert len(opp.evidence) > 0
        for ev in opp.evidence:
            assert ev.signal is not None
            assert ev.highlight_quote
