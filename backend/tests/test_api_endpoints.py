import pytest


@pytest.mark.asyncio
async def test_dashboard_stats_endpoint(client):
    response = await client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_documents" in data
    assert "total_signals" in data
    assert "total_opportunities" in data
    assert "average_opportunity_score" in data
    assert "sources_breakdown" in data
    assert "signal_types_breakdown" in data


@pytest.mark.asyncio
async def test_analytics_trends_endpoint(client):
    response = await client.get("/api/v1/analytics/trends?timeframe=30d")
    assert response.status_code == 200
    data = response.json()
    assert "category_distribution" in data
    assert "sentiment_timeline" in data
    assert len(data["sentiment_timeline"]) > 0


@pytest.mark.asyncio
async def test_sources_endpoint(client):
    response = await client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    codes = [s["code"] for s in data]
    assert "demo" in codes
    assert "product_hunt" in codes
    assert "reddit" in codes


@pytest.mark.asyncio
async def test_jobs_ingest_and_list(client):
    payload = {
        "source_code": "demo",
        "category": "Developer Tools",
        "limit": 10,
        "run_pipeline": True
    }
    response = await client.post("/api/v1/jobs/ingest", json=payload)
    assert response.status_code == 202
    res_data = response.json()
    assert "job_id" in res_data
    job_id = res_data["job_id"]

    # List jobs
    list_res = await client.get("/api/v1/jobs")
    assert list_res.status_code == 200
    jobs = list_res.json()
    assert len(jobs) >= 1

    # Get specific job
    get_res = await client.get(f"/api/v1/jobs/{job_id}")
    assert get_res.status_code == 200
    job_detail = get_res.json()
    assert job_detail["id"] == job_id


@pytest.mark.asyncio
async def test_opportunities_catalog_filtering(client):
    response = await client.get("/api/v1/opportunities?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data


@pytest.mark.asyncio
async def test_signals_and_documents_endpoints(client):
    sig_res = await client.get("/api/v1/signals?limit=10")
    assert sig_res.status_code == 200
    assert isinstance(sig_res.json(), list)

    doc_res = await client.get("/api/v1/documents?limit=10")
    assert doc_res.status_code == 200
    assert isinstance(doc_res.json(), list)
