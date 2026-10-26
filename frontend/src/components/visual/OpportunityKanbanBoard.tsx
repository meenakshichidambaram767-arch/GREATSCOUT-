import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  FlaskConical, 
  MessageSquare, 
  Hammer, 
  Rocket, 
  ChevronRight,
  GripVertical,
  Layers,
  Search,
  TrendingUp,
  ShieldAlert,
  Flame
} from 'lucide-react';

import { Opportunity, PipelineStage } from '../../types/api';
import { opportunitiesService } from '../../services/opportunitiesService';

interface OpportunityKanbanBoardProps {
  opportunities: Opportunity[];
  onOpportunityUpdated?: () => void;
}

interface ColumnDef {
  key: PipelineStage;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  badgeBg: string;
  borderActive: string;
}

const STAGES: ColumnDef[] = [
  {
    key: 'discovered',
    title: '1. Fresh Ideas',
    shortTitle: 'Fresh Ideas',
    desc: 'New problems found in online posts',
    icon: <Sparkles className="w-4 h-4 text-[#0e6670]" />,
    color: '#0e6670',
    badgeBg: 'bg-[#eaf3f3] text-[#0e6670] border-[#dbe7e7]',
    borderActive: 'border-[#0e6670] bg-[#0e6670]/[0.02]'
  },
  {
    key: 'validating',
    title: '2. Checking Demand',
    shortTitle: 'Checking Demand',
    desc: 'Making sure people actually want & will pay for this',
    icon: <FlaskConical className="w-4 h-4 text-[#4f46e5]" />,
    color: '#4f46e5',
    badgeBg: 'bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe]',
    borderActive: 'border-[#4f46e5] bg-[#4f46e5]/[0.02]'
  },
  {
    key: 'interviewing',
    title: '3. Talking to Users',
    shortTitle: 'User Chats',
    desc: 'Chatting directly with the people who complained',
    icon: <MessageSquare className="w-4 h-4 text-[#d97706]" />,
    color: '#d97706',
    badgeBg: 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]',
    borderActive: 'border-[#d97706] bg-[#d97706]/[0.02]'
  },
  {
    key: 'building',
    title: '4. Building Prototype',
    shortTitle: 'Building',
    desc: 'Creating a quick first version to fix the problem',
    icon: <Hammer className="w-4 h-4 text-[#0891b2]" />,
    color: '#0891b2',
    badgeBg: 'bg-[#ecfeff] text-[#0891b2] border-[#a5f3fc]',
    borderActive: 'border-[#0891b2] bg-[#0891b2]/[0.02]'
  },
  {
    key: 'launched',
    title: '5. Launched & Live',
    shortTitle: 'Launched',
    desc: 'Real product out in the world getting users',
    icon: <Rocket className="w-4 h-4 text-[#059669]" />,
    color: '#059669',
    badgeBg: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
    borderActive: 'border-[#059669] bg-[#059669]/[0.02]'
  }
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Developer Tools': { bg: 'bg-[#eaf3f3]', text: 'text-[#0e6670]', dot: 'bg-[#0e6670]' },
  'SaaS Operations': { bg: 'bg-[#eef2ff]', text: 'text-[#4f46e5]', dot: 'bg-[#4f46e5]' },
  'AI Automation': { bg: 'bg-[#ecfeff]', text: 'text-[#0891b2]', dot: 'bg-[#0891b2]' },
  'Remote Work': { bg: 'bg-[#ecfdf5]', text: 'text-[#059669]', dot: 'bg-[#059669]' },
  'E-Commerce': { bg: 'bg-[#fffbeb]', text: 'text-[#d97706]', dot: 'bg-[#d97706]' },
  'General SaaS': { bg: 'bg-[#f4f8f8]', text: 'text-[#2e4045]', dot: 'bg-[#0e6670]' },
};

