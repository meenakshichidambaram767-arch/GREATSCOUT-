import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Compass, Layers, Lightbulb, TrendingUp, Database, Activity } from 'lucide-react';

export interface Waypoint {
  id: string;
  angle: number; // degrees
  label: string;
  category: string;
  path: string;
  count: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'dashboard',
    angle: 0,
    label: 'Dashboard Console',
    category: 'EXECUTIVE OVERVIEW',
    path: '/app',
    count: '13 RAW SOURCES',
    icon: Activity,
    description: 'Executive KPI metrics, category concentration, and high-urgency pain clusters.',
  },
  {
    id: 'opportunities',
    angle: 60,
    label: 'Opportunity Catalog',
    category: 'SYNTHESIS DOSSIERS',
    path: '/app/opportunities',
    count: '5 OPPORTUNITIES',
    icon: Lightbulb,
    description: '7-Pillar evaluated product opportunities ranked by demand, willingness-to-pay, and competitive vacuum.',
  },
  {
    id: 'signals',
    angle: 120,
    label: 'Signals & Evidence',
    category: 'PAIN EXTRACTION',
    path: '/app/signals',
    count: '17 SIGNALS',
    icon: Layers,
    description: 'Granular extracted user pain quotes with severity ratings, sentiment metrics, and competitor citations.',
  },
  {
    id: 'analytics',
    angle: 180,
    label: 'Market Trends',
    category: 'TELEMETRY & TIMELINES',
    path: '/app/analytics',
    count: '7 TAXONOMIES',
    icon: TrendingUp,
    description: 'Historical sentiment timelines and domain concentration across Product Hunt and Reddit.',
  },
  {
    id: 'jobs',
    angle: 240,
    label: 'Ingestion & Jobs',
    category: 'BACKGROUND WORKER',
    path: '/app/jobs',
    count: '100% TRACEABLE',
    icon: Database,
    description: 'Live background worker monitoring, Reddit & Product Hunt collector controls, and execution logs.',
  },
  {
    id: 'preprocessing',
    angle: 300,
    label: 'Phase 3 Validation',
    category: 'DATA INTEGRITY',
    path: '/app/jobs',
    count: '14 VERIFIED TESTS',
    icon: Compass,
    description: 'HTML/Markdown cleanup, Unicode NFKC, exact SHA-256 deduplication, and Jaccard shingling.',
  },
];

interface CnRCompassProps {
  onWaypointChange?: (wp: Waypoint) => void;
}

