import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin
from backend.app.db.custom_types import VectorType

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.cluster import SignalCluster
    from backend.app.models.opportunity import OpportunityEvidence


class Signal(Base, TimestampMixin):
    __tablename__ = "signals"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    cluster_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("signal_clusters.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    signal_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    raw_quote: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    sentiment_score: Mapped[float] = mapped_column(Float, default=-0.5, nullable=False)
    urgency_score: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    commercial_intent_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    competitor_mentioned: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    embedding: Mapped[Optional[List[float]]] = mapped_column(VectorType(384), nullable=True)

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="signals")
    cluster: Mapped[Optional["SignalCluster"]] = relationship("SignalCluster", back_populates="signals")
    evidence: Mapped[List["OpportunityEvidence"]] = relationship(
        "OpportunityEvidence",
        back_populates="signal",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_signal_type_severity", "signal_type", "severity"),
    )

    def __repr__(self) -> str:
        return f"<Signal {self.id} [{self.signal_type}]: {self.summary[:40]}>"
