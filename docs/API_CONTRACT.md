# GreatScout — REST API Contract

Base URL: `/api/v1`

---

## 1. System & Health Endpoints

### `GET /health`
Returns system status, database connectivity, and configured AI providers.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "database": "connected",
  "vector_support": true,
  "timestamp": "2026-10-18T14:30:00Z"
}
```

---

## 2. Dashboard & Analytics Endpoints

### `GET /dashboard/stats`
Summary indicators for metric cards and top opportunities.

**Response `200 OK`**:
```json
{
  "total_documents": 1420,
  "total_signals": 3890,
  "total_clusters": 48,
  "total_opportunities": 24,
  "average_opportunity_score": 78.4,
  "sources_breakdown": [
    { "source": "Product Hunt", "count": 680, "percentage": 47.9 },
    { "source": "Reddit", "count": 740, "percentage": 52.1 }
  ],
  "signal_types_breakdown": [
    { "type": "pain_point", "count": 1820 },
    { "type": "complaint", "count": 910 },
    { "type": "feature_request", "count": 640 },
    { "type": "unmet_need", "count": 380 },
    { "type": "workflow_problem", "count": 140 }
  ],
  "recent_activity": [
    {
      "id": "uuid",
      "timestamp": "2026-10-18T14:20:00Z",
      "action": "opportunity_generated",
      "description": "Synthesized new high-scoring opportunity: 'Real-Time Stripe Churn Recovery for Micro-SaaS'"
    }
  ]
}
```

### `GET /analytics/trends`
Trendlines and category distribution.

**Query Parameters**:
- `timeframe`: `7d` | `30d` | `90d` | `all` (default: `30d`)

**Response `200 OK`**:
```json
{
  "category_distribution": [
    { "category": "Developer Tools", "count": 9, "avg_score": 84.2 },
    { "category": "SaaS Operations", "count": 6, "avg_score": 81.0 },
    { "category": "AI Automation", "count": 5, "avg_score": 79.5 },
    { "category": "E-Commerce", "count": 4, "avg_score": 72.3 }
  ],
  "sentiment_timeline": [
    { "date": "2026-10-11", "negative_signals": 42, "critical_urgency": 18 },
    { "date": "2026-10-12", "negative_signals": 55, "critical_urgency": 24 }
  ]
}
```

---

## 3. Opportunities Endpoints

### `GET /opportunities`
List opportunities with multi-faceted filtering, sorting, and pagination.

**Query Parameters**:
- `search`: string (filters title, problem thesis, target audience)
- `category`: string (optional)
- `min_score`: float (default: 0)
- `max_score`: float (default: 100)
- `status`: string (`all`, `active`, `starred`, `archived`)
- `sort_by`: string (`overall_score`, `demand_score`, `pain_intensity_score`, `willingness_to_pay_score`, `created_at`)
- `sort_order`: `asc` | `desc` (default: `desc`)
- `page`: integer (default: 1)
- `page_size`: integer (default: 10, max: 100)

**Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "d3b07384-d113-4e4b-9ffb-1830e0147e4d",
      "title": "Unified API Error Observability for Serverless Workflows",
      "target_audience": "Full-Stack & Backend Developers building on Vercel/AWS Lambda",
      "category": "Developer Tools",
      "problem_thesis": "Developers waste 4-6 hours weekly tracing silent failures across distributed webhooks and serverless edge functions without actionable stack traces.",
      "overall_score": 88.5,
      "demand_score": 92.0,
      "pain_intensity_score": 87.5,
      "willingness_to_pay_score": 84.0,
      "competitive_vacuum_score": 90.0,
      "confidence_level": "high",
      "signal_count": 34,
      "status": "active",
      "created_at": "2026-10-18T10:00:00Z"
    }
  ],
  "total": 24,
  "page": 1,
  "page_size": 10,
  "total_pages": 3
}
```

### `GET /opportunities/{id}`
Returns complete opportunity dossier and full evidence tree down to raw source citations.

**Response `200 OK`**:
```json
{
  "id": "d3b07384-d113-4e4b-9ffb-1830e0147e4d",
  "title": "Unified API Error Observability for Serverless Workflows",
  "target_audience": "Full-Stack & Backend Developers building on Vercel/AWS Lambda",
  "category": "Developer Tools",
  "problem_thesis": "Developers waste 4-6 hours weekly tracing silent failures across distributed webhooks and serverless edge functions without actionable stack traces.",
  "why_current_solutions_fail": "Datadog and Sentry are cost-prohibitive for small teams ($400+/mo) and require heavy agent configuration. Lightweight loggers fail to link asynchronous payload payloads.",
  "suggested_solution": "Drop-in 2-line SDK that automatically correlates webhook payloads with edge serverless retries, showing immediate visual replay of failed HTTP payloads.",
  "scores": {
    "overall_score": 88.5,
    "demand_score": 92.0,
    "pain_intensity_score": 87.5,
    "willingness_to_pay_score": 84.0,
    "competitive_vacuum_score": 90.0
  },
  "confidence_level": "high",
  "status": "active",
  "cluster": {
    "id": "c1f09230-1b22-441f-82a1-fa44923e41ab",
    "label": "Serverless Webhook Failure & Log Sprawl",
    "coherence_score": 0.89,
    "signal_count": 34
  },
  "evidence": [
    {
      "signal_id": "s1a07384-1111-4e4b-9ffb-1830e0147e01",
      "signal_type": "pain_point",
      "severity": 5,
      "sentiment_score": -0.85,
      "urgency_score": 0.9,
      "highlight_quote": "We lost $3,200 yesterday because a Stripe customer.subscription.deleted webhook timed out silently in our AWS Lambda without throwing a catchable error.",
      "relevance_score": 0.96,
      "source": {
        "platform": "reddit",
        "community": "r/SaaS",
        "title": "What's the hardest debugging session you had this month?",
        "url": "https://reddit.com/r/SaaS/comments/example123",
        "author": "tech_lead_dan",
        "published_at": "2026-10-15T18:30:00Z",
        "is_synthetic": true
      }
    }
  ],
  "created_at": "2026-10-18T10:00:00Z",
  "updated_at": "2026-10-18T10:00:00Z"
}
```

### `PATCH /opportunities/{id}`
Update opportunity status (e.g. star, archive, unstar).

**Request Body**:
```json
{
  "status": "starred"
}
```

---

## 4. Ingestion & Jobs Endpoints

### `GET /sources`
List configured data sources and connection status.

### `POST /jobs/ingest`
Trigger a background data ingestion job.

**Request Body**:
```json
{
  "source_code": "demo", 
  "category": "all",
  "limit": 50,
  "run_pipeline": true
}
```

**Response `202 Accepted`**:
```json
{
  "job_id": "j9810384-d113-4e4b-9ffb-1830e0147e99",
  "status": "running",
  "message": "Demo ingestion and AI analysis pipeline triggered successfully."
}
```

### `GET /jobs`
List background ingestion and AI processing jobs.

### `GET /jobs/{id}`
Get detailed status, progress, and execution logs for a job.

---

## 5. Raw Documents & Signals Endpoints

### `GET /documents`
List ingested documents with source badges and validation filters.

### `GET /signals`
Browse individual extracted signals filtered by type (`pain_point`, `complaint`, `feature_request`), severity, and keyword.
