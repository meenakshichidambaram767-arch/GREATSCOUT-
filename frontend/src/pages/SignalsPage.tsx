import React, { useEffect, useState } from 'react';
import { 
  ExternalLink, 
  RefreshCw 
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { Signal, Document } from '../types/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SignalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signals' | 'documents'>('signals');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signalType, setSignalType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [signalsData, docsData] = await Promise.all([
        dashboardService.getSignals({
          signal_type: signalType !== 'all' ? signalType : undefined,
          limit: 50,
        }),
        dashboardService.getDocuments({ limit: 30 }),
      ]);
      setSignals(signalsData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Failed to load signals and documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [signalType]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Signals & Raw Evidence
            <Badge variant="indigo" size="sm">Traceability Engine</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse atomic friction points and raw forum posts ingested into the knowledge graph.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchData}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'signals'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Extracted Signals ({signals.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Ingested Documents ({documents.length})
          </button>
        </div>

        {activeTab === 'signals' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Type:</span>
            <select
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="all">All Friction Types</option>
              <option value="pain_point">Pain Points</option>
              <option value="complaint">Complaints</option>
              <option value="feature_request">Feature Requests</option>
              <option value="unmet_need">Unmet Needs</option>
              <option value="workflow_problem">Workflow Problems</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-28" />
      ) : activeTab === 'signals' ? (
        signals.length === 0 ? (
          <Card className="text-center py-10 text-xs text-slate-400">
            No signals found for the selected type. Run an ingestion job to populate data.
          </Card>
        ) : (
          <div className="space-y-3">
            {signals.map((sig) => (
              <Card key={sig.id} className="border-slate-800 bg-slate-900/40 p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          sig.signal_type === 'pain_point'
                            ? 'rose'
                            : sig.signal_type === 'complaint'
                            ? 'amber'
                            : sig.signal_type === 'feature_request'
                            ? 'cyan'
                            : 'indigo'
                        }
                        size="sm"
                      >
                        {sig.signal_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Severity: {sig.severity}/5
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Urgency: {(sig.urgency_score * 100).toFixed(0)}%
                      </Badge>
                      {sig.competitor_mentioned && (
                        <Badge variant="slate" size="sm" className="font-mono text-[10px]">
                          Target: {sig.competitor_mentioned}
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100">{sig.summary}</h4>

                    <blockquote className="text-xs italic text-slate-300 border-l-2 border-slate-700 pl-2.5 py-0.5">
                      "{sig.raw_quote}"
                    </blockquote>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 shrink-0">
                    Sentiment: {sig.sentiment_score > 0 ? `+${sig.sentiment_score.toFixed(2)}` : sig.sentiment_score.toFixed(2)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        documents.length === 0 ? (
          <Card className="text-center py-10 text-xs text-slate-400">
            No documents ingested yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-slate-800 bg-slate-900/40 p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={doc.is_synthetic ? 'amber' : 'emerald'} size="sm">
                        {doc.is_synthetic ? 'Synthetic Demo' : 'Live Crawl'}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Upvotes: {doc.upvotes}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Comments: {doc.comment_count}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{doc.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {doc.content}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Author: @{doc.author || 'anonymous'}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400 truncate max-w-xs">
                        Hash: {doc.content_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Original Post
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
};
