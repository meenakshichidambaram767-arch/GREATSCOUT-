import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { SystemHealth } from '../../types/api';
import { Button } from '../common/Button';
import { PlayIcon } from '../common/Icons';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface HeaderProps {
  onQuickIngest?: () => void;
  onOpenCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onQuickIngest, onOpenCopilot }) => {
  const { user, logout } = useAuth();
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
    <header className="h-20 px-6 sm:px-10 bg-white/90 backdrop-blur-md border-b border-[#dbe7e7] flex items-center justify-between sticky top-0 z-20">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0e6670] font-mono">
          Intelligence Workspace
        </span>
        <span className="text-[#dbe7e7] hidden sm:inline">•</span>
        <span className="text-xs text-[#55696e] hidden sm:inline font-outfit">
          Evidence-backed opportunity discovery and cluster analysis
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium ${
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
          <span className="text-[11px] font-semibold">
            {isConnected ? 'System Connected' : 'Connecting...'}
          </span>
        </div>

        {/* AI Copilot Button */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0e6670] to-[#178996] text-white hover:brightness-110 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Copilot</span>
          </button>
        )}

        {/* Primary Action Button */}
        {onQuickIngest && (
          <Button
            variant="primary"
            size="sm"
            onClick={onQuickIngest}
            icon={<PlayIcon size={13} className="text-white mr-1.5" />}
          >
            Run Pipeline
          </Button>
        )}

        {/* User Identity / Profile Pill */}
        <div className="pl-2 border-l border-[#dbe7e7] flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#f4f8f8] border border-[#dbe7e7] text-xs font-mono"
                title={`${user.name} (${user.email})`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0e6670] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-[#1f2a2e] hidden sm:inline max-w-[90px] truncate">
                  {user.name}
                </span>
                {user.isGuest && (
                  <span className="text-[10px] text-[#55696e] bg-[#eaf3f3] px-1.5 py-0.2 rounded-full">
                    Demo
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1 rounded-md text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#f4f8f8] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Link
                to="/login"
                className="px-2.5 py-1 text-[#55696e] hover:text-[#1f2a2e] font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1 rounded-full bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] font-bold hover:bg-[#0e6670] hover:text-white transition-all shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

