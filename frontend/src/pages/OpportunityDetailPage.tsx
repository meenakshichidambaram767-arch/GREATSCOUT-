import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunitiesService } from '../services/opportunitiesService';
import { OpportunityDetail, OpportunityPRD } from '../types/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PRDModal } from '../components/opportunities/PRDModal';
import { 
  ArrowLeftIcon, 
  BookmarkIcon, 
  ExternalLinkIcon, 
  QuoteIcon, 
  AlertIcon, 
  CheckIcon,
  ArrowUpRightIcon 
} from '../components/common/Icons';
import { Sparkles } from 'lucide-react';
import { AskGreatScoutCopilot } from '../components/copilot/AskGreatScoutCopilot';
import { copilotService } from '../services/copilotService';
import { OpportunitySynthesizeResponse } from '../types/api';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [prd, setPrd] = useState<OpportunityPRD | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrd, setLoadingPrd] = useState(false);
  const [isPrdOpen, setIsPrdOpen] = useState(false);
  const [starring, setStarring] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [memo, setMemo] = useState<OpportunitySynthesizeResponse | null>(null);
  const [loadingMemo, setLoadingMemo] = useState(false);

  useEffect(() => {
    if (id) {
      loadOpportunity(id);
      loadPrd(id);
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

  const loadPrd = async (oppId: string) => {
    try {
      setLoadingPrd(true);
      const prdData = await opportunitiesService.getOpportunityPRD(oppId);
      setPrd(prdData);
    } catch (err) {
      console.error('Failed to load PRD:', err);
    } finally {
      setLoadingPrd(false);
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

  const copyTicket = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicket(id);
    setTimeout(() => setCopiedTicket(null), 2500);
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
      <div className="bg-white border border-[#dbe7e7] rounded-[20px] text-center py-12 p-6 shadow-sm">
        <AlertIcon size={36} className="text-[#b3261e] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#1f2a2e]">Opportunity Dossier Not Found</h2>
        <p className="text-xs sm:text-sm text-[#55696e] mt-1 mb-6">
          The requested dossier does not exist or may have been pruned.
        </p>
        <Link to="/app/opportunities">
          <Button variant="secondary" size="sm">Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7 font-outfit max-w-7xl mx-auto">
      {/* Back Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/app/opportunities"
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#55696e] hover:text-[#0e6670] transition-colors uppercase tracking-[0.08em]"
        >
          <ArrowLeftIcon size={14} />
          <span>Back to Opportunities</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrdOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#0e6670] hover:bg-[#0a4e56] text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>View Full Build Plan</span>
            <ArrowUpRightIcon size={13} />
          </button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCopilotOpen(true)}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#0e6670]" />}
          >
            Interrogate with Copilot
          </Button>
          <Button
            variant={opportunity.status === 'starred' ? 'primary' : 'secondary'}
            size="sm"
            onClick={toggleStar}
            loading={starring}
            showArrow={false}
            icon={<BookmarkIcon size={14} filled={opportunity.status === 'starred'} className="mr-1.5" />}
          >
            {opportunity.status === 'starred' ? 'Saved' : 'Save Idea'}
          </Button>
        </div>
      </div>

      {/* READY TO BUILD BANNER */}
      <div className="bg-gradient-to-r from-[#072428] via-[#0e484f] to-[#0e6670] rounded-[22px] p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#178996]/30">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#5cd6e5] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              Ready to Build
            </span>
            <span className="text-[11px] font-mono text-white/70">Step-by-step tasks • Recommended tools • Complete guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Turn this idea into a real, working product
          </h2>
          <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
            Here is everything you need to build this: the best tools to pick, how your database should be organized, and an easy checklist of tasks for you or your developers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsPrdOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-white text-[#0e6670] hover:bg-[#f4f8f8] text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Open Build Plan</span>
            <ArrowUpRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Main Idea Overview Card */}
      <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                {opportunity.category}
              </span>
              <span className="px-3 py-1 rounded-md bg-[#f8fafb] text-[#55696e] text-xs font-mono border border-[#dbe7e7]">
                Who needs this: {opportunity.target_audience}
              </span>
              <span className="px-3 py-1 rounded-md bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold border border-[#dbe7e7]">
                Confidence: {opportunity.confidence_level.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1f2a2e] tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            <div className="text-sm text-[#1f2a2e] leading-relaxed pt-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] block mb-1.5 text-[#0e6670]">
                The Problem Real Customers Are Facing:
              </span>
              <p className="text-sm sm:text-base text-[#1f2a2e] leading-relaxed bg-[#f8fafb] p-4 rounded-[14px] border border-[#eaf0f0]">
                {opportunity.problem_thesis}
              </p>
            </div>
          </div>

          {/* Large Overall Score Gauge */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#f8fafb] rounded-[18px] border border-[#dbe7e7] shrink-0 min-w-[220px]">
            <ScoreGauge score={opportunity.scores.overall_score} size="lg" />
            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-bold text-[#1f2a2e] block">
                Overall Opportunity Score
              </span>
              <p className="text-[11px] font-mono text-[#55696e] mt-0.5">
                {opportunity.scores.overall_score >= 80 ? 'Very High Demand' : opportunity.scores.overall_score >= 70 ? 'Strong Opportunity' : 'Growing Opportunity'}
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Breakdown */}
        <div className="mt-8 pt-6 border-t border-[#dbe7e7] space-y-6">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              Score Breakdown
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#1f2a2e]">
              Why This Is a Strong Business Opportunity
            </h2>
            <p className="text-xs text-[#55696e] mt-1 leading-relaxed">
              Scored using real online conversations (85%) and how practical it is to build (15%).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-[14px] bg-[#f8fafb] border border-[#dbe7e7] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-[#1f2a2e]">Customer Demand</span>
                  <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded font-bold">25%</span>
                </div>
                <ProgressBar value={opportunity.scores.demand_score} color="teal" />
              </div>
              <p className="text-[11px] text-[#55696e] mt-2">Lots of people asking for a solution</p>
            </div>

            <div className="p-4 rounded-[14px] bg-[#f8fafb] border border-[#dbe7e7] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-[#1f2a2e]">Pain Level</span>
                  <span className="text-[10px] font-mono text-[#b3261e] bg-[#fdf2f2] px-1.5 py-0.5 rounded font-bold">25%</span>
                </div>
                <ProgressBar value={opportunity.scores.pain_intensity_score} color="rose" />
              </div>
              <p className="text-[11px] text-[#55696e] mt-2">A big, frustrating problem for users</p>
            </div>

            <div className="p-4 rounded-[14px] bg-[#f8fafb] border border-[#dbe7e7] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-[#1f2a2e]">Proof Quality</span>
                  <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded font-bold">15%</span>
                </div>
                <ProgressBar value={opportunity.scores.evidence_strength_score ?? 75} color="teal" />
              </div>
              <p className="text-[11px] text-[#55696e] mt-2">Clear, detailed quotes from real users</p>
            </div>

            <div className="p-4 rounded-[14px] bg-[#f8fafb] border border-[#dbe7e7] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-[#1f2a2e]">Willing to Pay</span>
                  <span className="text-[10px] font-mono text-[#0e6670] bg-[#eaf3f3] px-1.5 py-0.5 rounded font-bold">15%</span>
                </div>
                <ProgressBar value={opportunity.scores.willingness_to_pay_score} color="teal" />
              </div>
              <p className="text-[11px] text-[#55696e] mt-2">People actively saying they'll pay for it</p>
            </div>

            <div className="p-4 rounded-[14px] bg-[#f8fafb] border border-[#dbe7e7] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-semibold text-[#1f2a2e]">Low Competition</span>
                  <span className="text-[10px] font-mono text-[#d98a00] bg-[#fef7e6] px-1.5 py-0.5 rounded font-bold">10%</span>
                </div>
                <ProgressBar value={opportunity.scores.competitive_vacuum_score} color="amber" />
              </div>
              <p className="text-[11px] text-[#55696e] mt-2">Existing tools don't solve this well</p>
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED TECH SETUP SECTION */}
      {prd && (
        <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5eeee]">
            <div>
              <span className="font-mono text-[10px] font-semibold text-[#0e6670] uppercase tracking-wider block">
                Recommended Tech Setup
              </span>
              <h2 className="text-xl font-bold text-[#1f2a2e]">
                The Best Tools to Build This Product
              </h2>
            </div>
            <button
              onClick={() => setIsPrdOpen(true)}
              className="text-xs font-mono text-[#0e6670] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Build Plan</span>
              <ArrowUpRightIcon size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                Website & User Interface
              </span>
              <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{prd.tech_stack.frontend}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                Server & Logic
              </span>
              <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{prd.tech_stack.backend}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                Database & Storage
              </span>
              <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{prd.tech_stack.database}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                Hosting & Cloud
              </span>
              <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{prd.tech_stack.infrastructure}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f4f8f8] border border-[#dbe7e7]">
            <span className="text-[10px] font-mono uppercase font-bold text-[#0e6670] block mb-1">
              Why these tools work best:
            </span>
            <p className="text-xs text-[#3b4d52] leading-relaxed">
              {prd.tech_stack.architecture_rationale}
            </p>
          </div>
        </div>
      )}

      {/* STEP-BY-STEP TASK LIST SECTION */}
      {prd && prd.linear_tickets.length > 0 && (
        <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5eeee]">
            <div>
              <span className="font-mono text-[10px] font-semibold text-[#0e6670] uppercase tracking-wider block">
                Ready to Build
              </span>
              <h2 className="text-xl font-bold text-[#1f2a2e]">
                Step-by-Step Task List ({prd.linear_tickets.length} Tasks)
              </h2>
            </div>
            <button
              onClick={() => setIsPrdOpen(true)}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] hover:bg-[#dbe7e7] transition-colors cursor-pointer"
            >
              Copy All Tasks
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prd.linear_tickets.map((t) => (
              <div key={t.identifier} className="p-4 rounded-xl bg-[#fbfdfd] border border-[#dbe7e7] flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                    <span className="font-bold text-[#0e6670] bg-[#eaf3f3] px-2 py-0.5 rounded border border-[#dbe7e7]">
                      {t.identifier}
                    </span>
                    <span className="text-[10px] font-semibold text-[#b3261e] bg-[#fdf2f2] px-2 py-0.5 rounded border border-[#f8cfcb]">
                      {t.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#1f2a2e] leading-snug">{t.title}</h3>
                  <p className="text-xs text-[#55696e] line-clamp-3 leading-relaxed">{t.description}</p>
                </div>

                <div className="pt-3 border-t border-[#eaf0f0] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#55696e]">Estimated: {t.estimate}</span>
                  <button
                    onClick={() => copyTicket(`[${t.identifier}] ${t.title}\n\n${t.description}\n\nAcceptance Criteria:\n${t.acceptance_criteria.map(ac => `- [ ] ${ac}`).join('\n')}`, t.identifier)}
                    className="text-xs font-mono text-[#0e6670] hover:underline cursor-pointer"
                  >
                    {copiedTicket === t.identifier ? 'Copied!' : 'Copy Task'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#dbe7e7] rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[#b3261e]">
            <AlertIcon size={18} />
            <h3 className="text-base font-bold text-[#1f2a2e]">Why Current Tools Fall Short</h3>
          </div>
          <p className="text-sm text-[#55696e] leading-relaxed">
            {opportunity.why_current_solutions_fail}
          </p>
        </div>

        <div className="bg-white border border-[#dbe7e7] rounded-[20px] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-[#0e6670]">
            <CheckIcon size={18} />
            <h3 className="text-base font-bold text-[#1f2a2e]">What You Should Build Instead</h3>
          </div>
          <p className="text-sm text-[#55696e] leading-relaxed">
            {opportunity.suggested_solution}
          </p>
        </div>
      </div>

      {/* Real Customer Quotes */}
      <div className="space-y-4">
        <div>
          <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
            Real Customer Proof
          </span>
          <h2 className="text-xl font-bold text-[#1f2a2e] flex items-center gap-2 mt-0.5">
            <QuoteIcon size={16} className="text-[#0e6670]" />
            <span>Quotes Found Online</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold border border-[#dbe7e7]">
              {opportunity.evidence.length} Quotes
            </span>
          </h2>
        </div>

        {opportunity.evidence.length === 0 ? (
          <div className="bg-white border border-[#dbe7e7] rounded-[18px] text-center py-8 text-xs text-[#55696e]">
            No quotes found for this idea yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {opportunity.evidence.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="rose" size="sm">
                        {item.signal_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Pain Level: {item.severity}/5
                      </Badge>
                      <Badge variant="slate" size="sm">
                        Urgency: {(item.urgency_score * 100).toFixed(0)}%
                      </Badge>
                      {item.source.is_synthetic ? (
                        <Badge variant="amber" size="sm">
                          Sample Post
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">
                          Live Post
                        </Badge>
                      )}
                    </div>

                    <blockquote className="text-sm italic text-[#1f2a2e] border-l-2 border-[#0e6670] pl-3 py-1 my-2 leading-relaxed bg-[#f8fafb] rounded-r-md">
                      "{item.highlight_quote}"
                    </blockquote>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#55696e] pt-1">
                      <span className="font-medium text-[#1f2a2e]">
                        Discussion: {item.source.title}
                      </span>
                      <span>•</span>
                      <span>Posted by: @{item.source.author || 'anonymous'}</span>
                      <span>•</span>
                      <span className="font-mono uppercase text-[#0e6670] font-semibold">{item.source.platform}</span>
                    </div>
                  </div>

                  {item.source.url && (
                    <a
                      href={item.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="secondary" size="sm" showArrow={false} icon={<ExternalLinkIcon size={13} className="mr-1" />}>
                        View Post
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Strategy & Validation Brief Card */}
      <div className="bg-gradient-to-br from-[#f8fafb] via-[#ffffff] to-[#eaf3f3] border border-[#dbe7e7] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7]">
                AI Validation Synthesis
              </span>
              <span className="text-xs text-[#55696e]">Instant GTM & Experiment Playbook</span>
            </div>
            <h3 className="text-lg font-bold text-[#1f2a2e] mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0e6670]" />
              Executive Validation Memo & Challenger Angles
            </h3>
          </div>

          {!memo && (
            <Button
              variant="primary"
              size="sm"
              loading={loadingMemo}
              onClick={async () => {
                if (!opportunity) return;
                try {
                  setLoadingMemo(true);
                  const data = await copilotService.synthesizeOpportunity(opportunity.id);
                  setMemo(data);
                } catch (e) {
                  console.error(e);
                } finally {
                  setLoadingMemo(false);
                }
              }}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Generate AI Strategic Memo
            </Button>
          )}
        </div>

        {memo && (
          <div className="space-y-4 pt-2 animate-fadeIn text-xs leading-relaxed text-[#1f2a2e]">
            <div className="p-4 rounded-2xl bg-white border border-[#dbe7e7] shadow-sm">
              <span className="font-mono text-[10px] font-bold uppercase text-[#0e6670] block mb-1">
                Executive Assessment:
              </span>
              <p className="text-sm font-medium">{memo.executive_summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#dbe7e7]">
                <span className="font-mono text-[10px] font-bold uppercase text-[#0e6670] block mb-1.5">
                  ⚔️ Strategic Challenger Angles:
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-[#37474f]">
                  {memo.strategic_angles.map((ang, i) => (
                    <li key={i}>{ang}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#dbe7e7]">
                <span className="font-mono text-[10px] font-bold uppercase text-[#0e6670] block mb-1.5">
                  🧪 Recommended 48-Hour Experiments:
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-[#37474f]">
                  {memo.validation_experiments.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#eaf3f3] border border-[#dbe7e7] flex items-center justify-between text-[11px] font-mono">
              <span><b>Target ICP:</b> {memo.target_icp}</span>
              <span className="text-[#0e6670] font-bold">Pricing: {memo.pricing_strategy}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Zero-to-Code Action Engine Modal */}
      <PRDModal
        isOpen={isPrdOpen}
        onClose={() => setIsPrdOpen(false)}
        prd={prd}
        loading={loadingPrd}
      />

      {/* Embedded Context Copilot Drawer */}
      <AskGreatScoutCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        contextOpportunityId={opportunity.id}
        initialQuery={`Synthesize customer frustration and recommend pricing for "${opportunity.title}"`}
      />
    </div>
  );
};

