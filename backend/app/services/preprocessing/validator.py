from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple, NamedTuple
from urllib.parse import urlparse
from backend.app.services.preprocessing.text_normalizer import TextNormalizer


class ValidationResult(NamedTuple):
    is_valid: bool
    status: str  # "valid" | "invalid"
    primary_reason: Optional[str]
    errors: List[str]
    warnings: List[str]


class DocumentValidator:
    """
    Validates field integrity, source identifiers, schema invariants,
    and quality rules for raw community documents before preprocessing.
    
    KEY RULES:
    - Never silently discards malformed records.
    - Records comprehensive, actionable failure reasons.
    - Safely tolerates minor formatting defects while rejecting corrupt/unusable inputs.
    """

    ALLOWED_DOCUMENT_TYPES = {"post", "comment"}
    SPAM_PATTERNS = [
        "buy crypto", "casino online", "slot machines", "free money",
        "work from home earn $$$", "payday loans", "cheap airfare tickets",
        "telegram trading signals", "airdrop token", "crypto pump", "free followers"
    ]

    @classmethod
    def validate_url(cls, url: Optional[str]) -> Tuple[bool, Optional[str]]:
        """Validates that URL uses http/https and has a resolvable netloc domain."""
        if not url or not isinstance(url, str):
            return False, "Missing or invalid URL"
        clean = url.strip()
        try:
            parsed = urlparse(clean)
            if parsed.scheme.lower() not in ("http", "https"):
                return False, f"Invalid URL scheme '{parsed.scheme}': must be http or https"
            if not parsed.netloc:
                return False, "URL is missing a valid domain host (netloc)"
            return True, None
        except Exception as e:
            return False, f"Malformed URL syntax: {e}"

    @classmethod
    def validate_timestamp(cls, ts: Any) -> Tuple[bool, Optional[str], Optional[datetime]]:
        """Validates timestamp format and ensures date is not in the future (with 15 min clock skew tolerance)."""
        if ts is None:
            return True, None, None

        parsed_dt = None
        if isinstance(ts, datetime):
            parsed_dt = ts
        elif isinstance(ts, str):
            try:
                # Support standard ISO formats
                parsed_dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except ValueError:
                return False, f"Timestamp string '{ts}' is not valid ISO-8601", None
        elif isinstance(ts, (int, float)):
            try:
                parsed_dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            except Exception:
                return False, f"Numeric epoch timestamp '{ts}' is out of range", None
        else:
            return False, f"Unsupported timestamp type '{type(ts).__name__}'", None

        # Clock skew tolerance: max 15 minutes in future
        now = datetime.now(timezone.utc)
        if parsed_dt.tzinfo is None:
            parsed_dt = parsed_dt.replace(tzinfo=timezone.utc)

        if parsed_dt > (now + timedelta(minutes=15)):
            return False, f"Timestamp '{parsed_dt.isoformat()}' is set in the future", parsed_dt

        return True, None, parsed_dt

    @classmethod
    def validate_raw_record(cls, record: Dict[str, Any]) -> ValidationResult:
        """
        Validates all fields of an incoming raw document record.
        Record may be post or comment from Product Hunt or Reddit.
        """
        errors: List[str] = []
        warnings: List[str] = []

        # 1. Source identifier & type validation
        source_id = record.get("source_id") or record.get("source_code")
        if not source_id:
            errors.append("Missing required source identifier ('source_id' or 'source_code')")

        doc_type = record.get("document_type", "post")
        if doc_type not in cls.ALLOWED_DOCUMENT_TYPES:
            errors.append(f"Invalid document_type '{doc_type}': must be 'post' or 'comment'")

        # 2. Content validation
        content = record.get("content")
        if TextNormalizer.is_empty_or_whitespace(content):
            errors.append("Content is missing, empty, or contains only whitespace")
        else:
            is_valid_len, len_err = TextNormalizer.validate_text_length(content, min_length=20)
            if not is_valid_len and len_err:
                errors.append(len_err)

        # 3. Title validation (required for posts, optional for comments)
        title = record.get("title")
        if doc_type == "post":
            if TextNormalizer.is_empty_or_whitespace(title):
                errors.append("Post is missing required 'title' field")
            elif len(title.strip()) < 3:
                errors.append(f"Post title is too short ({len(title.strip())} chars; min 3)")
            elif len(title.strip()) > 500:
                warnings.append(f"Post title exceeds 500 characters ({len(title.strip())} chars)")
        elif doc_type == "comment":
            if not title:
                # Warnings only for comments without titles
                warnings.append("Comment record has no title; title will be derived from parent or content snippet")

        # 4. URL validation
        url = record.get("url")
        is_valid_url, url_err = cls.validate_url(url)
        if not is_valid_url and url_err:
            errors.append(url_err)

        # 5. Timestamp validation
        published_at = record.get("published_at")
        is_valid_ts, ts_err, _ = cls.validate_timestamp(published_at)
        if not is_valid_ts and ts_err:
            errors.append(ts_err)

        # 6. Comment relationship validation
        if doc_type == "comment":
            parent_id = record.get("parent_external_id") or record.get("parent_id")
            thread_id = record.get("thread_id")
            if not parent_id and not thread_id:
                warnings.append("Comment is missing parent_external_id / thread_id reference")

        # 7. Spam check
        combined_text = f"{title or ''} {content or ''}".lower()
        for spam_trigger in cls.SPAM_PATTERNS:
            if spam_trigger in combined_text:
                errors.append(f"Spam pattern detected: '{spam_trigger}'")
                break

        is_valid = len(errors) == 0
        status = "valid" if is_valid else "invalid"
        primary_reason = errors[0] if errors else None

        return ValidationResult(
            is_valid=is_valid,
            status=status,
            primary_reason=primary_reason,
            errors=errors,
            warnings=warnings
        )
