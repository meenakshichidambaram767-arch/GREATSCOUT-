import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin, utc_now

if TYPE_CHECKING:
    from backend.app.models.source import Source
    from backend.app.models.signal import Signal


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    source_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sources.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    external_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    validation_status: Mapped[str] = mapped_column(String(20), default="valid", nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False
    )

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="documents")
    signals: Mapped[List["Signal"]] = relationship(
        "Signal",
        back_populates="document",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_doc_source_published", "source_id", "published_at"),
    )

    def __repr__(self) -> str:
        return f"<Document {self.id}: {self.title[:40]}>"
