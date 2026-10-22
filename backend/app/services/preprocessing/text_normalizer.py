import html
import re
import unicodedata
from typing import Tuple, Optional


class TextNormalizer:
    """
    Cleans and standardizes raw user text from Product Hunt and Reddit.
    Applies HTML entity decoding, HTML tag removal, Markdown syntax stripping,
    Unicode NFKC normalization, whitespace standardization, and boilerplate cleanup.
    
    CRITICAL INVARIANTS:
    - Never summarizes, paraphrases, or rewrites original user content.
    - Preserves meaningful technical terms (e.g., CI/CD, C++, Next.js, OAuth2), product names,
      punctuation, and negations (not, no, never, don't).
    - Preserves intact original text alongside normalized output.
    """

    MIN_TEXT_LENGTH: int = 20
    MAX_TEXT_LENGTH: int = 50000

    # Common bot/boilerplate patterns
    BOILERPLATE_PATTERNS = [
        re.compile(r'(?i)\*?I am a bot, and this action was performed automatically[^\n]*', re.DOTALL),
        re.compile(r'(?i)Please\s+contact\s+the\s+moderators\s+of\s+this\s+subreddit[^\n]*', re.DOTALL),
        re.compile(r'(?i)\[view\s+formatted\]', re.IGNORECASE),
        re.compile(r'^[=\-_*~]{3,}\s*$', re.MULTILINE),
    ]

    @classmethod
    def clean_html(cls, text: str) -> str:
        """Decodes HTML entities and strips HTML markup while preserving text content."""
        if not text:
            return ""
        # 1. Unescape entities (&amp; -> &, &quot; -> ", &#39; -> ', &lt; -> <, etc.)
        decoded = html.unescape(text)
        # 2. Replace <br> and paragraph breaks with newlines
        decoded = re.sub(r'<(?:br|/p|/div|/h[1-6])\s*/?>', '\n', decoded, flags=re.IGNORECASE)
        # 3. Strip remaining HTML tags
        stripped = re.sub(r'<[^>]+>', ' ', decoded)
        # 4. Collapse redundant horizontal spaces created by tag boundaries
        cleaned = re.sub(r'[^\S\r\n]+', ' ', stripped)
        return cleaned.strip()

    @classmethod
    def clean_markdown(cls, text: str) -> str:
        """Removes Markdown structural syntax while preserving inner text, code terms, and punctuation."""
        if not text:
            return ""
        cleaned = text

        # 1. Markdown images: ![alt](url) -> alt
        cleaned = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', r'\1', cleaned)

        # 2. Markdown links: [anchor](url) -> anchor
        cleaned = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', cleaned)

        # 3. Multi-line code blocks: ```lang\ncode\n``` -> code
        cleaned = re.sub(r'```(?:[a-zA-Z0-9_\-]+)?\s*\n?(.*?)\n?```', r'\1', cleaned, flags=re.DOTALL)

        # 4. Inline code backticks: `code` -> code (keeps technical term intact)
        cleaned = re.sub(r'`([^`]+)`', r'\1', cleaned)

        # 5. Bold & Italic markers: **text** / __text__ / *text* / _text_
        cleaned = re.sub(r'\*\*([^\*]+)\*\*', r'\1', cleaned)
        cleaned = re.sub(r'__([^_]+)__', r'\1', cleaned)
        cleaned = re.sub(r'(?<!\w)\*([^\*\n]+)\*(?!\w)', r'\1', cleaned)
        cleaned = re.sub(r'(?<!\w)_([^_\n]+)_(?!\w)', r'\1', cleaned)

        # 6. Strikethrough: ~~text~~ -> text
        cleaned = re.sub(r'~~([^~]+)~~', r'\1', cleaned)

        # 7. Blockquotes: > text -> text
        cleaned = re.sub(r'^\s*>\s+', '', cleaned, flags=re.MULTILINE)

        # 8. Headers: # Header -> Header
        cleaned = re.sub(r'^\s*#{1,6}\s+', '', cleaned, flags=re.MULTILINE)

        # 9. List bullets: * item / - item / 1. item -> item
        cleaned = re.sub(r'^\s*[\*\-\+]\s+', '', cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r'^\s*\d+\.\s+', '', cleaned, flags=re.MULTILINE)

        return cleaned

    @classmethod
    def normalize_unicode(cls, text: str) -> str:
        """Standardizes Unicode characters to NFKC and strips zero-width/control characters."""
        if not text:
            return ""
        # 1. NFKC normalization (composes characters, decomposes ligatures like fi, fl)
        normalized = unicodedata.normalize('NFKC', text)
        # 2. Replace non-breaking spaces with normal spaces
        normalized = normalized.replace('\u00a0', ' ')
        # 3. Remove zero-width characters and invisible control codes while preserving newlines and tabs
        normalized = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\u200b\u200c\u200d\u200e\u200f\ufeff]', '', normalized)
        return normalized

    @classmethod
    def strip_boilerplate(cls, text: str) -> str:
        """Strips known bot signatures and repetitive promotional footers."""
        if not text:
            return ""
        cleaned = text
        for pattern in cls.BOILERPLATE_PATTERNS:
            cleaned = pattern.sub('', cleaned)
        return cleaned

    @classmethod
    def normalize_whitespace(cls, text: str) -> str:
        """Standardizes spaces and paragraph breaks while preserving intentional paragraph separation."""
        if not text:
            return ""
        # Normalize carriage returns
        cleaned = text.replace('\r\n', '\n').replace('\r', '\n')
        # Collapse multiple horizontal spaces/tabs
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        # Collapse 3 or more newlines into 2 (preserves paragraph breaks)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        # Trim leading/trailing lines and spaces
        return cleaned.strip()

    @classmethod
    def normalize(cls, text: str) -> str:
        """
        Runs the complete text normalization pipeline:
        HTML cleanup -> Markdown cleanup -> Boilerplate strip -> Unicode NFKC -> Whitespace normalization.
        """
        if not text:
            return ""
        step1 = cls.clean_html(text)
        step2 = cls.clean_markdown(step1)
        step3 = cls.strip_boilerplate(step2)
        step4 = cls.normalize_unicode(step3)
        step5 = cls.normalize_whitespace(step4)
        return step5

    @classmethod
    def is_empty_or_whitespace(cls, text: Optional[str]) -> bool:
        """Checks if text is None, empty, or consists only of whitespace characters."""
        if text is None:
            return True
        return len(text.strip()) == 0

    @classmethod
    def validate_text_length(
        cls,
        text: Optional[str],
        min_length: Optional[int] = None,
        max_length: Optional[int] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validates minimum and maximum text length thresholds.
        Returns (is_valid, failure_reason).
        """
        min_len = min_length if min_length is not None else cls.MIN_TEXT_LENGTH
        max_len = max_length if max_length is not None else cls.MAX_TEXT_LENGTH

        if cls.is_empty_or_whitespace(text):
            return False, "Text is empty or contains only whitespace"

        clean = text.strip() if text else ""
        if len(clean) < min_len:
            return False, f"Text length ({len(clean)} chars) is below minimum required ({min_len} chars)"

        if len(clean) > max_len:
            return False, f"Text length ({len(clean)} chars) exceeds maximum allowed ({max_len} chars)"

        return True, None
