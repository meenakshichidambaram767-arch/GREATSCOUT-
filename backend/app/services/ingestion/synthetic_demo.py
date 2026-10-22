from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from backend.app.services.ingestion.base import BaseIngestionAdapter

# Realistic market problem datasets explicitly flagged with is_synthetic: True
SYNTHETIC_DATASET = [
    # 1. Developer Tools & Serverless Observability
    {
        "external_id": "demo_dev_01",
        "title": "Why is debugging silent serverless webhook failures still a nightmare?",
        "content": "We had a critical outage where Stripe webhook events timed out silently inside AWS Lambda. Sentry only logged a generic 504 gateway timeout without the incoming webhook body or headers. We lost $4,200 in customer subscriptions because we couldn't replay the dropped payload. Datadog is way too expensive for our 5-person team ($500/month minimum). We desperately need a drop-in 2-line SDK that logs and auto-retries failed webhook payloads with visual replay.",
        "author": "serverless_dev_alex",
        "url": "https://reddit.com/r/SaaS/comments/demo_dev_01",
        "upvotes": 128,
        "comment_count": 42,
        "category": "Developer Tools",
        "days_ago": 2,
    },
    {
        "external_id": "demo_dev_02",
        "title": "Webhook payload dead-letter queues are horribly overcomplicated",
        "content": "Every time our third-party integrations (Shopify, Stripe, Twilio) fail, our backend devs spend 3 hours digging through CloudWatch log streams. Existing observability tools don't correlate the original request body with the failed retry attempts. I would happily pay $99/mo for an observability tool tailored specifically for webhook payloads and async queues.",
        "author": "backend_lead_marcus",
        "url": "https://reddit.com/r/startups/comments/demo_dev_02",
        "upvotes": 89,
        "comment_count": 27,
        "category": "Developer Tools",
        "days_ago": 4,
    },
    {
        "external_id": "demo_dev_03",
        "title": "Product Hunt Discussion: What developer tool do you wish existed in 2026?",
        "content": "A developer tool that makes webhook testing and error monitoring dead simple. Right now we use ngrok for local dev and custom SQS dead-letter queues in prod, but there is zero unified visibility when webhooks silently fail or drop payload attributes during schema changes.",
        "author": "ph_maker_elena",
        "url": "https://www.producthunt.com/discussions/demo_dev_03",
        "upvotes": 74,
        "comment_count": 35,
        "category": "Developer Tools",
        "days_ago": 5,
    },

    # 2. SaaS Operations & Billing Reconciliation
    {
        "external_id": "demo_saas_01",
        "title": "Reconciling Stripe subscriptions with manual wire transfers is breaking our accounting",
        "content": "Our enterprise clients pay via ACH and international bank wire, while smaller clients pay via Stripe. QuickBooks and Xero don't automatically match the bank wire reference numbers with the pending invoices in Stripe Billing. Our accountant spends 15 hours at every month-end manually checking CSV exports line by line. We evaluated Anrok and Chargebee, but they are enterprise bloatware requiring annual contracts.",
        "author": "founder_sarah_k",
        "url": "https://reddit.com/r/SaaS/comments/demo_saas_01",
        "upvotes": 145,
        "comment_count": 56,
        "category": "SaaS Operations",
        "days_ago": 1,
    },
    {
        "external_id": "demo_saas_02",
        "title": "Why doesn't Stripe have native intelligent payment reconciliation for wire payments?",
        "content": "If a customer wires $12,450 for an annual plan, Stripe doesn't mark the invoice paid unless you manually generate a credit note or use complicated virtual bank accounts that confuse clients. We have 40+ outstanding invoices every month that require manual email chases even though the funds already cleared our Chase account.",
        "author": "b2b_ops_jason",
        "url": "https://reddit.com/r/startups/comments/demo_saas_02",
        "upvotes": 96,
        "comment_count": 31,
        "category": "SaaS Operations",
        "days_ago": 3,
    },
    {
        "external_id": "demo_saas_03",
        "title": "Month-end close is an Excel nightmare for bootstrapped SaaS companies",
        "content": "We run on Stripe Billing + Mercury Bank. Every month we spend 2 full days matching bank line items with customer accounts. A micro-tool that connects Stripe and bank APIs to auto-match payments with 99% confidence would save us thousands in bookkeeping fees.",
        "author": "bootstrapper_dave",
        "url": "https://www.producthunt.com/discussions/demo_saas_03",
        "upvotes": 82,
        "comment_count": 29,
        "category": "SaaS Operations",
        "days_ago": 6,
    },

    # 3. AI Automation & LLM Structured Reliability
    {
        "external_id": "demo_ai_01",
        "title": "LLM Structured JSON outputs keep failing schema validation in production",
        "content": "We are building an AI agent workflow and OpenAI/Anthropic models frequently return malformed JSON or drop required schema fields during peak latency periods. When this happens, our downstream Postgres ingestion pipeline throws validation errors and user jobs crash. Existing libraries like Instructor help, but there is no central monitoring dashboard to catch schema drift and hallucinated field names before users notice.",
        "author": "ai_engineer_victor",
        "url": "https://reddit.com/r/MachineLearning/comments/demo_ai_01",
        "upvotes": 210,
        "comment_count": 64,
        "category": "AI Automation",
        "days_ago": 2,
    },
    {
        "external_id": "demo_ai_02",
        "title": "Tool calling latency and hallucinated arguments are killing our voice agent",
        "content": "Our users expect sub-800ms responses. When the LLM outputs invalid function arguments, the retry loop adds 2 full seconds of awkward silence. We need a lightweight proxy or middleware layer that automatically repairs schema violations in-flight without re-running the full prompt.",
        "author": "voice_ai_kevin",
        "url": "https://reddit.com/r/SaaS/comments/demo_ai_02",
        "upvotes": 162,
        "comment_count": 48,
        "category": "AI Automation",
        "days_ago": 4,
    },
    {
        "external_id": "demo_ai_03",
        "title": "Product Hunt Discussion: The biggest bottleneck in deploying LLM apps to production",
        "content": "Guaranteed schema compliance. Everyone loves prototyping with prompt engineering, but when you put an LLM in a production API that outputs to a SQL database, schema drift and unexpected enum values break downstream code constantly. LangSmith monitors tokens, but doesn't auto-repair invalid structured outputs.",
        "author": "ph_maker_zack",
        "url": "https://www.producthunt.com/discussions/demo_ai_03",
        "upvotes": 118,
        "comment_count": 39,
        "category": "AI Automation",
        "days_ago": 5,
    },

    # 4. Remote Collaboration & Context Sprawl
    {
        "external_id": "demo_remote_01",
        "title": "Meeting transcript tools generate endless summaries that nobody actually reads",
        "content": "Our company uses Otter and Fireflies for every Zoom call. We now have 400 pages of AI summaries sitting in a folder that nobody opens. When a project manager asks 'what did we agree to regarding the authentication rewrite?', we still have to spend 30 minutes searching across Slack, Notion, and transcripts. We don't need more summaries; we need an action tracker that extracts committed deliverables and links them directly to Jira tickets.",
        "author": "eng_manager_priya",
        "url": "https://reddit.com/r/productivity/comments/demo_remote_01",
        "upvotes": 178,
        "comment_count": 52,
        "category": "Remote Work",
        "days_ago": 3,
    },
    {
        "external_id": "demo_remote_02",
        "title": "Context fragmentation between Slack threads and Linear/Jira is out of control",
        "content": "Crucial architectural decisions happen in informal Slack huddles and threads. By the time someone creates a ticket, half the context and rejected alternatives are lost. Existing bots just create messy dump tickets. We need intelligent extraction of decision rationale.",
        "author": "tech_lead_rachel",
        "url": "https://reddit.com/r/startups/comments/demo_remote_02",
        "upvotes": 112,
        "comment_count": 33,
        "category": "Remote Work",
        "days_ago": 5,
    },

    # 5. E-Commerce Multi-Channel Inventory & Returns
    {
        "external_id": "demo_ecom_01",
        "title": "Multi-channel inventory sync lag between Shopify and Amazon is causing overselling",
        "content": "We sell on both Shopify and Amazon FBM. When a flash sale happens on TikTok Shop, inventory sync lags by 15-20 minutes through our current middleware. We oversold 120 units last weekend and had to issue refunds while taking Amazon defect rate hits. Inventory planner tools like Katana are expensive and don't offer real-time sub-minute webhook sync.",
        "author": "ecom_brand_owner_leo",
        "url": "https://reddit.com/r/ecommerce/comments/demo_ecom_01",
        "upvotes": 134,
        "comment_count": 41,
        "category": "E-Commerce",
        "days_ago": 2,
    },
    {
        "external_id": "demo_ecom_02",
        "title": "Returns management for direct-to-consumer brands is eating all our margin",
        "content": "Returnly and Loop Returns charge high monthly platform fees plus per-label costs. For smaller D2C brands ($50k-$200k/mo), returns tracking and restock classification should not cost $400/month. A lightweight self-service return portal that auto-generates USPS QR codes without heavy subscription lock-in would be an instant buy.",
        "author": "dtc_founder_clara",
        "url": "https://www.producthunt.com/discussions/demo_ecom_02",
        "upvotes": 95,
        "comment_count": 28,
        "category": "E-Commerce",
        "days_ago": 6,
    }
]


class SyntheticDemoAdapter(BaseIngestionAdapter):
    """
    Supplies rich, realistic market intelligence records for zero-credential development and demonstration.
    All records explicitly flag is_synthetic: True.
    """

    async def fetch_documents(self, limit: int = 50, category: str = "all") -> List[Dict[str, Any]]:
        results = []
        now = datetime.now(timezone.utc)

        filtered = SYNTHETIC_DATASET
        if category and category.lower() != "all":
            filtered = [item for item in SYNTHETIC_DATASET if item.get("category", "").lower() == category.lower()]

        for item in filtered[:limit]:
            pub_date = now - timedelta(days=item.get("days_ago", 1))
            results.append({
                "external_id": item["external_id"],
                "title": item["title"],
                "content": item["content"],
                "author": item["author"],
                "url": item["url"],
                "upvotes": item["upvotes"],
                "comment_count": item["comment_count"],
                "is_synthetic": True, # Explicitly identified as synthetic per instructions
                "category": item.get("category", "General SaaS"),
                "published_at": pub_date.isoformat(),
            })

        return results
