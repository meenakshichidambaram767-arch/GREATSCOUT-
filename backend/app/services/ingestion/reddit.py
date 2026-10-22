import logging
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any
from backend.app.core.config import settings
from backend.app.services.ingestion.base import BaseIngestionAdapter

logger = logging.getLogger(__name__)


class RedditAdapter(BaseIngestionAdapter):
    """
    Ingests discussions, complaints, and rants from Reddit (r/SaaS, r/startups, r/webdev).
    Uses public Reddit JSON feeds with configurable User-Agent or Reddit OAuth.
    """

    SUBREDDITS = ["SaaS", "startups", "webdev"]

    async def fetch_documents(self, limit: int = 50, category: str = "all") -> List[Dict[str, Any]]:
        user_agent = settings.REDDIT_USER_AGENT or "GreatScoutMarketIntel/1.0 (by /u/greatscout-bot)"
        headers = {
            "User-Agent": user_agent,
        }

        documents = []
        per_sub_limit = max(5, limit // len(self.SUBREDDITS))

        async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
            for sub in self.SUBREDDITS:
                url = f"https://www.reddit.com/r/{sub}/hot.json?limit={per_sub_limit}"
                try:
                    res = await client.get(url)
                    if res.status_code == 429:
                        retry_after = res.headers.get("Retry-After", "unknown")
                        logger.warning(f"Reddit rate limit encountered for r/{sub} (429). Retry after: {retry_after}")
                        continue
                    if res.status_code != 200:
                        logger.warning(f"Reddit r/{sub} returned HTTP {res.status_code}")
                        continue
                    data = res.json()
                    children = data.get("data", {}).get("children", [])
                    for child in children:
                        post = child.get("data", {})
                        title = post.get("title", "")
                        selftext = post.get("selftext", "")
                        if not selftext or len(selftext) < 30:
                            continue

                        permalink = post.get("permalink", "")
                        post_url = f"https://www.reddit.com{permalink}" if permalink else post.get("url", "")
                        created_utc = post.get("created_utc", 0)
                        pub_date = datetime.fromtimestamp(created_utc, tz=timezone.utc).isoformat() if created_utc else None

                        documents.append({
                            "external_id": f"reddit_{post.get('id')}",
                            "title": title,
                            "content": selftext,
                            "author": post.get("author", "redditor"),
                            "url": post_url,
                            "upvotes": post.get("ups", 0),
                            "comment_count": post.get("num_comments", 0),
                            "is_synthetic": False,
                            "category": "SaaS Operations" if sub == "SaaS" else "Developer Tools",
                            "published_at": pub_date,
                        })
                except httpx.RequestError as exc:
                    logger.warning(f"Reddit network request failed for r/{sub}: {exc}")
                except Exception as e:
                    logger.error(f"Reddit unexpected error parsing r/{sub}: {e}")

        return documents[:limit]
