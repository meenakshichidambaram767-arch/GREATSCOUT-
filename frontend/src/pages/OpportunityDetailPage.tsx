import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles,
  TrendingUp,
  DollarSign,
  Compass,
  Quote,
  Clock,
  Wrench,
  Info,
  FileCheck
} from 'lucide-react';
import { opportunitiesService } from '../services/opportunitiesService';
import { OpportunityDetail } from '../types/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starring, setStarring] = useState(false);

  useEffect(() => {
    if (id) {
      loadOpportunity(id);
    }
  }, [id]);

  const loadOpportunity = async (oppId: string) => {
    try {
      setLoading(true);
      const data = await opportunitiesService.getOpportunityById(oppId);
      setOpportunity(data);
    } catch (err) {
      console.error('Failed to load opportunity:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async () => {
    if (!opportunity) return;
    try {
      setStarring(true);
      const newStatus = opportunity.status === 'starred' ? 'active' : 'starred';
      const updated = await opportunitiesService.updateOpportunityStatus(opportunity.id, newStatus);
      setOpportunity((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStarring(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Opportunity Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested opportunity dossier does not exist or may have been deleted.
        </p>
        <Link to="/opportunities">
          <Button variant="secondary" size="sm">Back to Opportunities</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities Catalog</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant={opportunity.status === 'starred' ? 'primary' : 'secondary'}
            size="sm"
            onClick={toggleStar}
            loading={starring}
            icon={<Star className={`w-3.5 h-3.5 ${opportunity.status === 'starred' ? 'fill-current' : ''}`} />}
          >
            {opportunity.status === 'starred' ? 'Starred Opportunity' : 'Star Opportunity'}
          </Button>
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <Card className="border-slate-800 bg-slate-900/60 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="cyan" size="md">{opportunity.category}</Badge>
              <Badge variant="indigo" size="md" className="font-mono text-xs">
                ICP: {opportunity.target_audience}
              </Badge>
              <Badge variant="emerald" size="md">
                Confidence: {opportunity.confidence_level.toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            <div className="text-sm text-slate-300 leading-relaxed pt-2">
              <p className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-1 text-emerald-400">
                Core Problem Thesis
              </p>
              <p className="text-base text-slate-300">{opportunity.problem_thesis}</p>
            </div>
          </div>

          {/* Large Overall Score Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 shrink-0 min-w-[200px]">
            <ScoreGauge score={opportunity.scores.overall_score} size="lg" />
            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-semibold text-slate-300">
                Composite Gap Score
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">Weighted Multi-Factor Metric</p>
            </div>
          </div>
        </div>

        {/* 7 Pillars Scoring Framework */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Multi-Factor Opportunity Scoring Matrix</span>
                <Badge variant="cyan" size="sm">7 Pillars</Badge>
                {opportunity.scores.metadata?.model_version && (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    v{opportunity.scores.metadata.model_version}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Empirical signals (85% aggregate weight) rigorously separated from heuristic estimates (15%).
              </p>
            </div>
          </div>

          {/* Group 1: Measured Empirical Evidence Metrics (85%) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Empirical Evidence Metrics
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                85% Aggregate Weight • Derived directly from verified citations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Demand Volume
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1 rounded">25%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.demand_score} color="emerald" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Recurrence across verified threads</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Pain Intensity
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-1 rounded">25%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.pain_intensity_score} color="rose" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Severity & disruption level</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      Evidence Quality
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-1 rounded">15%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.evidence_strength_score ?? 75} color="indigo" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Corroboration density & quotes</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      Willingness-to-Pay
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1 rounded">15%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.willingness_to_pay_score} color="cyan" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Commercial intent & budget cues</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Competitive Vacuum
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1 rounded">10%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.competitive_vacuum_score} color="amber" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Deficiency of existing tools</p>
              </div>
            </div>
          </div>

          {/* Group 2: Heuristic & Temporal Estimates (15%) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                2. Heuristic & Temporal Factors
              </span>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                15% Aggregate Weight • Flagged clearly as estimates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Technical Feasibility
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1 rounded">5%</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">Heuristic</span>
                    </div>
                  </div>
                  <ProgressBar value={opportunity.scores.feasibility_score ?? 85} color="amber" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Implementation complexity estimation</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Evidence Recency
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1 rounded">5%</span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">Decay Model</span>
                    </div>
                  </div>
                  <ProgressBar value={opportunity.scores.recency_score ?? 85} color="indigo" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Temporal relevance decay factor</p>
              </div>
            </div>
          </div>

          {/* Explanations List if available */}
          {opportunity.scores.metadata?.explanations && opportunity.scores.metadata.explanations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Scoring Model Rationale & Drivers
              </h3>
              <ul className="space-y-1.5">
                {opportunity.scores.metadata.explanations.map((exp, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-400 text-sm leading-none">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Strategic Analysis & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Why Current Solutions Fail</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {opportunity.why_current_solutions_fail}
          </p>
        </Card>

        <Card className="border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Recommended Product Angle</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {opportunity.suggested_solution}
          </p>
        </Card>
      </div>

      {/* Traceability Graph: Evidence Citations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-emerald-400" />
              Traceable User Evidence Citations
              <Badge variant="emerald" size="sm">{opportunity.evidence.length} Cited Quotes</Badge>
            </h2>
            <p className="text-xs text-slate-400">
              Direct verbatim quotes from real discussions that anchor this opportunity.
            </p>
          </div>
        </div>

        {opportunity.evidence.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-400">
            No specific evidence citations mapped to this opportunity yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {opportunity.evidence.map((item, idx) => (
              <Card key={idx} className="border-slate-800 bg-slate-900/40 p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="rose" size="sm">
                        {item.signal_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Severity: {item.severity}/5
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Urgency: {(item.urgency_score * 100).toFixed(0)}%
                      </Badge>
                      {item.source.is_synthetic ? (
                        <Badge variant="amber" size="sm">
                          Synthetic Demo
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          Verified Live Feed
                        </Badge>
                      )}
                    </div>

                    {/* Verbatim Quote */}
                    <blockquote className="text-sm italic text-slate-200 border-l-2 border-emerald-500/60 pl-3 py-1 my-2 leading-relaxed">
                      "{item.highlight_quote}"
                    </blockquote>

                    {/* Source Thread Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="font-medium text-slate-300">
                        Thread: <span className="text-slate-200">{item.source.title}</span>
                      </span>
                      <span>•</span>
                      <span>Author: <strong className="text-slate-300">@{item.source.author || 'anonymous'}</strong></span>
                      <span>•</span>
                      <span className="font-mono uppercase text-emerald-400">{item.source.platform}</span>
                    </div>
                  </div>

                  {/* External Source Link */}
                  {item.source.url && (
                    <a
                      href={item.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Source Post
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
