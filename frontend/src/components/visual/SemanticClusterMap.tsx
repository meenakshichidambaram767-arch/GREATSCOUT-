import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Activity
} from 'lucide-react';

import { Opportunity } from '../../types/api';

interface SemanticClusterMapProps {
  opportunities: Opportunity[];
  onSelectOpportunity?: (opp: Opportunity) => void;
  onOpenCopilot?: (query?: string) => void;
}

interface CelestialColor {
  fill: string;
  stroke: string;
  glow: string;
  gradientStart: string;
  gradientStop: string;
}

const CATEGORY_COSMIC_COLORS: Record<string, CelestialColor> = {
  'Developer Tools': { 
    fill: '#0ea5e9', 
    stroke: '#38bdf8', 
    glow: 'rgba(56, 189, 248, 0.45)', 
    gradientStart: '#38bdf8', 
    gradientStop: '#0284c7' 
  },
  'SaaS Operations': { 
    fill: '#8b5cf6', 
    stroke: '#a78bfa', 
    glow: 'rgba(167, 139, 250, 0.45)', 
    gradientStart: '#a78bfa', 
    gradientStop: '#6d28d9' 
  },
  'AI Automation': { 
    fill: '#06b6d4', 
    stroke: '#22d3ee', 
    glow: 'rgba(34, 211, 238, 0.45)', 
    gradientStart: '#22d3ee', 
    gradientStop: '#0891b2' 
  },
  'Remote Work': { 
    fill: '#10b981', 
    stroke: '#34d399', 
    glow: 'rgba(52, 211, 153, 0.45)', 
    gradientStart: '#34d399', 
    gradientStop: '#059669' 
  },
  'E-Commerce': { 
    fill: '#f59e0b', 
    stroke: '#fbbf24', 
    glow: 'rgba(251, 191, 36, 0.45)', 
    gradientStart: '#fbbf24', 
    gradientStop: '#d97706' 
  },
  'General SaaS': { 
    fill: '#14b8a6', 
    stroke: '#2dd4bf', 
    glow: 'rgba(45, 212, 191, 0.45)', 
    gradientStart: '#2dd4bf', 
    gradientStop: '#0f766e' 
  },
};

