import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesService } from '../services/opportunitiesService';
import { Opportunity, OpportunityPRD } from '../types/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { PRDModal } from '../components/opportunities/PRDModal';
import { BatchPRDModal } from '../components/opportunities/BatchPRDModal';
import { 
  SearchIcon, 
  FilterIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  QuoteIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon
} from '../components/common/Icons';

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

  // Multi-project selection & PRD states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [singlePrd, setSinglePrd] = useState<OpportunityPRD | null>(null);
  const [isSinglePrdOpen, setIsSinglePrdOpen] = useState(false);
  const [loadingPrdId, setLoadingPrdId] = useState<string | null>(null);

  const [batchPrds, setBatchPrds] = useState<OpportunityPRD[]>([]);
  const [batchMarkdown, setBatchMarkdown] = useState<string>('');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);

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

  // Open individual project PRD
  const handleOpenSinglePrd = async (oppId: string) => {
    try {
      setLoadingPrdId(oppId);
      const prd = await opportunitiesService.getOpportunityPRD(oppId);
      setSinglePrd(prd);
      setIsSinglePrdOpen(true);
    } catch (err) {
      console.error('Failed to load PRD:', err);
    } finally {
      setLoadingPrdId(null);
    }
  };

  // Toggle selection for batch export
  const toggleSelect = (oppId: string) => {
    setSelectedIds((prev) => 
      prev.includes(oppId) ? prev.filter((id) => id !== oppId) : [...prev, oppId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === opportunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(opportunities.map((o) => o.id));
    }
  };

  // Open batch PRD for multiple projects
  const handleOpenBatchPrd = async (idsToFetch?: string[]) => {
    const targetIds = idsToFetch || selectedIds;
    if (targetIds.length === 0) return;

    try {
      setLoadingBatch(true);
      setIsBatchModalOpen(true);
      const batchData = await opportunitiesService.getBatchPRD(targetIds);
      setBatchPrds(batchData.items);
      setBatchMarkdown(batchData.combined_markdown);
    } catch (err) {
      console.error('Failed to load batch PRDs:', err);
    } finally {
      setLoadingBatch(false);
    }
  };

  return (
    <div className="space-y-7 font-outfit max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e5eeee]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0e6670]">
              Evaluation Engine
            </span>
            <span className="text-[#cce1e3]">•</span>
            <span className="text-[11px] font-mono text-[#55696e]">
              {total} Ranked Opportunities
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-outfit font-extrabold tracking-tight text-[#1f2a2e] flex items-center gap-2.5">
            <span>Opportunity</span>
            <span className="text-[#0e6670]">Dossiers</span>
          </h1>

          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Multi-dimensional commercial scoring derived from recurring market complaints and competitive vacuums.
          </p>
        </div>

        {/* Global Batch Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleOpenBatchPrd(opportunities.map(o => o.id))}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#0e6670] hover:bg-[#0a4e56] text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Batch Build Plans (All {opportunities.length})</span>
            <ArrowUpRightIcon size={13} />
          </button>
        </div>
      </div>

      {/* MULTI-PROJECT SELECTION ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-[#072428] border border-[#178996]/50 rounded-[18px] p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#5cd6e5] text-[#072428] font-bold text-xs flex items-center justify-center font-mono">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-bold block text-white">
                {selectedIds.length} {selectedIds.length === 1 ? 'Project' : 'Projects'} Selected
              </span>
              <p className="text-[11px] text-white/70">
                Generate and export complete build plans, tech stacks, and task checklists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
            >
              <CloseIcon size={13} />
              <span>Deselect All</span>
            </button>

            <button
              onClick={() => handleOpenBatchPrd()}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-[#0e6670] hover:bg-[#f4f8f8] shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>View & Export Selected Plans ({selectedIds.length})</span>
              <ArrowUpRightIcon size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 rounded-[20px] border border-[#dbe7e7]">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3.5">
          <div className="relative flex-1">
            <SearchIcon size={16} className="absolute left-3.5 top-3.5 text-[#55696e]" />
            <input
              type="text"
              placeholder="Filter by keyword, industry, or problem domain (e.g. webhook, accounting, LLM)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8fafb] border border-[#dbe7e7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1f2a2e] placeholder-[#55696e] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0e6670]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="bg-[#f8fafb] border border-[#dbe7e7] rounded-xl px-3 py-2 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0e6670]"
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
              className="bg-[#f8fafb] border border-[#dbe7e7] rounded-xl px-3 py-2 text-xs text-[#1f2a2e] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0e6670]"
            >
              <option value="overall_score">Sort: Highest Index Rating</option>
              <option value="demand_score">Sort: Demand Volume</option>
              <option value="pain_intensity_score">Sort: Problem Severity</option>
              <option value="willingness_to_pay_score">Sort: Commercial Intent</option>
              <option value="created_at">Sort: Recent Ingestion</option>
            </select>

            <div className="flex items-center gap-1.5 bg-[#f8fafb] border border-[#dbe7e7] rounded-xl px-3 py-1.5 text-xs">
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
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                    minScore === val
                      ? 'bg-[#0e6670] text-white shadow-sm'
                      : 'text-[#55696e] hover:text-[#1f2a2e]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSelectAll}
              className="bg-[#f8fafb] border border-[#dbe7e7] hover:border-[#0e6670] rounded-xl px-3 py-2 text-xs font-mono font-medium text-[#1f2a2e] cursor-pointer"
            >
              {selectedIds.length === opportunities.length && opportunities.length > 0 ? 'Deselect All' : 'Select All'}
            </button>

            <Button variant="primary" size="sm" type="submit" showArrow={false} icon={<FilterIcon size={14} className="mr-1" />}>
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Opportunities Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-48" />
      ) : opportunities.length === 0 ? (
        <EmptyState
          title="No matching opportunities found"
          description="Try broadening your search criteria or clearing filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setCategory('All Categories');
            setMinScore(0);
            setSortBy('overall_score');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {opportunities.map((opp) => {
            const isSelected = selectedIds.includes(opp.id);
            return (
              <div 
                key={opp.id} 
                className={`bg-white border rounded-[20px] p-6 shadow-sm transition-all duration-200 flex flex-col justify-between group relative ${
                  isSelected ? 'border-[#0e6670] ring-2 ring-[#0e6670]/20' : 'border-[#dbe7e7] hover:border-[#0e6670] hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Bar with Category, Target & Checkbox */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Checkbox for batch selection */}
                      <button
                        type="button"
                        onClick={() => toggleSelect(opp.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#0e6670] border-[#0e6670] text-white' 
                            : 'bg-white border-[#c8d8d8] hover:border-[#0e6670]'
                        }`}
                        title={isSelected ? 'Deselect' : 'Select for batch export'}
                      >
                        {isSelected && <CheckIcon size={12} />}
                      </button>

                      <span className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold tracking-wide border border-[#dbe7e7]">
                        {opp.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#f8fafb] text-[#55696e] text-[11px] font-mono border border-[#dbe7e7]">
                        Target: {opp.target_audience}
                      </span>
                    </div>

                    <ScoreGauge score={opp.scores.overall_score} size="sm" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1f2a2e] group-hover:text-[#0e6670] transition-colors leading-snug">
                    {opp.title}
                  </h3>

                  <div className="mt-3 bg-[#f8fafb] rounded-[12px] p-3.5 border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] tracking-wider block mb-1">
                      Problem:
                    </span>
                    <p className="text-xs sm:text-sm text-[#3b4d52] line-clamp-3 leading-relaxed">
                      {opp.problem_thesis}
                    </p>
                  </div>
                </div>

                {/* Card Actions: Quotes count, 1-Click Build Plan, and View Details */}
                <div className="mt-5 pt-4 border-t border-[#dbe7e7] flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-semibold flex items-center gap-1.5">
                      <QuoteIcon size={12} className="text-[#0e6670]" />
                      <span>{opp.signal_count} Quotes</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenSinglePrd(opp.id)}
                      disabled={loadingPrdId === opp.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#eaf3f3] hover:bg-[#0e6670] text-[#0e6670] hover:text-white border border-[#dbe7e7] hover:border-[#0e6670] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <span>{loadingPrdId === opp.id ? 'Loading...' : 'Build Plan'}</span>
                      <ArrowUpRightIcon size={12} />
                    </button>

                    <Link to={`/app/opportunities/${opp.id}`}>
                      <Button variant="primary" size="sm" showArrow={true}>
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
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
              icon={<ChevronLeftIcon size={14} className="mr-1" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRightIcon size={14} className="mr-1" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Individual Project PRD Modal */}
      <PRDModal
        isOpen={isSinglePrdOpen}
        onClose={() => setIsSinglePrdOpen(false)}
        prd={singlePrd}
        loading={loadingPrdId !== null}
      />

      {/* Multi-Project Batch PRD Modal */}
      <BatchPRDModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        prds={batchPrds}
        combinedMarkdown={batchMarkdown}
        loading={loadingBatch}
      />
    </div>
  );
};
