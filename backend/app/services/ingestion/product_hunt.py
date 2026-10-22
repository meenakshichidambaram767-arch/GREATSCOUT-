import logging
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.services.ingestion.base import BaseIngestionAdapter

logger = logging.getLogger(__name__)


class ProductHuntAdapter(BaseIngestionAdapter):
    """
    Ingests discussions, reviews, and community threads from Product Hunt via GraphQL API.
    Gracefully falls back if credentials are unconfigured.
    """

    GRAPHQL_ENDPOINT = "https://api.producthunt.com/v2/api/graphql"

    async def fetch_documents(self, limit: int = 50, category: str = "all") -> List[Dict[str, Any]]:
        token = settings.PRODUCT_HUNT_API_TOKEN
        if not token:
            logger.info("Product Hunt API token unconfigured; skipping live ingestion.")
            return []

        query = """
        query GetPosts($first: Int!) {
          posts(first: $first) {
            edges {
              node {
                id
                name
                tagline
                description
                url
                votesCount
                commentsCount
                createdAt
                user {
                  username
                  name
                }
              }
            }
          }
        }
        """

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(
                    self.GRAPHQL_ENDPOINT,
                    json={"query": query, "variables": {"first": limit}},
                    headers=headers
                )
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After", "unknown")
                    logger.warning(f"Product Hunt API rate limit hit (429). Retry after: {retry_after}")
                    return []

                if response.status_code != 200:
                    logger.warning(f"Product Hunt API returned status {response.status_code}: {response.text[:200]}")
                    return []

                data = response.json()
                if "errors" in data:
                    logger.warning(f"Product Hunt GraphQL errors: {data['errors']}")
                    return []

                edges = data.get("data", {}).get("posts", {}).get("edges", [])
                documents = []
                for edge in edges:
                    node = edge.get("node", {})
                    title = f"{node.get('name', '')} — {node.get('tagline', '')}"
                    content = node.get("description", "") or node.get("tagline", "")
                    documents.append({
                        "external_id": f"ph_{node.get('id')}",
                        "title": title,
                        "content": content,
                        "author": node.get("user", {}).get("username", "product_hunter"),
                        "url": node.get("url", "https://www.producthunt.com"),
                        "upvotes": node.get("votesCount", 0),
                        "comment_count": node.get("commentsCount", 0),
                        "is_synthetic": False,
                        "category": category,
                        "published_at": node.get("createdAt"),
                    })
                return documents
            except httpx.RequestError as exc:
                logger.warning(f"Product Hunt network request failed: {exc}")
                return []
            except Exception as e:
                logger.error(f"Product Hunt ingestion unexpected error: {e}")
                return []
