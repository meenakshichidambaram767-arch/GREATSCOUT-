import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Database, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#dbe7e7] rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative font-outfit">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#55696e] hover:text-[#1f2a2e] p-1.5 rounded-full hover:bg-[#eaf3f3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-full bg-[#0e6670] flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1f2a2e] tracking-tight">
              Scan Customer <span className="text-[#0e6670]">Feedback</span>
            </h2>
            <p className="text-xs text-[#55696e] mt-0.5">
              Collect real discussions online, extract customer complaints, and discover new product ideas
            </p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#eaf3f3] border border-[#dbe7e7] flex items-center justify-center text-[#0e6670] mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#1f2a2e]">Scan Started Successfully!</h3>
            <p className="text-xs sm:text-sm text-[#55696e] max-w-xs mx-auto">
              {result.message}
            </p>
            <div className="p-3 bg-[#f4f8f8] rounded-xl text-xs font-mono text-[#0e6670] border border-[#dbe7e7]">
              Scan ID: {result.job_id}
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/app/jobs');
                }}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Live Scanner Status
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#fdf2f2] border border-[#f8cfcb] text-[#b3261e] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#55696e] mb-2 uppercase tracking-[0.08em]">
                Where should we scan for feedback?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'demo', label: 'Sample Data', badge: 'Fast Demo', desc: 'Curated developer posts' },
                  { id: 'product_hunt', label: 'Product Hunt', badge: 'Live API', desc: 'Maker launch discussions' },
                  { id: 'reddit', label: 'Reddit', badge: 'Live Reddit', desc: 'Real user rants & bugs' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSourceCode(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      sourceCode === s.id
                        ? 'bg-[#eaf3f3] border-[#0e6670] shadow-sm ring-1 ring-[#0e6670]'
                        : 'bg-[#f4f8f8] border-[#dbe7e7] hover:border-[#0e6670] text-[#55696e]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#1f2a2e]">{s.label}</div>
                    <div className="text-[10px] text-[#55696e] mt-0.5">{s.desc}</div>
                    <Badge variant={sourceCode === s.id ? 'emerald' : 'slate'} size="sm" className="mt-2 text-[9px] px-1.5 py-0">
                      {s.badge}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#55696e] mb-1.5 uppercase tracking-[0.08em]">
                Target Industry / Software Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#f4f8f8] border border-[#dbe7e7] rounded-xl px-3.5 py-2.5 text-sm text-[#1f2a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
              >
                <option value="all">All Industries (Scan everything)</option>
                <option value="Developer Tools">Developer Tools & Infrastructure</option>
                <option value="SaaS Operations">SaaS Operations & Accounting</option>
                <option value="AI Automation">AI Workflow & LLM Tooling</option>
                <option value="Remote Work">Remote Team Collaboration</option>
                <option value="E-Commerce">E-Commerce & Online Stores</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#55696e] mb-1.5 uppercase tracking-[0.08em]">
                  How many posts to scan?
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
                  className="w-full bg-[#f4f8f8] border border-[#dbe7e7] rounded-xl px-3.5 py-2 text-sm text-[#1f2a2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-[#55696e] mb-1.5 uppercase tracking-[0.08em]">
                  Automatic Analysis
                </label>
                <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-xs text-[#1f2a2e]">
                  <input
                    type="checkbox"
                    checked={runPipeline}
                    onChange={(e) => setRunPipeline(e.target.checked)}
                    className="w-4 h-4 rounded border-[#dbe7e7] text-[#0e6670] focus:ring-[#0e6670]"
                  />
                  <span>Create ranked ideas automatically</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#dbe7e7] flex justify-end gap-3">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={loading}
                icon={<Database className="w-3.5 h-3.5 text-white mr-1" />}
              >
                Start Scan Now
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
