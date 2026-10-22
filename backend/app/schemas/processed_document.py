from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ProcessedDocumentResponse(BaseModel):
    id: str
    raw_document_id: str
    document_type: str
    parent_external_id: Optional[str] = None
    thread_id: Optional[str] = None
    normalized_title: str
    normalized_content: str
    original_content_snapshot: str
    language: str
    language_confidence: float
    is_eligible: bool
    validation_status: str
    validation_reason: Optional[str] = None
    validation_errors: Optional[List[str]] = None
    content_hash: str
    is_exact_duplicate: bool
    is_near_duplicate: bool
    canonical_document_id: Optional[str] = None
    similarity_score: Optional[float] = None
    word_count: int
    char_count: int
    source_metadata: Optional[Dict[str, Any]] = None
    processed_at: datetime
    is_synthetic: bool

    model_config = ConfigDict(from_attributes=True)


class DatasetStatsReport(BaseModel):
    """
    Comprehensive dataset statistics report detailing data quality, source distributions,
    posts versus comments, language classification, duplicates, and processing eligibility.
    """
    total_raw_documents: int = Field(..., description="Total count of raw documents in inventory")
    documents_by_source: Dict[str, int] = Field(default_factory=dict, description="Raw document counts per source channel")
    posts_count: int = Field(0, description="Count of top-level post submissions")
    comments_count: int = Field(0, description="Count of nested comment records")
    missing_required_fields_count: int = Field(0, description="Records missing title, content, or valid URL")
    empty_or_unusable_text_count: int = Field(0, description="Records with whitespace-only or sub-threshold text")
    exact_duplicates_count: int = Field(0, description="Exact duplicate records identified by SHA-256")
    suspected_near_duplicates_count: int = Field(0, description="Near-duplicate records identified by Jaccard shingling")
    language_distribution: Dict[str, int] = Field(default_factory=dict, description="Count distribution of detected languages")
    documents_eligible_for_processing: int = Field(0, description="Valid, target-language, non-duplicate records ready for AI extraction")
    validation_failure_reasons: Dict[str, int] = Field(default_factory=dict, description="Breakdown of specific validation error triggers")
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class PreprocessingRunSummary(BaseModel):
    """Summary metrics of a batch preprocessing run."""
    total_inspected: int
    newly_processed: int
    updated_existing: int
    valid_count: int
    invalid_count: int
    duplicates_detected: int
    ineligible_language_count: int
    eligible_count: int
    duration_seconds: float
