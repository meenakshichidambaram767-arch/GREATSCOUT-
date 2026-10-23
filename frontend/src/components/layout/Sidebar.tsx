import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Radar, 
  Lightbulb, 
  Activity, 
  Layers, 
  TrendingUp, 
  Database,
  Globe,
  CheckCircle2
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
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex md:w-20 lg:w-[260px] shrink-0 bg-white border-r border-[#dbe7e7] flex-col h-screen sticky top-0 z-30 transition-all duration-300">
        {/* Brand Header with Circular Teal GS Logo */}
        <div className="h-20 px-4 lg:px-6 flex items-center gap-3.5 border-b border-[#dbe7e7]">
          <div className="w-10 h-10 rounded-full bg-[#0e6670] flex items-center justify-center shrink-0 shadow-sm text-white">
            <Radar className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="hidden lg:block min-w-0">
            <h1 className="text-lg font-outfit font-bold tracking-tight text-[#1f2a2e]">
              GreatScout
            </h1>
            <p className="text-[10px] font-mono tracking-[0.08em] uppercase text-[#0e6670] font-semibold truncate">
              SCOUT SMART, BUILD BETTER
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <div className="hidden lg:block px-3 mb-2 text-[11px] font-mono font-semibold text-[#55696e] uppercase tracking-[0.08em]">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/' || item.path === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-[12px] text-sm font-outfit font-medium transition-all duration-150 justify-center lg:justify-start ${
                    isActive
                      ? 'bg-[#0e6670] text-white shadow-sm font-semibold'
                      : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
                  }`
                }
                title={item.name}
              >
                <Icon className="w-5 h-5 shrink-0 stroke-[2]" />
                <span className="hidden lg:inline truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Pipeline Status Card */}
        <div className="p-3 lg:p-4 border-t border-[#dbe7e7]">
          <div className="p-3 rounded-2xl bg-[#f4f8f8] border border-[#dbe7e7] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#0e6670]" />
            </div>
            <div className="hidden lg:block min-w-0 flex-1">
              <div className="text-xs font-outfit font-semibold text-[#1f2a2e] truncate">Pipeline Status</div>
              <div className="text-[11px] text-[#0e6670] font-mono tracking-tight font-medium">Ready // Synced</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#dbe7e7] z-40 flex items-center justify-around px-2 py-2 safe-bottom shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/app'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-outfit transition-all ${
                  isActive
                    ? 'text-[#0e6670] font-bold'
                    : 'text-[#55696e] hover:text-[#1f2a2e]'
                }`
              }
            >
              <Icon className="w-5 h-5 stroke-[2]" />
              <span className="mt-1">{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
