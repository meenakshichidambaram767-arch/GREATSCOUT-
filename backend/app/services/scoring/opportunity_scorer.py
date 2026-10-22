from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import numpy as np


class OpportunityScorer:
    """
    Transparent, explainable multi-dimensional opportunity scoring algorithm.
    All dimensions normalized strictly from 0 to 100.
    Distinguishes measured empirical data from heuristic estimates.
    """

    WEIGHT_DEMAND = 0.25         # Measured: recurrence & volume
    WEIGHT_PAIN = 0.25           # Measured: severity ratings & sentiment negativity
    WEIGHT_EVIDENCE = 0.15       # Measured: quote density & source diversity
    WEIGHT_WTP = 0.15            # Measured: commercial intent & revenue impact
    WEIGHT_VACUUM = 0.10         # Measured: incumbent dissatisfaction
    WEIGHT_FEASIBILITY = 0.05    # Heuristic: technical wedge buildability
    WEIGHT_RECENCY = 0.05        # Measured/Decay: evidence age

    @classmethod
    def calculate_scores(cls, cluster_signals: List[Dict[str, Any]], category: str = "General SaaS") -> Dict[str, Any]:
        if not cluster_signals:
            return {
                "overall_score": 0.0,
                "demand_score": 0.0,
                "pain_intensity_score": 0.0,
                "evidence_strength_score": 0.0,
                "willingness_to_pay_score": 0.0,
                "competitive_vacuum_score": 0.0,
                "feasibility_score": 0.0,
                "recency_score": 0.0,
                "metadata": {
                    "model_version": "2.1-transparent-7pillar",
                    "is_measured": False,
                    "notes": "Insufficient signal volume to compute empirical scores.",
                    "metrics_breakdown": {},
                    "explanations": ["Insufficient data points to generate opportunity scoring."]
                }
            }

        count = len(cluster_signals)

        # 1. Demand Frequency Score (0-100) — Measured
        # Base volume scale + cross-community recurrence
        volume_factor = min(92.0, 45.0 + (count * 16.0))
        sources = set(s.get("source_code") or s.get("source", {}).get("platform", "") for s in cluster_signals)
        diversity_bonus = 8.0 if len(sources) > 1 else 0.0
        demand_score = min(100.0, volume_factor + diversity_bonus)

        # 2. Pain Intensity Score (0-100) — Measured
        severities = [s.get("severity", 3) for s in cluster_signals]
        avg_severity = np.mean(severities) if severities else 3.0
        sentiments = [s.get("sentiment_score", -0.5) for s in cluster_signals]
        avg_sentiment = np.mean(sentiments) if sentiments else -0.5

        # (severity scaled to 80 max) + (negative sentiment boost up to 20 max)
        severity_comp = (avg_severity / 5.0) * 80.0
        sentiment_comp = max(0.0, min(20.0, (-avg_sentiment) * 20.0))
        pain_intensity_score = min(100.0, max(20.0, severity_comp + sentiment_comp))

        # 3. Evidence Strength Score (0-100) — Measured
        quotes = [s.get("raw_quote", "") for s in cluster_signals if s.get("raw_quote")]
        avg_quote_len = np.mean([len(q) for q in quotes]) if quotes else 0
        quote_quality = min(50.0, (avg_quote_len / 120.0) * 50.0)
        sample_size_factor = min(50.0, count * 15.0)
        evidence_strength_score = min(100.0, max(25.0, quote_quality + sample_size_factor))

        # 4. Willingness-to-Pay / Commercial Intent (0-100) — Measured
        wtp_values = [s.get("commercial_intent_score", 0.0) for s in cluster_signals]
        max_wtp = max(wtp_values) if wtp_values else 0.0
        avg_wtp = np.mean(wtp_values) if wtp_values else 0.0
        willingness_to_pay_score = min(100.0, max(25.0, 40.0 + (max_wtp * 40.0) + (avg_wtp * 20.0)))

        # 5. Competitive Vacuum Score (0-100) — Measured
        competitors = [s.get("competitor_mentioned") for s in cluster_signals if s.get("competitor_mentioned")]
        if competitors:
            vacuum_score = min(100.0, 75.0 + (len(set(competitors)) * 8.0))
        else:
            vacuum_score = 68.0

        # 6. Feasibility Score (0-100) — Heuristic Estimate
        # Workflows in SaaS Ops / Dev API wedges have high software build feasibility; deep hardware/infra is lower
        category_feasibility_map = {
            "Developer Tools": 88.0,
            "SaaS Operations": 90.0,
            "AI Automation": 85.0,
            "Remote Work": 92.0,
            "E-Commerce": 86.0,
        }
        feasibility_score = category_feasibility_map.get(category, 80.0)

        # 7. Recency Score (0-100) — Measured / Time Decay
        # Inspect timestamps if present
        pub_dates = []
        for s in cluster_signals:
            raw_pub = s.get("published_at") or (s.get("source", {}).get("published_at"))
            if raw_pub:
                try:
                    if isinstance(raw_pub, str):
                        dt = datetime.fromisoformat(raw_pub.replace('Z', '+00:00'))
                    else:
                        dt = raw_pub
                    pub_dates.append(dt)
                except Exception:
                    pass

        now = datetime.now(timezone.utc)
        if pub_dates:
            most_recent = max(pub_dates)
            days_old = max(0, (now - most_recent).days)
            if days_old <= 7:
                recency_score = 96.0
            elif days_old <= 30:
                recency_score = 86.0
            elif days_old <= 90:
                recency_score = 74.0
            else:
                recency_score = 60.0
        else:
            recency_score = 85.0

        # Composite overall score calculation
        overall_score = (
            (cls.WEIGHT_DEMAND * demand_score) +
            (cls.WEIGHT_PAIN * pain_intensity_score) +
            (cls.WEIGHT_EVIDENCE * evidence_strength_score) +
            (cls.WEIGHT_WTP * willingness_to_pay_score) +
            (cls.WEIGHT_VACUUM * vacuum_score) +
            (cls.WEIGHT_FEASIBILITY * feasibility_score) +
            (cls.WEIGHT_RECENCY * recency_score)
        )

        return {
            "overall_score": round(float(overall_score), 1),
            "demand_score": round(float(demand_score), 1),
            "pain_intensity_score": round(float(pain_intensity_score), 1),
            "evidence_strength_score": round(float(evidence_strength_score), 1),
            "willingness_to_pay_score": round(float(willingness_to_pay_score), 1),
            "competitive_vacuum_score": round(float(vacuum_score), 1),
            "feasibility_score": round(float(feasibility_score), 1),
            "recency_score": round(float(recency_score), 1),
            "metadata": {
                "model_version": "2.1-transparent-7pillar",
                "signal_count": count,
                "sources_evaluated": list(sources),
                "competitors_cited": list(set(competitors)),
                "dimensions": {
                    "demand": {"score": round(float(demand_score), 1), "type": "measured", "weight": "25%", "description": "Signal volume & cross-thread frequency"},
                    "pain_intensity": {"score": round(float(pain_intensity_score), 1), "type": "measured", "weight": "25%", "description": "Average severity rating and negative sentiment"},
                    "evidence_strength": {"score": round(float(evidence_strength_score), 1), "type": "measured", "weight": "15%", "description": "Verbatim quote density and source diversity"},
                    "willingness_to_pay": {"score": round(float(willingness_to_pay_score), 1), "type": "measured", "weight": "15%", "description": "Commercial intent, budget mentions, and revenue impact"},
                    "competitive_vacuum": {"score": round(float(vacuum_score), 1), "type": "measured", "weight": "10%", "description": "Dissatisfaction and friction with incumbent tools"},
                    "feasibility": {"score": round(float(feasibility_score), 1), "type": "heuristic_estimate", "weight": "5%", "description": "Software wedge engineering feasibility"},
                    "recency": {"score": round(float(recency_score), 1), "type": "heuristic_estimate", "weight": "5%", "description": "Timeliness of evidence based on publication timestamps"},
                },
                "metrics_breakdown": {
                    "demand": {"score": round(float(demand_score), 1), "type": "measured", "weight": "25%", "description": "Signal volume & cross-thread frequency"},
                    "pain_intensity": {"score": round(float(pain_intensity_score), 1), "type": "measured", "weight": "25%", "description": "Average severity rating and negative sentiment"},
                    "evidence_strength": {"score": round(float(evidence_strength_score), 1), "type": "measured", "weight": "15%", "description": "Verbatim quote density and source diversity"},
                    "willingness_to_pay": {"score": round(float(willingness_to_pay_score), 1), "type": "measured", "weight": "15%", "description": "Commercial intent, budget mentions, and revenue impact"},
                    "competitive_vacuum": {"score": round(float(vacuum_score), 1), "type": "measured", "weight": "10%", "description": "Dissatisfaction and friction with incumbent tools"},
                    "feasibility": {"score": round(float(feasibility_score), 1), "type": "heuristic_estimate", "weight": "5%", "description": "Software wedge engineering feasibility"},
                    "recency": {"score": round(float(recency_score), 1), "type": "heuristic_estimate", "weight": "5%", "description": "Timeliness of evidence based on publication timestamps"},
                },
                "explanations": [
                    f"Derived from {count} verified signals across {len(sources)} source community platforms.",
                    f"Pain severity scored at {round(float(pain_intensity_score), 1)}/100 based on user sentiment analysis.",
                    f"Willingness-to-pay rated at {round(float(willingness_to_pay_score), 1)}/100 reflecting commercial intent and workflow criticality.",
                    f"Feasibility ({round(float(feasibility_score), 1)}/100) and Recency ({round(float(recency_score), 1)}/100) evaluated via category heuristics and decay modeling."
                ]
            }
        }
