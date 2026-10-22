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
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
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
        jobsService.getJobs(),
        jobsService.getSources(),
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
        return <Badge variant="emerald" size="sm"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'running':
        return <Badge variant="cyan" size="sm" glow><Loader2 className="w-3 h-3 animate-spin" /> Running</Badge>;
      case 'failed':
        return <Badge variant="rose" size="sm"><XCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge variant="slate" size="sm"><Clock className="w-3 h-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Ingestion & Processing Jobs
            <Badge variant="emerald" size="sm">Background Workers</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor async crawler tasks, LLM signal extraction, and HDBSCAN clustering jobs.
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
            icon={<Play className="w-3.5 h-3.5" />}
          >
            Launch Ingestion Job
          </Button>
        </div>
      </div>

      {/* Upstream Sources Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((s) => (
          <Card key={s.id} className="border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{s.name}</span>
              <Badge variant={s.is_active ? 'emerald' : 'slate'} size="sm">
                {s.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">Code: {s.code}</p>
          </Card>
        ))}
      </div>

      {/* Jobs Grid and Logs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Job History & Status ({jobs.length})
          </h3>

          {loading && jobs.length === 0 ? (
            <LoadingSkeleton count={3} height="h-24" />
          ) : jobs.length === 0 ? (
            <Card className="text-center py-10 text-xs text-slate-400">
              No jobs have been executed yet. Click 'Launch Ingestion Job' to start.
            </Card>
          ) : (
            jobs.map((job) => (
              <Card
                key={job.id}
                hoverEffect
                onClick={() => setSelectedJob(job)}
                className={`border-slate-800 p-4 cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? 'ring-1 ring-emerald-500/60 bg-slate-900/90'
                    : 'bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {job.job_type.toUpperCase()}
                      </span>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate max-w-sm">
                      ID: {job.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                    <span className="text-cyan-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {job.documents_processed} docs
                    </span>
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {job.signals_extracted} signals
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {job.opportunities_generated} opps
                    </span>
                  </div>
                </div>

                {job.error_message && (
                  <div className="mt-2 text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/50">
                    {job.error_message}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Selected Job Execution Logs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Execution Logs
          </h3>

          <Card className="border-slate-800 bg-slate-950 font-mono text-xs text-slate-300 p-4 h-96 overflow-y-auto">
            {selectedJob ? (
              <div className="space-y-2">
                <div className="text-emerald-400 text-[11px] pb-2 border-b border-slate-800">
                  === Job {selectedJob.id} [{selectedJob.status.toUpperCase()}] ===
                </div>
                {selectedJob.logs && selectedJob.logs.length > 0 ? (
                  selectedJob.logs.map((log, i) => (
                    <div key={i} className="text-slate-400 text-[11px] leading-relaxed">
                      &gt; {typeof log === 'string' ? log : JSON.stringify(log)}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-[11px]">No logs recorded for this job.</div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic text-center py-12">
                Select a job to view its live execution logs.
              </div>
            )}
          </Card>
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
