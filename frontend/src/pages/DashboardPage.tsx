import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  Lightbulb, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { opportunitiesService } from '../services/opportunitiesService';
import { DashboardStats, Opportunity, SystemHealth } from '../types/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { IngestionModal } from '../components/jobs/IngestionModal';

const TEAL_PALETTE = ['#0e6670', '#178996', '#22b0c2', '#33c3d5', '#5cd6e5'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  if (loading && !stats) {
    return (
      <div className="space-y-7">
        <div className="h-8 w-64 bg-[#e3eded] rounded-xl animate-pulse" />
        <LoadingSkeleton count={4} height="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-7 font-outfit">
      {/* Page Header with Eyebrow and Split Teal Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] block mb-1">
            TELEMETRY // REAL-TIME DISCOVERY
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Intelligence</span>
            <span className="text-[#0e6670]">Overview</span>
            {isConnected ? (
              <span className="text-[11px] px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold tracking-wide">
                LIVE
              </span>
            ) : (
              <span className="text-[11px] px-3 py-1 rounded-full bg-[#fef7e6] text-[#d98a00] border border-[#fbe1b3] font-mono font-semibold tracking-wide">
                Connecting...
              </span>
            )}
          </h1>
          <p className="text-sm text-[#55696e] mt-1.5 max-w-2xl">
            Real-time market gap synthesis distilled from public discussions, pain points, and unmet software needs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards: Responsive 4 -> 2 -> 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ingested Documents */}
        <Card className="rounded-[20px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em]">
                Ingested Documents
              </p>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[40px] leading-tight font-outfit font-bold text-[#1f2a2e] mt-2 font-mono">
              {stats?.total_documents ?? 0}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e]">
            {hasDocuments ? '100% Validated across PH & Reddit' : 'Awaiting first pipeline run'}
          </div>
        </Card>

        {/* KPI 2: Extracted Signals */}
        <Card className="rounded-[20px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em]">
                Extracted Signals
              </p>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[40px] leading-tight font-outfit font-bold text-[#1f2a2e] mt-2 font-mono">
              {stats?.total_signals ?? 0}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e]">
            Pain points, feature requests & unmet needs
          </div>
        </Card>

        {/* KPI 3: Discovered Gaps */}
        <Card className="rounded-[20px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="font-mono text-[11px] font-semibold text-[#55696e] uppercase tracking-[0.08em]">
                Discovered Gaps
              </p>
              <div className="w-10 h-10 rounded-full bg-[#eaf3f3] text-[#0e6670] flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[40px] leading-tight font-outfit font-bold text-[#1f2a2e] mt-2 font-mono">
              {stats?.total_opportunities ?? 0}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-[#dbe7e7] text-xs text-[#55696e]">
            {stats?.total_clusters ?? 0} Problem clusters synthesized
          </div>
        </Card>

        {/* KPI 4: Avg Opportunity Score (SOLID TEAL with White Text) */}
        <div className="bg-[#0e6670] text-white rounded-[20px] p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <p className="font-mono text-[11px] font-semibold text-white/80 uppercase tracking-[0.08em]">
                Avg Opportunity Score
              </p>
              <div className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[40px] leading-tight font-outfit font-bold text-white mt-2 font-mono">
              {(stats?.average_opportunity_score ?? 0).toFixed(1)}
            </h3>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-white/80">
            Composite 0-100 commercial viability index
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Chart Panels with 24px radius, teal shades, light #e3eded gridlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Taxonomy Breakdown */}
        <div className="lg:col-span-2 bg-white border border-[#dbe7e7] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                DISTRIBUTION
              </span>
              <h3 className="text-lg font-bold text-[#1f2a2e]">Extracted Friction Taxonomy</h3>
              <p className="text-xs text-[#55696e] mt-0.5">Classification of user complaints across signal categories</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            {stats?.signal_types_breakdown && stats.signal_types_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signal_types_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                  <XAxis 
                    dataKey="type" 
                    stroke="#55696e" 
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => val.replace('_', ' ').toUpperCase()} 
                  />
                  <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    labelStyle={{ color: '#1f2a2e', fontWeight: 600, fontSize: '12px' }}
                    itemStyle={{ color: '#0e6670' }}
                  />
                  <Bar dataKey="count" fill="#0e6670" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#f4f8f8] rounded-xl border border-dashed border-[#e3eded]">
                <div className="w-8 h-8 rounded-full bg-[#e3eded] mb-2" />
                <p className="text-xs text-[#3b4d52]">No signals extracted yet. Run an ingestion job to populate data.</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Share */}
        <div className="bg-white border border-[#dbe7e7] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              VOLUME BREAKDOWN
            </span>
            <h3 className="text-lg font-bold text-[#1f2a2e]">Source Share</h3>
            <p className="text-xs text-[#55696e] mt-0.5">Product Hunt vs Reddit volume</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center my-2">
            {stats?.sources_breakdown && stats.sources_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sources_breakdown}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.sources_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    itemStyle={{ color: '#0e6670' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#e3eded] flex items-center justify-center text-xs text-[#3b4d52]">
                Awaiting Data
              </div>
            )}
          </div>
          <div className="space-y-2 pt-2 border-t border-[#dbe7e7]">
            {stats?.sources_breakdown?.map((item, idx) => (
              <div key={item.source} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-[#1f2a2e] font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: TEAL_PALETTE[idx % TEAL_PALETTE.length] }}
                  />
                  {item.source}
                </span>
                <span className="font-mono text-[#55696e]">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Discovered Market Opportunities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
              CATALOG
            </span>
            <h2 className="text-xl font-bold text-[#1f2a2e] flex items-center gap-2.5">
              <span>Highest-Scoring</span>
              <span className="text-[#0e6670]">Product Gaps</span>
              <Badge variant="emerald" size="sm">Evidence-Backed</Badge>
            </h2>
            <p className="text-xs text-[#55696e] mt-0.5">Opportunities synthesized from tightly coherent recurring user signals</p>
          </div>
          <Link to="/app/opportunities">
            <Button variant="ghost" size="sm" showArrow={true}>
              View All Opportunities
            </Button>
          </Link>
        </div>

        {/* If no opportunities generated yet: FULL-WIDTH TEAL BANNER */}
        {topOpportunities.length === 0 ? (
          <div className="bg-[#0e6670] text-white rounded-[24px] p-8 sm:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-white/80 block">
                PIPELINE READY
              </span>
              <h3 className="text-2xl font-outfit font-bold tracking-tight text-white">
                No opportunities generated yet
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Trigger the GreatScout pipeline to ingest developer discussions from Reddit & Product Hunt, extract pain points, and synthesize evidence-backed opportunities.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#f4f8f8] text-[#0e6670] font-outfit font-bold text-sm shadow-md transition-all hover:scale-[1.02] shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Sparkles className="w-4 h-4 text-[#0e6670]" />
              <span>Run Scout Pipeline</span>
              <ArrowUpRight className="w-4 h-4 text-[#0e6670]" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topOpportunities.map((opp) => (
              <div 
                key={opp.id} 
                className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm hover:border-[#0e6670] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                      {opp.category}
                    </span>
                    <ScoreGauge score={opp.scores?.overall_score ?? 0} size="sm" showLabel={false} />
                  </div>
                  <h3 className="text-base font-bold text-[#1f2a2e] hover:text-[#0e6670] transition-colors line-clamp-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-[#55696e] mt-2 line-clamp-2 leading-relaxed">
                    {opp.problem_thesis}
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-[#dbe7e7] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#f4f8f8] text-[#0e6670] border border-[#dbe7e7] font-semibold">
                      {opp.signal_count} Verified Signals
                    </span>
                  </div>
                  <Link to={`/app/opportunities/${opp.id}`}>
                    <Button variant="primary" size="sm" showArrow={true}>
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};