export const SemanticClusterMap: React.FC<SemanticClusterMapProps> = ({
  opportunities,
  onSelectOpportunity,
  onOpenCopilot
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null);
  const [showConstellations, setShowConstellations] = useState(true);
  const [minScoreFilter, setMinScoreFilter] = useState(0);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(opportunities.map((o) => o.category)))];
  }, [opportunities]);

  // Filtered opportunities
  const filteredOpps = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchCat = selectedCategory === 'all' || opp.category === selectedCategory;
      const matchScore = opp.scores.overall_score >= minScoreFilter;
      const matchSearch = !searchQuery.trim() || 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchScore && matchSearch;
    });
  }, [opportunities, selectedCategory, minScoreFilter, searchQuery]);

  // Find the top scored opportunity for glowing pulse
  const topScorer = useMemo(() => {
    if (opportunities.length === 0) return null;
    return [...opportunities].sort((a, b) => b.scores.overall_score - a.scores.overall_score)[0];
  }, [opportunities]);

  // Constellation links between opportunities in the same category
  const constellationLinks = useMemo(() => {
    if (!showConstellations) return [];
    const links: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; id: string }> = [];
    
    // Group by category
    const byCategory: Record<string, Opportunity[]> = {};
    filteredOpps.forEach((o) => {
      if (!byCategory[o.category]) byCategory[o.category] = [];
      byCategory[o.category].push(o);
    });

    Object.entries(byCategory).forEach(([cat, opps]) => {
      const col = CATEGORY_COSMIC_COLORS[cat] || CATEGORY_COSMIC_COLORS['General SaaS'];
      for (let i = 0; i < opps.length - 1; i++) {
        const p1 = opps[i];
        const p2 = opps[i + 1];
        const x1 = 10 + ((p1.scores.pain_intensity_score || 50) / 100) * 80;
        const y1 = 90 - ((p1.scores.demand_score || 50) / 100) * 80;
        const x2 = 10 + ((p2.scores.pain_intensity_score || 50) / 100) * 80;
        const y2 = 90 - ((p2.scores.demand_score || 50) / 100) * 80;

        links.push({
          x1,
          y1,
          x2,
          y2,
          color: col.stroke,
          id: `${p1.id}-${p2.id}`
        });
      }
    });

    return links;
  }, [filteredOpps, showConstellations]);

  return (
    <div className="bg-[#091519] rounded-[28px] border border-[#1b343b] p-6 shadow-2xl space-y-4 relative overflow-hidden text-white font-outfit select-none">
      {/* Background Starlight & Ambient Cosmic Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0e6670]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#4f46e5]/15 rounded-full blur-[100px]" />
        {/* Subtle grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
      </div>

      {/* Header & Cosmic Controls */}
      <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#0c242c] px-3 py-1 rounded-full border border-[#1b4350] flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-[#38bdf8] animate-spin" style={{ animationDuration: '20s' }} />
              Visual Idea Map
            </span>
            <span className="text-xs text-[#8da3a8] hidden sm:inline">
              Ideas placed by user frustration (left to right) vs demand (bottom to top)
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2.5">
            <span>Where the Best Business Ideas Live</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#112930] text-[#38bdf8] border border-[#1e4856]">
              {filteredOpps.length} Ideas Shown
            </span>
          </h3>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#55696e]" />
            <input
              type="text"
              placeholder="Search ideas by name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-full border border-[#1e3c45] bg-[#0d2127] text-white placeholder-[#55696e] focus:outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Toggle Constellations */}
          <button
            onClick={() => setShowConstellations(!showConstellations)}
            className={`text-xs px-3 py-2 rounded-full border font-mono transition-all flex items-center gap-1.5 ${
              showConstellations
                ? 'bg-[#0e3b47] border-[#38bdf8]/50 text-[#38bdf8]'
                : 'bg-[#0d2127] border-[#1e3c45] text-[#8da3a8]'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Connect Ideas</span>
          </button>

          {/* Min Score filter */}
          <div className="flex items-center gap-1.5 bg-[#0d2127] px-3 py-1.5 rounded-full border border-[#1e3c45] text-xs font-mono text-[#8da3a8]">
            <span>Min Score:</span>
            {[0, 75, 80].map((sc) => (
              <button
                key={sc}
                onClick={() => setMinScoreFilter(sc)}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  minScoreFilter === sc
                    ? 'bg-[#38bdf8] text-[#091519]'
                    : 'text-[#8da3a8] hover:text-white'
                }`}
              >
                {sc === 0 ? 'All' : `${sc}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="relative z-20 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === cat
                ? 'bg-[#38bdf8] text-[#091519] font-bold shadow-lg shadow-[#38bdf8]/20'
                : 'bg-[#0d2127] text-[#8da3a8] hover:text-white border border-[#1e3c45]'
            }`}
          >
            {cat !== 'all' && (
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COSMIC_COLORS[cat]?.fill || '#38bdf8' }}
              />
            )}
            <span>{cat === 'all' ? 'All Categories' : cat}</span>
          </button>
        ))}
      </div>

      {/* Main Galaxy Interactive Canvas */}
      <div className="relative z-20 w-full h-[520px] bg-[#071114] rounded-[22px] border border-[#173038] overflow-hidden">
        {/* Quadrant Nebulae Background Overlays */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          {/* Top Left: Feature Horizon */}
          <div className="border-r border-b border-dashed border-[#1a3842]/60 p-4 bg-gradient-to-br from-[#06b6d4]/[0.04] to-transparent flex flex-col justify-start items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#38bdf8]/70 bg-[#0d2830] px-2.5 py-1 rounded-full border border-[#1b4350]">
              ✨ Popular Requests (Lots of people want this, but less urgent)
            </span>
          </div>

          {/* Top Right: Goldmine Nebula (Golden Aurora) */}
          <div className="border-b border-dashed border-[#1a3842]/60 p-4 bg-gradient-to-bl from-[#10b981]/[0.08] via-[#0e6670]/[0.06] to-transparent flex flex-col justify-start items-end">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#34d399] bg-[#06322b] px-3 py-1 rounded-full border border-[#10b981]/40 shadow-lg shadow-[#10b981]/15 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#34d399] animate-pulse" />
              <span>🏆 The Sweet Spot! (High Demand + High Frustration — Build First)</span>
            </span>
          </div>

          {/* Bottom Left: Emerging Frontier */}
          <div className="border-r border-dashed border-[#1a3842]/60 p-4 bg-gradient-to-tr from-[#0e6670]/[0.03] to-transparent flex flex-col justify-end items-start">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#64748b]">
              🌱 Early Signals (Just starting to pop up in online posts)
            </span>
          </div>

          {/* Bottom Right: Acute Crucible */}
          <div className="p-4 bg-gradient-to-tl from-[#f43f5e]/[0.04] to-transparent flex flex-col justify-end items-end">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#f43f5e]/80 bg-[#271015] px-2.5 py-1 rounded-full border border-[#f43f5e]/20">
              🔥 Deep Niche Pains (Super frustrating, but for a specialized group)
            </span>
          </div>
        </div>

        {/* Orbit Grid Circles & Crosshairs */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[360px] h-[360px] rounded-full border border-dashed border-[#1b3a45]/30 animate-spin" style={{ animationDuration: '60s' }} />
          <div className="w-[200px] h-[200px] rounded-full border border-dashed border-[#1b3a45]/20 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
        </div>

        {/* Axis Navigation Legend */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-2 bg-[#09181d]/90 px-3.5 py-1 rounded-full border border-[#1a3a44] text-[10px] font-mono text-[#8da3a8] shadow-lg">
          <span>How Frustrated People Are ➔</span>
        </div>
        <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 origin-left z-10 pointer-events-none flex items-center gap-2 bg-[#09181d]/90 px-3 py-1 rounded-full border border-[#1a3a44] text-[10px] font-mono text-[#8da3a8] shadow-lg">
          <span>How Many People Want It ➔</span>
        </div>

        {/* SVG Planetary System & Constellations */}
        <svg className="w-full h-full relative z-20 overflow-visible">
          <defs>
            {/* Filter glow effect */}
            <filter id="cosmicGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients per category */}
            {Object.entries(CATEGORY_COSMIC_COLORS).map(([cat, col]) => (
              <radialGradient id={`planetGrad-${cat.replace(/\s+/g, '')}`} cx="35%" cy="35%" r="65%" key={cat}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="25%" stopColor={col.gradientStart} />
                <stop offset="85%" stopColor={col.gradientStop} />
                <stop offset="100%" stopColor="#031116" />
              </radialGradient>
            ))}
          </defs>

          {/* Constellation Curved Lines */}
          {constellationLinks.map((link) => (
            <line
              key={link.id}
              x1={`${link.x1}%`}
              y1={`${link.y1}%`}
              x2={`${link.x2}%`}
              y2={`${link.y2}%`}
              stroke={link.color}
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.35"
            />
          ))}

          {/* Planetary Opportunity Nodes */}
          {filteredOpps.map((opp) => {
            const pain = opp.scores.pain_intensity_score || 50;
            const demand = opp.scores.demand_score || 50;
            const cxPct = 10 + (pain / 100) * 80;
            const cyPct = 90 - (demand / 100) * 80;

            const radius = Math.max(16, Math.min(30, opp.scores.overall_score * 0.32));
            const col = CATEGORY_COSMIC_COLORS[opp.category] || CATEGORY_COSMIC_COLORS['General SaaS'];
            const isTop = topScorer?.id === opp.id;
            const isSelected = activeOpp?.id === opp.id;

            return (
              <g
                key={opp.id}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => {
                  setActiveOpp(opp);
                  onSelectOpportunity?.(opp);
                }}
                onMouseEnter={() => setActiveOpp(opp)}
              >
                {/* Outermost Radar Pulse Beacon for #1 Top Scorer */}
                {isTop && (
                  <>
                    <circle
                      cx={`${cxPct}%`}
                      cy={`${cyPct}%`}
                      r={radius + 18}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      opacity="0.4"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                    <circle
                      cx={`${cxPct}%`}
                      cy={`${cyPct}%`}
                      r={radius + 10}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '16s' }}
                    />
                  </>
                )}

                {/* Outer Corona Glow */}
                <circle
                  cx={`${cxPct}%`}
                  cy={`${cyPct}%`}
                  r={radius + 5}
                  fill="none"
                  stroke={col.stroke}
                  strokeWidth="2"
                  opacity={isSelected ? '0.9' : '0.4'}
                  filter="url(#cosmicGlow)"
                />

                {/* Core Planetary Sphere */}
                <circle
                  cx={`${cxPct}%`}
                  cy={`${cyPct}%`}
                  r={radius}
                  fill={`url(#planetGrad-${opp.category.replace(/\s+/g, '')})`}
                  stroke={isSelected ? '#ffffff' : col.stroke}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="filter drop-shadow-2xl hover:scale-110 transition-transform"
                />

                {/* Orbiting Satellite Moon (Representing Quotes Count) */}
                <circle
                  cx={`${cxPct + radius * 0.9}%`}
                  cy={`${cyPct - radius * 0.9}%`}
                  r="3.5"
                  fill="#ffffff"
                  stroke={col.stroke}
                  strokeWidth="1"
                  className="animate-pulse"
                />

                {/* Center Commercial Score Text */}
                <text
                  x={`${cxPct}%`}
                  y={`${cyPct}%`}
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  pointerEvents="none"
                  className="filter drop-shadow-md"
                >
                  {Math.round(opp.scores.overall_score)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected / Hovered Opportunity Glass HUD Drawer */}
        {activeOpp && (
          <div className="absolute bottom-4 right-4 z-30 w-80 sm:w-96 p-4 rounded-2xl bg-[#091a20]/95 backdrop-blur-md border border-[#204955] shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38bdf8] bg-[#0c2c36] px-2.5 py-0.5 rounded-full border border-[#1c4856]">
                {activeOpp.category}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-[#34d399] bg-[#06352c] px-2 py-0.5 rounded-full border border-[#10b981]/30">
                  ★ Score {activeOpp.scores.overall_score.toFixed(1)}
                </span>
                <button
                  onClick={() => setActiveOpp(null)}
                  className="text-xs text-[#8da3a8] hover:text-white px-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                {activeOpp.title}
              </h4>
              <p className="text-[11px] text-[#cbd5e1] mt-1.5 italic line-clamp-2 bg-[#061418] p-2.5 rounded-xl border border-[#15343d]">
                "{activeOpp.problem_thesis}"
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#cbd5e1]">
              <div className="bg-[#0c252d] p-2 rounded-xl border border-[#19404d] flex items-center justify-between">
                <span>Popularity:</span>
                <b className="text-[#38bdf8]">{activeOpp.scores.demand_score}%</b>
              </div>
              <div className="bg-[#0c252d] p-2 rounded-xl border border-[#19404d] flex items-center justify-between">
                <span>Frustration:</span>
                <b className="text-rose-400">{activeOpp.scores.pain_intensity_score}%</b>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/app/opportunities/${activeOpp.id}`}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 px-3 rounded-xl bg-[#38bdf8] text-[#091519] hover:bg-[#7dd3fc] transition-colors shadow-sm"
              >
                <span>See Quotes & Plan</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {onOpenCopilot && (
                <button
                  onClick={() => onOpenCopilot(`What are people complaining about regarding "${activeOpp.title}" and how can we build a solution?`)}
                  className="flex items-center gap-1 text-xs font-mono font-bold py-2 px-3 rounded-xl bg-[#0c2c36] text-[#38bdf8] border border-[#1f4e5c] hover:bg-[#123b47] transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                  <span>Ask AI Helper</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8da3a8] pt-1 border-t border-[#162d34]">
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(CATEGORY_COSMIC_COLORS).map(([cat, col]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.fill }} />
              <span className="text-[#cbd5e1]">{cat}</span>
            </div>
          ))}
        </div>
        <span className="text-[11px] font-mono text-[#8da3a8]">
          Bigger circles = higher rated ideas • White orbiting dots = real user quotes collected online
        </span>
      </div>
    </div>
  );
};
