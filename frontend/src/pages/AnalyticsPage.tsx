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
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<TrendsAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Market Trends & Sentiment Dynamics
            <Badge variant="cyan" size="sm">Analytics Suite</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze shifts in software complaints, critical urgency spikes, and domain opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          {['7d', '30d', '90d', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-md font-medium uppercase tracking-wider transition-all ${
                timeframe === t
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} height="h-72" />
      ) : (
        <div className="space-y-6">
          {/* Sentiment & Critical Urgency Timeline */}
          <Card className="border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Negative Sentiment & High-Urgency Friction Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Daily tracking of critical user dissatisfaction spikes across developer and founder communities
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              {trends?.sentiment_timeline && trends.sentiment_timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends.sentiment_timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="negative_signals"
                      name="Negative Signals"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical_urgency"
                      name="Critical Urgency (Severity 4-5)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No trend data available for this timeframe.
                </div>
              )}
            </div>
          </Card>

          {/* Domain Breakdown & Average Opportunity Scores */}
          <Card className="border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Category Gap Concentration & Score Index
                </h3>
                <p className="text-xs text-slate-400">
                  Comparing opportunity volume and average score ratings across software verticals
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              {trends?.category_distribution && trends.category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends.category_distribution} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="count" name="Opportunities Count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg_score" name="Avg Opportunity Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No category data available.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
