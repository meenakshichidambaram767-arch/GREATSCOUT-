# GreatScout — System Architecture Document
**Tagline:** "Scout Smart, Build Better."

## 1. System Overview & Vision

GreatScout is an AI-powered market intelligence and product opportunity discovery platform. Unlike generic AI idea generators that invent hypothetical products, GreatScout works backwards from **real-world recurring user friction**:
1. Ingesting discussions, feature requests, rants, and workflow complaints from **Product Hunt** and **Reddit**.
2. Normalizing and validating unstructured posts and comments.
3. Extracting structured **Signals** (pain points, complaints, unmet needs, workarounds).
4. Generating **Semantic Embeddings** and clustering similar signals with **HDBSCAN / Cosine Density Clustering**.
5. Computing an **Explainable Opportunity Score** (Demand Frequency, Pain Intensity, Willingness to Pay, Competitive Vacuum).
6. Generating an **Evidence-Backed Opportunity Report** that links every thesis directly to original raw user quotes, authors, and source URLs.

```
+---------------------------------------------------------------------------------------+
|                                    DATA SOURCES                                       |
|  +---------------------------+  +----------------------+  +------------------------+  |
|  | Product Hunt GraphQL API  |  | Reddit PRAW / Feeds  |  | Realistic Synthetic    |  |
|  | (Discussions, Reviews)    |  | (r/SaaS, r/startups) |  | Demo Dataset Engine    |  |
|  +-------------+-------------+  +----------+-----------+  +-----------+------------+  |
+----------------|---------------------------|--------------------------|---------------+
                 v                           v                          v
+---------------------------------------------------------------------------------------+
|                              INGESTION & PREPROCESSING                                |
|  - Bounded background worker jobs with progress tracking                              |
|  - Content sanitization, deduplication (SHA-256 content hashes)                        |
|  - Metadata normalization (upvotes, author, comments, timestamps, permalinks)          |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                               AI SIGNAL EXTRACTION                                    |
|  - LLM extraction pipeline (OpenAI / Gemini / Anthropic / Local heuristic engine)     |
|  - Typed signal taxonomy: PAIN_POINT, COMPLAINT, FEATURE_REQUEST, UNMET_NEED, WORKAROUND|
|  - Severity score (1-5), sentiment polarity (-1.0 to 1.0), raw quote extraction       |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                          VECTOR EMBEDDINGS & CLUSTERING                               |
|  - Vector Embeddings (Sentence Transformers or high-performance embedding provider)   |
|  - Stored in PostgreSQL with pgvector (384/1536 dim) + cosine distance indexing       |
|  - Density-based clustering (HDBSCAN / Agglomerative) to discover cohesive themes     |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                        EXPLAINABLE OPPORTUNITY SCORING                                |
|  - Demand Frequency Score (volume + cross-community recurrence)                       |
|  - Pain Intensity Score (sentiment severity, emotional friction, urgency)            |
|  - Willingness-to-Pay Index (pricing mentions, commercial intent, enterprise budget)  |
|  - Competitive Vacuum Score (dissatisfaction with legacy tools, absence of leaders)   |
|  => Composite Opportunity Score (0 - 100)                                             |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                           OPPORTUNITY DOSSIER SYNTHESIS                               |
|  - Opportunity Title, Executive Problem Thesis, Target ICP Persona                    |
|  - Why Existing Tools Fail, Recommended Product Angle                                 |
|  - 100% Traceable Evidence Graph (Opportunity -> Cluster -> Signals -> Source Posts)  |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                          PRESENTATION & CLIENT APPLICATION                            |
|  - FastAPI Async REST API (Documentation, Pagination, Filtering, Analytics)           |
|  - React + TypeScript + Vite + Tailwind CSS + Recharts Dashboard                      |
|  - Explorer with multi-facet filters, deep-dive dossier view, citation inspector       |
+---------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
GREATSCOUT-/
├── backend/
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── dashboard.py  # Overview KPIs and recent activity
│   │   │   │   │   ├── sources.py    # Source configuration & status
│   │   │   │   │   ├── documents.py  # Ingested raw documents
│   │   │   │   │   ├── signals.py    # Extracted user signals
│   │   │   │   │   ├── opportunities.py # Opportunity catalog & dossiers
│   │   │   │   │   ├── analytics.py  # Market trends & category breakdowns
│   │   │   │   │   ├── jobs.py       # Background ingestion & processing jobs
│   │   │   │   │   └── health.py     # Health checks & system info
│   │   │   │   └── router.py         # Consolidated API router
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic BaseSettings & env configs
│   │   │   └── logging.py            # Structured logging
│   │   ├── db/
│   │   │   ├── base.py               # Declarative base & metadata
│   │   │   └── session.py            # Async engine, sessionmaker & vector extensions
│   │   ├── models/                   # SQLAlchemy 2.0 ORM models
│   │   │   ├── source.py
│   │   │   ├── document.py
│   │   │   ├── signal.py
│   │   │   ├── cluster.py
│   │   │   ├── opportunity.py
│   │   │   └── job.py
│   │   ├── schemas/                  # Pydantic v2 schemas
│   │   │   ├── document.py
│   │   │   ├── signal.py
│   │   │   ├── opportunity.py
│   │   │   ├── analytics.py
│   │   │   └── job.py
│   │   ├── services/
│   │   │   ├── ingestion/            # Raw data ingestion
│   │   │   │   ├── base.py
│   │   │   │   ├── product_hunt.py
│   │   │   │   ├── reddit.py
│   │   │   │   └── synthetic_demo.py
│   │   │   ├── preprocessing/        # Cleaning, dedup, validation
│   │   │   │   └── cleaner.py
│   │   │   ├── ai/                   # LLM Signal extraction & synthesis
│   │   │   │   ├── extractor.py
│   │   │   │   ├── synthesizer.py
│   │   │   │   └── prompt_templates.py
│   │   │   ├── vector/               # Embeddings & Clustering
│   │   │   │   ├── embedder.py
│   │   │   │   └── clusterer.py
│   │   │   └── scoring/              # Opportunity scoring engine
│   │   │       └── opportunity_scorer.py
│   │   └── main.py                   # FastAPI application factory
│   ├── tests/                        # Pytest suite
│   │   ├── conftest.py
│   │   ├── test_api.py
│   │   ├── test_cleaner.py
│   │   ├── test_clustering.py
│   │   └── test_scoring.py
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/               # Badges, Buttons, Cards, Modals, Loaders
│   │   │   ├── layout/               # Header, Sidebar, Container, Footer
│   │   │   ├── dashboard/            # KPI cards, Trend charts, Activity feed
│   │   │   ├── opportunities/        # OpportunityCard, FilterBar, ScoreBreakdown
│   │   │   ├── signals/              # SignalList, QuoteInspector
│   │   │   └── jobs/                 # JobTriggerModal, JobProgressBar
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── pages/                    # Route pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── OpportunitiesPage.tsx
│   │   │   ├── OpportunityDetailPage.tsx
│   │   │   ├── SignalsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── IngestionJobsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/                 # Axios API clients & endpoints
│   │   │   ├── api.ts
│   │   │   ├── opportunitiesService.ts
│   │   │   ├── jobsService.ts
│   │   │   └── analyticsService.ts
│   │   ├── types/                    # TypeScript interfaces
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                 # Custom Tailwind & theme styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── docs/
    ├── ARCHITECTURE.md
    ├── IMPLEMENTATION_PLAN.md
    ├── API_CONTRACT.md
    └── DATABASE_SCHEMA.md
```

