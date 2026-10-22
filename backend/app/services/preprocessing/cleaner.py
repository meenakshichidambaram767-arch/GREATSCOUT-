import hashlib
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from typing import Dict, Any, Optional, Tuple, List


class DocumentCleaner:
    """Sanitizes text, normalizes URLs, computes deterministic SHA-256 hashes, and validates raw document input."""

    TRACKING_PARAMS = {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "ref", "source", "fbclid", "gclid", "msclkid", "mc_cid", "mc_eid"
    }

    SPAM_PATTERNS = [
        "buy crypto", "casino online", "slot machines", "free money",
        "work from home earn $$$", "payday loans", "cheap airfare tickets",
        "telegram trading signals", "airdrop token"
    ]

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Remove zero-width characters and control codes
        cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\ufeff]', '', text)
        # Normalize whitespace while preserving intentional paragraph breaks
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        return cleaned.strip()

    @classmethod
    def normalize_url(cls, url: str) -> str:
        """Removes tracking query parameters, hashes, and trailing slashes for canonical comparison."""
        if not url:
            return ""
        try:
            parsed = urlparse(url.strip())
            # Filter tracking parameters
            filtered_query = [
                (k, v) for k, v in parse_qsl(parsed.query)
                if k.lower() not in cls.TRACKING_PARAMS
            ]
            normalized = urlunparse((
                parsed.scheme.lower(),
                parsed.netloc.lower(),
                parsed.path.rstrip('/') if parsed.path != '/' else '/',
                parsed.params,
                urlencode(filtered_query),
                "" # Strip fragments
            ))
            return normalized
        except Exception:
            return url.strip()

    @staticmethod
    def compute_content_hash(title: str, content: str) -> str:
        """Generates a deterministic SHA-256 hash of the normalized title and content."""
        clean_t = re.sub(r'\s+', ' ', title.strip().lower())
        clean_c = re.sub(r'\s+', ' ', content.strip().lower())
        normalized = f"{clean_t}|{clean_c}"
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @classmethod
    def validate_document(cls, title: str, content: str, url: str) -> Tuple[bool, str]:
        """
        Validates minimum quality and length requirements for market intelligence analysis.
        Returns (is_valid, reason).
        """
        if not title or len(title.strip()) < 5:
            return False, "Title is too short (< 5 characters)"
        if not content or len(content.strip()) < 20:
            return False, "Content is too short (< 20 characters)"
        if not url or not (url.startswith("http://") or url.startswith("https://")):
            return False, "Invalid URL scheme (must start with http:// or https://)"

        # Check for spam or promotional noise
        lower = f"{title} {content}".lower()
        for spam_trigger in cls.SPAM_PATTERNS:
            if spam_trigger in lower:
                return False, f"Spam pattern detected: '{spam_trigger}'"

        return True, "valid"
