# GreatScout — AI-Powered Market Intelligence Platform
> **Tagline:** *"Scout Smart, Build Better."*

GreatScout is an end-to-end market intelligence and product opportunity discovery platform designed for founders, entrepreneurs, developers, and product managers. 

Instead of functioning as a random AI startup idea generator, GreatScout works backwards from **real-world recurring user friction**: analyzing discussions, complaints, feature requests, and unmet needs from **Product Hunt** and **Reddit**, extracting structured friction signals, clustering them semantically with vector embeddings, and computing an explainable opportunity score with 100% source traceability.

---

## 🌟 Core Features

1. **Executive Intelligence Dashboard**:
   - Live KPI counters for Ingested Documents, Extracted Signals, Semantic Clusters, and Discovered Opportunities.
   - Interactive Source Breakdown (Product Hunt vs Reddit volume) and Friction Taxonomy distributions.
   - High-scoring product gap showcase with direct links to deep-dive dossiers.

2. **Modular Data Ingestion Engine**:
   - **Product Hunt GraphQL API client**: Ingests discussions, reviews, and community threads.
   - **Reddit Client**: Ingests rants and complaints from `r/SaaS`, `r/startups`, and `r/webdev`.
   - **Zero-Credential Demo Mode**: Ships with rich, realistic problem posts across 5 major software categories (Developer Tools, SaaS Operations, AI Automation, Remote Work, E-Commerce), explicitly tagged with `is_synthetic: true`.

3. **Document Preprocessing & Deduplication**:
   - Automatic whitespace normalization, minimum length validation, and spam detection.
   - Deterministic SHA-256 content hashing for deduplication.

4. **AI Signal Extraction**:
   - Extracts atomic friction points: `pain_point`, `complaint`, `feature_request`, `unmet_need`, and `workflow_problem`.
   - Computes severity (1-5), sentiment polarity (-1.0 to 1.0), emotional urgency, and commercial intent.
   - Configurable LLM provider support (OpenAI, Gemini, Anthropic) with local heuristic NLP fallback for zero-cost offline execution.

5. **Dense Vector Embeddings & Semantic Clustering**:
   - 384-dimensional dense semantic vectors.
   - HDBSCAN / Cosine distance clustering baseline with cluster centroid calculation and coherence scoring.

6. **Transparent 7-Pillar Opportunity Scoring**:
   $$\text{Opportunity Score} = 0.25 \times \text{Demand} + 0.25 \times \text{Pain} + 0.15 \times \text{Evidence} + 0.15 \times \text{WTP} + 0.10 \times \text{Vacuum} + 0.05 \times \text{Feasibility} + 0.05 \times \text{Recency}$$
   - **Empirical Measured Dimensions (85% Aggregate Weight)**:
     - **Demand Volume (25%)**: Normalized cross-thread frequency and source diversity.
     - **Pain Severity (25%)**: Severity level (1-5) and negative emotional sentiment polarity.
     - **Evidence Strength (15%)**: Verbatim quote density and sample corroboration.
     - **Willingness to Pay (15%)**: Budget mentions, revenue impact, and commercial intent.
     - **Competitive Vacuum (10%)**: Deficiencies and friction cited regarding existing tools.
   - **Heuristic & Temporal Dimensions (15% Aggregate Weight)**:
     - **Technical Feasibility (5%)**: Software buildability heuristic (flagged explicitly as estimate).
     - **Evidence Recency (5%)**: Time-decay relevance modeling.

7. **Evidence-Backed Opportunity Dossiers**:
   - Complete product gap thesis, target ICP persona, "Why Current Solutions Fail", and recommended product wedge.
   - **100% Traceability Graph**: Every claim links directly to the underlying cluster, atomic signals, and verbatim quotes with direct URLs to the original posts.

8. **Market Trends & Sentiment Dynamics**:
   - Daily tracking of critical urgency spikes and negative sentiment friction.
   - Category gap concentration charts.

9. **Background Ingestion Job Monitor**:
   - Bounded async background workers with real-time progress tracking and live execution logs.

10. **Comprehensive Documentation Suite**:
    - [AI Opportunity Discovery Pipeline Guide](docs/AI_PIPELINE.md)
    - [Scoring Methodology & 7-Pillar Formula](docs/SCORING_METHODOLOGY.md)
    - [External API Integrations Guide](docs/API_INTEGRATIONS.md)
    - [Local Development Setup](docs/LOCAL_SETUP.md)
    - [Production Deployment Guide](docs/DEPLOYMENT.md)
    - [System Verification Report](docs/VERIFICATION_REPORT.md)
    - [System Architecture](docs/ARCHITECTURE.md)
    - [API Contract & Specifications](docs/API_CONTRACT.md)

