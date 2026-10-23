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
        <div className="h-6 w-32 bg-[#e3eded] rounded-xl animate-pulse" />
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="bg-white border border-[#dbe7e7] rounded-[24px] text-center py-12 p-6 shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#b3261e] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#1f2a2e]">Opportunity Not Found</h2>
        <p className="text-xs sm:text-sm text-[#55696e] mt-1 mb-6">
          The requested opportunity dossier does not exist or may have been deleted.
        </p>
        <Link to="/app/opportunities">
          <Button variant="secondary" size="sm">Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7 font-outfit">
      {/* Back Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/app/opportunities"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#55696e] hover:text-[#0e6670] transition-colors uppercase tracking-[0.08em]"
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
            showArrow={false}
            icon={<Star className={`w-3.5 h-3.5 ${opportunity.status === 'starred' ? 'fill-current' : ''}`} />}
          >
            {opportunity.status === 'starred' ? 'Starred Opportunity' : 'Star Opportunity'}
          </Button>
        </div>
      </div>

      {/* Main Dossier Header Card: White Surface, #dbe7e7 borders */}
      <div className="bg-white border border-[#dbe7e7] rounded-[24px] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                {opportunity.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f4f8f8] text-[#55696e] text-xs font-mono border border-[#dbe7e7]">
                ICP: {opportunity.target_audience}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold border border-[#dbe7e7]">
                Confidence: {opportunity.confidence_level.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1f2a2e] tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            <div className="text-sm text-[#1f2a2e] leading-relaxed pt-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] mb-1 text-[#0e6670]">
                Core Problem Thesis
              </p>
              <p className="text-base text-[#1f2a2e] leading-relaxed">{opportunity.problem_thesis}</p>
            </div>
          </div>

          {/* Large Overall Score Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#f4f8f8] rounded-[20px] border border-[#dbe7e7] shrink-0 min-w-[200px]">
            <ScoreGauge score={opportunity.scores.overall_score} size="lg" />
            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-semibold text-[#1f2a2e]">
                Composite Gap Score
              </span>
              <p className="text-[10px] text-[#55696e] mt-0.5">Weighted Multi-Factor Metric</p>
            </div>
          </div>
        </div>

        {/* 7 Pillars Scoring Framework */}
        <div className="mt-8 pt-6 border-t border-[#dbe7e7] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                SCIENTIFIC EVALUATION
              </span>
              <h2 className="text-base font-bold text-[#1f2a2e] flex items-center gap-2">
                <span>Multi-Factor Opportunity Scoring Matrix</span>
                <Badge variant="emerald" size="sm">7 Pillars</Badge>
                {opportunity.scores.metadata?.model_version && (
                  <span className="text-[10px] font-mono text-[#55696e] bg-[#f4f8f8] px-2 py-0.5 rounded-full border border-[#dbe7e7]">
                    v{opportunity.scores.metadata.model_version}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#55696e] mt-0.5">
                Empirical signals (85% aggregate weight) rigorously separated from heuristic estimates (15%).
              </p>
            </div>
          </div>

          {/* Group 1: Measured Empirical Evidence Metrics (85%) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0e6670] font-mono">
                1. Empirical Evidence Metrics
              </span>
              <span className="text-[10px] font-mono bg-[#eaf3f3] text-[#0e6670] px-2 py-0.5 rounded-full border border-[#dbe7e7]">
                85% Aggregate Weight • Derived directly from verified citations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0e6670] shrink-0" />
                      Demand Volume
                    </span>
                    <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded-full font-bold">25%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.demand_score} color="teal" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Recurrence across verified threads</p>
              </div>

              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#b3261e] shrink-0" />
                      Pain Intensity
                    </span>
                    <span className="text-[10px] font-mono text-[#b3261e] bg-[#fdf2f2] px-1.5 py-0.5 rounded-full font-bold">25%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.pain_intensity_score} color="rose" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Severity & disruption level</p>
              </div>

              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-[#0e6670] shrink-0" />
                      Evidence Quality
                    </span>
                    <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded-full font-bold">15%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.evidence_strength_score ?? 75} color="teal" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Corroboration density & quotes</p>
              </div>

              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#0e6670] shrink-0" />
                      Willingness-to-Pay
                    </span>
                    <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded-full font-bold">15%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.willingness_to_pay_score} color="teal" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Commercial intent & budget cues</p>
              </div>

              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#d98a00] shrink-0" />
                      Competitive Vacuum
                    </span>
                    <span className="text-[10px] font-mono text-[#d98a00] bg-[#fef7e6] px-1.5 py-0.5 rounded-full font-bold">10%</span>
                  </div>
                  <ProgressBar value={opportunity.scores.competitive_vacuum_score} color="amber" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Deficiency of existing tools</p>
              </div>
            </div>
          </div>

          {/* Group 2: Heuristic & Temporal Estimates (15%) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#d98a00] font-mono">
                2. Heuristic & Temporal Factors
              </span>
              <span className="text-[10px] font-mono bg-[#fef7e6] text-[#d98a00] px-2 py-0.5 rounded-full border border-[#fbe1b3]">
                15% Aggregate Weight • Flagged clearly as estimates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#d98a00] shrink-0" />
                      Technical Feasibility
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#d98a00] bg-[#fef7e6] px-1.5 py-0.5 rounded-full font-bold">5%</span>
                      <span className="text-[9px] font-mono text-[#55696e] bg-white border border-[#dbe7e7] px-1.5 py-0.5 rounded-full">Heuristic</span>
                    </div>
                  </div>
                  <ProgressBar value={opportunity.scores.feasibility_score ?? 85} color="amber" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Implementation complexity estimation</p>
              </div>

              <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0e6670] shrink-0" />
                      Evidence Recency
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded-full font-bold">5%</span>
                      <span className="text-[9px] font-mono text-[#55696e] bg-white border border-[#dbe7e7] px-1.5 py-0.5 rounded-full">Decay Model</span>
                    </div>
                  </div>
                  <ProgressBar value={opportunity.scores.recency_score ?? 85} color="teal" />
                </div>
                <p className="text-[11px] text-[#55696e] mt-2">Temporal relevance decay factor</p>
              </div>
            </div>
          </div>

          {/* Explanations List if available */}
          {opportunity.scores.metadata?.explanations && opportunity.scores.metadata.explanations.length > 0 && (
            <div className="p-4 rounded-[16px] bg-[#f4f8f8] border border-[#dbe7e7]">
              <h3 className="text-xs font-semibold text-[#1f2a2e] flex items-center gap-2 mb-2 font-mono uppercase tracking-[0.08em]">
                <Info className="w-3.5 h-3.5 text-[#0e6670]" />
                Scoring Model Rationale & Drivers
              </h3>
              <ul className="space-y-1.5">
                {opportunity.scores.metadata.explanations.map((exp, i) => (
                  <li key={i} className="text-xs text-[#55696e] flex items-start gap-2">
                    <span className="text-[#0e6670] text-sm leading-none">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Analysis & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#b3261e]">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#1f2a2e]">Why Current Solutions Fail</h3>
          </div>
          <p className="text-sm text-[#55696e] leading-relaxed">
            {opportunity.why_current_solutions_fail}
          </p>
        </div>

        <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#0e6670]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-[#1f2a2e]">Recommended Product Angle</h3>
          </div>
          <p className="text-sm text-[#55696e] leading-relaxed">
            {opportunity.suggested_solution}
          </p>
        </div>
      </div>

      {/* Traceability Graph: Evidence Citations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              PRIMARY EVIDENCE
            </span>
            <h2 className="text-xl font-bold text-[#1f2a2e] flex items-center gap-2.5">
              <Quote className="w-4 h-4 text-[#0e6670]" />
              <span>Traceable User Evidence Citations</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold border border-[#dbe7e7]">
                {opportunity.evidence.length} Quotes
              </span>
            </h2>
            <p className="text-xs text-[#55696e] mt-0.5">
              Direct verbatim quotes from real discussions that anchor this opportunity.
            </p>
          </div>
        </div>

        {opportunity.evidence.length === 0 ? (
          <div className="bg-white border border-[#dbe7e7] rounded-[20px] text-center py-8 text-xs text-[#55696e]">
            No specific evidence citations mapped to this opportunity yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {opportunity.evidence.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#dbe7e7] rounded-[20px] p-5 shadow-sm">
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
                    <blockquote className="text-sm italic text-[#1f2a2e] border-l-2 border-[#0e6670] pl-3 py-1 my-2 leading-relaxed bg-[#f4f8f8] rounded-r-lg">
                      "{item.highlight_quote}"
                    </blockquote>

                    {/* Source Thread Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#55696e] pt-1">
                      <span className="font-medium text-[#1f2a2e]">
                        Thread: <span className="text-[#1f2a2e]">{item.source.title}</span>
                      </span>
                      <span>•</span>
                      <span>Author: <strong className="text-[#1f2a2e]">@{item.source.author || 'anonymous'}</strong></span>
                      <span>•</span>
                      <span className="font-mono uppercase text-[#0e6670] font-semibold">{item.source.platform}</span>
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
                      <Button variant="secondary" size="sm" showArrow={false} icon={<ExternalLink className="w-3.5 h-3.5 mr-1" />}>
                        Source Post
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
