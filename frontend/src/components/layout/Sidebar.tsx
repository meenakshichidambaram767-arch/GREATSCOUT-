import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Radar, 
  Lightbulb, 
  Activity, 
  Layers, 
  TrendingUp, 
  Database,
  Cpu,
  Globe
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app', icon: Activity },
  { name: 'Opportunities', path: '/app/opportunities', icon: Lightbulb },
  { name: 'Signals & Evidence', path: '/app/signals', icon: Layers },
  { name: 'Market Trends', path: '/app/analytics', icon: TrendingUp },
  { name: 'Ingestion & Jobs', path: '/app/jobs', icon: Database },
  { name: 'Landing Overview', path: '/', icon: Globe },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-800/60 py-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 flex items-center justify-center shadow-glow-emerald">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Radar className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            GreatScout
          </h1>
          <p className="text-[10px] font-mono tracking-wider text-emerald-400 font-medium">
            SCOUT SMART, BUILD BETTER
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Intelligence Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Telemetry Card */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">pgvector + AI Extractor</div>
            <div className="text-[11px] text-emerald-400/90 font-mono">Traceability: 100%</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