---

## 🏗️ System Architecture

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
|  - Dense 384-dimensional vector embeddings                                            |
|  - Stored in PostgreSQL with pgvector (or dual SQLite fallback for local test/dev)    |
|  - Density-based clustering (HDBSCAN baseline) to discover cohesive problem themes    |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                        EXPLAINABLE OPPORTUNITY SCORING                                |
|  - Demand (30%) + Pain (30%) + Willingness-to-Pay (20%) + Competitive Vacuum (20%)    |
+--------------------------------------------+------------------------------------------+
                                             v
+---------------------------------------------------------------------------------------+
|                           OPPORTUNITY DOSSIER SYNTHESIS                               |
|  - 100% Traceable Evidence Graph (Opportunity -> Cluster -> Signals -> Source Posts)  |
+--------------------------------------------+------------------------------------------+
```

---

## 🚀 Quickstart & Setup

### Option 1: Run with Docker Compose (Recommended)

Requires Docker and Docker Compose:
```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database with pgvector**: `localhost:5432`

---

### Option 2: Run Locally for Development

#### 1. Backend Setup (FastAPI & SQLAlchemy)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic -c backend/alembic.ini upgrade head

# Seed initial demo dataset (optional)
python backend/scripts/seed.py

# Start FastAPI dev server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup (React + TypeScript + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

### Backend Pytest Suite
Verifies data models, database relationships, full traceability graphs, preprocessing, clustering, opportunity scoring formulas, and all REST endpoints:
```bash
python -m pytest backend/tests -v
```
*Current test suite: **23 passed in 0.70s**.*

### Frontend Vitest Suite
Verifies React components, design system elements, and user interfaces:
```bash
cd frontend
npm test
```
*Current test suite: **1 passed**.*

### Production Build Verification
```bash
cd frontend
npm run build
```

---

## 📂 Project Structure

```
GREATSCOUT-/
├── backend/
│   ├── alembic/                      # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── app/
│   │   ├── api/v1/endpoints/         # REST API route handlers
│   │   │   ├── dashboard.py          # KPIs & activity feed
│   │   │   ├── opportunities.py      # Opportunity catalog & dossiers
│   │   │   ├── jobs.py               # Ingestion pipeline triggers & status
│   │   │   ├── signals.py            # Signals & documents exploration
│   │   │   └── health.py             # Diagnostic & health check
│   │   ├── core/config.py            # Pydantic BaseSettings & env configs
│   │   ├── db/
│   │   │   ├── session.py            # Async engine & session factory
│   │   │   └── custom_types.py       # Dual-dialect VectorType (Postgres pgvector / SQLite)
│   │   ├── models/                   # SQLAlchemy 2.0 ORM models
│   │   │   ├── source.py
│   │   │   ├── document.py
│   │   │   ├── signal.py
│   │   │   ├── cluster.py
│   │   │   ├── opportunity.py
│   │   │   └── job.py
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── ingestion/            # Product Hunt, Reddit & Synthetic adapters
│   │   │   ├── preprocessing/        # Cleaner & deduplicator
│   │   │   ├── ai/                   # Signal extractor & opportunity synthesizer
│   │   │   ├── vector/               # VectorEmbedder & SemanticClusterer
│   │   │   ├── scoring/              # OpportunityScorer (4-pillar formula)
│   │   │   └── jobs/                 # JobRunner background worker
│   │   └── main.py                   # FastAPI application factory
│   ├── scripts/seed.py               # CLI database seeding tool
│   ├── tests/                        # Comprehensive Pytest suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Badge, Button, Card, ScoreGauge, ProgressBar
│   │   │   ├── layout/               # Sidebar, Header, MainLayout
│   │   │   └── jobs/                 # IngestionModal
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx     # KPI metrics, source share, top gaps
│   │   │   ├── OpportunitiesPage.tsx # Search, category filters, score sliders
│   │   │   ├── OpportunityDetailPage.tsx # Dossier & Traceable Citation Inspector
│   │   │   ├── SignalsPage.tsx       # Extracted signals & raw documents
│   │   │   ├── AnalyticsPage.tsx     # Recharts trendlines & category distributions
│   │   │   └── IngestionJobsPage.tsx # Background job monitor & live logs
│   │   ├── services/                 # Axios typed API client
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── App.tsx                   # React Router & QueryClientProvider
│   │   └── index.css                 # Cyber-intelligence theme
│   ├── package.json
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

## 🛡️ License

MIT License. Built for builders with precision.
