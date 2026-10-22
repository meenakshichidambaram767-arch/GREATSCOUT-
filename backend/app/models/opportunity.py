import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.cluster import SignalCluster
    from backend.app.models.signal import Signal


class Opportunity(Base, TimestampMixin):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    cluster_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("signal_clusters.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_audience: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="General SaaS", index=True, nullable=False)
    problem_thesis: Mapped[str] = mapped_column(Text, nullable=False)
    why_current_solutions_fail: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_solution: Mapped[str] = mapped_column(Text, nullable=False)
    
    # 4 Core Explainable Scoring Pillars
    demand_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    pain_intensity_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    willingness_to_pay_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    competitive_vacuum_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0, index=True, nullable=False)

    confidence_level: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True, nullable=False)

    # Relationships
    cluster: Mapped["SignalCluster"] = relationship("SignalCluster", back_populates="opportunity")
    evidence: Mapped[List["OpportunityEvidence"]] = relationship(
        "OpportunityEvidence",
        back_populates="opportunity",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_opp_score_status", "overall_score", "status"),
    )

    def __repr__(self) -> str:
        return f"<Opportunity {self.id} [{self.overall_score:.1f}]: {self.title[:40]}>"


class OpportunityEvidence(Base, TimestampMixin):
    __tablename__ = "opportunity_evidence"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    opportunity_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("opportunities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    signal_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("signals.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    highlight_quote: Mapped[str] = mapped_column(Text, nullable=False)
    relevance_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    # Relationships
    opportunity: Mapped["Opportunity"] = relationship("Opportunity", back_populates="evidence")
    signal: Mapped["Signal"] = relationship("Signal", back_populates="evidence")

    def __repr__(self) -> str:
        return f"<OpportunityEvidence {self.id} for Opp {self.opportunity_id}>"
