import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { SystemHealth } from '../../types/api';
import { Button } from '../common/Button';

export interface HeaderProps {
  onQuickIngest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onQuickIngest }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  const checkHealth = async () => {
    try {
      const res = await dashboardService.getHealth();
      setHealth(res);
    } catch (err) {
      console.warn('Backend offline or not reachable yet:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 px-8 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Slogan */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Product Intelligence OS
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Analyzing Product Hunt discussions & Reddit rants
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Health Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-mono text-slate-300">
            {health?.status === 'healthy' ? 'ENGINE ACTIVE' : 'CONNECTING...'}
          </span>
          {health?.database && (
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              ({health.database.split(' ')[0]})
            </span>
          )}
        </div>

        {/* Quick Ingest Button */}
        {onQuickIngest && (
          <Button
            variant="outline"
            size="sm"
            onClick={onQuickIngest}
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Run Scout Pipeline
          </Button>
        )}

        {/* Link back to Landing */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          title="Return to Axiom-styled landing page"
        >
          <Globe className="w-3.5 h-3.5 text-[#DA840A]" />
          <span>Landing</span>
        </Link>
      </div>
    </header>
  );
};
