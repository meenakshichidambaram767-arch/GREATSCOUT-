import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Database, ArrowRight } from 'lucide-react';
import { jobsService } from '../../services/jobsService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [sourceCode, setSourceCode] = useState('demo');
  const [category, setCategory] = useState('all');
  const [limit, setLimit] = useState(50);
  const [runPipeline, setRunPipeline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ job_id: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await jobsService.triggerJob({
        source_code: sourceCode,
        category,
        limit,
        run_pipeline: runPipeline,
      });
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to start ingestion job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Run GreatScout Pipeline</h2>
            <p className="text-xs text-slate-400">
              Ingest raw user discussions and discover market opportunities
            </p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Job Queued Successfully!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {result.message}
            </p>
            <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 border border-slate-800">
              Job ID: {result.job_id}
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  window.location.href = '/jobs';
                }}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Jobs Monitor
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Data Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'demo', label: 'Synthetic Demo', badge: 'Zero Setup', desc: 'Curated friction' },
                  { id: 'product_hunt', label: 'Product Hunt', badge: 'Live API', desc: 'Discussions' },
                  { id: 'reddit', label: 'Reddit', badge: 'Live PRAW', desc: 'r/SaaS & r/startups' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSourceCode(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      sourceCode === s.id
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{s.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                    <Badge variant={sourceCode === s.id ? 'emerald' : 'slate'} size="sm" className="mt-2 text-[9px] px-1.5 py-0">
                      {s.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Domain / Software Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="all">All Domains (Cross-industry discovery)</option>
                <option value="Developer Tools">Developer Tools & Infrastructure</option>
                <option value="SaaS Operations">SaaS Operations & Billing</option>
                <option value="AI Automation">AI Workflow & LLM Tooling</option>
                <option value="Remote Work">Remote Team Collaboration</option>
                <option value="E-Commerce">E-Commerce & Logistics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Document Batch Limit
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Pipeline
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={runPipeline}
                    onChange={(e) => setRunPipeline(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>Auto-cluster & score</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={loading}
                icon={<Database className="w-3.5 h-3.5" />}
              >
                Launch Pipeline
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
