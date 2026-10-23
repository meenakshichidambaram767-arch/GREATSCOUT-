import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { IngestionModal } from '../jobs/IngestionModal';

export const MainLayout: React.FC = () => {
  const [ingestModalOpen, setIngestModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-subtle-grid text-[#1f2a2e] font-outfit">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header onQuickIngest={() => setIngestModalOpen(true)} />
        <main className="flex-1 px-6 sm:px-12 py-7 max-w-[1240px] w-full mx-auto space-y-7">
          <Outlet />
        </main>
      </div>

      {/* Global Ingestion Pipeline Modal */}
      <IngestionModal
        isOpen={ingestModalOpen}
        onClose={() => setIngestModalOpen(false)}
      />
    </div>
  );
};
