import React, { useEffect, useState } from 'react';
import { 
  ExternalLink, 
  RefreshCw
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { Signal, Document } from '../types/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { IngestionModal } from '../components/jobs/IngestionModal';

export const SignalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signals' | 'documents'>('signals');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signalType, setSignalType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [signalsData, docsData] = await Promise.all([
        dashboardService.getSignals({
          signal_type: signalType !== 'all' ? signalType : undefined,
          limit: 50,
        }).catch(() => []),
        dashboardService.getDocuments({ limit: 30 }).catch(() => []),
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
    <div className="space-y-7 font-outfit">
      {/* Page Header with Eyebrow and Split Teal Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] block mb-1">
            EVIDENCE HARVEST // SEMANTIC TRACEABILITY
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Signals &</span>
            <span className="text-[#0e6670]">Evidence</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold">
              Traceability Engine
            </span>
          </h1>
          <p className="text-sm text-[#55696e] mt-1.5 max-w-2xl">
            Browse atomic friction quotes, user pain classifications, and raw source discussions ingested into the knowledge graph.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs and Filters: Clean white surface and pill buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[22px] border border-[#dbe7e7] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-5 py-2.5 rounded-full text-xs font-outfit font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670] ${
              activeTab === 'signals'
                ? 'bg-[#0e6670] text-white shadow-sm'
                : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
            }`}
          >
            Extracted Signals ({signals.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-5 py-2.5 rounded-full text-xs font-outfit font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670] ${
              activeTab === 'documents'
                ? 'bg-[#0e6670] text-white shadow-sm'
                : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
            }`}
          >
            Raw Ingested Documents ({documents.length})
          </button>
        </div>

        {activeTab === 'signals' && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold text-[#55696e] uppercase tracking-[0.08em]">Type:</span>
            <select
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-full px-4 py-2 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
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

      {/* Content Rendering: White cards, 56px rows, hover #f4f8f8, pill status chips */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-32" />
      ) : activeTab === 'signals' ? (
        signals.length === 0 ? (
          <EmptyState
            title="No signals found for the selected type"
            description="Trigger the ingestion pipeline to parse comments and extract user friction signals."
            actionLabel="Run Scout Pipeline"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-3.5">
            {signals.map((sig) => (
              <div 
                key={sig.id} 
                className="bg-white border border-[#dbe7e7] rounded-[20px] p-5 shadow-sm hover:border-[#0e6670] hover:bg-[#f4f8f8]/60 transition-all duration-150"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          sig.signal_type === 'pain_point'
                            ? 'rose'
                            : sig.signal_type === 'complaint'
                            ? 'amber'
                            : sig.signal_type === 'feature_request'
                            ? 'teal'
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
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f4f8f8] text-[#0e6670] border border-[#dbe7e7] font-mono text-[11px] font-semibold">
                          Target: {sig.competitor_mentioned}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#1f2a2e]">{sig.summary}</h4>

                    <blockquote className="text-xs sm:text-sm italic text-[#1f2a2e] border-l-2 border-[#0e6670] pl-3 py-1 bg-[#f4f8f8] rounded-r-lg leading-relaxed">
                      "{sig.raw_quote}"
                    </blockquote>
                  </div>

                  <div className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] shrink-0">
                    Sentiment: {sig.sentiment_score > 0 ? `+${sig.sentiment_score.toFixed(2)}` : sig.sentiment_score.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        documents.length === 0 ? (
          <EmptyState
            title="No raw documents ingested yet"
            description="Trigger the ingestion pipeline to crawl discussions from Product Hunt and Reddit."
            actionLabel="Run Scout Pipeline"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-3.5">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white border border-[#dbe7e7] rounded-[20px] p-5 shadow-sm hover:border-[#0e6670] hover:bg-[#f4f8f8]/60 transition-all duration-150"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
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

                    <h4 className="text-base font-bold text-[#1f2a2e]">{doc.title}</h4>
                    <p className="text-xs sm:text-sm text-[#55696e] line-clamp-3 leading-relaxed">
                      {doc.content}
                    </p>

                    <div className="text-xs text-[#55696e] flex flex-wrap items-center gap-3 pt-1">
                      <span>Author: <strong className="text-[#1f2a2e]">@{doc.author || 'anonymous'}</strong></span>
                      <span>•</span>
                      <span className="font-mono text-[#55696e] truncate max-w-xs">
                        Hash: {doc.content_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="secondary" size="sm" showArrow={false} icon={<ExternalLink className="w-3.5 h-3.5 mr-1" />}>
                        Original Post
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