export const CnRCompass: React.FC<CnRCompassProps> = ({ onWaypointChange }) => {
  const navigate = useNavigate();
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint>(WAYPOINTS[0]);
  const [scrollY, setScrollY] = useState<number>(0);

  // Scroll listener for dynamic scroll-linked rotation
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectWaypoint = (wp: Waypoint) => {
    setActiveWaypoint(wp);
    if (onWaypointChange) onWaypointChange(wp);
  };

  // Scroll-linked rotational drift + waypoint targeting
  const scrollOffset = (scrollY * 0.12) % 360;
  const targetAngle = activeWaypoint.angle + scrollOffset;

  return (
    <div className="relative w-full max-w-[960px] mx-auto py-4 flex flex-col items-center">
      {/* Compass Circular Frame */}
      <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[580px] md:h-[580px] flex items-center justify-center select-none">
        {/* Background Dashed Guide SVG (matching C&R sc_line, compass_dash, and compass_line) */}
        <svg 
          viewBox="0 0 600 600" 
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Outermost Thin Coordinate Border */}
          <circle cx="300" cy="300" r="285" fill="none" stroke="#DDDDDD" strokeWidth="1" />
          
          {/* Degree Ticks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const x1 = 300 + 275 * Math.cos(rad);
            const y1 = 300 + 275 * Math.sin(rad);
            const x2 = 300 + 285 * Math.cos(rad);
            const y2 = 300 + 285 * Math.sin(rad);
            return (
              <line 
                key={deg} 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#AAAAAA" 
                strokeWidth={deg % 90 === 0 ? "2" : "1"} 
              />
            );
          })}

          {/* Secondary Dashed Celestial Ring (Rotating Counter-Clockwise) */}
          <circle 
            cx="300" 
            cy="300" 
            r="240" 
            fill="none" 
            stroke="#70a8af" 
            strokeWidth="1.2" 
            strokeDasharray="4 6" 
            className="animate-cir01 origin-center"
          />

          {/* Tertiary Rotating Dashed Orbit Ring (Rotating Clockwise) */}
          <circle 
            cx="300" 
            cy="300" 
            r="190" 
            fill="none" 
            stroke="#16717d" 
            strokeWidth="1.5" 
            strokeDasharray="3 5" 
            className="animate-cir02 origin-center"
          />

          {/* Cardinal Axis Crosshairs */}
          <line x1="300" y1="20" x2="300" y2="580" stroke="#DDDDDD" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20" y1="300" x2="580" y2="300" stroke="#DDDDDD" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Diagonal 45-deg Guidelines */}
          <line x1="100" y1="100" x2="500" y2="500" stroke="#E2ECEC" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="100" y1="500" x2="500" y2="100" stroke="#E2ECEC" strokeWidth="1" strokeDasharray="2 4" />

          {/* Inner Central Target Card */}
          <circle cx="300" cy="300" r="90" fill="#FFFFFF" stroke="#DDDDDD" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="40" fill="#F4F9F9" stroke="#16717d" strokeWidth="1.5" />
          <circle cx="300" cy="300" r="6" fill="#10b981" />
        </svg>

        {/* Dynamic Rotating Needle Assembly linked to Scroll + Active Waypoint */}
        <div 
          className="absolute w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out"
          style={{ transform: `rotate(${targetAngle}deg)` }}
        >
          {/* Needle North Point (C&R Teal Pointer with Emerald Accents) */}
          <div className="absolute top-[70px] sm:top-[90px] md:top-[110px] flex flex-col items-center">
            <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[44px] border-b-[#16717d] filter drop-shadow-[0_4px_8px_rgba(22,113,125,0.35)]" />
            <div className="w-[3px] h-[80px] sm:h-[110px] md:h-[135px] bg-[#16717d]" />
          </div>

          {/* Needle South Point (Subtle Dark Needle Tail) */}
          <div className="absolute bottom-[70px] sm:bottom-[90px] md:bottom-[110px] flex flex-col items-center">
            <div className="w-[2px] h-[80px] sm:h-[110px] md:h-[135px] bg-[#CCCCCC]" />
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[32px] border-t-[#777777]" />
          </div>

          {/* Central Pivot Hub */}
          <div className="w-12 h-12 rounded-full bg-white border border-[#16717d] shadow-md flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#10b981] animate-ping" />
          </div>
        </div>

        {/* Interactive Waypoint Nodes positioned along orbital radius */}
        {WAYPOINTS.map((wp) => {
          const rad = ((wp.angle - 90) * Math.PI) / 180;
          const x = 50 + 41 * Math.cos(rad);
          const y = 50 + 41 * Math.sin(rad);
          const isSelected = activeWaypoint.id === wp.id;
          const Icon = wp.icon;

          return (
            <button
              key={wp.id}
              onClick={() => {
                handleSelectWaypoint(wp);
                navigate(wp.path);
              }}
              onMouseEnter={() => handleSelectWaypoint(wp)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 ${
                isSelected ? 'scale-110 z-30' : 'hover:scale-105'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`Navigate to ${wp.label}`}
              aria-label={`Compass node: ${wp.label}`}
            >
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-outfit transition-all duration-200 border shadow-sm ${
                  isSelected 
                    ? 'bg-[#16717d] text-white border-[#16717d] shadow-[0_4px_16px_rgba(22,113,125,0.4)]'
                    : 'bg-white text-[#000000] border-[#DDDDDD] hover:border-[#16717d] hover:bg-[#F4F9F9]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#10b981]' : 'bg-[#16717d]'}`} />
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#16717d]'}`} />
                <span className="font-semibold whitespace-nowrap hidden sm:inline">{wp.label}</span>
                <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#16717d]'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Waypoint Intelligence Card (C&R #FFFFFF Card on #F4F9F9 canvas) */}
      <div className="w-full max-w-[720px] mt-6 bg-white border border-[#DDDDDD] rounded-[20px] p-6 sm:p-8 shadow-cnr-card transition-all duration-300 hover:shadow-cnr-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DDDDDD] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4F9F9] border border-[#16717d]/30 flex items-center justify-center text-[#16717d]">
              {React.createElement(activeWaypoint.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <span className="font-outfit text-xs font-semibold text-[#16717d] tracking-wider uppercase">
                {activeWaypoint.category} // WAYPOINT {activeWaypoint.angle}°
              </span>
              <h4 className="font-outfit text-[22px] font-bold text-[#000000]">
                {activeWaypoint.label}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#F4F9F9] border border-[#DDDDDD] rounded-full text-xs font-mono font-medium text-[#16717d]">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>{activeWaypoint.count}</span>
          </div>
        </div>

        <p className="font-outfit text-[16px] text-[#444444] leading-[1.6] py-5">
          {activeWaypoint.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="font-outfit text-xs text-[#888888]">
            Click node or action button to enter platform module
          </span>
          <button
            onClick={() => navigate(activeWaypoint.path)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#000000] hover:bg-[#16717d] text-white font-outfit text-sm font-medium transition-colors duration-200 shadow-sm"
          >
            <span>Open {activeWaypoint.label}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

