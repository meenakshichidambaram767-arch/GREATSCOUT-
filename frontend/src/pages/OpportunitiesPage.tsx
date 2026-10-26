import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Filter,
  LayoutGrid,
  Columns,
  Compass
} from 'lucide-react';

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
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon
} from '../components/common/Icons';
import { SemanticClusterMap } from '../components/visual/SemanticClusterMap';
import { OpportunityKanbanBoard } from '../components/visual/OpportunityKanbanBoard';

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
  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'galaxy'>('grid');

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
        page: viewMode === 'kanban' ? 1 : page,
        page_size: viewMode === 'kanban' ? 50 : 8,
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
  }, [page, category, sortBy, minScore, viewMode]);

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
    <div className="space-y-7 font-outfit max-w-[1400px] w-full mx-auto">
      {/* Page Header with Friendly Eyebrow, Title, Batch Button, and Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7] inline-block mb-1.5">
            Proven Business Opportunities
          </span>
          <h1 className="text-3xl sm:text-4xl font-outfit font-bold tracking-tight text-[#1f2a2e] flex flex-wrap items-center gap-3">
            <span>Business Ideas</span>
            <span className="text-[#0e6670]">Catalog</span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-mono font-semibold">
              {total} Ideas Found
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#55696e] mt-1.5 max-w-3xl leading-relaxed">
            Every idea below comes from real complaints posted by everyday users on Reddit and Product Hunt. Click any idea to see the exact comments and a ready-to-build solution plan.
          </p>
        </div>

        {/* Global Batch Action Button & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            onClick={() => handleOpenBatchPrd(opportunities.map(o => o.id))}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#0e6670] hover:bg-[#0a4e56] text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Batch Build Plans ({opportunities.length})</span>
            <ArrowUpRightIcon size={13} />
          </button>

          {/* View Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-[#dbe7e7] shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0e6670] text-white shadow-sm'
                  : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#f4f8f8]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card List</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#0e6670] text-white shadow-sm'
                  : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#f4f8f8]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Progress Board</span>
            </button>

            <button
              onClick={() => setViewMode('galaxy')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'galaxy'
                  ? 'bg-[#0e6670] text-white shadow-sm'
                  : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#f4f8f8]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Visual Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Project Selection Action Bar (Grid Mode Only) */}
      {viewMode === 'grid' && selectedIds.length > 0 && (
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

      {/* Multi-View Renderer */}
      {viewMode === 'kanban' ? (
        <OpportunityKanbanBoard
          opportunities={opportunities}
          onOpportunityUpdated={fetchOpportunities}
        />
      ) : viewMode === 'galaxy' ? (
        <SemanticClusterMap
          opportunities={opportunities}
          onSelectOpportunity={(opp) => {
            window.location.href = `/app/opportunities/${opp.id}`;
          }}
        />
      ) : (
        <>
          {/* Helpful Explainer Banner */}
          <div className="bg-[#f4f8f8] border border-[#dbe7e7] rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#55696e]">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💡</span>
              <div>
                <strong className="text-[#1f2a2e] block sm:inline">How do idea scores work? </strong>
                <span>
                  Scores out of 100 show how many people want this and how badly they need a solution. Anything scored 70 or higher is a high-demand business idea!
                </span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <Card className="p-4 sm:p-5 rounded-[22px] border border-[#dbe7e7]">
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#55696e]" />
                <input
                  type="text"
                  placeholder="Search by keyword, topic, or who it's for (e.g., Shopify, accounting, dev)..."
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
                  <option value="overall_score">Highest Rated Ideas</option>
                  <option value="demand_score">Most Talked About</option>
                  <option value="pain_intensity_score">Most Frustrated Users</option>
                  <option value="willingness_to_pay_score">People Most Ready to Pay</option>
                  <option value="created_at">Newest Found</option>
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

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="bg-[#f4f8f8] border border-[#dbe7e7] hover:border-[#0e6670] rounded-full px-3.5 py-2 text-xs font-mono font-medium text-[#1f2a2e] cursor-pointer"
                >
                  {selectedIds.length === opportunities.length && opportunities.length > 0 ? 'Deselect All' : 'Select All'}
                </button>

                <Button variant="primary" size="sm" type="submit" showArrow={false} icon={<Filter className="w-3.5 h-3.5 mr-1" />}>
                  Filter
                </Button>
              </div>
            </form>
          </Card>

          {/* Opportunities Cards Grid */}
          {loading ? (
            <LoadingSkeleton count={4} height="h-48" />
          ) : opportunities.length === 0 ? (
            <EmptyState
              title="No matching ideas found"
              description="Try typing a different keyword or reset your filters."
              actionLabel="Reset Search & Filters"
              onAction={() => {
                setSearch('');
                setCategory('All Categories');
                setMinScore(0);
                setSortBy('overall_score');
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {opportunities.map((opp) => {
                  const isSelected = selectedIds.includes(opp.id);

                  return (
                    <div 
                      key={opp.id} 
                      className={`bg-white border rounded-[22px] p-6 shadow-sm transition-all duration-200 flex flex-col justify-between group relative ${
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
                            <span className="px-2.5 py-0.5 rounded-full bg-[#f4f8f8] text-[#55696e] text-[11px] font-mono border border-[#dbe7e7]">
                              Who needs this: {opp.target_audience}
                            </span>
                          </div>

                          <ScoreGauge score={opp.scores.overall_score} size="sm" />
                        </div>

                        <h3 className="text-lg font-bold text-[#1f2a2e] group-hover:text-[#0e6670] transition-colors leading-snug">
                          {opp.title}
                        </h3>

                        <div className="mt-3 bg-[#f8fafb] rounded-[14px] p-3.5 border border-[#eaf0f0]">
                          <span className="text-[11px] font-mono uppercase font-bold text-[#55696e] tracking-wider block mb-1">
                            The Problem:
                          </span>
                          <p className="text-xs sm:text-sm text-[#3b4d52] line-clamp-3 leading-relaxed">
                            {opp.problem_thesis}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom: Quotes, Build Plan button, and View Details */}
                      <div className="mt-5 pt-4 border-t border-[#dbe7e7] flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-semibold flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#0e6670]" />
                            {opp.signal_count} Real Quotes
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
                              View Quotes & Plan
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

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
            </>
          )}
        </>
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
