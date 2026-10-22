import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.models.source import Source
from backend.app.models.document import Document
from backend.app.models.signal import Signal
from backend.app.models.cluster import SignalCluster
from backend.app.models.opportunity import Opportunity, OpportunityEvidence
from backend.app.models.job import IngestionJob


@pytest.mark.asyncio
async def test_create_and_query_source(db_session):
    source = Source(
        code="product_hunt",
        name="Product Hunt",
        base_url="https://www.producthunt.com",
        is_active=True
    )
    db_session.add(source)
    await db_session.commit()

    result = await db_session.execute(select(Source).where(Source.code == "product_hunt"))
    saved_source = result.scalar_one_or_none()

    assert saved_source is not None
    assert saved_source.name == "Product Hunt"
    assert saved_source.id is not None
    assert saved_source.is_active is True


@pytest.mark.asyncio
async def test_full_traceability_graph(db_session):
    """
    Verifies full traceability:
    Source -> Document -> Signal -> Cluster -> Opportunity -> OpportunityEvidence
    """
    # 1. Source
    source = Source(
        code="reddit",
        name="Reddit",
        base_url="https://www.reddit.com",
        is_active=True
    )
    db_session.add(source)
    await db_session.flush()

    # 2. Document
    document = Document(
        source_id=source.id,
        external_id="post_12345",
        title="Why is Stripe billing reconciliation so tedious?",
        content="I spend 5 hours every month manually comparing invoices with bank transfers. It's frustrating.",
        author="saas_builder_99",
        url="https://reddit.com/r/SaaS/comments/post_12345",
        upvotes=42,
        comment_count=18,
        is_synthetic=True,
        content_hash="mock_sha256_hash_12345",
        validation_status="valid"
    )
    db_session.add(document)
    await db_session.flush()

    # 3. Cluster
    cluster = SignalCluster(
        category="SaaS Operations",
        label="Automated Stripe Revenue & Invoice Reconciliation",
        description="Founders struggling with manual bank transfer vs invoice reconciliation.",
        signal_count=1,
        coherence_score=0.92,
        centroid_embedding=[0.1, 0.2, 0.3]
    )
    db_session.add(cluster)
    await db_session.flush()

    # 4. Signal
    signal = Signal(
        document_id=document.id,
        cluster_id=cluster.id,
        signal_type="pain_point",
        summary="Manual Stripe invoice reconciliation consumes 5 hours monthly",
        raw_quote="I spend 5 hours every month manually comparing invoices with bank transfers.",
        severity=4,
        sentiment_score=-0.75,
        urgency_score=0.8,
        commercial_intent_score=0.6,
        competitor_mentioned="Stripe",
        embedding=[0.1, 0.2, 0.35]
    )
    db_session.add(signal)
    await db_session.flush()

    # 5. Opportunity
    opportunity = Opportunity(
        cluster_id=cluster.id,
        title="Zero-Touch Stripe & Bank Transfer Reconciliation Tool",
        target_audience="Early-stage B2B SaaS founders & accountants",
        category="SaaS Operations",
        problem_thesis="Founders waste hours manually matching manual wire payments with Stripe subscriptions.",
        why_current_solutions_fail="QuickBooks and Xero don't sync Stripe metadata cleanly without complex setup.",
        suggested_solution="AI-powered reconciliation matching webhook events with bank feeds in seconds.",
        demand_score=85.0,
        pain_intensity_score=80.0,
        willingness_to_pay_score=75.0,
        competitive_vacuum_score=82.0,
        overall_score=81.0,
        confidence_level="high",
        status="active"
    )
    db_session.add(opportunity)
    await db_session.flush()

    # 6. Opportunity Evidence
    evidence = OpportunityEvidence(
        opportunity_id=opportunity.id,
        signal_id=signal.id,
        highlight_quote="I spend 5 hours every month manually comparing invoices with bank transfers.",
        relevance_score=0.95
    )
    db_session.add(evidence)
    await db_session.commit()

    # Trace back from Opportunity to Cluster, Signal, Document, and Source
    stmt = (
        select(Opportunity)
        .where(Opportunity.id == opportunity.id)
        .options(
            selectinload(Opportunity.cluster),
            selectinload(Opportunity.evidence)
            .selectinload(OpportunityEvidence.signal)
            .selectinload(Signal.document)
            .selectinload(Document.source)
        )
    )
    result = await db_session.execute(stmt)
    loaded_opp = result.scalar_one()

    assert loaded_opp.title == "Zero-Touch Stripe & Bank Transfer Reconciliation Tool"
    assert loaded_opp.cluster.label == "Automated Stripe Revenue & Invoice Reconciliation"
    assert len(loaded_opp.evidence) == 1

    cited_evidence = loaded_opp.evidence[0]
    assert cited_evidence.signal.signal_type == "pain_point"
    assert cited_evidence.signal.document.author == "saas_builder_99"
    assert cited_evidence.signal.document.source.code == "reddit"
    assert cited_evidence.signal.embedding == [0.1, 0.2, 0.35]


@pytest.mark.asyncio
async def test_create_ingestion_job(db_session):
    job = IngestionJob(
        job_type="full_pipeline",
        status="pending",
        documents_processed=0,
        signals_extracted=0,
        opportunities_generated=0,
        logs=["Job initialized"]
    )
    db_session.add(job)
    await db_session.commit()

    result = await db_session.execute(select(IngestionJob).where(IngestionJob.id == job.id))
    saved_job = result.scalar_one()

    assert saved_job.status == "pending"
    assert saved_job.job_type == "full_pipeline"
    assert saved_job.logs == ["Job initialized"]
