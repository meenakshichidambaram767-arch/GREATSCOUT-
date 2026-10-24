from typing import Dict, Any, List


class PRDGenerator:
    """
    Zero-to-Code Action Engine: Synthesizes production-grade Product Requirements Documents (PRD),
    architecture blueprints, schema definitions, and Linear/Jira engineering tickets from opportunity dossiers.
    """

    DOMAIN_BLUEPRINTS = {
        "Developer Tools": {
            "tech_stack": {
                "frontend": "Next.js 14 (App Router) + TailwindCSS + Tremor UI (Monitoring Dashboards)",
                "backend": "FastAPI (Async Python 3.11) + Rust / Go Ingestion Daemon",
                "database": "PostgreSQL 16 (TimescaleDB partition) + Redis 7 (Dead-Letter Queue)",
                "infrastructure": "Cloudflare Workers (Edge Interception) + AWS ECS Fargate",
                "integrations": ["Stripe Webhooks API", "AWS Lambda SDK", "Datadog / OpenTelemetry Exporter"],
                "architecture_rationale": "Edge routing layer intercepts raw payloads in <10ms, streams directly to Redis buffer, and guarantees zero data loss during downstream Lambda crashes."
            },
            "mvp_phases": [
                {
                    "phase": "Phase 1: Core Wedge (Weeks 1-2)",
                    "features": [
                        "2-Line Drop-in SDK for AWS Lambda & Cloudflare Workers",
                        "Automated raw payload serialization into Redis dead-letter buffer",
                        "Web-based dead-letter queue inspector with full JSON body & header view"
                    ]
                },
                {
                    "phase": "Phase 2: One-Click Replay & Telemetry (Weeks 3-4)",
                    "features": [
                        "One-click idempotent transaction replay with modified payloads",
                        "Automated retry policies (exponential backoff with jitter)",
                        "Slack & PagerDuty webhook failure alerts"
                    ]
                }
            ],
            "edge_cases": [
                "Handling duplicate webhook deliveries from Stripe without double charging users",
                "Payloads exceeding 256KB compressed stored in S3 with presigned URL references",
                "Downstream lambda cold starts triggering spurious timeout cascades"
            ],
            "schema_ddl": """-- Core Webhook Transaction & Replay Schema
CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'shopify', 'twilio'
    secret_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255),
    headers JSONB NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processed', 'failed', 'replayed'
    error_message TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE replay_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES webhook_events(id) ON DELETE CASCADE,
    triggered_by VARCHAR(100) NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    latency_ms INTEGER,
    replayed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_status ON webhook_events (status, received_at DESC);
CREATE INDEX idx_webhook_external ON webhook_events (external_event_id);""",
            "api_endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/ingest/:endpoint_id",
                    "description": "High-throughput edge ingestion endpoint that captures raw webhook payload and returns 200 immediately.",
                    "request_sample": "{\n  \"event_id\": \"evt_1N4k...\",\n  \"type\": \"invoice.payment_failed\",\n  \"data\": { \"amount\": 4200 }\n}",
                    "response_sample": "{\n  \"status\": \"queued\",\n  \"event_id\": \"d9a8f...\",\n  \"ingested_at\": \"2026-10-24T09:30:00Z\"\n}"
                },
                {
                    "method": "POST",
                    "path": "/api/v1/events/:event_id/replay",
                    "description": "Trigger manual or automated retry of a failed webhook event to target service.",
                    "request_sample": "{\n  \"override_headers\": { \"X-Retry-Count\": \"1\" }\n}",
                    "response_sample": "{\n  \"success\": true,\n  \"http_status\": 200,\n  \"latency_ms\": 84\n}"
                }
            ],
            "linear_tickets": [
                {
                    "identifier": "ENG-101",
                    "title": "Build zero-allocation Redis payload ingestion buffer",
                    "priority": "Urgent",
                    "estimate": "5 pts",
                    "label": "Backend",
                    "description": "Implement a high-throughput endpoint capable of receiving incoming HTTP POST payloads and queueing to Redis streams with <15ms latency.",
                    "acceptance_criteria": [
                        "Accepts arbitrary JSON, form-data, and raw text payloads",
                        "Persists raw headers and HMAC signature verification",
                        "Unit tested under 1,000 req/sec benchmark"
                    ]
                },
                {
                    "identifier": "ENG-102",
                    "title": "Develop Visual Dead-Letter Queue Inspector UI",
                    "priority": "High",
                    "estimate": "3 pts",
                    "label": "Frontend",
                    "description": "Create a dashboard view displaying failed webhook payloads with JSON tree view, diff viewer, and 1-click retry button.",
                    "acceptance_criteria": [
                        "Real-time updates via WebSocket",
                        "Search by customer ID or external event ID",
                        "Syntax-highlighted request/response viewer"
                    ]
                },
                {
                    "identifier": "ENG-103",
                    "title": "Idempotent Replay Dispatcher with Jitter",
                    "priority": "High",
                    "estimate": "5 pts",
                    "label": "Engine",
                    "description": "Worker service that reads dead-letter items and re-executes HTTP requests with exponential backoff.",
                    "acceptance_criteria": [
                        "Prevents duplicate executions via atomic redis locks",
                        "Logs status code and response payload for auditing",
                        "Handles TLS timeouts and unreachable hosts gracefully"
                    ]
                }
            ]
        },
        "SaaS Operations": {
            "tech_stack": {
                "frontend": "Next.js 14 + Shadcn/ui + TanStack Table + Recharts",
                "backend": "FastAPI (Python 3.11) + SQLAlchemy Async",
                "database": "PostgreSQL 16 with Row Level Security (RLS)",
                "infrastructure": "AWS RDS + Docker + Vercel Enterprise",
                "integrations": ["Stripe Billing API", "Plaid Transactions API", "QuickBooks Online SDK"],
                "architecture_rationale": "High-accuracy fuzzy matching engine with bi-directional webhooks ensuring accounting books reconcile automatically without CSV exports."
            },
            "mvp_phases": [
                {
                    "phase": "Phase 1: Bi-Directional Feed Sync (Weeks 1-2)",
                    "features": [
                        "Plaid & bank wire CSV real-time transaction ingestion",
                        "Stripe Billing open invoice and metadata synchronization",
                        "Automated exact amount + invoice ID matcher (95% automation)"
                    ]
                },
                {
                    "phase": "Phase 2: Reconciliation Ledger & Accounting Push (Weeks 3-4)",
                    "features": [
                        "Human-in-the-loop confidence reviewer for ambiguous wire transfers",
                        "Automated 1-click mark-as-paid in Stripe and QuickBooks",
                        "Month-end financial audit trail export"
                    ]
                }
            ],
            "edge_cases": [
                "Bank wires with wire fee deduction (e.g., $15 bank fee causing $4,985 deposit for a $5,000 invoice)",
                "Wire memos containing customer names rather than invoice numbers",
                "Currency exchange rate variance on international SWIFT transfers"
            ],
            "schema_ddl": """-- Financial Reconciliation Schema
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    reference_memo TEXT,
    settled_date DATE NOT NULL,
    reconciliation_status VARCHAR(50) DEFAULT 'unmatched',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stripe_invoices (
    id VARCHAR(100) PRIMARY KEY, -- 'in_1N...'
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    amount_due NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reconciliation_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
    invoice_id VARCHAR(100) REFERENCES stripe_invoices(id) ON DELETE CASCADE,
    match_confidence NUMERIC(5, 2) NOT NULL,
    match_strategy VARCHAR(100) NOT NULL, -- 'exact_id', 'amount_and_name_fuzzy'
    reconciled_by VARCHAR(100) DEFAULT 'system',
    reconciled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_unmatched_trans ON bank_transactions (reconciliation_status, settled_date);""",
            "api_endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/reconcile/run",
                    "description": "Executes automated reconciliation algorithm across pending transactions and open invoices.",
                    "request_sample": "{\n  \"tolerance_cents\": 2500,\n  \"auto_confirm_threshold\": 0.95\n}",
                    "response_sample": "{\n  \"matched_count\": 18,\n  \"unmatched_count\": 2,\n  \"total_volume_usd\": 84500.00\n}"
                }
            ],
            "linear_tickets": [
                {
                    "identifier": "FIN-201",
                    "title": "Build Fuzzy String Matching Engine for Bank Memos",
                    "priority": "Urgent",
                    "estimate": "5 pts",
                    "label": "Algorithm",
                    "description": "Implement Levenshtein and token-sort fuzzy matching to pair ambiguous bank transaction memos with Stripe customer account names.",
                    "acceptance_criteria": [
                        "Correctly matches memos with leading bank noise (e.g. 'WIRE IN TRF ACME CORP')",
                        "Accounts for standard $15-$30 intermediary wire fee deductions",
                        "Calculates deterministic confidence score between 0.0 and 1.0"
                    ]
                },
                {
                    "identifier": "FIN-202",
                    "title": "Interactive Match Confirmation Queue UI",
                    "priority": "High",
                    "estimate": "3 pts",
                    "label": "Frontend",
                    "description": "Build two-pane review interface allowing accountants to approve or re-assign low-confidence matches with keyboard shortcuts.",
                    "acceptance_criteria": [
                        "Keyboard shortcuts (Enter to approve, J/K to navigate)",
                        "Side-by-side transaction vs invoice metadata preview",
                        "One-click batch confirmation"
                    ]
                }
            ]
        },
        "AI Automation": {
            "tech_stack": {
                "frontend": "Next.js 14 + Monaco Editor (Schema Playground) + TailwindCSS",
                "backend": "Node.js (Fastify) with TypeScript + Rust Native Validator",
                "database": "Redis (In-memory schema cache) + ClickHouse (Drift Analytics)",
                "infrastructure": "Cloudflare Workers / AWS CloudFront Functions (Sub-20ms proxy)",
                "integrations": ["OpenAI Responses API", "Anthropic Claude API", "PostgreSQL DDL Validator"],
                "architecture_rationale": "Ultra-low latency streaming proxy that intercepts LLM output chunks in real-time, repairs unclosed brackets, and enforces strict JSON Schema before sending to database."
            },
            "mvp_phases": [
                {
                    "phase": "Phase 1: In-Flight JSON Repair (Weeks 1-2)",
                    "features": [
                        "Streaming parser fixing unescaped quotes, trailing commas, and unclosed brackets",
                        "Zero-latency pass-through proxy compatible with openai-node SDK",
                        "Strict JSON Schema validation against user-provided Pydantic/Zod models"
                    ]
                },
                {
                    "phase": "Phase 2: Schema Drift Telemetry & Fallbacks (Weeks 3-4)",
                    "features": [
                        "Auto-retry with targeted patch prompts on catastrophic hallucinations",
                        "Schema drift monitoring dashboard showing failure rates per model",
                        "Instant mock generator from schema definitions"
                    ]
                }
            ],
            "edge_cases": [
                "Token streaming boundary splits in the middle of multi-byte UTF-8 characters",
                "Model hallucinates Markdown fences (```json ... ```) around raw output",
                "Enum values returned with minor casing or spacing variations ('Credit Card' vs 'credit_card')"
            ],
            "schema_ddl": """-- LLM Schema Guard Telemetry Schema
CREATE TABLE schema_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    target_model VARCHAR(100) NOT NULL,
    json_schema JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE validation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_id UUID REFERENCES schema_definitions(id) ON DELETE CASCADE,
    model_called VARCHAR(100) NOT NULL,
    raw_output_snippet TEXT NOT NULL,
    was_repaired BOOLEAN NOT NULL,
    repaired_fields JSONB,
    latency_added_ms NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validation_schema ON validation_events (schema_id, was_repaired);""",
            "api_endpoints": [
                {
                    "method": "POST",
                    "path": "/v1/chat/completions",
                    "description": "Drop-in OpenAI proxy that automatically guarantees conforming JSON Schema output.",
                    "request_sample": "{\n  \"model\": \"gpt-4o\",\n  \"messages\": [...],\n  \"schema_guard\": \"invoice_schema_v2\"\n}",
                    "response_sample": "{\n  \"choices\": [{\n    \"message\": { \"role\": \"assistant\", \"content\": \"{\\\"invoice_id\\\": 123}\" }\n  }],\n  \"guard_latency_ms\": 14.2\n}"
                }
            ],
            "linear_tickets": [
                {
                    "identifier": "AI-301",
                    "title": "Develop Streaming In-Flight JSON Repair Middleware",
                    "priority": "Urgent",
                    "estimate": "5 pts",
                    "label": "Edge Proxy",
                    "description": "Create a high-speed streaming transformer that strips Markdown code fences and fixes truncated JSON brackets in under 20ms.",
                    "acceptance_criteria": [
                        "Repairs trailing commas and unclosed brackets in-flight",
                        "Preserves Server-Sent Events (SSE) streaming compatibility",
                        "Adds less than 25ms total overhead to TTFT (time-to-first-token)"
                    ]
                }
            ]
        },
        "Remote Work": {
            "tech_stack": {
                "frontend": "React 18 + TipTap Collaborative Editor + TailwindCSS",
                "backend": "FastAPI (Python 3.11) + Celery Task Queue + Spacy NLP",
                "database": "PostgreSQL 16 (Full-Text Search) + Redis Pub/Sub",
                "infrastructure": "AWS ECS Fargate + Cloudflare CDN",
                "integrations": ["Slack Events API", "Zoom & Google Meet Transcript API", "Linear & Jira API"],
                "architecture_rationale": "Event-driven transcript and message parser that captures decision context, auto-links action items with meeting recordings, and syncs status updates asynchronously."
            },
            "mvp_phases": [
                {
                    "phase": "Phase 1: Automated Action Item Extraction (Weeks 1-2)",
                    "features": [
                        "Real-time Slack conversation listener and transcript parser",
                        "NLP extraction of owner, due date, and deliverable commitments",
                        "Digest card generator with one-click approval to push tasks"
                    ]
                },
                {
                    "phase": "Phase 2: Asynchronous Decision Ledger (Weeks 3-4)",
                    "features": [
                        "Searchable decision history tagged by team and project",
                        "Automatic ping on stale commitments past deadline",
                        "Two-way sync to Linear, Jira, and Asana tasks"
                    ]
                }
            ],
            "edge_cases": [
                "Ambiguous statements like 'We should look into this next week' without an explicit assignee",
                "Action items modified or cancelled later in the conversation thread",
                "Privacy filters ensuring sensitive HR and salary discussions are excluded from public logs"
            ],
            "schema_ddl": """-- Action Item & Decision Ledger Schema
CREATE TABLE meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_title VARCHAR(255) NOT NULL,
    source_platform VARCHAR(50) NOT NULL, -- 'zoom', 'google_meet', 'slack'
    raw_transcript TEXT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID REFERENCES meeting_transcripts(id) ON DELETE SET NULL,
    summary TEXT NOT NULL,
    context_rationale TEXT NOT NULL,
    decided_by VARCHAR(100) NOT NULL,
    project_tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assignee VARCHAR(100),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced_linear', 'completed'
    external_ticket_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_actions_assignee ON action_items (assignee, status);
CREATE INDEX idx_decisions_project ON decisions (project_tag);""",
            "api_endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/actions/extract",
                    "description": "Parses meeting transcript or Slack thread and extracts structured action items with assignees.",
                    "request_sample": "{\n  \"source\": \"slack\",\n  \"content\": \"Alex will deploy the Redis fix by Thursday 5pm.\"\n}",
                    "response_sample": "{\n  \"action_items\": [\n    {\n      \"title\": \"Deploy Redis fix\",\n      \"assignee\": \"Alex\",\n      \"due_date\": \"2026-10-29\"\n    }\n  ]\n}"
                },
                {
                    "method": "GET",
                    "path": "/api/v1/decisions/search",
                    "description": "Full-text search through historical decisions, agreements, and context threads.",
                    "request_sample": "{\n  \"query\": \"redis buffer size\",\n  \"project\": \"infrastructure\"\n}",
                    "response_sample": "{\n  \"results\": [\n    {\n      \"decision_id\": \"d72b...\",\n      \"summary\": \"Set Redis dead-letter buffer limit to 500MB\"\n    }\n  ]\n}"
                }
            ],
            "linear_tickets": [
                {
                    "identifier": "REM-401",
                    "title": "Build NLP Action Item & Assignee Extraction Pipeline",
                    "priority": "Urgent",
                    "estimate": "5 pts",
                    "label": "NLP Pipeline",
                    "description": "Develop rule-based and entity-recognition parser capable of detecting commitments, owners, and relative dates from text.",
                    "acceptance_criteria": [
                        "Extracts names, dates, and action verbs with >90% precision",
                        "Normalizes relative dates ('by Friday', 'tomorrow morning') to ISO timestamps",
                        "Returns confidence scores for human verification"
                    ]
                },
                {
                    "identifier": "REM-402",
                    "title": "Slack Interactive Bot & Task Digest Card",
                    "priority": "High",
                    "estimate": "3 pts",
                    "label": "Bot Integration",
                    "description": "Create Slack Block Kit message with interactive buttons allowing team members to confirm or edit detected action items.",
                    "acceptance_criteria": [
                        "Renders preview card with editable assignee dropdown",
                        "One-click push directly into Linear / Jira backlogs",
                        "Auto-updates original Slack thread when item is marked done"
                    ]
                }
            ]
        },
        "E-Commerce": {
            "tech_stack": {
                "frontend": "Next.js 14 + TanStack Table (Virtual Scroll) + Tremor UI",
                "backend": "FastAPI (Python 3.11) + Redis Distributed Locks (Redlock)",
                "database": "PostgreSQL 16 + Redis (Live SKU Stock Cache)",
                "infrastructure": "AWS ECS Fargate + AWS SQS FIFO Queues",
                "integrations": ["Shopify GraphQL Admin API", "Amazon Selling Partner API (SP-API)", "WooCommerce REST API"],
                "architecture_rationale": "FIFO queue with atomic Redis stock reservation ensures inventory deductions across Shopify and Amazon happen in <500ms, eliminating overselling during flash sales."
            },
            "mvp_phases": [
                {
                    "phase": "Phase 1: Real-Time Multi-Channel Stock Sync (Weeks 1-2)",
                    "features": [
                        "Sub-second order webhook ingestion from Shopify and Amazon SP-API",
                        "Atomic stock deduction across connected sales channels",
                        "Real-time out-of-stock emergency buffer trigger"
                    ]
                },
                {
                    "phase": "Phase 2: Multi-Warehouse Routing & Safety Stock (Weeks 3-4)",
                    "features": [
                        "Automated location routing based on customer postal code",
                        "Channel-specific safety stock reservations to prevent stockouts",
                        "Low-stock alert webhooks to Slack and email"
                    ]
                }
            ],
            "edge_cases": [
                "Simultaneous orders for the last remaining unit placed within 200ms on different channels",
                "Amazon SP-API throttling order webhook requests during peak Black Friday spikes",
                "Customer order cancellation restoring reserved stock atomically without race conditions"
            ],
            "schema_ddl": """-- Multi-Channel Inventory Sync Schema
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    total_physical_stock INTEGER NOT NULL,
    reserved_stock INTEGER DEFAULT 0,
    safety_buffer INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE channel_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_type VARCHAR(50) NOT NULL, -- 'shopify', 'amazon', 'woocommerce'
    store_identifier VARCHAR(100) NOT NULL,
    api_credentials_hash VARCHAR(255) NOT NULL,
    is_sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_sync_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) NOT NULL,
    channel_id UUID REFERENCES channel_connections(id) ON DELETE CASCADE,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    sync_latency_ms INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'success',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_sku ON inventory_items (sku);
CREATE INDEX idx_sync_events_sku ON stock_sync_events (sku, synced_at DESC);""",
            "api_endpoints": [
                {
                    "method": "POST",
                    "path": "/api/v1/inventory/webhook/:channel_id",
                    "description": "High-throughput webhook endpoint receiving real-time order notifications and decrementing stock globally.",
                    "request_sample": "{\n  \"order_id\": \"109284\",\n  \"line_items\": [\n    { \"sku\": \"TEE-BLK-M\", \"quantity\": 2 }\n  ]\n}",
                    "response_sample": "{\n  \"status\": \"decremented\",\n  \"remaining_available_stock\": 14,\n  \"broadcast_queued\": true\n}"
                },
                {
                    "method": "POST",
                    "path": "/api/v1/inventory/sync-now",
                    "description": "Forces reconciliation check between warehouse inventory and external marketplace feeds.",
                    "request_sample": "{\n  \"sku\": \"TEE-BLK-M\"\n}",
                    "response_sample": "{\n  \"sku\": \"TEE-BLK-M\",\n  \"shopify_synced\": 14,\n  \"amazon_synced\": 14\n}"
                }
            ],
            "linear_tickets": [
                {
                    "identifier": "INV-501",
                    "title": "Implement Redlock Distributed Inventory Reservation Engine",
                    "priority": "Urgent",
                    "estimate": "5 pts",
                    "label": "Core Engine",
                    "description": "Build an atomic Redis lock mechanism that holds inventory during checkout to guarantee zero double-selling across channels.",
                    "acceptance_criteria": [
                        "Atomic decrement using Redis Lua script",
                        "Releases reservation lock on checkout abandonment after 15 minutes",
                        "Sub-20ms latency under high concurrent load"
                    ]
                },
                {
                    "identifier": "INV-502",
                    "title": "Shopify & Amazon SP-API Bi-Directional Stock Sync Worker",
                    "priority": "High",
                    "estimate": "5 pts",
                    "label": "Integrations",
                    "description": "Worker service consuming SQS queue and pushing updated stock counts to marketplace APIs with backoff rate-limiting.",
                    "acceptance_criteria": [
                        "Handles Amazon SP-API hourly quota limits gracefully",
                        "Idempotent retry logic on network timeouts",
                        "Logs audit event with latency metrics"
                    ]
                }
            ]
        }
    }

    @classmethod
    def get_blueprint_for_opportunity(cls, opp: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dynamically resolves the best tailored blueprint for ANY project based on its title,
        problem thesis, or category keywords so every opportunity gets a bespoke PRD.
        """
        text = (
            opp.get("title", "") + " " +
            opp.get("problem_thesis", "") + " " +
            opp.get("category", "")
        ).lower()

        if any(k in text for k in ["reconcil", "invoice", "bank", "accounting", "stripe & bank"]):
            return cls.DOMAIN_BLUEPRINTS["SaaS Operations"]
        elif any(k in text for k in ["schema guard", "output repair", "llm", "ai output", "json repair"]):
            return cls.DOMAIN_BLUEPRINTS["AI Automation"]
        elif any(k in text for k in ["action item", "asynchronous", "tracker & rationale", "remote work", "decision"]):
            return cls.DOMAIN_BLUEPRINTS["Remote Work"]
        elif any(k in text for k in ["inventory", "multi-channel", "sku", "independent brands", "e-commerce", "shopify"]):
            return cls.DOMAIN_BLUEPRINTS["E-Commerce"]
        else:
            return cls.DOMAIN_BLUEPRINTS["Developer Tools"]

    @classmethod
    def generate_prd(cls, opp: Dict[str, Any]) -> Dict[str, Any]:
        blueprint = cls.get_blueprint_for_opportunity(opp)
        category = opp.get("category", "Developer Tools")

        title = opp.get("title", "Market Opportunity")
        target_audience = opp.get("target_audience", "Engineering & Operations Teams")
        problem_thesis = opp.get("problem_thesis", "")
        suggested_solution = opp.get("suggested_solution", "")
        why_fail = opp.get("why_current_solutions_fail", "")

        markdown_doc = f"""# Product Requirements Document (PRD)
## {title}

**Target Persona:** {target_audience}  
**Category:** {category}  
**Status:** Ready for Engineering Implementation  

---

### 1. Executive Summary & Problem Thesis
{problem_thesis}

**Why Incumbent Tools Fall Short:**
{why_fail}

**Proposed Architectural Solution:**
{suggested_solution}

---

### 2. Recommended Technology Stack
- **Frontend:** {blueprint['tech_stack']['frontend']}
- **Backend Service:** {blueprint['tech_stack']['backend']}
- **Persistence & Cache:** {blueprint['tech_stack']['database']}
- **Hosting & Infrastructure:** {blueprint['tech_stack']['infrastructure']}
- **Third-Party Integrations:** {', '.join(blueprint['tech_stack']['integrations'])}

> **Architectural Rationale:**  
> {blueprint['tech_stack']['architecture_rationale']}

---

### 3. MVP Scope & Phase Progression
"""
        for phase in blueprint["mvp_phases"]:
            markdown_doc += f"#### {phase['phase']}\n"
            for feat in phase["features"]:
                markdown_doc += f"- [ ] {feat}\n"
            markdown_doc += "\n"

        markdown_doc += """### 4. Technical Edge Cases & Defensive Architecture\n"""
        for ec in blueprint["edge_cases"]:
            markdown_doc += f"- **Edge Case:** {ec}\n"

        markdown_doc += f"""\n---

### 5. Database Schema Blueprint (DDL)
```sql
{blueprint['schema_ddl']}
```

---

### 6. Linear & Jira Engineering Backlog
"""
        for t in blueprint["linear_tickets"]:
            markdown_doc += f"#### [{t['identifier']}] {t['title']} ({t['estimate']} • {t['priority']})\n"
            markdown_doc += f"{t['description']}\n\n"
            markdown_doc += "**Acceptance Criteria:**\n"
            for ac in t["acceptance_criteria"]:
                markdown_doc += f"- [ ] {ac}\n"
            markdown_doc += "\n"

        return {
            "opportunity_id": opp.get("id"),
            "title": title,
            "target_audience": target_audience,
            "category": category,
            "problem_thesis": problem_thesis,
            "suggested_solution": suggested_solution,
            "tech_stack": blueprint["tech_stack"],
            "mvp_phases": blueprint["mvp_phases"],
            "edge_cases": blueprint["edge_cases"],
            "schema_ddl": blueprint["schema_ddl"],
            "api_endpoints": blueprint["api_endpoints"],
            "linear_tickets": blueprint["linear_tickets"],
            "markdown_content": markdown_doc
        }
