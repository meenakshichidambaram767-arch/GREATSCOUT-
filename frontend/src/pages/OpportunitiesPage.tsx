import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { opportunitiesService } from '../services/opportunitiesService';
import { Opportunity } from '../types/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

const CATEGORIES = [
  'All Categories',
  'Developer Tools',
  'SaaS Operations',
  'AI Automation',
  'Remote Work',
  'E-Commerce',
];

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('overall_score');
  const [minScore, setMinScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await opportunitiesService.getOpportunities({
        search: search.trim() || undefined,
        category: category !== 'All Categories' ? category : undefined,
        min_score: minScore > 0 ? minScore : undefined,
        sort_by: sortBy,
        sort_order: 'desc',
        page,
        page_size: 8,
      });
      setOpportunities(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [page, category, sortBy, minScore]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Discovered Market Opportunities
            <Badge variant="emerald" size="sm">{total} Gaps Found</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real recurring user pain points distilled into actionable product theses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-800 bg-slate-900/40 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search opportunity title, problem thesis, or target audience..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="overall_score">Sort: Highest Overall Score</option>
              <option value="demand_score">Sort: Highest Demand Volume</option>
              <option value="pain_intensity_score">Sort: Most Critical Pain</option>
              <option value="willingness_to_pay_score">Sort: Highest Willingness-to-Pay</option>
              <option value="created_at">Sort: Newest First</option>
            </select>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Min Score:</span>
              <button
                type="button"
                onClick={() => setMinScore(0)}
                className={`px-1.5 py-0.5 rounded text-[11px] ${minScore === 0 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMinScore(70)}
                className={`px-1.5 py-0.5 rounded text-[11px] ${minScore === 70 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                70+
              </button>
              <button
                type="button"
                onClick={() => setMinScore(85)}
                className={`px-1.5 py-0.5 rounded text-[11px] ${minScore === 85 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                85+
              </button>
            </div>

            <Button variant="primary" size="sm" type="submit">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Opportunities Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-44" />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No matching market opportunities"
          description="Try clearing search keywords or selecting 'All Categories'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <Link key={opp.id} to={`/opportunities/${opp.id}`}>
              <Card hoverEffect className="h-full flex flex-col justify-between border-slate-800">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="cyan" size="sm">{opp.category}</Badge>
                      <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
                        {opp.target_audience}
                      </Badge>
                    </div>
                    <ScoreGauge score={opp.scores.overall_score} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-slate-100 hover:text-emerald-400 transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {opp.problem_thesis}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <Layers className="w-3.5 h-3.5" />
                      {opp.signal_count} Verified Signals
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 font-medium">
                    <span>Inspect Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Showing Page <span className="text-slate-200 font-bold">{page}</span> of{' '}
            <span className="text-slate-200 font-bold">{totalPages}</span> ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
