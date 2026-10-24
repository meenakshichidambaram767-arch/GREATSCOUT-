import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  CartesianGrid 
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { TrendsAnalytics } from '../types/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { IngestionModal } from '../components/jobs/IngestionModal';

export const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<TrendsAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getTrends(timeframe);
        setTrends(data);
      } catch (err) {
        console.error('Failed to load trends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [timeframe]);

  return (
    <div className="space-y-7 font-outfit max-w-7xl mx-auto">
      {/* Page Header with Eyebrow and Split Teal Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7] inline-block mb-1.5">
            Market Trends & Dynamics
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Market</span>
            <span className="text-[#0e6670]">Trends</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold">
              Trend Analytics
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Track how user complaints change over time, see which software industries have the most frustrated customers, and spot where new market demand is spiking.
          </p>
        </div>

        {/* Timeframe Pill Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-[#dbe7e7] rounded-full p-1.5 shadow-sm text-xs">
          {['7d', '30d', '90d', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1 rounded-full font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670] ${
                timeframe === t
                  ? 'bg-[#0e6670] text-white shadow-sm'
                  : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
              }`}
            >
              {t === 'all' ? 'All Time' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Explainer Banner */}
      <div className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#55696e]">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📈</span>
          <div>
            <strong className="text-[#1f2a2e] block sm:inline">How to use trend data: </strong>
            <span>
              A sudden spike in complaints or urgent problems in an industry indicates an immediate business opportunity to launch a better alternative tool.
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} height="h-80" />
      ) : (
        <div className="space-y-7">
          {/* Sentiment & Critical Urgency Timeline: White Card with 24px radius, #e3eded grid */}
          <div className="bg-white border border-[#dbe7e7] rounded-[24px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  TIMELINE
                </span>
                <h3 className="text-lg font-bold text-[#1f2a2e] flex items-center gap-2 mt-0.5">
                  <Activity className="w-5 h-5 text-[#0e6670]" />
                  Customer Complaints & Urgent Frustrations Over Time
                </h3>
                <p className="text-xs text-[#55696e] mt-0.5">
                  Daily tracking of negative user feedback and high-urgency problems across public forums
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              {trends?.sentiment_timeline && trends.sentiment_timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.sentiment_timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                    <XAxis dataKey="date" stroke="#55696e" fontSize={11} tickLine={false} />
                    <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      labelStyle={{ color: '#1f2a2e', fontWeight: 600, fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="negative_signals"
                      name="Negative Customer Signals"
                      stroke="#0e6670"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#0e6670' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical_urgency"
                      name="Critical Urgency (High Pain)"
                      stroke="#d98a00"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#d98a00' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No timeline data available for this timeframe"
                  description="Run a feedback scan to log time-stamped signals."
                  actionLabel="Run Feedback Scanner"
                  onAction={() => setModalOpen(true)}
                  showGhost={false}
                />
              )}
            </div>
          </div>

          {/* Domain Breakdown & Average Opportunity Scores */}
          <div className="bg-white border border-[#dbe7e7] rounded-[24px] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  BY SOFTWARE CATEGORY
                </span>
                <h3 className="text-lg font-bold text-[#1f2a2e] flex items-center gap-2 mt-0.5">
                  <BarChart3 className="w-5 h-5 text-[#0e6670]" />
                  Opportunity Count & Demand by Industry
                </h3>
                <p className="text-xs text-[#55696e] mt-0.5">
                  Comparing how many viable business ideas exist across different categories, alongside their average ratings
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              {trends?.category_distribution && trends.category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends.category_distribution} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                    <XAxis dataKey="category" stroke="#55696e" fontSize={11} tickLine={false} />
                    <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      labelStyle={{ color: '#1f2a2e', fontWeight: 600, fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="count" name="Opportunities Count" fill="#178996" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="avg_score" name="Avg Opportunity Score" fill="#0e6670" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No category breakdown data available"
                  description="Run a feedback scan to populate category scores."
                  actionLabel="Run Feedback Scanner"
                  onAction={() => setModalOpen(true)}
                  showGhost={false}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
