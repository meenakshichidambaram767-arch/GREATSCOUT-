import React, { useEffect, useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  FileText, 
  Layers, 
  Lightbulb,
  Terminal
} from 'lucide-react';
import { jobsService } from '../services/jobsService';
import { IngestionJob, Source } from '../types/api';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ProgressBar } from '../components/common/ProgressBar';
import { IngestionModal } from '../components/jobs/IngestionModal';

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
          <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] text-xs font-mono font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0e6670]" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="px-3 py-1 rounded-full bg-[#fef7e6] text-[#d98a00] border border-[#fbe1b3] text-xs font-mono font-semibold flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d98a00]" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full bg-[#fdf2f2] text-[#b3261e] border border-[#f8cfcb] text-xs font-mono font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-[#b3261e]" /> Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#f4f8f8] text-[#55696e] border border-[#dbe7e7] text-xs font-mono font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#55696e]" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-7 font-outfit">
      {/* Page Header with Eyebrow and Split Teal Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] block mb-1">
            DATA HARVEST // BACKGROUND JOBS
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Ingestion &</span>
            <span className="text-[#0e6670]">Jobs</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold">
              Background Workers
            </span>
          </h1>
          <p className="text-sm text-[#55696e] mt-1.5 max-w-2xl">
            Monitor asynchronous crawler tasks, natural language signal extraction, and opportunity clustering pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Poll Updates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={<Play className="w-3.5 h-3.5 text-white mr-1" />}
          >
            Launch Ingestion Job
          </Button>
        </div>
      </div>

      {/* Upstream Sources Overview: White Cards, 18px radius */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((s) => (
          <div key={s.id} className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#1f2a2e]">{s.name}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                s.is_active ? 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]' : 'bg-[#f4f8f8] text-[#55696e] border-[#dbe7e7]'
              }`}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-[#55696e] mt-2 font-mono">Code: {s.code}</p>
          </div>
        ))}
      </div>

      {/* Jobs Grid and Logs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em]">
              JOB HISTORY & STATUS ({jobs.length})
            </span>
          </div>

          {loading && jobs.length === 0 ? (
            <LoadingSkeleton count={3} height="h-28" />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No ingestion jobs executed yet"
              description="Launch your first crawler job to extract friction signals from live community discussions."
              actionLabel="Launch Ingestion Job"
              onAction={() => setModalOpen(true)}
            />
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white border rounded-[20px] p-5 cursor-pointer transition-all duration-200 shadow-sm ${
                  selectedJob?.id === job.id
                    ? 'border-[#0e6670] bg-[#eaf3f3]/40 shadow-md ring-1 ring-[#0e6670]'
                    : 'border-[#dbe7e7] hover:border-[#0e6670] hover:bg-[#f4f8f8]/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#1f2a2e]">
                        {job.job_type.toUpperCase()}
                      </span>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-[11px] font-mono text-[#55696e] truncate max-w-sm">
                      ID: {job.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                    <span className="text-[#0e6670] bg-[#eaf3f3] px-2.5 py-1 rounded-full border border-[#dbe7e7] flex items-center gap-1 font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      {job.documents_processed} docs
                    </span>
                    <span className="text-[#0e6670] bg-[#eaf3f3] px-2.5 py-1 rounded-full border border-[#dbe7e7] flex items-center gap-1 font-semibold">
                      <Layers className="w-3.5 h-3.5" />
                      {job.signals_extracted} signals
                    </span>
                    <span className="text-[#0e6670] bg-[#eaf3f3] px-2.5 py-1 rounded-full border border-[#dbe7e7] flex items-center gap-1 font-semibold">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {job.opportunities_generated} opps
                    </span>
                  </div>
                </div>

                {job.status === 'running' && (
                  <div className="mt-3 pt-3 border-t border-[#dbe7e7]">
                    <ProgressBar value={65} color="teal" label="Pipeline Execution in Progress" />
                  </div>
                )}

                {job.error_message && (
                  <div className="mt-3 text-xs text-[#b3261e] bg-[#fdf2f2] p-3 rounded-xl border border-[#f8cfcb]">
                    {job.error_message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Selected Job Execution Logs: Mono on #f4f8f8 with #dbe7e7 border */}
        <div className="space-y-3.5">
          <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#0e6670]" />
            EXECUTION LOGS
          </span>

          <div className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-[22px] font-mono text-xs text-[#1f2a2e] p-5 h-96 overflow-y-auto shadow-sm">
            {selectedJob ? (
              <div className="space-y-2">
                <div className="text-[#0e6670] font-bold text-[11px] pb-2 border-b border-[#dbe7e7]">
                  === Job {selectedJob.id} [{selectedJob.status.toUpperCase()}] ===
                </div>
                {selectedJob.logs && selectedJob.logs.length > 0 ? (
                  selectedJob.logs.map((log, i) => (
                    <div key={i} className="text-[#55696e] text-[11px] leading-relaxed">
                      &gt; {typeof log === 'string' ? log : JSON.stringify(log)}
                    </div>
                  ))
                ) : (
                  <div className="text-[#55696e] italic text-[11px] py-2">No logs recorded for this job.</div>
                )}
              </div>
            ) : (
              <div className="text-[#55696e] italic text-center py-16">
                Select a job from the history to view its live execution logs.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
