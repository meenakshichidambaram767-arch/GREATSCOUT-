import hashlib
import re
from typing import Set, List, Dict, Any, Optional, Tuple, NamedTuple


class DuplicateMatch(NamedTuple):
    is_duplicate: bool
    duplicate_type: Optional[str]  # "exact" | "near" | None
    canonical_id: Optional[str]
    similarity_score: float


class DuplicateDetector:
    """
    Exact and near-duplicate detection service.
    
    KEY PRINCIPLES:
    - Never deletes or discards independent reports of the same problem.
    - Preserves provenance (author, upvotes, timestamps, raw document ID).
    - Uses deterministic SHA-256 for exact duplicate detection.
    - Uses word 3-shingling Jaccard similarity for near-duplicate detection.
    """

    NEAR_DUPLICATE_THRESHOLD: float = 0.85
    SHINGLE_SIZE: int = 2

    @classmethod
    def compute_exact_hash(cls, normalized_title: str, normalized_content: str) -> str:
        """
        Generates a deterministic SHA-256 hash from normalized title and content.
        Identical texts produce the exact same 64-character hexadecimal digest.
        """
        t = re.sub(r'\s+', ' ', normalized_title.strip().lower())
        c = re.sub(r'\s+', ' ', normalized_content.strip().lower())
        combined = f"{t}\n{c}".encode('utf-8')
        return hashlib.sha256(combined).hexdigest()

    @classmethod
    def generate_shingles(cls, text: str, k: Optional[int] = None) -> Set[str]:
        """
        Splits text into a set of k-word shingles (n-grams).
        Defaults to k=2 (bigrams) which provides robust sensitivity for short-to-medium
        user-generated forum comments and product descriptions.
        Falls back to character 4-grams if text has fewer than k words.
        """
        shingle_k = k if k is not None else cls.SHINGLE_SIZE
        words = re.findall(r'\b\w+\b', text.lower())
        if len(words) >= shingle_k:
            return {" ".join(words[i:i + shingle_k]) for i in range(len(words) - shingle_k + 1)}

        # Fallback to character 4-grams for very short text
        clean = re.sub(r'\s+', '', text.lower())
        char_k = 4
        if len(clean) >= char_k:
            return {clean[i:i + char_k] for i in range(len(clean) - char_k + 1)}
        return {clean} if clean else set()

    @classmethod
    def calculate_jaccard_similarity(cls, shingles_a: Set[str], shingles_b: Set[str]) -> float:
        """
        Computes the Jaccard similarity coefficient between two shingle sets:
        J(A, B) = |A ∩ B| / |A ∪ B|.
        """
        if not shingles_a or not shingles_b:
            return 0.0
        intersection = len(shingles_a.intersection(shingles_b))
        union = len(shingles_a.union(shingles_b))
        if union == 0:
            return 0.0
        return float(intersection / union)

    @classmethod
    def check_duplicate(
        cls,
        current_id: str,
        normalized_title: str,
        normalized_content: str,
        existing_items: List[Dict[str, Any]],
        threshold: Optional[float] = None
    ) -> DuplicateMatch:
        """
        Compares normalized text against an existing repository of documents.
        Each existing item is expected to have:
        {'id': str, 'content_hash': str, 'normalized_title': str, 'normalized_content': str}
        
        Returns DuplicateMatch(is_duplicate, duplicate_type, canonical_id, similarity_score).
        """
        thresh = threshold if threshold is not None else cls.NEAR_DUPLICATE_THRESHOLD
        current_hash = cls.compute_exact_hash(normalized_title, normalized_content)

        # 1. Exact Duplicate Check (SHA-256 match)
        for item in existing_items:
            if item.get("id") == current_id:
                continue
            if item.get("content_hash") == current_hash:
                return DuplicateMatch(
                    is_duplicate=True,
                    duplicate_type="exact",
                    canonical_id=item["id"],
                    similarity_score=1.0
                )

        # 2. Near-Duplicate Check (Shingling Jaccard match)
        current_shingles = cls.generate_shingles(f"{normalized_title} {normalized_content}")
        if not current_shingles:
            return DuplicateMatch(
                is_duplicate=False,
                duplicate_type=None,
                canonical_id=None,
                similarity_score=0.0
            )

        best_score = 0.0
        best_canonical_id = None

        for item in existing_items:
            if item.get("id") == current_id:
                continue

            existing_text = f"{item.get('normalized_title', '')} {item.get('normalized_content', '')}"
            existing_shingles = item.get("_shingles")
            if existing_shingles is None:
                existing_shingles = cls.generate_shingles(existing_text)

            sim = cls.calculate_jaccard_similarity(current_shingles, existing_shingles)
            if sim > best_score:
                best_score = sim
                best_canonical_id = item["id"]

        if best_score >= thresh and best_canonical_id is not None:
            return DuplicateMatch(
                is_duplicate=True,
                duplicate_type="near",
                canonical_id=best_canonical_id,
                similarity_score=round(best_score, 3)
            )

        return DuplicateMatch(
            is_duplicate=False,
            duplicate_type=None,
            canonical_id=None,
            similarity_score=round(best_score, 3)
        )
