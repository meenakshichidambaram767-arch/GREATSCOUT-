import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Key, 
  Quote, 
  ExternalLink, 
  RefreshCw, 
  Lightbulb, 
  Check, 
  Copy, 
  Minimize2,
  Maximize2
} from 'lucide-react';
import { copilotService } from '../../services/copilotService';
import { CopilotAskResponse, CopilotCitedQuote, CopilotRelevantOpportunity } from '../../types/api';

interface Message {

  id: string;
  sender: 'user' | 'assistant';
  content: string;
  citedQuotes?: CopilotCitedQuote[];
  relevantOpps?: CopilotRelevantOpportunity[];
  providerUsed?: string;
  timestamp: string;
}

interface AskGreatScoutCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  contextOpportunityId?: string;
  initialQuery?: string;
}

export const AskGreatScoutCopilot: React.FC<AskGreatScoutCopilotProps> = ({
  isOpen,
  onClose,
  contextOpportunityId,
  initialQuery
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: "👋 **Hi! I'm your Evidence Copilot.**\n\nI have indexed all verified customer discussions, pain point signals, and competitor teardowns. Ask me anything to validate your next software wedge or uncover high-margin market gaps.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('greatscout_copilot_key') || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    copilotService.getSuggestedPrompts()
      .then(setSuggestedPrompts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('greatscout_copilot_key', key);
    setShowSettings(false);
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: CopilotAskResponse = await copilotService.askCopilot({
        query,
        opportunity_id: contextOpportunityId,
        api_key: apiKey.trim() || undefined,
        provider: 'gemini'
      });

      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: res.answer,
        citedQuotes: res.cited_quotes,
        relevantOpps: res.relevant_opportunities,
        providerUsed: res.provider_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: `⚠️ **Unable to complete inference:** ${err?.message || 'Server error'}. Please verify backend status.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className={`bg-white h-full flex flex-col shadow-2xl border-l border-[#dbe7e7] transition-all duration-300 ${
          expanded ? 'w-full md:w-[780px]' : 'w-full md:w-[480px]'
        }`}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#dbe7e7] bg-[#f8fafb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0e6670] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#1f2a2e]">Evidence Copilot</h3>
                <span className="text-[10px] font-mono bg-[#eaf3f3] text-[#0e6670] px-2 py-0.5 rounded-full font-semibold border border-[#dbe7e7]">
                  RAG Grounded
                </span>
              </div>
              <p className="text-[11px] text-[#55696e]">Powered by verified discussions & scores</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="API Key Settings"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                apiKey 
                  ? 'bg-[#eaf3f3] border-[#0e6670]/30 text-[#0e6670]' 
                  : 'bg-white border-[#dbe7e7] text-[#55696e] hover:text-[#1f2a2e]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg border border-[#dbe7e7] bg-white text-[#55696e] hover:text-[#1f2a2e] transition-colors hidden md:block"
              title={expanded ? "Collapse width" : "Expand width"}
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#dbe7e7] bg-white text-[#55696e] hover:text-[#1f2a2e] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Settings Drawer (collapsible) */}
        {showSettings && (
          <div className="p-4 bg-[#f4f8f8] border-b border-[#dbe7e7] space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1f2a2e] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#0e6670]" />
                Optional Custom AI API Key
              </span>
              <span className="text-[10px] text-[#55696e]">Stored locally in browser</span>
            </div>
            <p className="text-[11px] text-[#55696e]">
              Enter a Google Gemini or OpenAI API Key for live multimodal reasoning. Leave empty to use GreatScout's built-in intelligent Evidence Engine.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy... or sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[#dbe7e7] focus:outline-none focus:border-[#0e6670]"
              />
              <button
                onClick={() => handleSaveApiKey(apiKey)}
                className="text-xs px-3 py-1.5 bg-[#0e6670] text-white rounded-lg font-medium hover:bg-[#0c5760]"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#55696e]">
                {msg.sender === 'assistant' ? (
                  <>
                    <Bot className="w-3 h-3 text-[#0e6670]" />
                    <span className="font-semibold text-[#0e6670]">GreatScout Copilot</span>
                    {msg.providerUsed && (
                      <span className="text-[9px] font-mono bg-[#f4f8f8] px-1.5 rounded border border-[#dbe7e7]">
                        {msg.providerUsed}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span className="font-semibold">You</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  msg.sender === 'user'
                    ? 'bg-[#0e6670] text-white rounded-tr-none'
                    : 'bg-[#f8fafb] text-[#1f2a2e] border border-[#dbe7e7] rounded-tl-none shadow-sm'
                }`}
              >
                {/* Copy button */}
                <button
                  onClick={() => copyToClipboard(msg.content, msg.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded bg-white/80 border border-[#dbe7e7] opacity-0 group-hover:opacity-100 transition-opacity text-[#55696e] hover:text-[#1f2a2e]"
                  title="Copy response"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>

                {/* Content with basic markdown handling */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {/* Relevant Opportunities Badges */}
                {msg.relevantOpps && msg.relevantOpps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#dbe7e7]/60 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0e6670] block">
                      Linked Opportunities
                    </span>
                    <div className="space-y-1">
                      {msg.relevantOpps.map((opp) => (
                        <Link
                          key={opp.id}
                          to={`/app/opportunities/${opp.id}`}
                          onClick={onClose}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#dbe7e7] hover:border-[#0e6670] transition-colors group/link"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-[#1f2a2e] group-hover/link:text-[#0e6670] block truncate">
                              {opp.title}
                            </span>
                            <span className="text-[10px] text-[#55696e]">
                              {opp.category} • Status: {opp.status}
                            </span>
                          </div>
                          <span className="shrink-0 text-[11px] font-mono font-bold text-[#0e6670] bg-[#eaf3f3] px-2 py-0.5 rounded-full flex items-center gap-1">
                            {opp.overall_score.toFixed(1)}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supporting Quotes Pill Accordion */}
                {msg.citedQuotes && msg.citedQuotes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#dbe7e7]/60 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#55696e] block flex items-center gap-1">
                      <Quote className="w-3 h-3 text-[#0e6670]" />
                      Cited Customer Evidence ({msg.citedQuotes.length})
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {msg.citedQuotes.slice(0, 3).map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-white/90 border border-[#dbe7e7] text-[11px] text-[#2d3a3f]"
                        >
                          <p className="italic text-[#1f2a2e]">"{q.quote}"</p>
                          <div className="flex items-center justify-between mt-1 text-[9px] text-[#55696e] font-mono">
                            <span>{q.source} • {q.author || 'verified user'}</span>
                            {q.sentiment !== undefined && (
                              <span className={q.sentiment < -0.5 ? 'text-rose-600 font-bold' : 'text-amber-600'}>
                                Sent: {q.sentiment.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#0e6670] p-3 rounded-xl bg-[#f4f8f8] border border-[#dbe7e7] w-fit animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing market signals & evidence records...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        {suggestedPrompts.length > 0 && (
          <div className="p-2.5 px-4 bg-[#f8fafb] border-t border-[#dbe7e7] overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#dbe7e7] hover:border-[#0e6670] hover:text-[#0e6670] text-[#55696e] transition-colors shrink-0 flex items-center gap-1"
              >
                <Lightbulb className="w-2.5 h-2.5 text-[#0e6670]" />
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#dbe7e7]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'What are developers saying about webhooks?')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-full border border-[#dbe7e7] bg-[#f8fafb] focus:outline-none focus:border-[#0e6670] focus:bg-white text-[#1f2a2e]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-[#0e6670] text-white flex items-center justify-center hover:bg-[#0c5760] disabled:opacity-40 disabled:hover:bg-[#0e6670] transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
