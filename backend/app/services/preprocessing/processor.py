import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.document import Document
from backend.app.models.processed_document import ProcessedDocument
from backend.app.services.preprocessing.text_normalizer import TextNormalizer
from backend.app.services.preprocessing.language_filter import LanguageDetector
from backend.app.services.preprocessing.duplicate_detector import DuplicateDetector, DuplicateMatch
from backend.app.services.preprocessing.validator import DocumentValidator, ValidationResult

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """
    Core orchestrator for Phase 3 Data Validation and Preprocessing.
    Transforms raw Document records into validated, normalized ProcessedDocument records.
    
    GUARANTEES:
    - Traceability: 1-to-1 linkage from ProcessedDocument.raw_document_id to Document.id.
    - Preserves Untouched Original Text: Document.content is never modified;
      ProcessedDocument.original_content_snapshot stores the exact raw text.
    - Idempotency: Repeated processing updates the existing ProcessedDocument record
      instead of creating duplicate entries.
    - Duplicate Preservation: Independent evidence from duplicate reports is kept intact
      with canonical cross-referencing and similarity metrics.
    """

    @classmethod
    async def process_document(
        cls,
        doc: Document,
        db: AsyncSession,
        existing_cache: Optional[List[Dict[str, Any]]] = None,
        allowed_languages: Optional[List[str]] = None
    ) -> ProcessedDocument:
        """
        Processes a single raw Document and persists a ProcessedDocument record.
        """
        # 1. Field validation
        doc_dict = {
            "source_id": doc.source_id,
            "document_type": getattr(doc, "document_type", "post"),
            "title": doc.title,
            "content": doc.content,
            "url": doc.url,
            "author": doc.author,
            "published_at": doc.published_at,
            "parent_external_id": getattr(doc, "parent_external_id", None),
            "thread_id": getattr(doc, "thread_id", None),
        }
        val_result: ValidationResult = DocumentValidator.validate_raw_record(doc_dict)

        # 2. Text Normalization (preserves technical terms, punctuation, negations)
        normalized_title = TextNormalizer.normalize(doc.title)
        normalized_content = TextNormalizer.normalize(doc.content)

        # For comments without explicit titles, derive descriptive title from content
        if not normalized_title and getattr(doc, "document_type", "post") == "comment":
            normalized_title = f"Comment: {normalized_content[:60]}..." if normalized_content else "Comment"

        # 3. Language Detection & Filtering
        lang_res = LanguageDetector.detect_language(f"{normalized_title}. {normalized_content}")
        is_lang_eligible, lang_ineligible_reason = LanguageDetector.check_eligibility(
            lang_res,
            allowed_languages=allowed_languages
        )

        # 4. Compute stable content hash of normalized text
        content_hash = DuplicateDetector.compute_exact_hash(normalized_title, normalized_content)

        # 5. Duplicate Detection against existing processed documents
        if existing_cache is None:
            # Query existing processed records from database
            stmt = select(
                ProcessedDocument.id,
                ProcessedDocument.content_hash,
                ProcessedDocument.normalized_title,
                ProcessedDocument.normalized_content
            ).where(ProcessedDocument.raw_document_id != doc.id)
            res = await db.execute(stmt)
            existing_cache = [
                {
                    "id": row.id,
                    "content_hash": row.content_hash,
                    "normalized_title": row.normalized_title,
                    "normalized_content": row.normalized_content
                }
                for row in res.all()
            ]

        dup_match: DuplicateMatch = DuplicateDetector.check_duplicate(
            current_id=doc.id,
            normalized_title=normalized_title,
            normalized_content=normalized_content,
            existing_items=existing_cache
        )

        # 6. Determine final validation status and processing eligibility
        validation_status = "valid"
        validation_reason = None
        validation_errors = list(val_result.errors)

        if not val_result.is_valid:
            validation_status = "invalid"
            validation_reason = val_result.primary_reason
        elif not is_lang_eligible:
            validation_status = "filtered_language"
            validation_reason = lang_ineligible_reason
            validation_errors.append(lang_ineligible_reason)
        elif dup_match.is_duplicate:
            validation_status = "duplicate"
            validation_reason = f"Identified as {dup_match.duplicate_type} duplicate (similarity: {dup_match.similarity_score:.2f}) of canonical {dup_match.canonical_id}"
            validation_errors.append(validation_reason)

        is_eligible = (
            val_result.is_valid and
            is_lang_eligible and
            not dup_match.is_duplicate and
            len(normalized_content) >= TextNormalizer.MIN_TEXT_LENGTH
        )

        word_count = len(normalized_content.split()) if normalized_content else 0
        char_count = len(normalized_content) if normalized_content else 0

        source_meta = {
            "external_id": doc.external_id,
            "author": doc.author,
            "url": doc.url,
            "upvotes": doc.upvotes,
            "comment_count": doc.comment_count,
            "published_at": doc.published_at.isoformat() if doc.published_at else None,
            "detection_method": lang_res.method,
            "is_synthetic": doc.is_synthetic,
        }

        # 7. Idempotent Persistence: Check if ProcessedDocument already exists for this raw doc
        stmt_check = select(ProcessedDocument).where(ProcessedDocument.raw_document_id == doc.id)
        existing_proc = (await db.execute(stmt_check)).scalar_one_or_none()

        if existing_proc:
            # Update in-place
            existing_proc.document_type = getattr(doc, "document_type", "post")
            existing_proc.parent_external_id = getattr(doc, "parent_external_id", None)
            existing_proc.thread_id = getattr(doc, "thread_id", None)
            existing_proc.normalized_title = normalized_title
            existing_proc.normalized_content = normalized_content
            existing_proc.original_content_snapshot = doc.content
            existing_proc.language = lang_res.language
            existing_proc.language_confidence = lang_res.confidence
            existing_proc.is_eligible = is_eligible
            existing_proc.validation_status = validation_status
            existing_proc.validation_reason = validation_reason
            existing_proc.validation_errors = validation_errors
            existing_proc.content_hash = content_hash
            existing_proc.is_exact_duplicate = (dup_match.duplicate_type == "exact")
            existing_proc.is_near_duplicate = (dup_match.duplicate_type == "near")
            existing_proc.canonical_document_id = dup_match.canonical_id
            existing_proc.similarity_score = dup_match.similarity_score
            existing_proc.word_count = word_count
            existing_proc.char_count = char_count
            existing_proc.source_metadata = source_meta
            existing_proc.processed_at = datetime.now(timezone.utc)
            existing_proc.is_synthetic = doc.is_synthetic
            proc_record = existing_proc
        else:
            # Create new record
            proc_record = ProcessedDocument(
                raw_document_id=doc.id,
                document_type=getattr(doc, "document_type", "post"),
                parent_external_id=getattr(doc, "parent_external_id", None),
                thread_id=getattr(doc, "thread_id", None),
                normalized_title=normalized_title,
                normalized_content=normalized_content,
                original_content_snapshot=doc.content,
                language=lang_res.language,
                language_confidence=lang_res.confidence,
                is_eligible=is_eligible,
                validation_status=validation_status,
                validation_reason=validation_reason,
                validation_errors=validation_errors,
                content_hash=content_hash,
                is_exact_duplicate=(dup_match.duplicate_type == "exact"),
                is_near_duplicate=(dup_match.duplicate_type == "near"),
                canonical_document_id=dup_match.canonical_id,
                similarity_score=dup_match.similarity_score,
                word_count=word_count,
                char_count=char_count,
                source_metadata=source_meta,
                processed_at=datetime.now(timezone.utc),
                is_synthetic=doc.is_synthetic
            )
            db.add(proc_record)

        await db.flush()

        # Update cache for near-duplicate checks on subsequent documents in the batch
        existing_cache.append({
            "id": proc_record.id,
            "content_hash": content_hash,
            "normalized_title": normalized_title,
            "normalized_content": normalized_content
        })

        return proc_record

    @classmethod
    async def process_all_documents(
        cls,
        db: AsyncSession,
        source_id: Optional[str] = None,
        limit: Optional[int] = None,
        allowed_languages: Optional[List[str]] = None
    ) -> List[ProcessedDocument]:
        """
        Batch-processes all raw Document records matching filter criteria.
        """
        stmt = select(Document).order_by(Document.ingested_at.asc())
        if source_id:
            stmt = stmt.where(Document.source_id == source_id)
        if limit:
            stmt = stmt.limit(limit)

        raw_docs = (await db.execute(stmt)).scalars().all()
        processed_list = []
        cache: List[Dict[str, Any]] = []

        for doc in raw_docs:
            proc = await cls.process_document(
                doc=doc,
                db=db,
                existing_cache=cache,
                allowed_languages=allowed_languages
            )
            processed_list.append(proc)

        await db.commit()
        return processed_list
