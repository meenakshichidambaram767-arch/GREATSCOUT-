import pytest
import numpy as np
from backend.app.services.vector.embedder import VectorEmbedder
from backend.app.services.vector.clusterer import SemanticClusterer, cosine_similarity


def test_embedder_generates_unit_vector():
    vec = VectorEmbedder.embed_text("Stripe invoice reconciliation manual accounting wire transfer")
    assert len(vec) == 384
    norm = np.linalg.norm(vec)
    assert pytest.approx(norm, rel=1e-3) == 1.0


def test_semantic_similarity_topical_affinity():
    # Two similar Stripe billing problems
    vec_billing1 = VectorEmbedder.embed_text("Manual Stripe billing reconciliation with bank wire payments")
    vec_billing2 = VectorEmbedder.embed_text("Mercury bank wire transfer matching with Stripe invoice CSV")

    # One unrelated e-commerce returns problem
    vec_ecom = VectorEmbedder.embed_text("Shopify returns management and USPS QR code shipping label costs")

    sim_related = cosine_similarity(vec_billing1, vec_billing2)
    sim_unrelated = cosine_similarity(vec_billing1, vec_ecom)

    assert sim_related > sim_unrelated
    assert sim_related > 0.60


def test_clusterer_groups_similar_signals():
    signals = [
        {
            "id": "s1",
            "summary": "Stripe invoice reconciliation manual",
            "raw_quote": "We spend 5 hours matching Stripe invoices.",
            "category": "SaaS Operations",
            "embedding": VectorEmbedder.embed_text("Stripe invoice reconciliation manual bank wire transfer"),
        },
        {
            "id": "s2",
            "summary": "Bank wire matching with Stripe is tedious",
            "raw_quote": "Why doesn't Stripe match bank wire transfers automatically?",
            "category": "SaaS Operations",
            "embedding": VectorEmbedder.embed_text("Stripe bank wire transfer accounting reconciliation"),
        },
        {
            "id": "s3",
            "summary": "Shopify inventory sync lag",
            "raw_quote": "Shopify and Amazon inventory lag causes overselling.",
            "category": "E-Commerce",
            "embedding": VectorEmbedder.embed_text("Shopify inventory sync lag warehouse overselling"),
        }
    ]

    clusters = SemanticClusterer.cluster_signals(signals, similarity_threshold=0.60)
    assert len(clusters) >= 2  # SaaS Operations vs E-Commerce
    for c in clusters:
        assert c["coherence_score"] > 0.5
        assert len(c["centroid_embedding"]) == 384
