# GreatScout — AI Opportunity Discovery Pipeline

**Tagline:** Scout Smart, Build Better.

---

## 1. Pipeline Overview

The GreatScout AI Opportunity Discovery Pipeline transforms unstructured, noisy user discussions, rants, reviews, and feature requests from Product Hunt and Reddit into rigorous, defensible product opportunity dossiers.

Unlike generic AI idea generators that invent hypothetical products, GreatScout operates on **strict empirical evidence**: an opportunity dossier cannot exist without traceable signals and verbatim user quotes extracted from real community posts.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INGESTION & CLEANING LAYER                      │
│   • Product Hunt GraphQL API / Reddit JSON Feeds / Synthetic Demo      │
│   • URL Normalization (strips utm_*, ref, affiliate tags)              │
│   • Text Sanitization & Content Hashing (SHA-256 idempotency)         │
│   • Spam & Minimum-Length Validation Filters                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Validated Documents
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SIGNAL EXTRACTION LAYER                         │
│   • Pattern Matching & LLM Semantic Extraction                         │
│   • 5 Signal Taxonomies: pain_point, complaint, feature_request,      │
│     unmet_need, workflow_problem                                       │
│   • Empirical Metrics: Severity (1-5), Sentiment (-1 to +1),          │
│     Urgency (0-1), Commercial Intent (0-1), Competitor Extraction      │
│   • Verbatim Quote Preservation with Offset Traceability              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Structured Signals
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SEMANTIC EMBEDDING ENGINE                          │
│   • 384-Dimensional Dense Vector Generation                            │
│   • Sentence-Transformers (all-MiniLM-L6-v2) or Local Fallback         │
│   • Strict L2 Unit Normalization (||v|| = 1.0) for Cosine Distance    │
│   • Stored in pgvector (PostgreSQL prod) or Custom Vector Type (SQLite)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized Embeddings
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DENSITY & TOPICAL CLUSTERING                        │
│   • Incremental Centroid-Based Cosine Similarity Clustering            │
│   • Distance Thresholding (θ = 0.65 similarity cut-off)                │
│   • Centroid Recalculation & Cluster Coherence Scoring                 │
│   • Automated Semantic Category & Topic Labeling                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Coherent Signal Clusters
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  OPPORTUNITY SYNTHESIS & SCORING                       │
│   • Transparent 7-Pillar Scoring Model (85% Measured, 15% Heuristic)   │
│   • Deduplicated Verbatim Quote Mapping (Unique highlight quotes)     │
│   • Strategic Dossier: Problem Thesis, Solution Angle, ICP Target      │
│   • Idempotent Refresh: Updates existing clusters without duplicates   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Five-Phase Execution Details

### Phase 1: Ingestion, Sanitization & Idempotency
- **Input Sources**:
  - `ProductHuntAdapter`: GraphQL endpoint querying recent products, maker commentary, and user discussions.
  - `RedditAdapter`: Public JSON feeds targeting SaaS, entrepreneurship, and developer subreddits (`r/SaaS`, `r/startups`, `r/webdev`).
  - `SyntheticDemoAdapter`: 13 seed documents covering acute B2B pain points across 5 enterprise categories.
- **URL Normalization**: Strips query tracking parameters (`utm_source`, `utm_medium`, `utm_campaign`, `ref`, `fbclid`) to ensure that identical threads with different referral parameters generate the exact same canonical URL and hash.
- **Deduplication**: Calculates SHA-256 `content_hash = sha256(f"{title}\n{content}".encode("utf-8")).hexdigest()`. Existing documents matching this hash are reused, guaranteeing idempotent re-runs.
- **Validation**: Filters out spam keywords (`crypto pump`, `free followers`, `casino`) and short submissions (<30 characters).

### Phase 2: Signal Extraction & Structured Taxonomy
Each validated document is parsed into atomic problem signals. A signal contains:
- `signal_type`: One of `pain_point`, `complaint`, `feature_request`, `unmet_need`, `workflow_problem`.
- `summary`: Concise synthesis of the user problem.
- `raw_quote`: Verbatim excerpt cited from the source text.
- `severity`: Integer scale (1 to 5) measuring workflow disruption.
- `sentiment_score`: Continuous value (-1.0 to +1.0) indicating emotional intensity.
- `urgency_score`: Continuous value (0.0 to 1.0) reflecting time-sensitivity.
- `commercial_intent_score`: Continuous value (0.0 to 1.0) measuring budget/purchase readiness.
- `competitor_mentioned`: Named incumbent tool (e.g., Datadog, Jira, Zapier) creating user friction.

### Phase 3: Semantic Embedding Generation
- **Dimensionality**: 384 dimensions matching industry standards for semantic text embeddings.
- **Engine**: Sentence-Transformers `all-MiniLM-L6-v2` when dependencies are available, with a deterministic vocabulary-weighted embedding fallback for local offline execution.
- **Normalization**: Vectors are normalized to unit Euclidean length ($\sum v_i^2 = 1.0$), ensuring that dot products equal cosine similarities.
- **Storage**:
  - *Production (PostgreSQL)*: `vector(384)` with IVFFlat / HNSW index for sub-millisecond retrieval.
  - *Local Dev (SQLite)*: JSON-serialized BLOB with custom adapter and pythonic cosine distance operator.

### Phase 4: Clustering & Centroid Coherence
- **Clustering Strategy**: Signals are assigned to clusters based on cosine similarity against existing cluster centroid vectors.
- **Threshold**: Similarity cutoff $\ge 0.65$ merges into an existing cluster; similarity below cutoff spawns a new topical cluster.
- **Coherence Metric**: Measures average pairwise similarity between all signals within the cluster. Clusters with coherence $\ge 0.70$ represent tightly focused market gaps.

### Phase 5: Opportunity Synthesis & Scoring
- Translates cluster signal patterns into commercial product theses:
  - **Title**: Actionable opportunity name.
  - **ICP Target Audience**: Defined user segment suffering from this problem.
  - **Problem Thesis**: Comprehensive definition of the recurring gap.
  - **Why Solutions Fail**: Root cause analysis of why existing tools fall short.
  - **Suggested Solution**: Product wedge or architecture to address the vacuum.
  - **7-Pillar Composite Score**: Explainable score from 0 to 100.
  - **Evidence Citations**: Verbatim quotes with direct URLs back to source threads.

---

## 3. Traceability Graph

Every record maintains referential integrity across the system:

$$\text{Opportunity} \longrightarrow \text{SignalCluster} \longrightarrow \text{Signals} \longrightarrow \text{Document} \longrightarrow \text{Source}$$

- The frontend UI displays clickable external source links for live threads and an amber `Synthetic Demo` badge for local demonstration records.
- Deleting an opportunity does not orphan signals; foreign keys and cascade rules preserve graph consistency.
