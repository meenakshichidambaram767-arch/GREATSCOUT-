import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { IngestionModal } from '../jobs/IngestionModal';
import { AskGreatScoutCopilot } from '../copilot/AskGreatScoutCopilot';

export const MainLayout: React.FC = () => {
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-subtle-grid text-[#1f2a2e] font-outfit">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative">
        <Header 
          onQuickIngest={() => setIngestModalOpen(true)} 
          onOpenCopilot={() => setCopilotOpen(true)}
        />
        <main className="flex-1 px-6 sm:px-12 py-7 max-w-[1240px] w-full mx-auto space-y-7">
          <Outlet />
        </main>

        {/* Floating Quick Copilot Trigger Pill */}
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#0e6670] to-[#178996] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-bold tracking-wide"
        >
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span>Ask Copilot</span>
        </button>
      </div>

      {/* Global Ingestion Pipeline Modal */}
      <IngestionModal
        isOpen={ingestModalOpen}
        onClose={() => setIngestModalOpen(false)}
      />

      {/* Global AI Evidence Copilot Drawer */}
      <AskGreatScoutCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
};

