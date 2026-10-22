import re
import json
from typing import List, Dict, Any, Optional
import httpx
from backend.app.core.config import settings
from backend.app.services.ai.prompt_templates import SIGNAL_EXTRACTION_SYSTEM_PROMPT


class SignalExtractor:
    """
    Extracts structured market signals from unstructured text.
    Supports LLM providers (OpenAI / Anthropic / Gemini) and local rule-based heuristic fallback.
    """

    KNOWN_COMPETITORS = [
        "Stripe", "AWS", "Datadog", "Sentry", "QuickBooks", "Xero", 
        "Shopify", "Amazon", "Jira", "Notion", "Linear", "Otter", 
        "Fireflies", "Returnly", "Loop Returns", "CloudWatch", "Twilio"
    ]

    @classmethod
    async def extract_signals(cls, title: str, content: str) -> List[Dict[str, Any]]:
        provider = settings.AI_PROVIDER.lower()

        if provider == "openai" and settings.OPENAI_API_KEY:
            try:
                return await cls._extract_with_openai(title, content)
            except Exception as e:
                print(f"[SignalExtractor] OpenAI call failed ({e}), falling back to heuristic engine.")

        # Default / Fallback: Deterministic heuristic extractor
        return cls._extract_heuristic(title, content)

    @classmethod
    async def _extract_with_openai(cls, title: str, content: str) -> List[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        user_message = f"Title: {title}\nContent:\n{content}"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SIGNAL_EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                body = res.json()
                raw_text = body["choices"][0]["message"]["content"]
                parsed = json.loads(raw_text)
                if isinstance(parsed, dict) and "signals" in parsed:
                    return parsed["signals"]
                elif isinstance(parsed, list):
                    return parsed
        raise RuntimeError("Non-200 or invalid response from OpenAI")

    @classmethod
    def _extract_heuristic(cls, title: str, content: str) -> List[Dict[str, Any]]:
        full_text = f"{title}. {content}"
        sentences = re.split(r'(?<=[.!?])\s+', content.strip())
        signals = []

        # Find competitor mentions
        competitor_found = None
        for comp in cls.KNOWN_COMPETITORS:
            if comp.lower() in full_text.lower():
                competitor_found = comp
                break

        for s in sentences:
            sentence = s.strip()
            if len(sentence) < 25:
                continue
            lower = sentence.lower()

            signal_type = None
            severity = 3
            urgency = 0.5
            sentiment = -0.5
            commercial_intent = 0.0

            # 1. Pain Point Detection
            if any(k in lower for k in ["lost $", "outage", "nightmare", "broke", "crash", "failed", "timeout silently"]):
                signal_type = "pain_point"
                severity = 5
                urgency = 0.9
                sentiment = -0.85
            elif any(k in lower for k in ["hours every month", "spend 5 hours", "waste", "frustrating", "struggling"]):
                signal_type = "pain_point"
                severity = 4
                urgency = 0.75
                sentiment = -0.7

            # 2. Complaint Detection
            elif any(k in lower for k in ["too expensive", "bloatware", "horribly overcomplicated", "doesn't automatically", "eating all our margin"]):
                signal_type = "complaint"
                severity = 3
                urgency = 0.6
                sentiment = -0.6

            # 3. Feature Request / Solution Search
            elif any(k in lower for k in ["would happily pay", "wish existed", "need a lightweight", "desperately need", "instant buy"]):
                signal_type = "feature_request"
                severity = 3
                urgency = 0.8
                sentiment = -0.3
                commercial_intent = 0.85

            # 4. Unmet Need Detection
            elif any(k in lower for k in ["there is zero", "nobody actually reads", "don't have", "no unified visibility", "doesn't auto-repair"]):
                signal_type = "unmet_need"
                severity = 3
                urgency = 0.65
                sentiment = -0.5

            # 5. Workflow Problem Detection
            elif any(k in lower for k in ["manually", "excel", "csv exports", "spreadsheets", "line by line"]):
                signal_type = "workflow_problem"
                severity = 4
                urgency = 0.7
                sentiment = -0.65

            # Commercial intent modifiers
            if any(w in lower for w in ["pay $", "contract", "subscription", "$/mo", "$/month", "budget", "fees"]):
                commercial_intent = max(commercial_intent, 0.75)

            if signal_type:
                signals.append({
                    "signal_type": signal_type,
                    "summary": f"{title.strip()[:100]} — {sentence[:120]}...",
                    "raw_quote": sentence,
                    "severity": severity,
                    "sentiment_score": sentiment,
                    "urgency_score": urgency,
                    "commercial_intent_score": commercial_intent,
                    "competitor_mentioned": competitor_found
                })

            if len(signals) >= 3:
                break

        # Fallback if no specific trigger fired
        if not signals and len(content) > 30:
            signals.append({
                "signal_type": "pain_point",
                "summary": title.strip()[:150],
                "raw_quote": sentences[0] if sentences else content[:200],
                "severity": 3,
                "sentiment_score": -0.5,
                "urgency_score": 0.5,
                "commercial_intent_score": 0.2,
                "competitor_mentioned": competitor_found
            })

        return signals