export const OpportunityKanbanBoard: React.FC<OpportunityKanbanBoardProps> = ({
  opportunities,
  onOpportunityUpdated
}) => {
  const [localOpps, setLocalOpps] = useState<Opportunity[]>(opportunities);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<PipelineStage | null>(null);

  // Sync with props
  React.useEffect(() => {
    setLocalOpps(opportunities);
  }, [opportunities]);

  const stageKeys = STAGES.map((s) => s.key);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(opportunities.map((o) => o.category)))];
  }, [opportunities]);

  const filteredOpps = useMemo(() => {
    return localOpps.filter((opp) => {
      const matchCat = selectedCategory === 'all' || opp.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.problem_thesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.target_audience.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [localOpps, selectedCategory, searchQuery]);

  // Stage change logic
  const handleStageChange = async (oppId: string, newStage: PipelineStage) => {
    const opp = localOpps.find((o) => o.id === oppId);
    if (!opp || opp.status === newStage) return;

    // Optimistic UI update
    setLocalOpps((prev) =>
      prev.map((o) => (o.id === oppId ? ({ ...o, status: newStage } as Opportunity) : o))
    );
    setUpdatingId(oppId);

    try {
      await opportunitiesService.updateOpportunityStatus(oppId, newStage);
      onOpportunityUpdated?.();
    } catch (err) {
      console.error('Failed to update stage:', err);
      // Revert on error
      setLocalOpps(opportunities);
    } finally {
      setUpdatingId(null);
    }
  };

  const moveStageStep = (oppId: string, currentStage: string, direction: 'prev' | 'next') => {
    const currentIndex = stageKeys.indexOf(currentStage as PipelineStage);
    const validCurrent = currentIndex >= 0 ? currentIndex : 0;
    const targetIndex = direction === 'next' ? validCurrent + 1 : validCurrent - 1;

    if (targetIndex >= 0 && targetIndex < stageKeys.length) {
      handleStageChange(oppId, stageKeys[targetIndex]);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggedId(oppId);
    e.dataTransfer.setData('text/plain', oppId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colKey: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colKey) {
      setDragOverCol(colKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colKey: PipelineStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const oppId = e.dataTransfer.getData('text/plain') || draggedId;
    if (oppId) {
      handleStageChange(oppId, colKey);
    }
    setDraggedId(null);
  };

  return (
    <div className="space-y-5 select-none font-outfit">
      {/* Top Controls & Pipeline Metrics Banner */}
      <div className="bg-white rounded-[24px] border border-[#dbe7e7] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7]">
                How Ideas Progress
              </span>
              <span className="text-xs text-[#55696e] hidden sm:inline">
                Drag cards or click arrows to move ideas as you test and build them
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1f2a2e] mt-1 flex items-center gap-2">
              <span>Track Ideas From Discovery to Launch</span>
              <span className="text-xs font-mono font-bold text-[#0e6670] bg-[#eaf3f3] px-2.5 py-0.5 rounded-full border border-[#dbe7e7]">
                {filteredOpps.length} Ideas
              </span>
            </h3>
          </div>

          {/* Quick Search & Category Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#55696e]" />
              <input
                type="text"
                placeholder="Search ideas by name or problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-full border border-[#dbe7e7] bg-[#f8fafb] focus:outline-none focus:border-[#0e6670] focus:bg-white text-[#1f2a2e]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0e6670] text-white shadow-sm font-semibold'
                      : 'bg-[#f4f8f8] text-[#55696e] hover:text-[#1f2a2e] border border-[#dbe7e7]'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stage Progress Distribution Ribbon */}
        <div className="pt-2 border-t border-[#dbe7e7]/70">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#55696e] mb-1.5">
            <span className="font-semibold text-[#1f2a2e]">Idea Progress Stages</span>
            <span>
              {localOpps.filter(o => String(o.status) !== 'discovered' && String(o.status) !== 'launched').length} Currently Being Tested or Built
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-[#f0f4f4] overflow-hidden flex shadow-inner">
            {STAGES.map((col) => {
              const count = localOpps.filter((o) => {
                const norm = String(o.status).toLowerCase();
                if (col.key === 'discovered') return norm === 'discovered' || norm === 'active' || !stageKeys.includes(norm as PipelineStage);
                return norm === col.key;
              }).length;
              const pct = localOpps.length > 0 ? (count / localOpps.length) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={col.key}
                  style={{ width: `${pct}%`, backgroundColor: col.color }}
                  className="h-full transition-all duration-300"
                  title={`${col.shortTitle}: ${count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((col, colIdx) => {
          const colOpps = filteredOpps.filter((o) => {
            const norm = String(o.status).toLowerCase();
            if (col.key === 'discovered') {
              return norm === 'discovered' || norm === 'active' || !stageKeys.includes(norm as PipelineStage);
            }
            return norm === col.key;
          });

          const avgScore = colOpps.length > 0
            ? (colOpps.reduce((acc, curr) => acc + curr.scores.overall_score, 0) / colOpps.length).toFixed(1)
            : '0.0';

          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex flex-col rounded-[22px] bg-[#f8fafb] border transition-all duration-200 min-w-[260px] max-w-full flex-1 p-3.5 ${
                isOver 
                  ? 'border-[#0e6670] bg-[#eaf3f3]/60 shadow-lg scale-[1.01]' 
                  : 'border-[#dbe7e7]'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 rounded-[16px] bg-white border border-[#dbe7e7] shadow-sm mb-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1f2a2e]">
                    <span className="p-1 rounded-lg bg-[#f4f8f8] border border-[#dbe7e7]/70">
                      {col.icon}
                    </span>
                    <span>{col.shortTitle}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}>
                    {colOpps.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#55696e] pt-1 border-t border-[#f0f4f4]">
                  <span className="truncate pr-1">{col.desc}</span>
                  {colOpps.length > 0 && (
                    <span className="font-mono text-[#0e6670] font-bold shrink-0">
                      Avg {avgScore}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards List Drop Zone */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {colOpps.map((opp) => {
                  const catStyle = CATEGORY_STYLES[opp.category] || CATEGORY_STYLES['General SaaS'];
                  const isTopScore = opp.scores.overall_score >= 80;
                  const isUpdating = updatingId === opp.id;

                  return (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp.id)}
                      className={`p-4 rounded-[18px] bg-white border border-[#dbe7e7] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#0e6670]/60 transition-all duration-200 flex flex-col justify-between group cursor-grab active:cursor-grabbing relative overflow-hidden ${
                        isUpdating ? 'opacity-50 pointer-events-none' : ''
                      } ${draggedId === opp.id ? 'opacity-40 scale-95' : ''}`}
                    >
                      {/* Left Category Accent Strip */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: col.color }}
                      />

                      <div className="space-y-2.5">
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <GripVertical className="w-3.5 h-3.5 text-[#8da3a8] opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full truncate flex items-center gap-1 ${catStyle.bg} ${catStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                              <span className="truncate">{opp.category}</span>
                            </span>
                          </div>

                          {/* Commercial Score Pill */}
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            isTopScore 
                              ? 'bg-[#eaf3f3] text-[#0e6670] border border-[#0e6670]/30 shadow-xs' 
                              : 'bg-[#f4f8f8] text-[#1f2a2e] border border-[#dbe7e7]'
                          }`}>
                            {isTopScore && <Flame className="w-3 h-3 text-[#0e6670]" />}
                            {opp.scores.overall_score.toFixed(1)}
                          </span>
                        </div>

                        {/* Title */}
                        <Link
                          to={`/app/opportunities/${opp.id}`}
                          className="text-xs font-bold text-[#1f2a2e] group-hover:text-[#0e6670] line-clamp-2 leading-snug transition-colors block"
                        >
                          {opp.title}
                        </Link>

                        {/* Problem Thesis Snippet */}
                        <p className="text-[11px] text-[#55696e] line-clamp-2 italic leading-relaxed bg-[#f8fafb] p-2 rounded-xl border border-[#f0f4f4]">
                          "{opp.problem_thesis}"
                        </p>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-[#55696e]">
                          <div className="flex items-center gap-1 bg-[#f8fafb] px-2 py-1 rounded-lg border border-[#f0f4f4]">
                            <TrendingUp className="w-3 h-3 text-[#0e6670]" />
                            <span>Popularity: <b>{opp.scores.demand_score}%</b></span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#f8fafb] px-2 py-1 rounded-lg border border-[#f0f4f4]">
                            <ShieldAlert className="w-3 h-3 text-rose-500" />
                            <span>Frustration: <b>{opp.scores.pain_intensity_score}%</b></span>
                          </div>
                        </div>

                        {/* Quotes Count & Target Audience */}
                        <div className="flex items-center justify-between text-[10px] text-[#55696e] pt-1">
                          <span className="font-mono text-[#0e6670] font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#0e6670]" />
                            {opp.signal_count} Real User Quotes
                          </span>
                          <span className="truncate max-w-[110px] text-[#8da3a8]">
                            {opp.target_audience}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom: Move Controls & Deep Dive link */}
                      <div className="mt-3.5 pt-2.5 border-t border-[#dbe7e7]/70 flex items-center justify-between">
                        {/* Prev Stage Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStageStep(opp.id, col.key, 'prev');
                          }}
                          disabled={colIdx === 0}
                          title={colIdx === 0 ? 'First stage' : `Move back to ${STAGES[colIdx - 1]?.shortTitle}`}
                          className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg bg-[#f4f8f8] border border-[#dbe7e7] text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3] disabled:opacity-25 disabled:pointer-events-none transition-all"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span className="hidden sm:inline">◀ Prev Step</span>
                        </button>

                        {/* Direct PRD link */}
                        <Link
                          to={`/app/opportunities/${opp.id}`}
                          className="text-[10px] font-mono font-bold text-[#0e6670] hover:underline flex items-center gap-0.5"
                        >
                          <span>View Plan</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>

                        {/* Next Stage Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStageStep(opp.id, col.key, 'next');
                          }}
                          disabled={colIdx === STAGES.length - 1}
                          title={colIdx === STAGES.length - 1 ? 'Final stage' : `Advance to ${STAGES[colIdx + 1]?.shortTitle}`}
                          className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#0e6670] text-white hover:bg-[#0c5760] disabled:opacity-25 disabled:pointer-events-none transition-all shadow-xs"
                        >
                          <span className="hidden sm:inline">Next Step ▶</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State in Column */}
                {colOpps.length === 0 && (
                  <div className={`h-36 border border-dashed rounded-[18px] flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isOver ? 'border-[#0e6670] bg-[#eaf3f3]' : 'border-[#dbe7e7] text-[#8da3a8]'
                  }`}>
                    <span className="text-xs font-semibold text-[#55696e]">
                      {isOver ? 'Drop idea here' : 'No ideas in this stage yet'}
                    </span>
                    <span className="text-[10px] text-[#8da3a8] mt-1">
                      {isOver ? 'Release mouse to move here' : 'Drag cards or click Next Step'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
