import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  Lightbulb, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { opportunitiesService } from '../services/opportunitiesService';
import { DashboardStats, Opportunity } from '../types/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

const PIE_COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#f43f5e'];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, oppsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        opportunitiesService.getOpportunities({ page_size: 4, sort_by: 'overall_score', sort_order: 'desc' }),
      ]);
      setStats(statsData);
      setTopOpportunities(oppsData.items);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        <LoadingSkeleton count={4} height="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Intelligence Overview
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              LIVE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time market gap synthesis from Product Hunt discussions and Reddit complaints.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchData}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ingested Documents</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {stats?.total_documents ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">100% Validated</span>
            <span>across PH & Reddit</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Extracted Signals</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {stats?.total_signals ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-indigo-400 font-medium">Pain Points & Needs</span>
            <span>extracted</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Discovered Gaps</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">
                {stats?.total_opportunities ?? 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lightbulb className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{stats?.total_clusters ?? 0} Clusters</span>
            <span>synthesized</span>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Opportunity Score</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {(stats?.average_opportunity_score ?? 0).toFixed(1)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-300">Composite 0-100 index</span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Taxonomy Breakdown */}
        <Card className="lg:col-span-2 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Extracted Friction Taxonomy</h3>
              <p className="text-xs text-slate-400">Distribution of user problems across categories</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats?.signal_types_breakdown && stats.signal_types_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signal_types_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="type" 
                    stroke="#64748b" 
                    fontSize={11}
                    tickFormatter={(val) => val.replace('_', ' ').toUpperCase()} 
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No signals extracted yet. Run an ingestion job to populate data.
              </div>
            )}
          </div>
        </Card>

        {/* Source Distribution */}
        <Card className="border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Source Share</h3>
            <p className="text-xs text-slate-400">Product Hunt vs Reddit volume</p>
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            {stats?.sources_breakdown && stats.sources_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sources_breakdown}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.sources_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No sources tracked yet</div>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {stats?.sources_breakdown?.map((item, idx) => (
              <div key={item.source} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  {item.source}
                </span>
                <span className="font-mono text-slate-400">
                  {item.count} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Discovered Market Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Highest-Scoring Product Gaps
              <Badge variant="emerald" size="sm">Evidence-Backed</Badge>
            </h2>
            <p className="text-xs text-slate-400">Opportunities synthesized from tightly coherent recurring user signals</p>
          </div>
          <Link to="/opportunities">
            <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
              View All Opportunities
            </Button>
          </Link>
        </div>

        {topOpportunities.length === 0 ? (
          <Card className="text-center py-10">
            <Lightbulb className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No opportunities generated yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click 'Run Scout Pipeline' in the top header to ingest sample discussions and synthesize gap reports.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topOpportunities.map((opp) => (
              <Link key={opp.id} to={`/opportunities/${opp.id}`}>
                <Card hoverEffect className="h-full flex flex-col justify-between border-slate-800">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge variant="cyan" size="sm">{opp.category}</Badge>
                      <ScoreGauge score={opp.scores?.overall_score ?? 0} size="sm" showLabel={false} />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 hover:text-emerald-400 transition-colors line-clamp-1">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {opp.problem_thesis}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-emerald-400">
                      {opp.signal_count} Verified Signals
                    </span>
                    <span className="text-slate-400">
                      Demand: <strong className="text-slate-200">{opp.scores?.demand_score?.toFixed(0)}</strong> | Pain: <strong className="text-slate-200">{opp.scores?.pain_intensity_score?.toFixed(0)}</strong>
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
