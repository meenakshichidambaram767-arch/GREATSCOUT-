import React from 'react';
import { NavLink } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { 
  OverviewIcon, 
  OpportunityIcon, 
  SignalIcon, 
  TrendsIcon, 
  PipelineIcon, 
  CheckIcon,
  ExternalLinkIcon 
} from '../common/Icons';

const NAV_ITEMS = [
  { name: 'Overview', path: '/app', icon: OverviewIcon },
  { name: 'Opportunities', path: '/app/opportunities', icon: OpportunityIcon },
  { name: 'Customer Signals', path: '/app/signals', icon: SignalIcon },
  { name: 'Market Trends', path: '/app/analytics', icon: TrendsIcon },
  { name: 'Data Ingestion', path: '/app/jobs', icon: PipelineIcon },
  { name: 'Landing Overview', path: '/', icon: ExternalLinkIcon },
];

export const Sidebar: React.FC = () => {
  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex md:w-20 lg:w-[260px] shrink-0 bg-white border-r border-[#dbe7e7] flex-col h-screen sticky top-0 z-30 transition-all duration-300">
        {/* Brand Header with GreatScout Official Brand Logo */}
        <div className="h-20 px-4 lg:px-6 flex items-center border-b border-[#dbe7e7]">
          <NavLink to="/app" className="focus:outline-none">
            <div className="hidden lg:block">
              <BrandLogo size="md" variant="full" />
            </div>
            <div className="lg:hidden flex justify-center w-full">
              <BrandLogo size="md" variant="icon" />
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="hidden lg:block px-3 mb-2 text-[10px] font-mono font-semibold text-[#55696e] uppercase tracking-[0.12em]">
            Core Platform
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/' || item.path === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-outfit transition-all duration-150 justify-center lg:justify-start ${
                    isActive
                      ? 'bg-[#0e6670] text-white shadow-sm font-semibold'
                      : 'text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3]'
                  }`
                }
                title={item.name}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden lg:inline truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="p-3 lg:p-4 border-t border-[#dbe7e7]">
          <div className="p-3 rounded-xl bg-[#f4f8f8] border border-[#dbe7e7] flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] flex items-center justify-center shrink-0">
              <CheckIcon size={14} className="text-[#0e6670]" />
            </div>
            <div className="hidden lg:block min-w-0 flex-1">
              <div className="text-xs font-outfit font-semibold text-[#1f2a2e] truncate">Engine Status</div>
              <div className="text-[11px] text-[#0e6670] font-mono tracking-tight font-medium">Operational</div>
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
              <Icon size={18} />
              <span className="mt-1">{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
