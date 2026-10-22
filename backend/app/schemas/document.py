from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    title: str = Field(..., max_length=500)
    content: str
    author: Optional[str] = Field(default=None, max_length=100)
    url: str = Field(..., max_length=1000)
    upvotes: int = Field(default=0, ge=0)
    comment_count: int = Field(default=0, ge=0)
    is_synthetic: bool = False
    validation_status: str = Field(default="valid")
    published_at: Optional[datetime] = None


class DocumentCreate(DocumentBase):
    source_code: str
    external_id: Optional[str] = None
    content_hash: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: str
    source_id: str
    external_id: Optional[str] = None
    content_hash: str
    ingested_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