---

## 3. Core Architectural Principles

1. **Strict Problem-First Discovery**:
   Opportunities are never synthesized from thin air. Every opportunity must be supported by an HDBSCAN cluster containing at least $N$ distinct user signals from validated documents.

2. **Complete Source Traceability**:
   Clicking any claim or score on the frontend allows inspecting the underlying cluster, the extracted signals, the exact original user quotes, and a direct link to the Product Hunt or Reddit post.

3. **Dual Execution Mode (Zero-Credential Demo vs Live Production)**:
   - **Demo Mode**: Ships with a rich synthetic dataset mimicking real developer/founder pain points across 5 major software categories (AI Developer Tools, SaaS Billing, Cloud Cost Optimization, Remote Team Sync, E-Commerce Operations). Every synthetic record is explicitly tagged with `is_synthetic: true`.
   - **Live Mode**: Connects to Product Hunt GraphQL API and Reddit PRAW API with configurable rate limits, token rotations, and background workers.

4. **Dual Database Dialect Support**:
   - Production / Docker: PostgreSQL 16 with the `pgvector` extension for high-dimensional vector search.
   - Development / Testing: SQLAlchemy abstraction allows running tests and local environments seamlessly with SQLite fallback while retaining full schema integrity.

5. **Explainable Opportunity Score Formula**:
   $$\text{Opportunity Score} = w_1 \cdot \text{Demand} + w_2 \cdot \text{Intensity} + w_3 \cdot \text{WillingnessToPay} + w_4 \cdot \text{CompetitiveVacuum}$$
   Where:
   - **Demand Score (30%)**: Normalized signal frequency and cross-source occurrence count.
   - **Pain Intensity Score (30%)**: Sentiment negativity, emotional urgency, and severity ratings (1-5).
   - **Willingness to Pay (20%)**: Keyword occurrences indicating enterprise budget, commercial subscriptions, or cost of workarounds.
   - **Competitive Vacuum (20%)**: Mentions of unsatisfactory incumbent tools, lack of adequate software, or negative reviews of existing alternatives.
