import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from backend.app.services.ingestion.product_hunt import ProductHuntAdapter
from backend.app.services.ingestion.reddit import RedditAdapter


@pytest.mark.asyncio
async def test_product_hunt_adapter_unconfigured_token():
    adapter = ProductHuntAdapter()
    with patch("backend.app.services.ingestion.product_hunt.settings.PRODUCT_HUNT_API_TOKEN", None):
        docs = await adapter.fetch_documents(limit=10)
        assert docs == []


@pytest.mark.asyncio
async def test_product_hunt_adapter_mocked_success():
    adapter = ProductHuntAdapter()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "posts": {
                "edges": [
                    {
                        "node": {
                            "id": "12345",
                            "name": "CloudOps Monitor",
                            "tagline": "Real-time anomaly detector for Kubernetes",
                            "description": "Developers waste hours debugging pods.",
                            "url": "https://www.producthunt.com/posts/cloudops-monitor",
                            "votesCount": 142,
                            "commentsCount": 18,
                            "createdAt": "2026-03-15T12:00:00Z",
                            "user": {"username": "k8s_dev", "name": "Alex Dev"},
                        }
                    }
                ]
            }
        }
    }

    with patch("backend.app.services.ingestion.product_hunt.settings.PRODUCT_HUNT_API_TOKEN", "ph_test_token_123"):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
            docs = await adapter.fetch_documents(limit=5)
            assert len(docs) == 1
            doc = docs[0]
            assert doc["external_id"] == "ph_12345"
            assert "CloudOps Monitor" in doc["title"]
            assert doc["is_synthetic"] is False
            assert doc["upvotes"] == 142
            assert doc["author"] == "k8s_dev"


@pytest.mark.asyncio
async def test_product_hunt_adapter_rate_limit_429():
    adapter = ProductHuntAdapter()
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.headers = {"Retry-After": "60"}

    with patch("backend.app.services.ingestion.product_hunt.settings.PRODUCT_HUNT_API_TOKEN", "ph_test_token_123"):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
            docs = await adapter.fetch_documents(limit=5)
            assert docs == []


@pytest.mark.asyncio
async def test_reddit_adapter_mocked_success():
    adapter = RedditAdapter()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "children": [
                {
                    "data": {
                        "id": "abc1234",
                        "title": "Why is cloud billing so broken?",
                        "selftext": "We just spent $12,000 on unexpected AWS NAT gateway fees. How are there no good tools for this?",
                        "author": "devops_guru",
                        "permalink": "/r/SaaS/comments/abc1234/cloud_billing/",
                        "ups": 89,
                        "num_comments": 42,
                        "created_utc": 1773500000,
                    }
                },
                {
                    "data": {
                        "id": "short1",
                        "title": "Quick question",
                        "selftext": "Too short",  # < 30 chars, should be filtered out
                        "author": "brief_user",
                        "permalink": "/r/SaaS/comments/short1/quick/",
                        "ups": 2,
                        "num_comments": 1,
                        "created_utc": 1773500000,
                    }
                }
            ]
        }
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        docs = await adapter.fetch_documents(limit=5)
        # Should include only the long post, not the short one
        assert len(docs) >= 1
        assert docs[0]["external_id"] == "reddit_abc1234"
        assert docs[0]["is_synthetic"] is False
        assert "AWS NAT gateway" in docs[0]["content"]
        assert docs[0]["upvotes"] == 89


@pytest.mark.asyncio
async def test_reddit_adapter_rate_limit_429():
    adapter = RedditAdapter()
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.headers = {"Retry-After": "30"}

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_response):
        docs = await adapter.fetch_documents(limit=5)
        assert docs == []
