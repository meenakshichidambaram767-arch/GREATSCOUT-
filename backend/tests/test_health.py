import pytest


@pytest.mark.asyncio
async def test_health_check_endpoint(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["app_name"] == "GreatScout"
    assert data["tagline"] == "Scout Smart, Build Better."
    assert data["database"] == "connected"
    assert data["vector_support"] is True
    assert "version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()

    assert data["app"] == "GreatScout"
    assert data["docs"] == "/docs"
