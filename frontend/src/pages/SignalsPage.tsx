import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { Signal, Document } from '../types/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { IngestionModal } from '../components/jobs/IngestionModal';
import { RefreshIcon, ExternalLinkIcon } from '../components/common/Icons';

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
    <div className="space-y-7 font-outfit max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5eeee]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0e6670]">
              Telemetry & Corpus
            </span>
            <span className="text-[#cce1e3]">•</span>
            <span className="text-[11px] font-mono text-[#55696e]">
              Verbatim Evidence
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-[#1f2a2e] flex items-center gap-2.5">
            <span>Customer Feedback</span>
            <span className="text-[#0e6670]">& Evidence</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Direct customer quotes and complete discussion threads harvested across authorized channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            icon={<RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-[18px] border border-[#dbe7e7] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all cursor-pointer focus-visible:outline-none ${
              activeTab === 'signals'
                ? 'bg-[#0e6670] text-white shadow-sm'
                : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
            }`}
          >
            Extracted Quotes ({signals.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-outfit font-semibold transition-all cursor-pointer focus-visible:outline-none ${
              activeTab === 'documents'
                ? 'bg-[#0e6670] text-white shadow-sm'
                : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
            }`}
          >
            Raw Thread Documents ({documents.length})
          </button>
        </div>

        {activeTab === 'signals' && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold text-[#55696e] uppercase tracking-[0.08em]">Filter:</span>
            <select
              value={signalType}
              onChange={(e) => setSignalType(e.target.value)}
              className="bg-[#f8fafb] border border-[#dbe7e7] rounded-lg px-3 py-1.5 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0e6670]"
            >
              <option value="all">All Signal Types</option>
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
        <LoadingSkeleton count={4} height="h-32" />
      ) : activeTab === 'signals' ? (
        signals.length === 0 ? (
          <EmptyState
            title="No signals indexed for this filter"
            description="Run the ingestion pipeline to parse comments and extract user friction signals."
            actionLabel="Run Pipeline"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-3.5">
            {signals.map((sig) => (
              <div 
                key={sig.id} 
                className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm hover:border-[#0e6670] hover:bg-[#fcfdfd] transition-all duration-150"
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
                        <span className="px-2.5 py-0.5 rounded-md bg-[#f4f8f8] text-[#0e6670] border border-[#dbe7e7] font-mono text-[11px] font-semibold">
                          Target: {sig.competitor_mentioned}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#1f2a2e]">{sig.summary}</h4>

                    <blockquote className="text-xs sm:text-sm italic text-[#1f2a2e] border-l-2 border-[#0e6670] pl-3 py-1.5 bg-[#f8fafb] rounded-r-md leading-relaxed">
                      "{sig.raw_quote}"
                    </blockquote>
                  </div>

                  <div className="text-xs font-mono font-semibold px-3 py-1 rounded-md bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] shrink-0">
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
            actionLabel="Run Pipeline"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="space-y-3.5">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm hover:border-[#0e6670] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded bg-[#f4f8f8] border border-[#dbe7e7] text-[#0e6670] font-bold">
                        {doc.source_id ? 'Indexed Feed' : 'Raw Record'}
                      </span>
                      <span className="text-xs text-[#55696e] font-mono">
                        by @{doc.author || 'anonymous'}
                      </span>
                      {doc.is_synthetic && (
                        <span className="text-[10px] font-mono text-[#d98a00] bg-[#fef7e6] border border-[#fbe1b3] px-2 py-0.5 rounded">
                          Synthetic Demo Record
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-[#1f2a2e]">{doc.title}</h4>
                    <p className="text-xs text-[#55696e] line-clamp-3 leading-relaxed">
                      {doc.content}
                    </p>
                  </div>

                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="secondary" size="sm" showArrow={false} icon={<ExternalLinkIcon size={13} className="mr-1" />}>
                        Source
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
