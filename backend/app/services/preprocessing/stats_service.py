from typing import Dict, Any, List, Optional
from collections import Counter
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.document import Document
from backend.app.models.source import Source
from backend.app.models.processed_document import ProcessedDocument
from backend.app.schemas.processed_document import DatasetStatsReport
from backend.app.services.preprocessing.validator import DocumentValidator
from backend.app.services.preprocessing.text_normalizer import TextNormalizer
from backend.app.services.preprocessing.language_filter import LanguageDetector
from backend.app.services.preprocessing.duplicate_detector import DuplicateDetector


class DatasetStatsService:
    """
    Computes comprehensive dataset health and distribution statistics.
    Supports both live database inspection and in-memory batch auditing.
    """

    @classmethod
    async def compute_db_stats(cls, db: AsyncSession) -> DatasetStatsReport:
        """Computes full dataset statistics from active database records."""
        # 1. Total Raw Documents
        total_raw = (await db.execute(select(func.count(Document.id)))).scalar() or 0

        # 2. Documents by Source
        source_stmt = (
            select(Source.code, func.count(Document.id))
            .join(Document, Document.source_id == Source.id, isouter=True)
            .group_by(Source.code)
        )
        sources_res = await db.execute(source_stmt)
        docs_by_source = {code or "unknown": count for code, count in sources_res.all()}

        # 3. Posts vs Comments
        type_stmt = (
            select(Document.document_type, func.count(Document.id))
            .group_by(Document.document_type)
        )
        types_res = await db.execute(type_stmt)
        types_map = {dtype: count for dtype, count in types_res.all()}
        posts_count = types_map.get("post", 0)
        comments_count = types_map.get("comment", 0)

        # 4. Processed Document Metrics
        proc_stmt = select(ProcessedDocument)
        proc_res = await db.execute(proc_stmt)
        processed_docs = proc_res.scalars().all()

        missing_required = 0
        empty_text = 0
        exact_dups = 0
        near_dups = 0
        eligible_count = 0
        lang_counter: Counter = Counter()
        reasons_counter: Counter = Counter()

        for p in processed_docs:
            lang_counter[p.language] += 1
            if p.is_eligible:
                eligible_count += 1
            if p.is_exact_duplicate:
                exact_dups += 1
            if p.is_near_duplicate:
                near_dups += 1
            if p.validation_status == "invalid":
                missing_required += 1
                if p.validation_reason:
                    reasons_counter[p.validation_reason] += 1
            if len(p.normalized_content.strip()) < TextNormalizer.MIN_TEXT_LENGTH:
                empty_text += 1

        # If no processed documents exist yet, analyze raw documents on-the-fly
        if not processed_docs and total_raw > 0:
            raw_docs = (await db.execute(select(Document))).scalars().all()
            return cls.compute_in_memory_stats([
                {
                    "id": d.id,
                    "source_id": d.source_id,
                    "document_type": getattr(d, "document_type", "post"),
                    "title": d.title,
                    "content": d.content,
                    "url": d.url,
                    "author": d.author,
                    "published_at": d.published_at,
                    "parent_external_id": getattr(d, "parent_external_id", None),
                    "thread_id": getattr(d, "thread_id", None),
                }
                for d in raw_docs
            ])

        return DatasetStatsReport(
            total_raw_documents=total_raw,
            documents_by_source=docs_by_source,
            posts_count=posts_count,
            comments_count=comments_count,
            missing_required_fields_count=missing_required,
            empty_or_unusable_text_count=empty_text,
            exact_duplicates_count=exact_dups,
            suspected_near_duplicates_count=near_dups,
            language_distribution=dict(lang_counter),
            documents_eligible_for_processing=eligible_count,
            validation_failure_reasons=dict(reasons_counter),
            generated_at=datetime.utcnow()
        )

    @classmethod
    def compute_in_memory_stats(cls, raw_records: List[Dict[str, Any]]) -> DatasetStatsReport:
        """Computes dataset statistics in-memory for testing, preview, or ingestion staging."""
        total_raw = len(raw_records)
        docs_by_source: Counter = Counter()
        posts_count = 0
        comments_count = 0
        missing_required = 0
        empty_text = 0
        exact_dups = 0
        near_dups = 0
        eligible_count = 0
        lang_counter: Counter = Counter()
        reasons_counter: Counter = Counter()

        seen_hashes: Dict[str, str] = {}
        processed_shingles: List[Dict[str, Any]] = []

        for record in raw_records:
            source = record.get("source_code") or record.get("source_id") or "demo"
            docs_by_source[source] += 1

            doc_type = record.get("document_type", "post")
            if doc_type == "comment":
                comments_count += 1
            else:
                posts_count += 1

            # Field validation
            val_result = DocumentValidator.validate_raw_record(record)
            if not val_result.is_valid:
                missing_required += 1
                for err in val_result.errors:
                    reasons_counter[err] += 1

            content = record.get("content") or ""
            norm_content = TextNormalizer.normalize(content)
            norm_title = TextNormalizer.normalize(record.get("title") or "")

            if len(norm_content.strip()) < TextNormalizer.MIN_TEXT_LENGTH:
                empty_text += 1

            # Language check
            lang_res = LanguageDetector.detect_language(f"{norm_title} {norm_content}")
            lang_counter[lang_res.language] += 1

            # Exact duplicate check
            chash = DuplicateDetector.compute_exact_hash(norm_title, norm_content)
            record_id = record.get("id") or record.get("external_id") or str(len(seen_hashes))
            is_exact = chash in seen_hashes
            is_near = False

            if is_exact:
                exact_dups += 1
            else:
                seen_hashes[chash] = record_id
                # Near duplicate check
                shingles = DuplicateDetector.generate_shingles(f"{norm_title} {norm_content}")
                for existing in processed_shingles:
                    sim = DuplicateDetector.calculate_jaccard_similarity(shingles, existing["shingles"])
                    if sim >= DuplicateDetector.NEAR_DUPLICATE_THRESHOLD:
                        is_near = True
                        near_dups += 1
                        break

                processed_shingles.append({"id": record_id, "shingles": shingles})

            # Check eligibility
            is_eligible = (
                val_result.is_valid and
                lang_res.language == "en" and
                not is_exact and
                not is_near and
                len(norm_content) >= TextNormalizer.MIN_TEXT_LENGTH
            )
            if is_eligible:
                eligible_count += 1

        return DatasetStatsReport(
            total_raw_documents=total_raw,
            documents_by_source=dict(docs_by_source),
            posts_count=posts_count,
            comments_count=comments_count,
            missing_required_fields_count=missing_required,
            empty_or_unusable_text_count=empty_text,
            exact_duplicates_count=exact_dups,
            suspected_near_duplicates_count=near_dups,
            language_distribution=dict(lang_counter),
            documents_eligible_for_processing=eligible_count,
            validation_failure_reasons=dict(reasons_counter),
            generated_at=datetime.utcnow()
        )

    @staticmethod
    def format_cli_report(report: DatasetStatsReport) -> str:
        """Formats the statistics report into an executive terminal summary."""
        lines = [
            "==================================================================",
            "        GREATSCOUT :: DATASET HEALTH & PREPROCESSING REPORT       ",
            "==================================================================",
            f"Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
            "",
            "1. INVENTORY TOTALS & CHANNELS",
            f"  - Total Raw Documents:              {report.total_raw_documents:>6}",
            f"  - Top-level Post Submissions:        {report.posts_count:>6}",
            f"  - Nested Discussion Comments:       {report.comments_count:>6}",
        ]
        for src, cnt in report.documents_by_source.items():
            lines.append(f"      * {src:<25} {cnt:>6}")

        lines.extend([
            "",
            "2. QUALITY & VALIDATION HEALTH",
            f"  - Missing Required Fields:          {report.missing_required_fields_count:>6}",
            f"  - Empty / Unusable Text (<20 chars):{report.empty_or_unusable_text_count:>6}",
            f"  - Exact Duplicates (SHA-256):       {report.exact_duplicates_count:>6}",
            f"  - Suspected Near-Duplicates (>=85%):{report.suspected_near_duplicates_count:>6}",
            "",
            "3. LANGUAGE CLASSIFICATION",
        ])
        for lang, cnt in report.language_distribution.items():
            lines.append(f"      * {lang:<10}                        {cnt:>6}")

        lines.extend([
            "",
            "4. DOWNSTREAM AI ELIGIBILITY",
            f"  - Documents Eligible for Processing:{report.documents_eligible_for_processing:>6} ({(report.documents_eligible_for_processing / max(1, report.total_raw_documents)) * 100:.1f}%)",
            "=================================================================="
        ])
        if report.validation_failure_reasons:
            lines.append("PRIMARY VALIDATION FAILURES:")
            for reason, cnt in report.validation_failure_reasons.items():
                lines.append(f"  - [{cnt:>2}x] {reason}")
            lines.append("==================================================================")
        return "\n".join(lines)
