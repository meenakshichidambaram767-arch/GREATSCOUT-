# GreatScout — Database Schema & Data Models

## 1. Relational Entity-Relationship Diagram

```mermaid
erDiagram
    SOURCES ||--o{ DOCUMENTS : "ingests"
    SOURCES ||--o{ INGESTION_JOBS : "executes"
    DOCUMENTS ||--o{ SIGNALS : "contains"
    SIGNAL_CLUSTERS ||--o{ SIGNALS : "groups"
    SIGNAL_CLUSTERS ||--o| OPPORTUNITIES : "synthesizes"
    OPPORTUNITIES ||--o{ OPPORTUNITY_EVIDENCE : "cites"
    SIGNALS ||--o{ OPPORTUNITY_EVIDENCE : "proves"

    SOURCES {
        uuid id PK
        string code UK "product_hunt | reddit | demo"
        string name
        string base_url
        boolean is_active
        jsonb config
        timestamp created_at
        timestamp updated_at
    }

    DOCUMENTS {
        uuid id PK
        uuid source_id FK
        string external_id "e.g. reddit post id or PH discussion id"
        string title
        text content
        string author
        string url
        integer upvotes
        integer comment_count
        boolean is_synthetic
        string content_hash "SHA256"
        string validation_status "valid | invalid | duplicate"
        timestamp published_at
        timestamp ingested_at
    }

    SIGNALS {
        uuid id PK
        uuid document_id FK
        uuid cluster_id FK "nullable until clustered"
        string signal_type "pain_point | complaint | feature_request | unmet_need | workflow_problem"
        string summary
        text raw_quote
        integer severity "1 to 5"
        float sentiment_score "-1.0 to 1.0"
        float urgency_score "0.0 to 1.0"
        float commercial_intent_score "0.0 to 1.0"
        string competitor_mentioned
        vector embedding "384-dimensional or json array fallback"
        timestamp created_at
    }

    SIGNAL_CLUSTERS {
        uuid id PK
        string category "e.g. Developer Tools, SaaS Ops, E-Commerce"
        string label "Short descriptive topic label"
        text description
        integer signal_count
        float coherence_score "0.0 to 1.0"
        vector centroid_embedding "384-dimensional"
        timestamp created_at
        timestamp updated_at
    }

    OPPORTUNITIES {
        uuid id PK
        uuid cluster_id FK UK
        string title
        string target_audience
        text problem_thesis
        text why_current_solutions_fail
        text suggested_solution
        float demand_score "0 to 100"
        float pain_intensity_score "0 to 100"
        float willingness_to_pay_score "0 to 100"
        float competitive_vacuum_score "0 to 100"
        float overall_score "0 to 100"
        string confidence_level "high | medium | low"
        string status "active | archived | starred"
        timestamp created_at
        timestamp updated_at
    }

    OPPORTUNITY_EVIDENCE {
        uuid id PK
        uuid opportunity_id FK
        uuid signal_id FK
        text highlight_quote
        float relevance_score
        timestamp created_at
    }

    INGESTION_JOBS {
        uuid id PK
        uuid source_id FK
        string job_type "ingest | process_signals | cluster | full_pipeline"
        string status "pending | running | completed | failed"
        integer documents_processed
        integer signals_extracted
        integer opportunities_generated
        text error_message
        jsonb logs
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }
```

---

## 2. Table Specifications

