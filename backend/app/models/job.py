import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.source import Source


class IngestionJob(Base, TimestampMixin):
    __tablename__ = "ingestion_jobs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    source_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("sources.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    job_type: Mapped[str] = mapped_column(String(50), default="full_pipeline", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True, nullable=False)
    documents_processed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    signals_extracted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    opportunities_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logs: Mapped[Optional[list]] = mapped_column(JSON, default=list, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    source: Mapped[Optional["Source"]] = relationship("Source", back_populates="jobs")

    def __repr__(self) -> str:
        return f"<IngestionJob {self.id} [{self.job_type} - {self.status}]>"
