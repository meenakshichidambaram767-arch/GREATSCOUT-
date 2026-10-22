import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.document import Document
    from backend.app.models.job import IngestionJob


class Source(Base, TimestampMixin):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    base_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    config: Mapped[Optional[dict]] = mapped_column(JSON, default=dict, nullable=True)

    # Relationships
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="source",
        cascade="all, delete-orphan"
    )
    jobs: Mapped[List["IngestionJob"]] = relationship(
        "IngestionJob",
        back_populates="source"
    )

    def __repr__(self) -> str:
        return f"<Source {self.code}: {self.name}>"
