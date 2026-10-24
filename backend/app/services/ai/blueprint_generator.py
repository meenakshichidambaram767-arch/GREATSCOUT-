from typing import Dict, Any, List


class MVPBlueprintGenerator:
    """
    Generates an actionable 1-click MVP Blueprint and Product Requirement Document (PRD)
    tailored to a specific discovered opportunity.
    """

    BLUEPRINT_CATALOG = {
        "Developer Tools": {
            "elevator_pitch": "A drop-in 2-line SDK and developer dashboard that captures 100% of incoming webhooks, provides visual payload debugging, and automatically replays dropped events.",
            "mvp_scope_weeks": 2,
            "core_features": [
                {
                    "name": "Zero-Drop Ingestion Proxy",
                    "description": "Lightweight webhook forwarding proxy that buffers incoming payloads in Redis before dispatching to application servers.",
                    "priority": "P0 (Must Have)",
                    "effort": "3 days"
                },
                {
                    "name": "Visual Dead-Letter Queue & Payload Diff",
                    "description": "Developer dashboard to inspect exact HTTP headers, request bodies, and error stack traces for failed webhook executions.",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "1-Click Webhook Replay with Header Spoofing",
                    "description": "Allows engineers to re-send failed events directly to staging or local environments with custom headers.",
                    "priority": "P0 (Must Have)",
                    "effort": "3 days"
                },
                {
                    "name": "Slack & PagerDuty Alert Rules",
                    "description": "Instant notification rules triggered when endpoint error rate exceeds 5% in a 5-minute rolling window.",
                    "priority": "P1 (Nice to Have)",
                    "effort": "2 days"
                }
            ],
            "tech_stack": {
                "frontend": "Next.js 14 / React with Tailwind CSS & Lucide Icons",
                "backend": "FastAPI (Python) with AsyncIO & Redis Streams",
                "database": "PostgreSQL (Supabase) + TimescaleDB for telemetry",
                "auth": "Clerk or GitHub OAuth",
                "payments": "Stripe Billing (per-event tiered pricing)",
                "key_apis": "SendGrid for notifications, Redis Cloud for buffering"
            },
            "pricing_model": {
                "recommended_tier": "$29/month base + $0.0001 per replayed event",
                "strategy": "Freemium: Free up to 10,000 monthly events, then $29/mo starter",
                "rationale": "Directly undercuts Datadog ($400+/mo) while providing the specific payload recovery feature engineers actually need."
            },
            "first_100_customers_playbook": [
                {
                    "channel": "Reddit: r/webdev, r/node, r/golang",
                    "tactic": "Reply directly to threads discussing silent webhook timeouts with a link to an open-source test proxy."
                },
                {
                    "channel": "Product Hunt & Hacker News Show HN",
                    "tactic": "Launch as 'The open-source webhook recorder that stops silent data loss'."
                },
                {
                    "channel": "GitHub Marketplace Action",
                    "tactic": "Release a free CLI tool `curl-replay` that integrates directly into GitHub Actions."
                }
            ]
        },
        "SaaS Operations": {
            "elevator_pitch": "A zero-touch invoice reconciliation platform that automatically matches Stripe subscriptions with offline wire transfers and ACH deposits.",
            "mvp_scope_weeks": 2,
            "core_features": [
                {
                    "name": "Bidirectional Stripe & Bank Feed Sync",
                    "description": "Secure Plaid bank account integration coupled with Stripe webhooks to ingest pending invoices and deposits.",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "Fuzzy Descriptor Matching Algorithm",
                    "description": "Matches customer company names, reference numbers, and payment amounts with 99% automated confidence.",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "1-Click Invoice Mark-as-Paid in Stripe",
                    "description": "Immediately updates Stripe invoice status and customer entitlement upon verified reconciliation.",
                    "priority": "P0 (Must Have)",
                    "effort": "2 days"
                },
                {
                    "name": "Audit Trail & QuickBooks Export",
                    "description": "Generates GAAP-compliant CSV and direct QuickBooks sync for monthly bookkeeping closure.",
                    "priority": "P1 (Nice to Have)",
                    "effort": "3 days"
                }
            ],
            "tech_stack": {
                "frontend": "React with Tailwind CSS & TanStack Table",
                "backend": "FastAPI with SQLAlchemy & Pydantic",
                "database": "PostgreSQL with row-level encryption",
                "auth": "Google Workspace & Microsoft SSO",
                "payments": "Stripe Subscriptions",
                "key_apis": "Plaid Bank Feeds API, Stripe API, QuickBooks Online SDK"
            },
            "pricing_model": {
                "recommended_tier": "$49/month for up to 100 reconciled wires",
                "strategy": "Flat-rate monthly plan with 14-day risk-free trial",
                "rationale": "Saves 10-15 hours of manual accountant time worth over $500/month."
            },
            "first_100_customers_playbook": [
                {
                    "channel": "LinkedIn & B2B SaaS Communities",
                    "tactic": "Direct outreach to Finance Leads and Operations Managers at Series A/B startups."
                },
                {
                    "channel": "Accounting Firms & Fractional CFOs",
                    "tactic": "Partner with 5 boutique accounting firms by offering them a free multi-client agency dashboard."
                },
                {
                    "channel": "r/SaaS & indiehackers.com",
                    "tactic": "Publish case study: 'How manual wire reconciliation costs bootstrapped SaaS $6,000/year'."
                }
            ]
        },
        "AI Automation": {
            "elevator_pitch": "A high-speed schema validation proxy that intercepts and automatically repairs malformed JSON and enum drift from LLMs before it breaks databases.",
            "mvp_scope_weeks": 2,
            "core_features": [
                {
                    "name": "Streaming JSON Sanitizer & Heuristic Healer",
                    "description": "Detects unescaped quotes, trailing commas, and markdown fence blocks in LLM outputs and repairs them in-memory (<15ms).",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "Pydantic & Zod Schema Importer",
                    "description": "Upload existing TypeScript Zod schemas or Python Pydantic models to automatically configure validation boundaries.",
                    "priority": "P0 (Must Have)",
                    "effort": "3 days"
                },
                {
                    "name": "Fallback Prompt Rewriter",
                    "description": "If schema validation completely fails, automatically re-prompts the model with exact validation error diffs.",
                    "priority": "P0 (Must Have)",
                    "effort": "3 days"
                },
                {
                    "name": "Schema Drift Analytics Dashboard",
                    "description": "Visual report showing error rate trends across OpenAI, Anthropic, and Gemini models.",
                    "priority": "P1 (Nice to Have)",
                    "effort": "2 days"
                }
            ],
            "tech_stack": {
                "frontend": "React 18 + Tailwind + Monaco Code Editor",
                "backend": "Python / Rust with Axum or FastAPI",
                "database": "ClickHouse / SQLite for analytics",
                "auth": "API Key authentication + Clerk",
                "payments": "Stripe Usage-Based Metering",
                "key_apis": "OpenAI API, Anthropic API, Google GenAI SDK"
            },
            "pricing_model": {
                "recommended_tier": "$0.0005 per validated request or $39/mo for 250k requests",
                "strategy": "Developer-friendly pay-as-you-go with 10k free calls",
                "rationale": "Cheaper than paying for model retries while completely eliminating downstream production crashes."
            },
            "first_100_customers_playbook": [
                {
                    "channel": "Twitter / X AI Engineering Community",
                    "tactic": "Post side-by-side benchmark videos showing JSON errors being healed live in 12ms."
                },
                {
                    "channel": "LangChain & LlamaIndex Discord Channels",
                    "tactic": "Share integration guide showing how to use the proxy in 1 line of Python code."
                },
                {
                    "channel": "Hacker News & GitHub Trending",
                    "tactic": "Release the core regex repair utility as an open-source npm/pip package."
                }
            ]
        },
        "E-Commerce": {
            "elevator_pitch": "A lightweight, real-time inventory bridge that syncs stock levels between Shopify, TikTok Shop, and Amazon in under 3 seconds to stop overselling.",
            "mvp_scope_weeks": 2,
            "core_features": [
                {
                    "name": "Instant Webhook Event Listener",
                    "description": "Listens for Shopify `orders/create` and Amazon SP-API events and updates available stock across stores immediately.",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "Oversell Buffer Thresholds",
                    "description": "Allows merchants to set safety reserve stock levels (e.g. hold 2 units reserve during flash sales).",
                    "priority": "P0 (Must Have)",
                    "effort": "2 days"
                },
                {
                    "name": "Automated SKU Mapping Assistant",
                    "description": "Matches differently named product variants across marketplaces by barcode (UPC/EAN) or title.",
                    "priority": "P0 (Must Have)",
                    "effort": "4 days"
                },
                {
                    "name": "Inventory Discrepancy SMS Alerts",
                    "description": "Sends instant text message if marketplace API rate limits prevent inventory adjustments.",
                    "priority": "P1 (Nice to Have)",
                    "effort": "2 days"
                }
            ],
            "tech_stack": {
                "frontend": "React with Tailwind CSS & Recharts",
                "backend": "FastAPI + Celery / Redis background worker",
                "database": "PostgreSQL with optimistic locking",
                "auth": "Shopify OAuth & Amazon SP-API Auth",
                "payments": "Shopify Billing API & Stripe",
                "key_apis": "Shopify Admin API, Amazon Selling Partner API, TikTok Shop Open API"
            },
            "pricing_model": {
                "recommended_tier": "$39/month flat rate (up to 3 connected stores)",
                "strategy": "No percentage fees or order limits, contrasting with legacy tools that charge 1-2% of gross merchandise volume.",
                "rationale": "Directly saves direct-to-consumer brands hundreds of dollars in marketplace out-of-stock penalties."
            },
            "first_100_customers_playbook": [
                {
                    "channel": "Shopify App Store Launch",
                    "tactic": "Submit to Shopify App Store with 'Zero-Lag Inventory Bridge' as primary keyword."
                },
                {
                    "channel": "r/ecommerce & r/FulfillmentByAmazon",
                    "tactic": "Offer free audit of oversell occurrences for multi-channel merchants."
                },
                {
                    "channel": "E-Commerce Agency Partnerships",
                    "tactic": "Provide 20% recurring affiliate commissions to Shopify setup agencies."
                }
            ]
        }
    }

    @classmethod
    def generate(cls, opp: Any) -> Dict[str, Any]:
        """Generates a complete blueprint for an opportunity."""
        category = getattr(opp, "category", "General SaaS")
        title = getattr(opp, "title", "Innovative Solution")
        problem = getattr(opp, "problem_thesis", "User friction exists in current workflow.")
        target_audience = getattr(opp, "target_audience", "Modern professionals")
        suggested_solution = getattr(opp, "suggested_solution", "A focused tool solving this pain point.")

        catalog_entry = cls.BLUEPRINT_CATALOG.get(category)
        if not catalog_entry:
            # Fallback dynamic blueprint
            catalog_entry = {
                "elevator_pitch": f"A targeted, easy-to-use software solution designed specifically for {target_audience} to eliminate friction in: {title}.",
                "mvp_scope_weeks": 2,
                "core_features": [
                    {
                        "name": "Core Automated Workflow Engine",
                        "description": f"Automates manual friction described in: '{problem[:100]}...'",
                        "priority": "P0 (Must Have)",
                        "effort": "4 days"
                    },
                    {
                        "name": "Real-time Dashboard & Alerts",
                        "description": "Visual reporting and instant notifications when anomalies occur.",
                        "priority": "P0 (Must Have)",
                        "effort": "3 days"
                    },
                    {
                        "name": "1-Click CSV & Webhook Integrations",
                        "description": "Seamless data import and export into existing customer tools.",
                        "priority": "P0 (Must Have)",
                        "effort": "3 days"
                    }
                ],
                "tech_stack": {
                    "frontend": "React with Tailwind CSS & Lucide Icons",
                    "backend": "FastAPI (Python) with SQLAlchemy Async",
                    "database": "PostgreSQL (Supabase)",
                    "auth": "Clerk / OAuth",
                    "payments": "Stripe Subscriptions",
                    "key_apis": "REST / Webhooks"
                },
                "pricing_model": {
                    "recommended_tier": "$29 - $49 / month per user",
                    "strategy": "14-day free trial, no credit card required",
                    "rationale": "Affordable entry pricing targeting quick credit card approval without procurement delays."
                },
                "first_100_customers_playbook": [
                    {
                        "channel": "Direct Community Outreach",
                        "tactic": "Contact users who posted the verbatim complaints discovered by GreatScout."
                    },
                    {
                        "channel": "Product Hunt & Hacker News Launch",
                        "tactic": "Position as a lightweight alternative to bloated existing incumbents."
                    }
                ]
            }

        # Build full Markdown PRD ready for Notion / Linear
        markdown_prd = f"""# Product Requirements Document (PRD)
## {title}

**Target Audience:** {target_audience}  
**Status:** MVP Specification  
**Build Timeline:** {catalog_entry["mvp_scope_weeks"]} Weeks  

---

### 1. Executive Summary & Problem Thesis
{problem}

**Proposed Solution:**
{suggested_solution}

**Elevator Pitch:**
{catalog_entry["elevator_pitch"]}

---

### 2. Core MVP Feature Scope
"""
        for feat in catalog_entry["core_features"]:
            markdown_prd += f"- **{feat['name']}** [{feat['priority']} - Est: {feat['effort']}]: {feat['description']}\n"

        markdown_prd += f"""
---

### 3. Recommended Tech Stack
- **Frontend:** {catalog_entry["tech_stack"]["frontend"]}
- **Backend:** {catalog_entry["tech_stack"]["backend"]}
- **Database:** {catalog_entry["tech_stack"]["database"]}
- **Auth:** {catalog_entry["tech_stack"]["auth"]}
- **Payments:** {catalog_entry["tech_stack"]["payments"]}

---

### 4. Pricing & Monetization Model
- **Recommended Tier:** {catalog_entry["pricing_model"]["recommended_tier"]}
- **Strategy:** {catalog_entry["pricing_model"]["strategy"]}
- **Rationale:** {catalog_entry["pricing_model"]["rationale"]}

---

### 5. First 100 Customers Launch Plan
"""
        for step in catalog_entry["first_100_customers_playbook"]:
            markdown_prd += f"- **{step['channel']}**: {step['tactic']}\n"

        markdown_prd += "\n*Generated automatically by GreatScout Product Intelligence Platform.*"

        return {
            "opportunity_id": getattr(opp, "id", "demo"),
            "title": title,
            "category": category,
            "target_audience": target_audience,
            "elevator_pitch": catalog_entry["elevator_pitch"],
            "mvp_scope_weeks": catalog_entry["mvp_scope_weeks"],
            "core_features": catalog_entry["core_features"],
            "tech_stack": catalog_entry["tech_stack"],
            "pricing_model": catalog_entry["pricing_model"],
            "first_100_customers_playbook": catalog_entry["first_100_customers_playbook"],
            "markdown_prd": markdown_prd
        }
