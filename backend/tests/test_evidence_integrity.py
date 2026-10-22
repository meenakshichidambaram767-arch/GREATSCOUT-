import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_evidence_integrity_and_no_duplicate_quotes():
    """Verify that opportunity detail returns evidence without duplicate highlight quotes."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
        # Fetch list of opportunities
        res = await ac.get("/api/v1/opportunities")
        assert res.status_code == 200
        data = res.json()
        items = data.get("items", [])
        if not items:
            pytest.skip("No opportunities in current database to test evidence integrity")

        first_opp_id = items[0]["id"]
        detail_res = await ac.get(f"/api/v1/opportunities/{first_opp_id}")
        assert detail_res.status_code == 200
        opp_data = detail_res.json()

        evidence = opp_data.get("evidence", [])
        # Check all quotes are non-empty and unique
        seen_quotes = set()
        for ev in evidence:
            quote = ev["highlight_quote"]
            assert len(quote) > 0
            assert quote not in seen_quotes, f"Duplicate quote found: {quote}"
            seen_quotes.add(quote)

            # Check source metadata integrity
            source = ev.get("source", {})
            assert "platform" in source
            assert "url" in source
            assert "is_synthetic" in source


@pytest.mark.asyncio
async def test_evidence_scores_7pillars_present():
    """Verify that opportunity detail returns the complete 7-pillar score breakdown."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
        res = await ac.get("/api/v1/opportunities")
        assert res.status_code == 200
        items = res.json().get("items", [])
        if not items:
            pytest.skip("No opportunities in current database to test scores")

        first_opp_id = items[0]["id"]
        detail_res = await ac.get(f"/api/v1/opportunities/{first_opp_id}")
        assert detail_res.status_code == 200
        scores = detail_res.json().get("scores", {})

        expected_keys = [
            "overall_score",
            "demand_score",
            "pain_intensity_score",
            "willingness_to_pay_score",
            "competitive_vacuum_score",
            "evidence_strength_score",
            "feasibility_score",
            "recency_score",
            "metadata"
        ]
        for key in expected_keys:
            assert key in scores, f"Missing score dimension: {key}"
