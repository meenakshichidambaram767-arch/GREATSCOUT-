# GreatScout — Implementation Plan & Phase Roadmap

## Phase 1: Specifications, Architecture & Database Foundation (Current)
- [x] Architecture document (`docs/ARCHITECTURE.md`)
- [x] Database schema & ERD (`docs/DATABASE_SCHEMA.md`)
- [x] REST API contract (`docs/API_CONTRACT.md`)
- [ ] Backend foundation: FastAPI app skeleton, Pydantic settings, SQLAlchemy models, SQLite/PostgreSQL database session manager.
- [ ] Alembic migration initialization.
- [ ] Automated model tests and database connection test.

## Phase 2: Frontend Foundation & Design System
- [ ] Initialize Vite + React + TypeScript + Tailwind CSS application in `frontend/`.
- [ ] Modern UI theme with cyber-intelligence aesthetic (dark mode default, neon emerald/cyan accents, glassmorphic cards, crisp typography).
- [ ] Core layout components: Sidebar navigation, Top Header with live status pill, Breadcrumbs, Error Boundary.
- [ ] API client service layer using Axios and TanStack Query with typed responses.
- [ ] Frontend test setup with Vitest and React Testing Library.

## Phase 3: Data Ingestion & Preprocessing Pipeline
- [ ] Raw document cleaner and deduplicator (`cleaner.py` with SHA-256 hash checks and text normalization).
- [ ] Ingestion adapters:
  - Product Hunt GraphQL scraper/API client.
  - Reddit API (PRAW / JSON feed) client.
  - Comprehensive Synthetic Demo Engine (`synthetic_demo.py`) with rich, realistic problem posts across 5 real software categories (AI Tooling, SaaS Ops/Billing, Dev Observability, Remote Collaboration, E-Commerce Logistics) with `is_synthetic: true`.
- [ ] Bounded background worker system (`job_runner.py`) for asynchronous execution with progress updates and structured logs.

## Phase 4: AI Signal Extraction, Embeddings & Clustering
- [ ] AI Signal Extractor: structured extraction of pain points, complaints, feature requests, unmet needs, severity (1-5), and emotional urgency.
- [ ] Configurable AI Provider (LLM API support with robust heuristic/rule-based fallback for offline zero-cost execution).
- [ ] Dense vector embedder for extracted signal text.
- [ ] Semantic clustering algorithm (HDBSCAN / Cosine distance density clustering) with cluster centroid calculation and auto-labeling.

## Phase 5: Explainable Opportunity Scoring & Synthesis Engine
- [ ] Explainable 4-component scoring engine:
  - Demand Frequency Score (0-100)
  - Pain Intensity Score (0-100)
  - Willingness-to-Pay Score (0-100)
  - Competitive Vacuum Score (0-100)
  - Weighted composite score (0-100)
- [ ] Opportunity Synthesizer: builds strategic product gap dossiers with target personas, why existing solutions fail, and suggested feature angles.
- [ ] 100% Traceability Graph: connects every Opportunity to its Cluster, constituent Signals, and original Source Posts.

## Phase 6: REST API Integration & Services
- [ ] Complete FastAPI endpoints for Dashboard, Sources, Ingestion Jobs, Signals, Opportunities, and Trends.
- [ ] Comprehensive Pytest suite covering all API endpoints, scoring formulas, clustering routines, and edge cases.

## Phase 7: Rich Frontend Implementation & Data Visualization
- [ ] Interactive Dashboard with KPI counters, category distribution charts, and recent activity.
- [ ] Ingestion Manager view with 1-click Demo Seed, live job progress bar, and execution logs.
- [ ] Opportunities Catalog with full-text search, score range sliders, status filter, and pagination.
- [ ] Opportunity Detail View with score breakdown gauges, problem thesis breakdown, and interactive Citation Inspector.
- [ ] Signals & Documents Explorer with type filters and raw quote inspection.
- [ ] Polish all loading skeletons, error states, and responsive design.

## Phase 8: Docker, Final Verification & Documentation
- [ ] Multi-container `docker-compose.yml` (PostgreSQL with pgvector, FastAPI backend, Vite frontend).
- [ ] End-to-end test execution (Vitest + Pytest).
- [ ] Deployment and Quickstart guide in root `README.md`.
