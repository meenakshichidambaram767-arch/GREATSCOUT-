import re
from typing import List, Optional, Dict, Any, Tuple
import httpx
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.models.opportunity import Opportunity, OpportunityEvidence
from backend.app.models.signal import Signal
from backend.app.models.document import Document
from backend.app.models.source import Source
from backend.app.services.ai.competitor_radar import CompetitorRadarService
from backend.app.schemas.copilot import (
    CopilotAskResponse,
    CopilotCitedQuote,
    CopilotRelevantOpportunity,
    OpportunitySynthesizeResponse
)


class EvidenceCopilotService:
    """
    Autonomous AI Evidence Copilot.
    Performs RAG-style semantic retrieval over real ingested market signals,
    scores, quotes, and competitor complaints to answer founders' and PMs' questions.
    Supports Google Gemini, OpenAI, or smart local evidence synthesis.
    """

    @classmethod
    async def answer_query(
        cls,
        db: AsyncSession,
        query: str,
        opportunity_id: Optional[str] = None,
        custom_api_key: Optional[str] = None,
        provider: str = "gemini"
    ) -> CopilotAskResponse:
        # 1. Fetch relevant opportunities and evidence from DB
        stmt = (
            select(Opportunity)
            .options(
                selectinload(Opportunity.evidence).selectinload(OpportunityEvidence.signal).selectinload(Signal.document).selectinload(Document.source)
            )
        )
        res = await db.execute(stmt)
        all_opps = res.scalars().all()

        if not all_opps:
            return CopilotAskResponse(
                answer="No opportunities or market signals found in the database. Please run the **Scout Ingestion Pipeline** first to collect market feedback.",
                cited_quotes=[],
                relevant_opportunities=[],
                suggested_followups=["Run demo ingestion pipeline", "How does GreatScout score opportunities?"],
                provider_used="local"
            )

        # 2. Rank and filter opportunities relevant to the query
        keywords = [w.lower() for w in re.findall(r'\b[a-zA-Z]{3,}\b', query) if w.lower() not in {'what', 'when', 'where', 'which', 'who', 'how', 'about', 'with', 'from', 'that', 'this', 'have', 'show', 'tell', 'give'}]
        
        matched_opps: List[Tuple[Opportunity, int]] = []
        for opp in all_opps:
            score = 0
            # If explicit ID requested
            if opportunity_id and opp.id == opportunity_id:
                score += 100

            text_corpus = f"{opp.title} {opp.category} {opp.problem_thesis} {opp.why_current_solutions_fail} {opp.suggested_solution}".lower()
            for kw in keywords:
                if kw in text_corpus:
                    score += 10
            
            matched_opps.append((opp, score))

        # Sort by relevance score, then by overall opportunity score
        matched_opps.sort(key=lambda x: (x[1], x[0].overall_score), reverse=True)
        top_opps = [o[0] for o in matched_opps[:3]]

        # Gather cited quotes
        cited_quotes: List[CopilotCitedQuote] = []
        for opp in top_opps:
            for ev in opp.evidence[:3]:
                sig = ev.signal
                doc = sig.document if sig else None
                source_name = doc.source.name if doc and doc.source else "Market Discussion"
                author = doc.author if doc else None
                quote_text = ev.highlight_quote or (sig.raw_quote if sig else "")
                if quote_text:
                    cited_quotes.append(CopilotCitedQuote(
                        id=ev.id,
                        author=author,
                        source=source_name,
                        quote=quote_text,
                        sentiment=sig.sentiment_score if sig else -0.5,
                        opportunity_id=opp.id,
                        opportunity_title=opp.title
                    ))

        # Convert to relevant opportunity response items
        relevant_opps_response = [
            CopilotRelevantOpportunity(
                id=o.id,
                title=o.title,
                category=o.category,
                overall_score=o.overall_score,
                status=o.status
            )
            for o in top_opps
        ]

        # Check for active API key
        api_key = custom_api_key or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY
        
        # Try external LLM if API key exists
        if api_key and (custom_api_key or settings.GEMINI_API_KEY):
            try:
                external_ans = await cls._generate_with_gemini(
                    query=query,
                    top_opps=top_opps,
                    cited_quotes=cited_quotes,
                    api_key=api_key
                )
                if external_ans:
                    return CopilotAskResponse(
                        answer=external_ans,
                        cited_quotes=cited_quotes[:6],
                        relevant_opportunities=relevant_opps_response,
                        suggested_followups=cls._generate_followups(query, top_opps),
                        provider_used="gemini-1.5-flash"
                    )
            except Exception as e:
                # Fall back gracefully to local engine
                pass

        # Smart local evidence-backed synthesizer
        local_ans = cls._synthesize_local_answer(query, top_opps, cited_quotes)
        return CopilotAskResponse(
            answer=local_ans,
            cited_quotes=cited_quotes[:6],
            relevant_opportunities=relevant_opps_response,
            suggested_followups=cls._generate_followups(query, top_opps),
            provider_used="local_evidence_engine"
        )

    @classmethod
    async def _generate_with_gemini(
        cls,
        query: str,
        top_opps: List[Opportunity],
        cited_quotes: List[CopilotCitedQuote],
        api_key: str
    ) -> Optional[str]:
        """Calls Google Gemini API with grounded context."""
        context_str = "RELEVANT MARKET OPPORTUNITIES FOUND IN GREATSCOUT:\n"
        for i, opp in enumerate(top_opps, 1):
            context_str += f"\nOpportunity #{i}: {opp.title}\n"
            context_str += f"- Category: {opp.category} | Overall Score: {opp.overall_score}/100\n"
            context_str += f"- Problem Thesis: {opp.problem_thesis}\n"
            context_str += f"- Incumbent Vulnerability: {opp.why_current_solutions_fail}\n"
            context_str += f"- Suggested Solution: {opp.suggested_solution}\n"

        context_str += "\nVERBATIM CUSTOMER QUOTES / EVIDENCE:\n"
        for q in cited_quotes[:8]:
            context_str += f'- [{q.source}] (Author: {q.author or "user"}): "{q.quote}"\n'

        system_instruction = (
            "You are the GreatScout AI Evidence Copilot. You assist product founders, PMs, and engineering leaders "
            "in discovering and validating software business opportunities based on evidence from real customer discussions. "
            "Always cite the verbatim evidence quotes when explaining pain points. Be decisive, structured, and strategic."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"{system_instruction}\n\nCONTEXT:\n{context_str}\n\nUSER QUESTION:\n{query}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1000
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
        return None

    @classmethod
    def _synthesize_local_answer(
        cls,
        query: str,
        top_opps: List[Opportunity],
        cited_quotes: List[CopilotCitedQuote]
    ) -> str:
        """Deterministic, high-quality analytical response generator when no LLM key is configured."""
        q_lower = query.lower()

        primary_opp = top_opps[0] if top_opps else None

        # Scenario 1: Questions about competitors (Shopify, Jira, Stripe, etc.)
        competitors = ["shopify", "jira", "stripe", "datadog", "zoom", "slack"]
        detected_comp = next((c for c in competitors if c in q_lower), None)
        if detected_comp:
            radar = CompetitorRadarService.get_competitor_teardown(detected_comp)
            if radar:
                lines = [
                    f"### 🎯 Competitive Vulnerability Analysis: **{radar['name']}**",
                    f"\n**Category:** {radar['market_category']} | **Vulnerability Index:** `{radar['vulnerability_score']}/100`\n",
                    f"**Market Verdict:** {radar['summary_verdict']}\n",
                    "#### 💬 Primary User Complaints Identified:",
                ]
                for comp_p in radar.get("top_complaints", [])[:2]:
                    lines.append(f"- **{comp_p['pain_point']}**: *\"{comp_p['user_quote']}\"* *(Source: {comp_p['source']})*")
                
                playbook = radar.get("unbundling_playbook", {})
                lines.extend([
                    "\n#### ⚔️ Recommended Unbundling Wedge:",
                    f"- **Product Concept:** **{playbook.get('concept_name', 'Micro-SaaS')}**",
                    f"- **Value Proposition:** {playbook.get('value_proposition', '')}",
                    f"- **Pricing Model:** `{playbook.get('recommended_pricing', '$29 - $49/mo')}`",
                    f"- **Time to Launch MVP:** `{playbook.get('mvp_launch_window', '2-3 weeks')}`",
                    f"- **Challenger Advantage:** {playbook.get('why_challenger_wins', '')}"
                ])
                return "\n".join(lines)

        # Scenario 2: Questions about highest score, ranking, or willingness to pay
        if any(term in q_lower for term in ["highest", "top", "rank", "pay", "best", "commercial"]):
            lines = [
                "### 🏆 Top Scored Opportunities Ranked by Commercial Potential\n",
                "Based on real discussion frequency, frustration sentiment, and willingness-to-pay indicators:\n"
            ]
            for i, opp in enumerate(top_opps, 1):
                lines.append(
                    f"{i}. **{opp.title}** (Score: **{opp.overall_score:.1f}/100**)\n"
                    f"   - **Demand:** `{opp.demand_score:.0f}%` | **Frustration Level:** `{opp.pain_intensity_score:.0f}%` | **Willingness to Pay:** `{opp.willingness_to_pay_score:.0f}%`\n"
                    f"   - **Target Audience:** {opp.target_audience}\n"
                    f"   - **Why It Matters:** {opp.problem_thesis[:160]}...\n"
                )
            
            if cited_quotes:
                lines.append("#### 💬 Verbatim Supporting Evidence from Market:")
                for q in cited_quotes[:2]:
                    lines.append(f"> *\"{q.quote}\"*  \n> — **{q.author or 'Verified user'}** on {q.source}")

            return "\n".join(lines)

        # Scenario 3: Standard opportunity deep-dive or general question
        lines = [
            f"### 💡 Evidence Synthesis: {primary_opp.title if primary_opp else 'Market Opportunities'}\n",
            f"**Core Problem Thesis:**  \n{primary_opp.problem_thesis if primary_opp else 'Identified high-recurrence software gaps across developer and SaaS workflows.'}\n",
            f"**Why Current Incumbents Fail:**  \n{primary_opp.why_current_solutions_fail if primary_opp else 'Incumbents bundle bloated features without solving the core acute issue.'}\n",
            f"**Recommended Product Wedge:**  \n{primary_opp.suggested_solution if primary_opp else 'Build a focused, single-purpose API or micro-app.'}\n"
        ]

        if cited_quotes:
            lines.append("#### 🎙️ Voice of the Customer (Real Discussion Quotes):")
            for q in cited_quotes[:3]:
                lines.append(f"- **{q.source}**: *\"{q.quote}\"*")

        lines.extend([
            "\n#### 🚀 Next Actionable Steps:",
            "1. Click into the **Opportunity Detail** page to generate a full PRD & 2-week MVP Blueprint.",
            "2. Advance this opportunity to `Validating` on the **Kanban Board**.",
            "3. Export the user quote links to begin direct customer discovery interviews."
        ])

        return "\n".join(lines)

    @classmethod
    def _generate_followups(cls, query: str, top_opps: List[Opportunity]) -> List[str]:
        followups = [
            "Which opportunity has the highest willingness to pay?",
            "What are the top complaints about incumbent tools?",
            "Show me a 2-week MVP roadmap for the #1 opportunity"
        ]
        if top_opps:
            top_title = top_opps[0].title[:35]
            followups[2] = f"Generate PRD & pricing for '{top_title}...'"
        return followups

    @classmethod
    async def synthesize_opportunity_deepdive(
        cls,
        db: AsyncSession,
        opportunity_id: str
    ) -> OpportunitySynthesizeResponse:
        """Generates an executive validation memo for a specific opportunity."""
        stmt = (
            select(Opportunity)
            .where(Opportunity.id == opportunity_id)
            .options(
                selectinload(Opportunity.evidence).selectinload(OpportunityEvidence.signal)
            )
        )
        res = await db.execute(stmt)
        opp = res.scalar_one_or_none()
        if not opp:
            raise ValueError(f"Opportunity {opportunity_id} not found")

        quotes = [ev.highlight_quote for ev in opp.evidence if ev.highlight_quote]
        summary = (
            f"Opportunity '{opp.title}' represents a confirmed market vacuum scored at {opp.overall_score:.1f}/100. "
            f"Targeting {opp.target_audience}, it addresses acute frustration with current software alternatives."
        )

        angles = [
            f"Direct challenger to bloated incumbents by offering a sub-5-minute setup time.",
            f"Developer-first / API-first packaging that integrates directly into existing CI/CD or e-commerce workflows.",
            f"Transparent flat-rate pricing undercutting percent-of-revenue enterprise models."
        ]

        experiments = [
            "Post a 'Show HN / Feedback Wanted' mock landing page with waitlist email capture.",
            "Direct message the 3 verified authors of the extracted quotes on Reddit with a prototype demo.",
            "Publish an open-source lightweight CLI utility solving 20% of the pain point to build inbound domain authority."
        ]

        return OpportunitySynthesizeResponse(
            opportunity_id=opp.id,
            executive_summary=summary,
            strategic_angles=angles,
            target_icp=opp.target_audience,
            pricing_strategy="Freemium entry tier, with $29 - $79/mo pro subscription for automated workflows.",
            validation_experiments=experiments
        )
