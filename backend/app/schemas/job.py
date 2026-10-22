from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class IngestionJobCreate(BaseModel):
    source_code: str = Field(default="demo", description="demo | product_hunt | reddit")
    category: Optional[str] = Field(default="all")
    limit: int = Field(default=50, ge=1, le=500)
    run_pipeline: bool = Field(default=True, description="Automatically extract signals and discover opportunities")


class IngestionJobResponse(BaseModel):
    id: str
    source_id: Optional[str] = None
    job_type: str
    status: str
    documents_processed: int
    signals_extracted: int
    opportunities_generated: int
    error_message: Optional[str] = None
    logs: Optional[List[Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
