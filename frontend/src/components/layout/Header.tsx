import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
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
      setHealth(null);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = health?.status === 'healthy';

  return (
    <header className="h-20 px-6 sm:px-12 bg-white/85 backdrop-blur-md border-b border-[#dbe7e7] flex items-center justify-between sticky top-0 z-20">
      {/* Title & Slogan */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.08em] text-[#0e6670] bg-[#eaf3f3] px-2.5 py-1 rounded-full border border-[#dbe7e7]">
          PRODUCT INTELLIGENCE OS
        </span>
        <span className="text-[#dbe7e7] hidden sm:inline">|</span>
        <span className="text-xs text-[#55696e] hidden sm:inline font-outfit">
          Analyzing Product Hunt discussions & Reddit rants
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Pill: Amber Connecting... or Teal LIVE */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono tracking-wide ${
            isConnected
              ? 'bg-[#eaf3f3] border-[#dbe7e7] text-[#0e6670]'
              : 'bg-[#fef7e6] border-[#fbe1b3] text-[#d98a00]'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-[#0e6670]' : 'bg-[#d98a00]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConnected ? 'bg-[#0e6670]' : 'bg-[#d98a00]'
              }`}
            />
          </span>
          <span className="font-semibold text-[11px]">
            {isConnected ? 'LIVE' : 'Connecting...'}
          </span>
        </div>

        {/* Primary Action Button: Black pill with top-right arrow */}
        {onQuickIngest && (
          <Button
            variant="primary"
            size="sm"
            onClick={onQuickIngest}
            icon={<Sparkles className="w-3.5 h-3.5 text-white mr-1" />}
          >
            Run Scout Pipeline
          </Button>
        )}
      </div>
    </header>
  );
};