### 2.1 `sources`
Tracks upstream platforms and ingestion configurations.
- `id`: UUID (Primary Key, default uuid_generate_v4() or gen_random_uuid())
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g., `'product_hunt'`, `'reddit'`, `'demo'`)
- `name`: VARCHAR(100) NOT NULL
- `base_url`: VARCHAR(255)
- `is_active`: BOOLEAN DEFAULT true
- `config`: JSONB / Text DEFAULT '{}'
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.2 `documents`
Stores validated, sanitized posts and comment threads.
- `id`: UUID (Primary Key)
- `source_id`: UUID (Foreign Key -> sources.id, ON DELETE CASCADE)
- `external_id`: VARCHAR(100) (Upstream ID from Product Hunt / Reddit)
- `title`: VARCHAR(500) NOT NULL
- `content`: TEXT NOT NULL
- `author`: VARCHAR(100)
- `url`: VARCHAR(1000) NOT NULL
- `upvotes`: INTEGER DEFAULT 0
- `comment_count`: INTEGER DEFAULT 0
- `is_synthetic`: BOOLEAN DEFAULT false
- `content_hash`: VARCHAR(64) NOT NULL INDEX (Used for fast deduplication)
- `validation_status`: VARCHAR(20) DEFAULT 'valid'
- `published_at`: TIMESTAMPTZ
- `ingested_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.3 `signals`
Stores atomic user friction points extracted by the AI engine.
- `id`: UUID (Primary Key)
- `document_id`: UUID (Foreign Key -> documents.id, ON DELETE CASCADE)
- `cluster_id`: UUID (Foreign Key -> signal_clusters.id, ON DELETE SET NULL, NULLABLE)
- `signal_type`: VARCHAR(50) NOT NULL (Values: `pain_point`, `complaint`, `feature_request`, `unmet_need`, `workflow_problem`)
- `summary`: VARCHAR(500) NOT NULL
- `raw_quote`: TEXT NOT NULL
- `severity`: INTEGER NOT NULL (1 = minor inconvenience, 5 = critical blocker)
- `sentiment_score`: FLOAT NOT NULL (-1.0 to 1.0)
- `urgency_score`: FLOAT NOT NULL (0.0 to 1.0)
- `commercial_intent_score`: FLOAT NOT NULL (0.0 to 1.0)
- `competitor_mentioned`: VARCHAR(255) NULLABLE
- `embedding`: VECTOR(384) or JSON (Dense representation for semantic clustering)
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.4 `signal_clusters`
Groups semantically similar signals into cohesive problem themes.
- `id`: UUID (Primary Key)
- `category`: VARCHAR(100) NOT NULL
- `label`: VARCHAR(255) NOT NULL
- `description`: TEXT
- `signal_count`: INTEGER DEFAULT 0
- `coherence_score`: FLOAT DEFAULT 0.0
- `centroid_embedding`: VECTOR(384) or JSON
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.5 `opportunities`
Synthesized product gap reports generated from validated signal clusters.
- `id`: UUID (Primary Key)
- `cluster_id`: UUID UNIQUE (Foreign Key -> signal_clusters.id, ON DELETE CASCADE)
- `title`: VARCHAR(255) NOT NULL
- `target_audience`: VARCHAR(255) NOT NULL
- `problem_thesis`: TEXT NOT NULL
- `why_current_solutions_fail`: TEXT NOT NULL
- `suggested_solution`: TEXT NOT NULL
- `demand_score`: FLOAT NOT NULL (0 - 100)
- `pain_intensity_score`: FLOAT NOT NULL (0 - 100)
- `willingness_to_pay_score`: FLOAT NOT NULL (0 - 100)
- `competitive_vacuum_score`: FLOAT NOT NULL (0 - 100)
- `overall_score`: FLOAT NOT NULL (0 - 100)
- `confidence_level`: VARCHAR(20) DEFAULT 'medium'
- `status`: VARCHAR(20) DEFAULT 'active' (active, starred, archived)
- `created_at`: TIMESTAMPTZ DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.6 `opportunity_evidence`
Association table maintaining explicit traceability between opportunities and specific signal quotes.
- `id`: UUID (Primary Key)
- `opportunity_id`: UUID (Foreign Key -> opportunities.id, ON DELETE CASCADE)
- `signal_id`: UUID (Foreign Key -> signals.id, ON DELETE CASCADE)
- `highlight_quote`: TEXT NOT NULL
- `relevance_score`: FLOAT DEFAULT 1.0
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

### 2.7 `ingestion_jobs`
Bounded background worker logs and status monitors.
- `id`: UUID (Primary Key)
- `source_id`: UUID (Foreign Key -> sources.id, ON DELETE SET NULL, NULLABLE)
- `job_type`: VARCHAR(50) NOT NULL (`ingest`, `process_signals`, `cluster`, `full_pipeline`)
- `status`: VARCHAR(20) DEFAULT 'pending' (`pending`, `running`, `completed`, `failed`)
- `documents_processed`: INTEGER DEFAULT 0
- `signals_extracted`: INTEGER DEFAULT 0
- `opportunities_generated`: INTEGER DEFAULT 0
- `error_message`: TEXT NULLABLE
- `logs`: JSONB DEFAULT '[]'
- `started_at`: TIMESTAMPTZ NULLABLE
- `completed_at`: TIMESTAMPTZ NULLABLE
- `created_at`: TIMESTAMPTZ DEFAULT NOW()

---

## 3. Database Indexes

- `documents(content_hash)`: For rapid deduplication checks.
- `documents(source_id, published_at)`: For chronologically partitioned queries.
- `signals(signal_type, severity)`: For faceted filtering.
- `signals(cluster_id)`: For joining signals with clusters.
- `opportunities(overall_score DESC)`: For high-ranking opportunity discovery.
- `opportunities(status)`: For filtering active/starred opportunities.
- `signals(embedding)`: HNSW or IVFFlat index on pgvector for similarity queries:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_signals_embedding ON signals USING hnsw (embedding vector_cosine_ops);
  ```
