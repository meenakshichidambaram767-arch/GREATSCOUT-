import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { opportunitiesService } from '../services/opportunitiesService';
import { DashboardStats, Opportunity } from '../types/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { IngestionModal } from '../components/jobs/IngestionModal';
import { 
  RefreshIcon, 
  PlayIcon, 
  ArrowUpRightIcon, 
  CheckIcon, 
  OverviewIcon, 
  SignalIcon, 
  OpportunityIcon, 
  TrendsIcon, 
  QuoteIcon 
} from '../components/common/Icons';
import { LiveActivityTicker } from '../components/visual/LiveActivityTicker';
import { SemanticClusterMap } from '../components/visual/SemanticClusterMap';

const TEAL_PALETTE = ['#0e6670', '#178996', '#22b0c2', '#33c3d5', '#5cd6e5'];

const SIGNAL_TYPE_MAP: Record<string, { label: string; desc: string }> = {
  pain_point: { 
    label: 'Pain Points', 
    desc: 'Critical user friction and bottlenecks'
  },
  feature_request: { 
    label: 'Feature Requests', 
    desc: 'Explicit capability requests'
  },
  complaint: { 
    label: 'Complaints', 
    desc: 'Dissatisfaction with incumbent tools'
  },
  unmet_need: { 
    label: 'Unmet Needs', 
    desc: 'Unaddressed market capability voids'
  },
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, oppsData] = await Promise.all([
        dashboardService.getDashboardStats().catch(() => null),
        opportunitiesService.getOpportunities({ page_size: 4, sort_by: 'overall_score', sort_order: 'desc' }).catch(() => ({ items: [], total: 0 })),
      ]);
      setStats(statsData);
      setTopOpportunities(oppsData.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hasDocuments = (stats?.total_documents ?? 0) > 0;

  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: 'High Demand', color: 'text-[#0e6670] bg-[#eaf3f3] border-[#dbe7e7]' };
    if (score >= 70) return { label: 'Strong Potential', color: 'text-[#178996] bg-[#eaf3f3] border-[#dbe7e7]' };
    return { label: 'Emerging', color: 'text-[#d98a00] bg-[#fef7e6] border-[#fbe1b3]' };
  };

  if (loading && !stats) {
    return (
      <div className="space-y-7 font-outfit">
        <div className="h-10 w-72 bg-[#e3eded] rounded-xl animate-pulse" />
        <LoadingSkeleton count={4} height="h-36" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-outfit max-w-7xl mx-auto">
      {/* Live Market Activity Ticker */}
      <LiveActivityTicker />

      {/* Page Header: Clean, Architectural, Enterprise */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5eeee]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0e6670]">
              Market Intelligence Platform
            </span>
            <span className="text-[#cce1e3]">•</span>
            <span className="text-[11px] font-mono text-[#55696e]">
              Telemetry v1.0
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-[#1f2a2e] flex items-center gap-2.5">
            <span>Opportunity</span>
            <span className="text-[#0e6670]">Intelligence</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Synthesizing public discussion threads into ranked, evidence-backed software opportunity dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
            Ingest Feedback
          </Button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Documents Scanned */}
        <Card className="rounded-[20px] p-5 sm:p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors border-[#dbe7e7]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em] block">
                  Harvested Sources
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  Raw Discussions
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0 border border-[#dbe7e7]">
                <OverviewIcon size={18} />
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-[36px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_documents ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Normalized public posts and comment threads analyzed.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] flex items-center gap-1.5 text-xs text-[#0e6670] font-medium font-mono">
            <CheckIcon size={14} className="text-[#0e6670]" />
            <span>{hasDocuments ? 'Normalized & deduplicated' : 'Pipeline pending execution'}</span>
          </div>
        </Card>

        {/* KPI 2: Customer Pain Points Found */}
        <Card className="rounded-[20px] p-5 sm:p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors border-[#dbe7e7]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em] block">
                  Signal Extraction
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  Extracted Signals
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0 border border-[#dbe7e7]">
                <SignalIcon size={18} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[36px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_signals ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Discrete user friction points, bugs, and feature requests.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e] font-mono">
            Across {stats?.total_clusters ?? 0} semantic clusters
          </div>
        </Card>

        {/* KPI 3: Validated Product Opportunities */}
        <Card className="rounded-[20px] p-5 sm:p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors border-[#dbe7e7]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Synthesized Insights
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  Opportunities
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0 border border-[#dbe7e7]">
                <OpportunityIcon size={18} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[36px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_opportunities ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Ranked commercial candidates with verifiable source quotes.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e] font-mono">
            Traced to verbatim evidence
          </div>
        </Card>

        {/* KPI 4: Average Opportunity Score */}
        <div className="bg-[#0e6670] text-white rounded-[20px] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-white/80 uppercase tracking-[0.08em] block">
                  Composite Index
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Average Index Score
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
                <TrendsIcon size={18} />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[36px] leading-none font-outfit font-bold text-white font-mono">
                  {(stats?.average_opportunity_score ?? 0).toFixed(1)}
                </span>
                <span className="text-white/70 font-mono text-xs">/ 100</span>
              </div>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Weighted aggregate of demand volume, intensity, and vacuum.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/80 font-mono">
            7-Pillar scoring model active
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Signal Types Distribution */}
        <div className="lg:col-span-2 bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Distribution Taxonomy
                </span>
                <h3 className="text-base font-bold text-[#1f2a2e]">
                  User Friction Classification
                </h3>
              </div>
              <span className="text-xs text-[#55696e] bg-[#f4f8f8] px-3 py-1 rounded-full border border-[#dbe7e7] font-mono self-start sm:self-auto">
                {stats?.total_signals ?? 0} signals indexed
              </span>
            </div>
            <p className="text-xs text-[#55696e] max-w-xl leading-relaxed">
              Breakdown of user friction by classification category across ingested discussion channels.
            </p>
          </div>

          <div className="h-60 w-full pt-4">
            {stats?.signal_types_breakdown && stats.signal_types_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signal_types_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                  <XAxis 
                    dataKey="type" 
                    stroke="#55696e" 
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => SIGNAL_TYPE_MAP[val]?.label || val.replace('_', ' ')} 
                  />
                  <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                    labelStyle={{ color: '#1f2a2e', fontWeight: 700, fontSize: '12px' }}
                    labelFormatter={(val) => SIGNAL_TYPE_MAP[val]?.label || val}
                    formatter={(val) => [`${val} verified signals`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0e6670" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#f4f8f8] rounded-xl border border-dashed border-[#e3eded]">
                <p className="text-xs text-[#55696e]">No signals classified yet.</p>
              </div>
            )}
          </div>

          {/* Clean Signal Sub-grid without Emojis */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-[#dbe7e7]">
            <div className="bg-[#f8fafb] p-2.5 rounded-xl border border-[#eaf0f0]">
              <span className="text-xs font-semibold text-[#1f2a2e] block">Pain Points</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Repeated workflow friction</span>
            </div>
            <div className="bg-[#f8fafb] p-2.5 rounded-xl border border-[#eaf0f0]">
              <span className="text-xs font-semibold text-[#1f2a2e] block">Feature Requests</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Explicit tooling requests</span>
            </div>
            <div className="bg-[#f8fafb] p-2.5 rounded-xl border border-[#eaf0f0]">
              <span className="text-xs font-semibold text-[#1f2a2e] block">Complaints</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Incumbent product failures</span>
            </div>
            <div className="bg-[#f8fafb] p-2.5 rounded-xl border border-[#eaf0f0]">
              <span className="text-xs font-semibold text-[#1f2a2e] block">Unmet Needs</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Unaddressed solutions</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Source Breakdown */}
        <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              Source Attribution
            </span>
            <h3 className="text-base font-bold text-[#1f2a2e] mt-0.5">
              Channel Diversity
            </h3>
            <p className="text-xs text-[#55696e] mt-1 leading-relaxed">
              Cross-platform sampling distribution to ensure unbiased market signal density.
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-2">
            {stats?.sources_breakdown && stats.sources_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sources_breakdown}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={72}
                    paddingAngle={4}
                  >
                    {stats.sources_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                    itemStyle={{ color: '#0e6670', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val, name) => [`${val} records`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#e3eded] flex items-center justify-center text-xs text-[#55696e]">
                No Data
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-[#dbe7e7]">
            {stats?.sources_breakdown?.map((item, idx) => (
              <div key={item.source} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-[#1f2a2e] font-medium">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: TEAL_PALETTE[idx % TEAL_PALETTE.length] }}
                  />
                  {item.source}
                </span>
                <span className="font-mono text-[#55696e] font-medium">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2D Opportunity Galaxy & Semantic Cluster Map */}
      {topOpportunities.length > 0 && (
        <SemanticClusterMap
          opportunities={topOpportunities}
          onSelectOpportunity={(opp) => {
            window.location.href = `/app/opportunities/${opp.id}`;
          }}
        />
      )}

      {/* TOP OPPORTUNITIES LIST */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                Ranked Candidates
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-semibold">
                Evidence-Grounded
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1f2a2e]">
              Top Market Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-[#55696e] mt-1">
              Candidate products evaluated against demand volume, willingness to pay, and incumbent vacuum.
            </p>
          </div>

          <Link to="/app/opportunities">
            <Button variant="secondary" size="sm" showArrow={true}>
              All Opportunities
            </Button>
          </Link>
        </div>

        {topOpportunities.length === 0 ? (
          <div className="bg-[#0e6670] text-white rounded-[22px] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-white/80 block">
                Repository Initialized
              </span>
              <h3 className="text-2xl font-outfit font-bold tracking-tight text-white">
                No opportunities indexed yet
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Trigger the ingestion worker to process public feeds, cluster user complaints, and synthesize ranked opportunity dossiers.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#f4f8f8] text-[#0e6670] font-outfit font-bold text-sm shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <PlayIcon size={14} className="text-[#0e6670]" />
              <span>Trigger Ingestion</span>
              <ArrowUpRightIcon size={14} className="text-[#0e6670]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topOpportunities.map((opp) => {
              const score = opp.scores?.overall_score ?? 0;
              const rating = getScoreRating(score);

              return (
                <div 
                  key={opp.id} 
                  className="bg-white border border-[#dbe7e7] rounded-[20px] p-6 shadow-sm hover:border-[#0e6670] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Category and Score */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#f4f8f8] text-[#1f2a2e] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                          {opp.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${rating.color}`}>
                          {rating.label}
                        </span>
                      </div>
                      
                      <ScoreGauge score={score} size="sm" showLabel={false} />
                    </div>

                    {/* Opportunity Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#1f2a2e] group-hover:text-[#0e6670] transition-colors leading-snug">
                      {opp.title}
                    </h3>

                    {/* Problem Thesis */}
                    <div className="mt-3 bg-[#f8fafb] rounded-[12px] p-3.5 border border-[#eaf0f0]">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] tracking-wider block mb-1">
                        Validated Problem Thesis:
                      </span>
                      <p className="text-xs text-[#3b4d52] line-clamp-3 leading-relaxed">
                        {opp.problem_thesis}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-4 border-t border-[#dbe7e7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#0e6670] font-medium font-mono">
                      <QuoteIcon size={13} className="text-[#0e6670]" />
                      <span>{opp.signal_count} verbatim citations</span>
                    </div>

                    <Link to={`/app/opportunities/${opp.id}`}>
                      <Button variant="primary" size="sm" showArrow={true}>
                        Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER INFO BANNER */}
      <div className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-[18px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#55696e]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] flex items-center justify-center shrink-0">
            <CheckIcon size={14} />
          </div>
          <div>
            <span className="font-bold text-[#1f2a2e] block">
              Direct Citation Traceability
            </span>
            <span>
              All synthetic dossiers link bi-directionally to original verbatim comments and community thread identifiers.
            </span>
          </div>
        </div>
        <Link to="/app/signals" className="shrink-0 text-[#0e6670] font-semibold hover:underline flex items-center gap-1 font-mono">
          <span>Signal Explorer</span>
          <ArrowUpRightIcon size={12} />
        </Link>
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
