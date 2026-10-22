import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin, utc_now

if TYPE_CHECKING:
    from backend.app.models.document import Document


class ProcessedDocument(Base, TimestampMixin):
    """
    Normalized, validated, and deduplicated document record.
    Maintains strict 1-to-1 traceability back to the original raw Document record.
    Preserves original text snapshot alongside normalized content without modifying raw source data.
    """
    __tablename__ = "processed_documents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    raw_document_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("documents.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    document_type: Mapped[str] = mapped_column(
        String(20),
        default="post",
        index=True,
        nullable=False
    )  # "post" | "comment"
    parent_external_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    thread_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )

    # Normalized text content
    normalized_title: Mapped[str] = mapped_column(String(500), nullable=False)
    normalized_content: Mapped[str] = mapped_column(Text, nullable=False)
    original_content_snapshot: Mapped[str] = mapped_column(Text, nullable=False)

    # Language classification & processing eligibility
    language: Mapped[str] = mapped_column(String(20), default="en", index=True, nullable=False)
    language_confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    is_eligible: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    # Validation state & diagnostics
    validation_status: Mapped[str] = mapped_column(
        String(30),
        default="valid",
        index=True,
        nullable=False
    )  # "valid" | "invalid" | "duplicate" | "filtered_language"
    validation_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    validation_errors: Mapped[Optional[list]] = mapped_column(JSON, default=list, nullable=True)

    # Duplicate detection & canonical grouping
    content_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    is_exact_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_near_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    canonical_document_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("processed_documents.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    similarity_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Text metrics & metadata
    word_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    char_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    source_metadata: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    # Relationships
    raw_document: Mapped["Document"] = relationship("Document", back_populates="processed_document")
    canonical_document: Mapped[Optional["ProcessedDocument"]] = relationship(
        "ProcessedDocument",
        remote_side=[id],
        backref="duplicates"
    )

    __table_args__ = (
        Index("idx_proc_doc_type_status", "document_type", "validation_status"),
        Index("idx_proc_lang_eligible", "language", "is_eligible"),
    )

    def __repr__(self) -> str:
        return f"<ProcessedDocument {self.id} (raw={self.raw_document_id}): {self.normalized_title[:30]}>"
