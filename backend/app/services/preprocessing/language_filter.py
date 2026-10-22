import re
from typing import List, Dict, Optional, Tuple, NamedTuple


class LanguageDetectionResult(NamedTuple):
    language: str
    confidence: float
    is_reliable: bool
    method: str


class LanguageDetector:
    """
    Configurable language detection and filtering service.
    Uses stop-word frequency distribution and script classification.
    
    KEY RULES:
    - Never deletes non-target languages from raw data.
    - Labels detected language and marks processing eligibility flags explicitly.
    - Explicitly flags short text or low-confidence results as unreliable/unknown.
    """

    DEFAULT_ALLOWED_LANGUAGES: List[str] = ["en"]
    MIN_CHARS_FOR_RELIABILITY: int = 30
    MIN_WORDS_FOR_RELIABILITY: int = 5

    # Core high-frequency linguistic stop-words (top function words per language)
    STOPWORDS: Dict[str, set] = {
        "en": {
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
            "this", "but", "his", "by", "from", "they", "we", "say", "her",
            "she", "or", "an", "will", "my", "one", "all", "would", "there",
            "their", "what", "so", "up", "out", "if", "about", "who", "get",
            "which", "go", "me", "when", "make", "can", "like", "time", "no",
            "just", "him", "know", "take", "people", "into", "year", "your",
            "good", "some", "could", "them", "see", "other", "than", "then",
            "now", "look", "only", "come", "its", "over", "think", "also",
            "back", "after", "use", "two", "how", "our", "work", "first",
            "well", "way", "even", "new", "want", "because", "any", "these",
            "give", "day", "most", "us", "are", "is", "was", "were", "been"
        },
        "es": {
            "de", "la", "que", "el", "en", "y", "a", "los", "se", "del",
            "las", "un", "por", "con", "no", "una", "su", "para", "es", "al",
            "lo", "como", "mas", "pero", "sus", "le", "ya", "o", "este",
            "si", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre",
            "tambien", "me", "hasta", "hay", "donde", "quien", "desde", "todo",
            "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros"
        },
        "fr": {
            "de", "la", "le", "et", "les", "des", "en", "un", "du", "une",
            "est", "pour", "que", "qui", "dans", "a", "par", "sur", "pas",
            "plus", "au", "avec", "ce", "ne", "sont", "se", "ou", "ont",
            "son", "ses", "aux", "il", "comme", "mais", "nous", "sa", "cette",
            "aussi", "leur", "elle", "tout", "ces", "peut", "faire", "on"
        },
        "de": {
            "der", "die", "und", "in", "den", "von", "zu", "das", "mit",
            "sich", "des", "auf", "fur", "ist", "im", "dem", "nicht", "ein",
            "eine", "als", "auch", "es", "an", "werden", "aus", "er", "hat",
            "dass", "sie", "nach", "wird", "bei", "einer", "um", "am", "sind"
        },
        "pt": {
            "de", "a", "o", "que", "e", "do", "da", "em", "um", "para",
            "com", "nao", "uma", "os", "no", "se", "na", "por", "mais",
            "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem"
        }
    }

    # Script regular expression ranges
    CYRILLIC_PATTERN = re.compile(r'[\u0400-\u04FF]')
    CJK_PATTERN = re.compile(r'[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]')
    ARABIC_PATTERN = re.compile(r'[\u0600-\u06FF]')

    @classmethod
    def detect_language(cls, text: Optional[str]) -> LanguageDetectionResult:
        """
        Detects primary language of text.
        Returns LanguageDetectionResult(language, confidence, is_reliable, method).
        """
        if not text or len(text.strip()) == 0:
            return LanguageDetectionResult(
                language="unknown",
                confidence=0.0,
                is_reliable=False,
                method="empty_text"
            )

        clean = text.strip()

        # 1. Non-Latin script detection (Cyrillic, CJK, Arabic)
        total_chars = max(1, len(clean))
        cjk_matches = len(cls.CJK_PATTERN.findall(clean))
        if cjk_matches / total_chars > 0.15:
            return LanguageDetectionResult(
                language="zh_ja_ko",
                confidence=min(1.0, (cjk_matches / total_chars) * 3),
                is_reliable=True,
                method="script_detection"
            )

        cyrillic_matches = len(cls.CYRILLIC_PATTERN.findall(clean))
        if cyrillic_matches / total_chars > 0.15:
            return LanguageDetectionResult(
                language="ru",
                confidence=min(1.0, (cyrillic_matches / total_chars) * 3),
                is_reliable=True,
                method="script_detection"
            )

        arabic_matches = len(cls.ARABIC_PATTERN.findall(clean))
        if arabic_matches / total_chars > 0.15:
            return LanguageDetectionResult(
                language="ar",
                confidence=min(1.0, (arabic_matches / total_chars) * 3),
                is_reliable=True,
                method="script_detection"
            )

        # 2. Tokenize words for Latin stop-word distribution
        words = re.findall(r'\b[a-zA-Záéíóúüñàèìòùçãõâêîôûäöß]+\b', clean.lower())
        word_count = len(words)

        # Short text check: If too few words, language detection cannot be deemed reliable
        if len(clean) < cls.MIN_CHARS_FOR_RELIABILITY or word_count < cls.MIN_WORDS_FOR_RELIABILITY:
            # Check if any strong English words appear
            en_hits = sum(1 for w in words if w in cls.STOPWORDS["en"])
            if en_hits >= 2:
                return LanguageDetectionResult(
                    language="en",
                    confidence=0.55,
                    is_reliable=False,
                    method="short_text_fallback"
                )
            return LanguageDetectionResult(
                language="unknown",
                confidence=0.3,
                is_reliable=False,
                method="short_text_fallback"
            )

        # 3. Calculate stop-word frequency for each supported language
        scores: Dict[str, int] = {}
        for lang, stopset in cls.STOPWORDS.items():
            scores[lang] = sum(1 for w in words if w in stopset)

        best_lang, best_hits = max(scores.items(), key=lambda item: item[1])

        if best_hits == 0:
            return LanguageDetectionResult(
                language="unknown",
                confidence=0.2,
                is_reliable=False,
                method="statistical_stopword"
            )

        # Calculate confidence as fraction of words matched vs expected function word ratio (~30-50% in prose)
        confidence = min(1.0, (best_hits / max(1, word_count)) * 2.2)
        # Check margin over second best
        sorted_scores = sorted(scores.values(), reverse=True)
        margin = (sorted_scores[0] - sorted_scores[1]) if len(sorted_scores) > 1 else sorted_scores[0]
        if margin == 0 and sorted_scores[0] > 0:
            confidence *= 0.7  # Tied score lowers confidence

        is_reliable = confidence >= 0.45 and word_count >= cls.MIN_WORDS_FOR_RELIABILITY

        return LanguageDetectionResult(
            language=best_lang,
            confidence=round(confidence, 3),
            is_reliable=is_reliable,
            method="statistical_stopword"
        )

    @classmethod
    def check_eligibility(
        cls,
        detection: LanguageDetectionResult,
        allowed_languages: Optional[List[str]] = None,
        min_confidence: float = 0.4
    ) -> Tuple[bool, Optional[str]]:
        """
        Determines whether a document is eligible for downstream processing based on language.
        Returns (is_eligible, failure_reason_if_ineligible).
        """
        allowed = allowed_languages or cls.DEFAULT_ALLOWED_LANGUAGES

        if detection.language == "unknown":
            # If text is in Latin script and unknown, we allow it if not clearly non-English
            return True, None

        if detection.language not in allowed:
            return False, f"Document language '{detection.language}' (confidence: {detection.confidence}) is not in allowed target languages ({', '.join(allowed)})"

        return True, None
