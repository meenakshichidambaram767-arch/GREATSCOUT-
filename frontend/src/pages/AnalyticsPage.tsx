import React, { useEffect, useState } from 'react';
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5eeee]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0e6670]">
              Market Dynamics
            </span>
            <span className="text-[#cce1e3]">•</span>
            <span className="text-[11px] font-mono text-[#55696e]">
              Longitudinal Velocity
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-[#1f2a2e] flex items-center gap-2.5">
            <span>Market</span>
            <span className="text-[#0e6670]">Trends</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Longitudinal telemetry tracking sentiment velocity, volume spikes, and vertical problem clusters.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-[#dbe7e7] rounded-xl p-1 shadow-sm text-xs">
          {['7d', '30d', '90d', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none ${
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

      {loading ? (
        <LoadingSkeleton count={2} height="h-80" />
      ) : (
        <div className="space-y-7">
          {/* Sentiment & Urgency Timeline */}
          <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Temporal Dynamics
                </span>
                <h3 className="text-base font-bold text-[#1f2a2e]">
                  Signal Volume & Critical Urgency Index
                </h3>
              </div>
              <span className="text-xs text-[#55696e] font-mono bg-[#f8fafb] px-3 py-1 rounded-md border border-[#dbe7e7]">
                Sampling window: {timeframe}
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              {trends?.sentiment_timeline && trends.sentiment_timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.sentiment_timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                    <XAxis dataKey="date" stroke="#55696e" fontSize={11} tickLine={false} />
                    <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                      labelStyle={{ color: '#1f2a2e', fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="negative_signals"
                      name="Friction Signals"
                      stroke="#0e6670"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0e6670' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical_urgency"
                      name="High Urgency Mentions"
                      stroke="#d98a00"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#d98a00' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No timeline data available"
                  description="Run scans over time to generate longitudinal trends."
                  actionLabel="Ingest Signals"
                  onAction={() => setModalOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block">
                  Domain Concentration
                </span>
                <h3 className="text-base font-bold text-[#1f2a2e]">
                  Vertical Volume & Mean Viability Index
                </h3>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              {trends?.category_distribution && trends.category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends.category_distribution} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e3eded" vertical={false} />
                    <XAxis dataKey="category" stroke="#55696e" fontSize={11} tickLine={false} />
                    <YAxis stroke="#55696e" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dbe7e7', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                      labelStyle={{ color: '#1f2a2e', fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="count" name="Opportunities Count" fill="#0e6670" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg_score" name="Avg Opportunity Score" fill="#178996" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No categorical data"
                  description="Scan discussions across multiple categories to view comparative charts."
                  actionLabel="Ingest Signals"
                  onAction={() => setModalOpen(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};
