from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseIngestionAdapter(ABC):
    """Abstract base class for data source ingestion adapters."""

    @abstractmethod
    async def fetch_documents(self, limit: int = 50, category: str = "all") -> List[Dict[str, Any]]:
        """
        Fetches raw post/discussion documents from upstream source.
        Returns a list of dicts with:
        - external_id
        - title
        - content
        - author
        - url
        - upvotes
        - comment_count
        - is_synthetic
        - published_at
        """
        pass
