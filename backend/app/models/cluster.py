import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin
from backend.app.db.custom_types import VectorType

if TYPE_CHECKING:
    from backend.app.models.signal import Signal
    from backend.app.models.opportunity import Opportunity


class SignalCluster(Base, TimestampMixin):
    __tablename__ = "signal_clusters"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    signal_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    coherence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    centroid_embedding: Mapped[Optional[List[float]]] = mapped_column(VectorType(384), nullable=True)

    # Relationships
    signals: Mapped[List["Signal"]] = relationship(
        "Signal",
        back_populates="cluster"
    )
    opportunity: Mapped[Optional["Opportunity"]] = relationship(
        "Opportunity",
        back_populates="cluster",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<SignalCluster {self.id}: {self.label} ({self.signal_count} signals)>"
