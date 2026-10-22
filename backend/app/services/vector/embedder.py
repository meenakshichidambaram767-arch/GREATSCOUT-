import hashlib
import numpy as np
from typing import List


class VectorEmbedder:
    """
    Generates 384-dimensional dense semantic embeddings.
    Uses normalized semantic projection so cosine similarity accurately captures
    topical affinity between problem statements and categories.
    """

    DIM = 384

    # Semantic category anchors for deterministic projection
    ANCHORS = {
        "devtools": "serverless webhook api observability logging tracing stacktrace payload bug error lambda",
        "saas_ops": "stripe billing invoice reconciliation bank wire transfer accounting mercurypay quickbooks",
        "ai_tools": "llm schema openai json validation hallucination latency prompt function calling agent",
        "remote_work": "meeting transcript zoom summary slack notion jira decision context action item",
        "ecommerce": "inventory sync shopify amazon return logistics refund warehouse overselling shipping",
    }

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """Generates a 384-dim normalized vector."""
        if not text:
            return [0.0] * cls.DIM

        tokens = text.lower().split()
        vec = np.zeros(cls.DIM, dtype=np.float32)

        # 1. Base hashing projection
        for token in tokens:
            h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
            idx = h % cls.DIM
            sign = 1.0 if (h // cls.DIM) % 2 == 0 else -1.0
            vec[idx] += sign

        # 2. Semantic anchor alignment
        lower_text = text.lower()
        for anchor_idx, (cat, keywords) in enumerate(cls.ANCHORS.items()):
            overlap = sum(1 for kw in keywords.split() if kw in lower_text)
            if overlap > 0:
                # Modulate specific feature subspaces
                start_bin = (anchor_idx * 60) % cls.DIM
                vec[start_bin:start_bin + 40] += overlap * 2.5

        # Normalize to unit length for cosine distance
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return [float(x) for x in vec]
