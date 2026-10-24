import React, { useEffect, useState } from 'react';
import { jobsService } from '../services/jobsService';
import { IngestionJob, Source } from '../types/api';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ProgressBar } from '../components/common/ProgressBar';
import { IngestionModal } from '../components/jobs/IngestionModal';
import { PlayIcon, RefreshIcon, CheckIcon, AlertIcon } from '../components/common/Icons';

export const IngestionJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedJob, setSelectedJob] = useState<IngestionJob | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, sourcesData] = await Promise.all([
        jobsService.getJobs().catch(() => []),
        jobsService.getSources().catch(() => []),
      ]);
      setJobs(jobsData);
      setSources(sourcesData);
      if (jobsData.length > 0 && !selectedJob) {
        setSelectedJob(jobsData[0]);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] text-xs font-mono font-semibold flex items-center gap-1">
            <CheckIcon size={12} className="text-[#0e6670]" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fef7e6] text-[#d98a00] border border-[#fbe1b3] text-xs font-mono font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d98a00] animate-pulse" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#fdf2f2] text-[#b3261e] border border-[#f8cfcb] text-xs font-mono font-semibold flex items-center gap-1">
            <AlertIcon size={12} className="text-[#b3261e]" /> Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#f4f8f8] text-[#55696e] border border-[#dbe7e7] text-xs font-mono font-semibold flex items-center gap-1">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-7 font-outfit max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5eeee]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0e6670]">
              Pipeline Automation
            </span>
            <span className="text-[#cce1e3]">•</span>
            <span className="text-[11px] font-mono text-[#55696e]">
              Workers & Feeds
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-[#1f2a2e] flex items-center gap-2.5">
            <span>Data Ingestion</span>
            <span className="text-[#0e6670]">Pipeline</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Multi-stage ingestion workers harvesting, validating, and grouping raw discussion feeds.
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={<PlayIcon size={12} className="text-white mr-1" />}
          >
            Trigger Pipeline
          </Button>
        </div>
      </div>

      {/* Connected Data Sources Overview */}
      <div>
        <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block mb-2">
          Configured Feed Sources
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((s) => (
            <div key={s.id} className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1f2a2e]">{s.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                    s.is_active ? 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]' : 'bg-[#f4f8f8] text-[#55696e] border-[#dbe7e7]'
                  }`}>
                    {s.is_active ? 'Active' : 'Standby'}
                  </span>
                </div>
                <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                  {s.code === 'demo' ? 'Sample dataset of verified developer discussions for deterministic testing.' : s.code === 'product_hunt' ? 'Harvests maker submissions and community launches.' : 'Parses public subreddit threads and discussion submissions.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs Grid and Logs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em]">
              Execution History ({jobs.length})
            </span>
          </div>

          {loading && jobs.length === 0 ? (
            <LoadingSkeleton count={3} height="h-28" />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No execution runs recorded"
              description="Trigger the ingestion worker to harvest external discussions."
              actionLabel="Run Pipeline"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white border rounded-[18px] p-5 cursor-pointer transition-all duration-200 shadow-sm ${
                  selectedJob?.id === job.id
                    ? 'border-[#0e6670] bg-[#f8fbfb] shadow-md ring-1 ring-[#0e6670]'
                    : 'border-[#dbe7e7] hover:border-[#0e6670]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#1f2a2e]">
                        {job.job_type === 'full_pipeline' ? 'Full Pipeline Cycle' : job.job_type.toUpperCase()}
                      </span>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-[11px] font-mono text-[#55696e] truncate max-w-sm">
                      Job ID: {job.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-[#55696e]">
                    <span>Docs: <strong className="text-[#1f2a2e]">{job.documents_processed}</strong></span>
                    <span>Signals: <strong className="text-[#0e6670]">{job.signals_extracted}</strong></span>
                    <span>Opps: <strong className="text-[#178996]">{job.opportunities_generated}</strong></span>
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="mt-3">
                    <ProgressBar value={60} color="teal" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Execution Inspector */}
        <div className="bg-[#1f2a2e] text-white rounded-[20px] p-5 flex flex-col h-full min-h-[380px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="font-mono text-xs text-[#5cd6e5] font-semibold flex items-center gap-1.5">
              <span>Execution Telemetry</span>
            </span>
            {selectedJob && getStatusBadge(selectedJob.status)}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] text-[#e3eded] pr-1">
            {selectedJob?.logs && selectedJob.logs.length > 0 ? (
              selectedJob.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#22b0c2] select-none">{'>'}</span>
                  <span className="text-[#f4f8f8]">{log}</span>
                </div>
              ))
            ) : (
              <p className="text-white/40 italic">Select an execution job to inspect stdout logs.</p>
            )}
          </div>
        </div>
      </div>

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
