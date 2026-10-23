import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Filter
} from 'lucide-react';
import { opportunitiesService } from '../services/opportunitiesService';
import { Opportunity } from '../types/api';
import { Card } from '../components/common/Card';
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
    <div className="space-y-7 font-outfit">
      {/* Page Header with Eyebrow and Split Teal Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] block mb-1">
            COMMERCIAL DOSSIERS // 7-PILLAR EVALUATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Discovered</span>
            <span className="text-[#0e6670]">Opportunities</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold">
              {total} Gaps Found
            </span>
          </h1>
          <p className="text-sm text-[#55696e] mt-1.5 max-w-2xl">
            Real recurring user pain points distilled into actionable, evidence-backed product theses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar: White Surface, #dbe7e7 borders */}
      <Card className="p-4 sm:p-5 rounded-[22px] border border-[#dbe7e7]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#55696e]" />
            <input
              type="text"
              placeholder="Search opportunity title, problem thesis, or target audience..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f4f8f8] border border-[#dbe7e7] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#1f2a2e] placeholder-[#55696e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-full px-4 py-2.5 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
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
              className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-full px-4 py-2.5 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e6670]"
            >
              <option value="overall_score">Sort: Highest Overall Score</option>
              <option value="demand_score">Sort: Highest Demand Volume</option>
              <option value="pain_intensity_score">Sort: Most Critical Pain</option>
              <option value="willingness_to_pay_score">Sort: Highest Willingness-to-Pay</option>
              <option value="created_at">Sort: Newest First</option>
            </select>

            <div className="flex items-center gap-1.5 bg-[#f4f8f8] border border-[#dbe7e7] rounded-full px-3 py-1.5 text-xs">
              <span className="text-[#55696e] text-[11px] font-mono font-medium">Min Score:</span>
              {[
                { val: 0, label: 'All' },
                { val: 70, label: '70+' },
                { val: 85, label: '85+' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinScore(val)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all ${
                    minScore === val
                      ? 'bg-[#0e6670] text-white shadow-sm'
                      : 'text-[#55696e] hover:text-[#1f2a2e]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button variant="primary" size="sm" type="submit" showArrow={false} icon={<Filter className="w-3.5 h-3.5 mr-1" />}>
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Opportunities Grid: 20-24px radius, white cards, score as teal badge, evidence count chip, black primary View button */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-48" />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No matching market opportunities"
          description="Try adjusting search keywords, resetting category filters, or launching an ingestion run."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearch('');
            setCategory('All Categories');
            setMinScore(0);
            setSortBy('overall_score');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => (
            <div 
              key={opp.id} 
              className="bg-white border border-[#dbe7e7] rounded-[22px] p-6 shadow-sm hover:border-[#0e6670] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                      {opp.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f4f8f8] text-[#55696e] text-[11px] font-mono border border-[#dbe7e7]">
                      {opp.target_audience}
                    </span>
                  </div>
                  <ScoreGauge score={opp.scores.overall_score} size="sm" />
                </div>

                <h3 className="text-lg font-bold text-[#1f2a2e] hover:text-[#0e6670] transition-colors leading-snug">
                  {opp.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#55696e] mt-2 line-clamp-3 leading-relaxed">
                  {opp.problem_thesis}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#dbe7e7] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0e6670]" />
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-5 border-t border-[#dbe7e7]">
          <p className="text-xs text-[#55696e] font-outfit">
            Showing Page <span className="text-[#1f2a2e] font-bold">{page}</span> of{' '}
            <span className="text-[#1f2a2e] font-bold">{totalPages}</span> ({total} total opportunities)
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4 mr-1" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4 ml-1" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
