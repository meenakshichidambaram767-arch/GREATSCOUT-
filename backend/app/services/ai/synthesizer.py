from typing import Dict, Any, List


class OpportunitySynthesizer:
    """
    Synthesizes structured opportunity dossiers from clustered user friction signals.
    Ensures every opportunity report is strictly grounded in the underlying user evidence.
    """

    CATALOG_TEMPLATES = {
        "Developer Tools": {
            "title": "Serverless Webhook Observability & Zero-Drop Replay Engine",
            "target_audience": "Backend & Full-Stack Engineers deploying serverless microservices",
            "problem_thesis": "Developers frequently encounter silent webhook timeouts and payload loss during third-party integration drops, with existing observability tools failing to preserve full request payloads.",
            "why_current_solutions_fail": "Incumbents like Datadog and Sentry are priced for enterprise budgets ($500+/mo) and only capture generic timeout exceptions without the incoming webhook body required to replay transactions.",
            "suggested_solution": "A drop-in 2-line SDK with automated payload capture, visual dead-letter queue inspector, and one-click replay for failed webhook events.",
        },
        "SaaS Operations": {
            "title": "Automated Stripe & Bank Wire Invoice Reconciliation Hub",
            "target_audience": "B2B SaaS Founders, Finance Leads, and Operations Accountants",
            "problem_thesis": "Bootstrapped and scaling SaaS companies lose 10-15 hours monthly manually reconciling bank wire transfers and ACH payments with Stripe Billing subscriptions.",
            "why_current_solutions_fail": "QuickBooks and Xero lack native bidirectional Stripe metadata syncing for wire payments, while enterprise revenue platforms like Chargebee require burdensome annual contracts.",
            "suggested_solution": "A zero-touch reconciliation engine that matches incoming bank wire transaction descriptors with pending Stripe invoices with 99% automated confidence.",
        },
        "AI Automation": {
            "title": "LLM Production Schema Guard & In-Flight Output Repair Middleware",
            "target_audience": "AI Engineers and Technical Founders deploying structured LLM applications",
            "problem_thesis": "Production LLM agents regularly produce schema drift, malformed JSON structures, and hallucinated function arguments that break downstream relational database pipelines.",
            "why_current_solutions_fail": "Token monitoring tools like LangSmith only log errors post-facto; prompting models to self-retry adds 2-3 seconds of critical user-facing latency and ballooning API costs.",
            "suggested_solution": "High-speed schema validation proxy that intercepts and automatically repairs common JSON formatting and enum discrepancies in-flight within 20 milliseconds.",
        },
        "Remote Work": {
            "title": "Executive Action Item Tracker & Rationale Sync for Asynchronous Teams",
            "target_audience": "Engineering Managers and Technical Product Leads",
            "problem_thesis": "Teams are overwhelmed by redundant AI meeting transcripts while key architectural rationales and agreed commitments remain lost across disjointed Slack threads.",
            "why_current_solutions_fail": "Meeting transcription bots like Otter and Fireflies generate passive text dumps without bi-directional synchronization into Jira or Linear task backlogs.",
            "suggested_solution": "An intelligent context tracker that extracts ratified decisions and committed deliverables from discussions and creates synced, contextualized tickets.",
        },
        "E-Commerce": {
            "title": "Real-Time Multi-Channel Inventory Webhook Sync for Independent Brands",
            "target_audience": "Omnichannel Direct-to-Consumer Brands & E-Commerce Operations Managers",
            "problem_thesis": "Inventory sync delays between Shopify, TikTok Shop, and Amazon result in overselling, stockout cancellations, and costly marketplace penalties.",
            "why_current_solutions_fail": "Legacy inventory management suites operate on batch 15-minute polling intervals and charge exorbitant platform surcharges that erode direct-to-consumer gross margins.",
            "suggested_solution": "Sub-minute event-driven inventory routing middleware providing real-time stock allocation across all connected storefronts.",
        }
    }

    @classmethod
    def synthesize_opportunity(cls, cluster: Dict[str, Any], scores: Dict[str, float]) -> Dict[str, Any]:
        category = cluster.get("category", "General SaaS")
        signals = cluster.get("signals", [])
        label = cluster.get("label", "Market Problem")

        # Intelligently infer category from cluster label and content if General SaaS
        label_lower = label.lower()
        if category == "General SaaS":
            if any(k in label_lower for k in ["webhook", "lambda", "sentry", "serverless", "api", "cloudwatch"]):
                category = "Developer Tools"
            elif any(k in label_lower for k in ["stripe", "wire", "reconcil", "invoice", "accounting", "billing"]):
                category = "SaaS Operations"
            elif any(k in label_lower for k in ["llm", "schema", "json", "prompt", "token", "hallucin"]):
                category = "AI Automation"
            elif any(k in label_lower for k in ["transcript", "meeting", "slack", "huddle", "jira", "linear"]):
                category = "Remote Work"
            elif any(k in label_lower for k in ["shopify", "amazon", "inventory", "ecommerce", "return", "usps"]):
                category = "E-Commerce"

        # Pick appropriate baseline template or customize from cluster signals
        template = cls.CATALOG_TEMPLATES.get(category)
        if not template:
            clean_title = label.rstrip('.').title()
            template = {
                "title": f"{clean_title} Platform",
                "target_audience": f"Operators and teams dealing with {category}",
                "problem_thesis": f"Recurring user dissatisfaction centered around {label}.",
                "why_current_solutions_fail": "Existing market tools are fragmented, overly expensive, or lack workflow-specific automation.",
                "suggested_solution": f"A targeted workflow tool designed to eliminate manual friction in {label}.",
            }

        # Dynamically inject quotes and details from signals if available
        if signals:
            first_quote = signals[0].get("raw_quote", "")
            title = template["title"]
            problem_thesis = template["problem_thesis"]
            if first_quote and len(first_quote) > 30:
                problem_thesis += f" Users report: '{first_quote[:150]}...'"
        else:
            title = template["title"]
            problem_thesis = template["problem_thesis"]

        # Confidence rating
        overall = scores.get("overall_score", 70.0)
        signal_count = len(signals)
        if overall >= 80.0 and signal_count >= 2:
            confidence = "high"
        elif overall >= 65.0:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "title": title,
            "target_audience": template["target_audience"],
            "category": category,
            "problem_thesis": problem_thesis,
            "why_current_solutions_fail": template["why_current_solutions_fail"],
            "suggested_solution": template["suggested_solution"],
            "confidence_level": confidence,
            "status": "active"
        }
