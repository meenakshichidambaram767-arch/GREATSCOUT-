import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  AlertCircle, 
  Lightbulb, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  FileText,
  Compass,
  Info
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { opportunitiesService } from '../services/opportunitiesService';
import { DashboardStats, Opportunity, SystemHealth } from '../types/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { IngestionModal } from '../components/jobs/IngestionModal';

const TEAL_PALETTE = ['#0e6670', '#178996', '#22b0c2', '#33c3d5', '#5cd6e5'];

// Plain English mapping for signal types
const SIGNAL_TYPE_MAP: Record<string, { label: string; desc: string; icon: string }> = {
  pain_point: { 
    label: 'Pain Points', 
    desc: 'Things that frustrate users or waste their time',
    icon: '🔥'
  },
  feature_request: { 
    label: 'Feature Wishes', 
    desc: 'Tools and features people explicitly ask someone to build',
    icon: '✨'
  },
  complaint: { 
    label: 'Complaints', 
    desc: 'Issues with existing software that feels broken or clunky',
    icon: '⚠️'
  },
  unmet_need: { 
    label: 'Missing Tools', 
    desc: 'Problems where no good existing solution exists yet',
    icon: '🎯'
  },
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showExplainer, setShowExplainer] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, oppsData, healthData] = await Promise.all([
        dashboardService.getDashboardStats().catch(() => null),
        opportunitiesService.getOpportunities({ page_size: 4, sort_by: 'overall_score', sort_order: 'desc' }).catch(() => ({ items: [], total: 0 })),
        dashboardService.getHealth().catch(() => null),
      ]);
      setStats(statsData);
      setTopOpportunities(oppsData.items || []);
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isConnected = health?.status === 'healthy';
  const hasDocuments = (stats?.total_documents ?? 0) > 0;

  // Format score into plain English description
  const getScoreRating = (score: number) => {
    if (score >= 80) return { label: 'High Demand', color: 'text-[#0e6670] bg-[#eaf3f3] border-[#dbe7e7]' };
    if (score >= 70) return { label: 'Strong Potential', color: 'text-[#178996] bg-[#eaf3f3] border-[#dbe7e7]' };
    return { label: 'Promising Idea', color: 'text-[#d98a00] bg-[#fef7e6] border-[#fbe1b3]' };
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
      {/* Page Header: Clear, welcoming and jargon-free */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7]">
              Market Research & Idea Discovery
            </span>
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#0e6670] animate-pulse" />
                Live System Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-[#fef7e6] text-[#d98a00] border border-[#fbe1b3] font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#d98a00]" />
                Connecting...
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-2.5">
            <span>Product Discovery</span>
            <span className="text-[#0e6670]">Dashboard</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-2 max-w-3xl leading-relaxed">
            We scan real customer conversations on Reddit and Product Hunt to find repeated complaints, and automatically turn them into validated business ideas you can build.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Scan New Feedback
          </Button>
        </div>
      </div>

      {/* BEGINNER-FRIENDLY EXPLAINER: "How GreatScout Works in 3 Simple Steps" */}
      {showExplainer && (
        <div className="bg-gradient-to-br from-[#eaf3f3] via-[#f2f7f7] to-[#ffffff] border border-[#cce1e3] rounded-[24px] p-6 sm:p-7 shadow-sm transition-all relative">
          <button
            onClick={() => setShowExplainer(false)}
            className="absolute top-4 right-4 text-xs font-mono text-[#55696e] hover:text-[#1f2a2e] px-2.5 py-1 rounded-full hover:bg-white/80 transition-colors"
            title="Dismiss guide"
          >
            ✕ Hide Guide
          </button>

          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#0e6670] text-white flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1f2a2e]">
                New to GreatScout? Here is how this platform helps you:
              </h2>
              <p className="text-xs text-[#55696e]">
                You do not need to guess what to build next. Here is the 3-step process happening behind the scenes:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Step 1 */}
            <div className="bg-white rounded-[18px] p-5 border border-[#dbe7e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#0e6670] font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#eaf3f3] flex items-center justify-center text-xs font-mono">1</span>
                  <span>Scans Real Discussions</span>
                </div>
                <p className="text-xs text-[#55696e] leading-relaxed">
                  We collect public posts and comment threads where users talk about their day-to-day workflow struggles.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#f0f4f4] text-[11px] font-mono text-[#0e6670] font-semibold">
                → Source: Reddit & Product Hunt
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-[18px] p-5 border border-[#dbe7e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#0e6670] font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#eaf3f3] flex items-center justify-center text-xs font-mono">2</span>
                  <span>Detects Real Frustrations</span>
                </div>
                <p className="text-xs text-[#55696e] leading-relaxed">
                  AI reads every post to pull out specific complaints, broken tools, and features people are begging someone to build.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#f0f4f4] text-[11px] font-mono text-[#0e6670] font-semibold">
                → Filtered: Pain points & bugs
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-[18px] p-5 border border-[#dbe7e7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-[#0e6670] font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#eaf3f3] flex items-center justify-center text-xs font-mono">3</span>
                  <span>Ranks Proven Ideas</span>
                </div>
                <p className="text-xs text-[#55696e] leading-relaxed">
                  Similar complaints are grouped together into product opportunities, ranked by customer demand and willingness to pay.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#f0f4f4] text-[11px] font-mono text-[#0e6670] font-semibold">
                → Backed by real quotes as proof
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRICS: Simplified Names with Clear Definitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Discussions Scanned */}
        <Card className="rounded-[22px] p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em] block">
                  Step 1
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  Discussions Scanned
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            
            <div className="mt-3">
              <span className="text-[38px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_documents ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Total online posts, reviews, and community threads analyzed.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] flex items-center gap-1.5 text-xs text-[#0e6670] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0e6670]" />
            <span>{hasDocuments ? 'Verified real-world conversations' : 'No data yet — run a scan'}</span>
          </div>
        </Card>

        {/* KPI 2: Customer Pain Points Found */}
        <Card className="rounded-[22px] p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em] block">
                  Step 2
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  User Frustrations Found
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[38px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_signals ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Specific complaints, bugs, and missing features extracted by AI.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e]">
            Identified across all analyzed threads
          </div>
        </Card>

        {/* KPI 3: Validated Product Ideas */}
        <Card className="rounded-[22px] p-6 flex flex-col justify-between hover:border-[#0e6670] transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Step 3
                </span>
                <h3 className="text-sm font-bold text-[#1f2a2e] mt-0.5">
                  Product Opportunities
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[38px] leading-none font-outfit font-bold text-[#1f2a2e] font-mono">
                {stats?.total_opportunities ?? 0}
              </span>
              <p className="text-xs text-[#55696e] mt-2 leading-relaxed">
                Distinct software ideas ready to build, backed by real customer proof.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e]">
            Grouped from {stats?.total_clusters ?? 0} problem clusters
          </div>
        </Card>

        {/* KPI 4: Average Opportunity Score (Solid Teal) */}
        <div className="bg-[#0e6670] text-white rounded-[22px] p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] font-semibold text-white/80 uppercase tracking-[0.08em] block">
                  Market Rating
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Average Idea Score
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[38px] leading-none font-outfit font-bold text-white font-mono">
                  {(stats?.average_opportunity_score ?? 0).toFixed(1)}
                </span>
                <span className="text-white/70 font-mono text-sm">/ 100</span>
              </div>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Commercial potential score based on user urgency and willingness to pay.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/80">
            ★ Scores above 70 indicate high market demand
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS ROW: Simplified Headings with Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: What Are Users Complaining About? */}
        <div className="lg:col-span-2 bg-white border border-[#dbe7e7] rounded-[24px] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Feedback Breakdown
                </span>
                <h3 className="text-lg font-bold text-[#1f2a2e]">
                  What Are Customers Complaining About?
                </h3>
              </div>
              <span className="text-xs text-[#55696e] bg-[#f4f8f8] px-3 py-1 rounded-full border border-[#dbe7e7] font-mono self-start sm:self-auto">
                {stats?.total_signals ?? 0} total problems
              </span>
            </div>
            <p className="text-xs text-[#55696e] max-w-xl leading-relaxed">
              We sort user feedback into 4 easy-to-understand categories so you know whether users are suffering from broken workflows or begging for brand new tools.
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
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => SIGNAL_TYPE_MAP[val]?.label || val.replace('_', ' ')} 
                  />
                  <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#1f2a2e', fontWeight: 700, fontSize: '13px' }}
                    labelFormatter={(val) => SIGNAL_TYPE_MAP[val]?.label || val}
                    formatter={(val) => [`${val} real customer comments`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0e6670" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#f4f8f8] rounded-xl border border-dashed border-[#e3eded]">
                <p className="text-xs text-[#55696e]">No customer complaints extracted yet. Run a feedback scan to see data.</p>
              </div>
            )}
          </div>

          {/* Simple Guide Pills below the chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-2 border-t border-[#dbe7e7]">
            <div className="bg-[#f4f8f8] p-2.5 rounded-xl border border-[#eaf3f3]">
              <span className="text-xs font-bold text-[#1f2a2e] block">🔥 Pain Points</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Painful friction or time wasters</span>
            </div>
            <div className="bg-[#f4f8f8] p-2.5 rounded-xl border border-[#eaf3f3]">
              <span className="text-xs font-bold text-[#1f2a2e] block">✨ Feature Wishes</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Tools users explicitly ask for</span>
            </div>
            <div className="bg-[#f4f8f8] p-2.5 rounded-xl border border-[#eaf3f3]">
              <span className="text-xs font-bold text-[#1f2a2e] block">⚠️ Complaints</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Unhappy with clunky software</span>
            </div>
            <div className="bg-[#f4f8f8] p-2.5 rounded-xl border border-[#eaf3f3]">
              <span className="text-xs font-bold text-[#1f2a2e] block">🎯 Missing Tools</span>
              <span className="text-[11px] text-[#55696e] block mt-0.5 leading-snug">Gaps where no solution exists</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Where the Feedback Came From */}
        <div className="bg-white border border-[#dbe7e7] rounded-[24px] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              Data Sources
            </span>
            <h3 className="text-lg font-bold text-[#1f2a2e] mt-0.5">
              Where Feedback Came From
            </h3>
            <p className="text-xs text-[#55696e] mt-1 leading-relaxed">
              We gather conversations across different platforms to ensure feedback isn't one-sided.
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
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0e6670', fontWeight: 600 }}
                    formatter={(val, name) => [`${val} posts`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#e3eded] flex items-center justify-center text-xs text-[#55696e]">
                No Data Yet
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#dbe7e7]">
            {stats?.sources_breakdown?.map((item, idx) => (
              <div key={item.source} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-[#1f2a2e] font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: TEAL_PALETTE[idx % TEAL_PALETTE.length] }}
                  />
                  {item.source}
                </span>
                <span className="font-mono text-[#55696e] font-medium">
                  {item.count} posts ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
            <p className="text-[11px] text-[#55696e] pt-1 border-t border-[#f0f4f4] italic">
              💡 Diverse sources guarantee authentic, real-world customer demand.
            </p>
          </div>
        </div>
      </div>

      {/* TOP DISCOVERED OPPORTUNITIES: Simple English, Clear Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                Recommended Ideas
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-semibold">
                ★ Backed by Real User Quotes
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1f2a2e]">
              Top Product Opportunities to Build
            </h2>
            <p className="text-xs sm:text-sm text-[#55696e] mt-1">
              These are the highest-rated product ideas discovered from online discussions, ranked by demand and how urgently people want a solution.
            </p>
          </div>

          <Link to="/app/opportunities">
            <Button variant="secondary" size="sm" showArrow={true}>
              View All Opportunities
            </Button>
          </Link>
        </div>

        {/* Empty State Banner if no opportunities exist */}
        {topOpportunities.length === 0 ? (
          <div className="bg-[#0e6670] text-white rounded-[24px] p-8 sm:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-white/80 block">
                Ready to Discover
              </span>
              <h3 className="text-2xl font-outfit font-bold tracking-tight text-white">
                No product opportunities generated yet
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Click below to start the feedback scanner. GreatScout will read developer conversations from Reddit and Product Hunt, find common pain points, and give you ranked product opportunities with evidence.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#f4f8f8] text-[#0e6670] font-outfit font-bold text-sm shadow-md transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0e6670]" />
              <span>Scan Customer Discussions</span>
              <ArrowUpRight className="w-4 h-4 text-[#0e6670]" />
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
                  className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm hover:border-[#0e6670] hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
                      
                      {/* Score gauge with score value */}
                      <ScoreGauge score={score} size="sm" showLabel={false} />
                    </div>

                    {/* Opportunity Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#1f2a2e] group-hover:text-[#0e6670] transition-colors leading-snug">
                      {opp.title}
                    </h3>

                    {/* Brief Problem Statement */}
                    <div className="mt-3 bg-[#f8fafb] rounded-[14px] p-3.5 border border-[#eaf0f0]">
                      <span className="text-[11px] font-mono uppercase font-bold text-[#55696e] tracking-wider block mb-1">
                        The Problem People Face:
                      </span>
                      <p className="text-xs text-[#3b4d52] line-clamp-3 leading-relaxed">
                        {opp.problem_thesis}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Verified Proof & Action Button */}
                  <div className="mt-5 pt-4 border-t border-[#dbe7e7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#0e6670] font-medium font-mono">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{opp.signal_count} real user comments analyzed</span>
                    </div>

                    <Link to={`/app/opportunities/${opp.id}`}>
                      <Button variant="primary" size="sm" showArrow={true}>
                        See Full Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER INFO BANNER: Explaining why evidence matters */}
      <div className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-[20px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#55696e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#1f2a2e] block">
              Why can you trust these opportunities?
            </span>
            <span>
              Every score and thesis is traced directly back to verbatim customer quotes. Click "See Full Details" on any idea to read the original forum discussions.
            </span>
          </div>
        </div>
        <Link to="/app/signals" className="shrink-0 text-[#0e6670] font-semibold hover:underline flex items-center gap-1">
          <span>Explore Customer Quotes</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
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

