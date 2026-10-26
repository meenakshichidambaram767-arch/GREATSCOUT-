import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface TickerItem {
  id: string;
  type: 'pain' | 'opportunity' | 'insight';
  text: string;
  source: string;
  score?: number;
}

const DEFAULT_TICKERS: TickerItem[] = [
  {
    id: '1',
    type: 'pain',
    text: 'High-urgency pain: Silent AWS Lambda webhook timeouts causing $4,200 loss',
    source: 'Reddit r/webdev'
  },
  {
    id: '2',
    type: 'opportunity',
    text: 'Scored gap (85.6/100): Developer Dead-Letter Webhook Proxy with 1-click Replay',
    source: 'Synthesized Opportunity',
    score: 85.6
  },
  {
    id: '3',
    type: 'pain',
    text: 'Billing bottleneck: Reconciling manual B2B wire transfers with Stripe subscriptions',
    source: 'Product Hunt Discussion'
  },
  {
    id: '4',
    type: 'insight',
    text: 'Competitor teardown: Shopify app-store subscription inflation reaches $450/mo',
    source: 'Competitor Radar'
  },
  {
    id: '5',
    type: 'opportunity',
    text: 'Scored gap (81.4/100): Production JSON Schema Validator for LLM Outputs',
    source: 'Synthesized Opportunity',
    score: 81.4
  }
];

interface LiveActivityTickerProps {
  onOpenCopilot?: (query?: string) => void;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({ onOpenCopilot }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_TICKERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = DEFAULT_TICKERS[currentIndex];

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-[#f4f8f8] border border-[#dbe7e7] shadow-sm select-none">
      {/* Pulse status indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0e6670] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0e6670]" />
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0e6670]">
          MARKET PULSE
        </span>
      </div>

      {/* Rotating Item */}
      <div 
        key={current.id}
        className="flex-1 flex items-center gap-2 overflow-hidden animate-fadeIn"
      >
        <span className="text-xs text-[#1f2a2e] font-medium truncate">
          {current.text}
        </span>
        <span className="text-[10px] font-mono text-[#55696e] bg-white px-2 py-0.5 rounded-full border border-[#dbe7e7] shrink-0 hidden sm:inline">
          {current.source}
        </span>
      </div>

      {/* Action / Ask Copilot shortcut */}
      {onOpenCopilot && (
        <button
          onClick={() => onOpenCopilot(current.text)}
          className="text-[10px] font-mono font-bold text-[#0e6670] hover:underline flex items-center gap-1 shrink-0 bg-[#eaf3f3] px-2.5 py-1 rounded-full border border-[#0e6670]/20"
        >
          <Sparkles className="w-2.5 h-2.5 text-[#0e6670]" />
          <span>Ask Copilot</span>
        </button>
      )}
    </div>
  );
};
