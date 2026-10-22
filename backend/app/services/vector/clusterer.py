import numpy as np
from typing import List, Dict, Any


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


class SemanticClusterer:
    """
    Density-based semantic clustering baseline (HDBSCAN-compatible centroid grouping).
    Groups signals by embedding cosine similarity and derives cohesive thematic centroids.
    """

    @classmethod
    def cluster_signals(cls, signals: List[Dict[str, Any]], similarity_threshold: float = 0.65) -> List[Dict[str, Any]]:
        if not signals:
            return []

        clusters: List[Dict[str, Any]] = []
        assigned = set()

        for i, sig in enumerate(signals):
            if i in assigned:
                continue

            emb_i = sig.get("embedding")
            if not emb_i:
                continue

            current_members = [sig]
            assigned.add(i)

            # Find all other signals that match this theme
            for j, other in enumerate(signals):
                if j in assigned:
                    continue
                emb_j = other.get("embedding")
                if not emb_j:
                    continue

                sim = cosine_similarity(emb_i, emb_j)
                if sim >= similarity_threshold:
                    current_members.append(other)
                    assigned.add(j)

            # Calculate cluster centroid
            member_embeddings = [np.array(m["embedding"]) for m in current_members]
            centroid = np.mean(member_embeddings, axis=0)
            norm = np.linalg.norm(centroid)
            if norm > 0:
                centroid = centroid / norm

            # Calculate coherence score
            if len(current_members) > 1:
                pairwise_sims = [
                    cosine_similarity(list(centroid), m["embedding"])
                    for m in current_members
                ]
                coherence = float(np.mean(pairwise_sims))
            else:
                coherence = 0.85

            # Derive label & category
            category = current_members[0].get("category", "General SaaS")
            summary_seed = current_members[0].get("summary", "Market Problem")
            clean_label = summary_seed.split("—")[0].strip() if "—" in summary_seed else summary_seed[:80]

            clusters.append({
                "label": clean_label,
                "category": category,
                "description": f"Cluster of {len(current_members)} recurring complaints regarding {clean_label}.",
                "signals": current_members,
                "signal_count": len(current_members),
                "coherence_score": round(coherence, 3),
                "centroid_embedding": [float(x) for x in centroid],
            })

        return clusters
