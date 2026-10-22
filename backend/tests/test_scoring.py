import pytest
from backend.app.services.scoring.opportunity_scorer import OpportunityScorer


def test_scorer_empty_signals():
    scores = OpportunityScorer.calculate_scores([])
    assert scores["overall_score"] == 0.0
    assert scores["demand_score"] == 0.0
    assert scores["pain_intensity_score"] == 0.0
    assert scores["willingness_to_pay_score"] == 0.0
    assert scores["competitive_vacuum_score"] == 0.0
    assert scores["evidence_strength_score"] == 0.0
    assert scores["feasibility_score"] == 0.0
    assert scores["recency_score"] == 0.0


def test_scorer_explainable_7pillar_breakdown():
    signals = [
        {
            "severity": 5,
            "sentiment_score": -0.85,
            "urgency_score": 0.9,
            "commercial_intent_score": 0.8,
            "competitor_mentioned": "Sentry",
            "source_code": "reddit",
        },
        {
            "severity": 4,
            "sentiment_score": -0.75,
            "urgency_score": 0.8,
            "commercial_intent_score": 0.85,
            "competitor_mentioned": "Datadog",
            "source_code": "product_hunt",
        },
        {
            "severity": 5,
            "sentiment_score": -0.90,
            "urgency_score": 0.95,
            "commercial_intent_score": 0.90,
            "competitor_mentioned": "NewRelic",
            "source_code": "reddit",
        },
    ]

    scores = OpportunityScorer.calculate_scores(signals)

    # 7 dimensions present
    assert "demand_score" in scores
    assert "pain_intensity_score" in scores
    assert "willingness_to_pay_score" in scores
    assert "competitive_vacuum_score" in scores
    assert "evidence_strength_score" in scores
    assert "feasibility_score" in scores
    assert "recency_score" in scores
    assert "metadata" in scores

    # Cross-source bonus should increase demand
    assert scores["demand_score"] >= 80.0
    # High severity and negative sentiment should yield strong pain score
    assert scores["pain_intensity_score"] >= 75.0
    # Strong commercial intent should yield high WTP
    assert scores["willingness_to_pay_score"] >= 75.0
    # Mentioning multiple competitors should elevate competitive vacuum score
    assert scores["competitive_vacuum_score"] >= 80.0
    # Overall score should be in high confidence range
    assert scores["overall_score"] >= 75.0

    # Verify metadata transparency separation
    breakdown = scores["metadata"]["metrics_breakdown"]
    assert breakdown["demand"]["type"] == "measured"
    assert breakdown["pain_intensity"]["type"] == "measured"
    assert breakdown["evidence_strength"]["type"] == "measured"
    assert breakdown["feasibility"]["type"] == "heuristic_estimate"
    assert breakdown["recency"]["type"] == "heuristic_estimate"


def test_scorer_composite_7weight_formula():
    """Verifies that overall_score exactly reflects 7-pillar weighted combination."""
    signals = [
        {
            "severity": 3,
            "sentiment_score": -0.5,
            "urgency_score": 0.5,
            "commercial_intent_score": 0.0,
            "competitor_mentioned": None,
            "source_code": "demo",
        }
    ]
    scores = OpportunityScorer.calculate_scores(signals)
    computed = (
        0.25 * scores["demand_score"] +
        0.25 * scores["pain_intensity_score"] +
        0.15 * scores["evidence_strength_score"] +
        0.15 * scores["willingness_to_pay_score"] +
        0.10 * scores["competitive_vacuum_score"] +
        0.05 * scores["feasibility_score"] +
        0.05 * scores["recency_score"]
    )
    assert pytest.approx(scores["overall_score"], abs=0.1) == round(computed, 1)


def test_scorer_boundary_values():
    """Verifies scores stay strictly clamped between 0 and 100."""
    max_signals = [
        {
            "severity": 5,
            "sentiment_score": -1.0,
            "urgency_score": 1.0,
            "commercial_intent_score": 1.0,
            "competitor_mentioned": "LegacyCorp",
            "source_code": f"source_{i % 5}",
        }
        for i in range(25)
    ]
    scores = OpportunityScorer.calculate_scores(max_signals)
    for key, val in scores.items():
        if key != "metadata":
            assert 0.0 <= val <= 100.0
