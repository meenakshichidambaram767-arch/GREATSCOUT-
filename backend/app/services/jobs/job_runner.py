import asyncio
from datetime import datetime, timezone
import traceback
from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.db.session import AsyncSessionLocal
from backend.app.models.source import Source
from backend.app.models.document import Document
from backend.app.models.signal import Signal
from backend.app.models.cluster import SignalCluster
from backend.app.models.opportunity import Opportunity, OpportunityEvidence
from backend.app.models.job import IngestionJob

from backend.app.services.preprocessing.cleaner import DocumentCleaner
from backend.app.services.preprocessing.processor import DocumentProcessor
from backend.app.services.ingestion.synthetic_demo import SyntheticDemoAdapter
from backend.app.services.ingestion.product_hunt import ProductHuntAdapter
from backend.app.services.ingestion.reddit import RedditAdapter
from backend.app.services.ai.extractor import SignalExtractor
from backend.app.services.vector.embedder import VectorEmbedder
from backend.app.services.vector.clusterer import SemanticClusterer
from backend.app.services.scoring.opportunity_scorer import OpportunityScorer
from backend.app.services.ai.synthesizer import OpportunitySynthesizer


class JobRunner:
    """Orchestrates end-to-end background ingestion and opportunity synthesis jobs with idempotent execution."""

    @staticmethod
    async def ensure_sources(db: AsyncSession) -> Dict[str, Source]:
        """Ensures seed sources exist in the database."""
        sources_def = [
            {"code": "demo", "name": "Synthetic Demo Dataset", "base_url": "https://greatscout.internal", "is_active": True},
            {"code": "product_hunt", "name": "Product Hunt", "base_url": "https://www.producthunt.com", "is_active": True},
            {"code": "reddit", "name": "Reddit Communities", "base_url": "https://www.reddit.com", "is_active": True},
        ]
        result_map = {}
        for s_def in sources_def:
            res = await db.execute(select(Source).where(Source.code == s_def["code"]))
            src = res.scalar_one_or_none()
            if not src:
                src = Source(**s_def)
                db.add(src)
                await db.flush()
            result_map[src.code] = src
        await db.commit()
        return result_map

    @classmethod
    async def run_pipeline(
        cls,
        job_id: str,
        source_code: str = "demo",
        category: str = "all",
        limit: int = 50,
        run_full_pipeline: bool = True
    ):
        """Asynchronously executes the ingestion and synthesis pipeline."""
        async with AsyncSessionLocal() as db:
            # 1. Fetch Job
            res = await db.execute(select(IngestionJob).where(IngestionJob.id == job_id))
            job = res.scalar_one_or_none()
            if not job:
                return

            job.status = "running"
            job.started_at = datetime.now(timezone.utc)
            logs = [f"Job started at {job.started_at.isoformat()} for source '{source_code}'"]
            job.logs = logs
            await db.commit()

            try:
                # 2. Ensure sources exist
                source_map = await cls.ensure_sources(db)
                source = source_map.get(source_code)
                if source:
                    job.source_id = source.id

                # 3. Pick adapter
                if source_code == "product_hunt":
                    adapter = ProductHuntAdapter()
                elif source_code == "reddit":
                    adapter = RedditAdapter()
                else:
                    adapter = SyntheticDemoAdapter()

                logs.append(f"Step 1/5: Ingesting documents using {adapter.__class__.__name__} (limit={limit}, category={category})...")
                job.logs = list(logs)
                await db.commit()

                raw_docs = await adapter.fetch_documents(limit=limit, category=category)
                logs.append(f"Retrieved {len(raw_docs)} raw documents from upstream.")

                # 4. Clean, validate & deduplicate documents
                logs.append("Step 2/5: Normalizing, hashing, and validating documents...")
                saved_documents = []
                for doc_data in raw_docs:
                    title = doc_data["title"]
                    content = doc_data["content"]
                    raw_url = doc_data["url"]
                    url = DocumentCleaner.normalize_url(raw_url)

                    is_valid, reason = DocumentCleaner.validate_document(title, content, url)
                    if not is_valid:
                        continue

                    chash = DocumentCleaner.compute_content_hash(title, content)
                    # Check if document already exists
                    check_res = await db.execute(select(Document).where(Document.content_hash == chash))
                    existing = check_res.scalar_one_or_none()
                    if existing:
                        saved_documents.append(existing)
                        continue

                    doc = Document(
                        source_id=source.id if source else None,
                        external_id=doc_data.get("external_id"),
                        document_type=doc_data.get("document_type", "post"),
                        parent_external_id=doc_data.get("parent_external_id"),
                        thread_id=doc_data.get("thread_id"),
                        title=title,
                        content=content,  # Preserve untouched original raw text
                        author=doc_data.get("author"),
                        url=url,
                        upvotes=doc_data.get("upvotes", 0),
                        comment_count=doc_data.get("comment_count", 0),
                        is_synthetic=doc_data.get("is_synthetic", False),
                        content_hash=chash,
                        validation_status="valid",
                        published_at=datetime.fromisoformat(doc_data["published_at"]) if doc_data.get("published_at") else None,
                    )
                    db.add(doc)
                    await db.flush()
                    await DocumentProcessor.process_document(doc=doc, db=db, allowed_languages=["en"])
                    saved_documents.append(doc)

                job.documents_processed = len(saved_documents)
                logs.append(f"Validated, normalized, and stored {len(saved_documents)} unique documents.")
                job.logs = list(logs)
                await db.commit()

                if not run_full_pipeline:
                    job.status = "completed"
                    job.completed_at = datetime.now(timezone.utc)
                    await db.commit()
                    return

                # 5. Extract structured signals
                logs.append("Step 3/5: Extracting structured friction signals (pain points, complaints, needs)...")
                new_signals_count = 0
                for doc in saved_documents:
                    # Idempotency check: Skip signal extraction if doc already has signals
                    existing_signals = await db.execute(select(Signal).where(Signal.document_id == doc.id))
                    if existing_signals.scalars().all():
                        continue

                    raw_signals = await SignalExtractor.extract_signals(doc.title, doc.content)
                    for rs in raw_signals:
                        emb = VectorEmbedder.embed_text(f"{rs['summary']} {rs['raw_quote']}")
                        sig = Signal(
                            document_id=doc.id,
                            signal_type=rs["signal_type"],
                            summary=rs["summary"],
                            raw_quote=rs["raw_quote"],
                            severity=rs["severity"],
                            sentiment_score=rs["sentiment_score"],
                            urgency_score=rs["urgency_score"],
                            commercial_intent_score=rs["commercial_intent_score"],
                            competitor_mentioned=rs.get("competitor_mentioned"),
                            embedding=emb
                        )
                        db.add(sig)
                        await db.flush()
                        new_signals_count += 1

                all_signals_res = await db.execute(select(Signal))
                all_db_signals = all_signals_res.scalars().all()
                job.signals_extracted = len(all_db_signals)
                logs.append(f"Total signal inventory: {len(all_db_signals)} signals (+{new_signals_count} newly extracted).")
                job.logs = list(logs)
                await db.commit()

                # 6. Cluster signals
                logs.append("Step 4/5: Clustering signals into cohesive semantic problem themes...")
                cluster_input = []
                for s in all_db_signals:
                    cluster_input.append({
                        "id": s.id,
                        "summary": s.summary,
                        "raw_quote": s.raw_quote,
                        "severity": s.severity,
                        "sentiment_score": s.sentiment_score,
                        "urgency_score": s.urgency_score,
                        "commercial_intent_score": s.commercial_intent_score,
                        "competitor_mentioned": s.competitor_mentioned,
                        "embedding": s.embedding,
                        "category": category if category != "all" else "General SaaS",
                        "instance": s
                    })

                clusters = SemanticClusterer.cluster_signals(cluster_input, similarity_threshold=0.60)
                logs.append(f"Identified {len(clusters)} distinct problem clusters.")

                # 7. Synthesize Opportunities & Score
                logs.append("Step 5/5: Synthesizing evidence-backed opportunity reports & multi-dimensional scoring...")
                opportunities_synced = 0
                for c in clusters:
                    # Check if cluster already exists by label
                    existing_cluster_res = await db.execute(
                        select(SignalCluster).where(SignalCluster.label == c["label"]).order_by(SignalCluster.created_at.asc())
                    )
                    db_cluster = existing_cluster_res.scalars().first()

                    if not db_cluster:
                        db_cluster = SignalCluster(
                            category=c["category"],
                            label=c["label"],
                            description=c["description"],
                            signal_count=c["signal_count"],
                            coherence_score=c["coherence_score"],
                            centroid_embedding=c["centroid_embedding"],
                        )
                        db.add(db_cluster)
                        await db.flush()
                    else:
                        db_cluster.signal_count = c["signal_count"]
                        db_cluster.coherence_score = c["coherence_score"]
                        db_cluster.centroid_embedding = c["centroid_embedding"]
                        db.add(db_cluster)
                        await db.flush()

                    # Assign cluster_id to constituent signals
                    for member in c["signals"]:
                        sig_obj = member.get("instance")
                        if sig_obj:
                            sig_obj.cluster_id = db_cluster.id
                            db.add(sig_obj)

                    # Compute multi-dimensional scores
                    scores = OpportunityScorer.calculate_scores(c["signals"], category=c["category"])

                    # Synthesize or Update Opportunity
                    opp_data = OpportunitySynthesizer.synthesize_opportunity(c, scores)

                    existing_opp_res = await db.execute(
                        select(Opportunity).where(Opportunity.cluster_id == db_cluster.id).order_by(Opportunity.created_at.asc())
                    )
                    opportunity = existing_opp_res.scalars().first()

                    if not opportunity:
                        opportunity = Opportunity(
                            cluster_id=db_cluster.id,
                            title=opp_data["title"],
                            target_audience=opp_data["target_audience"],
                            category=c["category"],
                            problem_thesis=opp_data["problem_thesis"],
                            why_current_solutions_fail=opp_data["why_current_solutions_fail"],
                            suggested_solution=opp_data["suggested_solution"],
                            demand_score=scores["demand_score"],
                            pain_intensity_score=scores["pain_intensity_score"],
                            willingness_to_pay_score=scores["willingness_to_pay_score"],
                            competitive_vacuum_score=scores["competitive_vacuum_score"],
                            overall_score=scores["overall_score"],
                            confidence_level=opp_data["confidence_level"],
                            status="active"
                        )
                        db.add(opportunity)
                        await db.flush()
                    else:
                        opportunity.demand_score = scores["demand_score"]
                        opportunity.pain_intensity_score = scores["pain_intensity_score"]
                        opportunity.willingness_to_pay_score = scores["willingness_to_pay_score"]
                        opportunity.competitive_vacuum_score = scores["competitive_vacuum_score"]
                        opportunity.overall_score = scores["overall_score"]
                        opportunity.confidence_level = opp_data["confidence_level"]
                        opportunity.problem_thesis = opp_data["problem_thesis"]
                        db.add(opportunity)
                        await db.flush()

                    # Create Opportunity Evidence entries linking back to signals (prevent duplicate quotes)
                    existing_evidence_res = await db.execute(
                        select(OpportunityEvidence.signal_id).where(OpportunityEvidence.opportunity_id == opportunity.id)
                    )
                    linked_signals = set(existing_evidence_res.scalars().all())

                    for member in c["signals"]:
                        if member["id"] not in linked_signals:
                            evidence = OpportunityEvidence(
                                opportunity_id=opportunity.id,
                                signal_id=member["id"],
                                highlight_quote=member["raw_quote"],
                                relevance_score=0.95
                            )
                            db.add(evidence)
                            linked_signals.add(member["id"])

                    opportunities_synced += 1

                job.opportunities_generated = opportunities_synced
                job.status = "completed"
                job.completed_at = datetime.now(timezone.utc)
                logs.append(f"Pipeline successfully completed! Synchronized {opportunities_synced} actionable opportunities.")
                job.logs = list(logs)
                await db.commit()

            except Exception as e:
                stack = traceback.format_exc()
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.now(timezone.utc)
                logs.append(f"ERROR: {str(e)}\n{stack}")
                job.logs = list(logs)
                await db.commit()
