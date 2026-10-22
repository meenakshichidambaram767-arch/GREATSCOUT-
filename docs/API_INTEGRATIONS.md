# GreatScout — External API Integrations Guide

**Tagline:** Scout Smart, Build Better.

---

## 1. Overview

GreatScout supports live data ingestion from developer and entrepreneur communities to detect emerging product opportunities. The ingestion engine is built on modular adapters that enforce:
- Safe fallback when API credentials are absent.
- Standardized HTTP 429 rate limit backoff.
- Network exception handling with zero server crashes.
- Explicit tagging of all records (`is_synthetic: false` for live data, `is_synthetic: true` for demo seed data).

---

## 2. Supported Platforms

### 1. Product Hunt API (GraphQL v2)

- **Endpoint**: `https://api.producthunt.com/v2/api/graphql`
- **Authentication**: Bearer Token via HTTP Header: `Authorization: Bearer <PRODUCT_HUNT_API_TOKEN>`
- **Query Strategy**: Fetches posts, maker comments, user discussions, and votes:
```graphql
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
```
- **Rate Limit Handling**: Product Hunt enforces hourly point limits. When a `429 Too Many Requests` status is returned, the adapter reads the `Retry-After` response header, emits a structured warning log, and safely exits without crashing the pipeline.
- **Offline / Unconfigured Mode**: If `PRODUCT_HUNT_API_TOKEN` is unset or blank in `.env`, the adapter logs an informational notice and returns an empty list `[]`, allowing local demo pipelines to execute normally.

---

### 2. Reddit API (JSON Feeds & OAuth)

- **Target Communities**:
  - `r/SaaS`: B2B software complaints, pricing rants, migration frustrations.
  - `r/startups`: Founder operational bottlenecks, tooling struggles.
  - `r/webdev`: Developer API tooling gaps, infrastructure friction.
- **Protocol**: HTTP GET on subreddit hot feeds: `https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}`
- **User-Agent Requirement**: Reddit requires a distinctive `User-Agent` header. Configurable via `REDDIT_USER_AGENT` (defaults to `GreatScoutMarketIntel/1.0 (by /u/greatscout-bot)`).
- **Validation**: Submissions with text shorter than 30 characters are filtered out as low-information content.
- **Rate Limit Handling**: When Reddit returns HTTP 429, the adapter logs the incident and skips the rate-limited subreddit during the current job run.

---

## 3. Environment Variables

To activate live external ingestion, define the following variables in your `.env` file:

```bash
# Product Hunt Developer Token
PRODUCT_HUNT_API_TOKEN=your_product_hunt_developer_token_here

# Reddit User-Agent (Mandatory for Reddit HTTP requests)
REDDIT_USER_AGENT=GreatScoutMarketIntel/1.0 (by /u/your_reddit_username)

# Optional Reddit OAuth credentials (for high-volume authenticated calls)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

---

## 4. Mocked Testing Strategy

To ensure zero external network dependencies during automated CI/CD and local development:
- All external API connectors are unit-tested using `unittest.mock.AsyncMock` and `patch`.
- Test suite located at `backend/tests/test_adapters.py`:
  - `test_product_hunt_adapter_unconfigured_token`: Verifies graceful empty list return without token.
  - `test_product_hunt_adapter_mocked_success`: Verifies GraphQL response parsing and field mapping.
  - `test_product_hunt_adapter_rate_limit_429`: Verifies 429 rate limit backoff handling.
  - `test_reddit_adapter_mocked_success`: Verifies Reddit post parsing and length filtering.
  - `test_reddit_adapter_rate_limit_429`: Verifies Reddit 429 response recovery.
- Run tests at any time with:
```bash
./backend/venv/Scripts/python -m pytest backend/tests/test_adapters.py -v
```
