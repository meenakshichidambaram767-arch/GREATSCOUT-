import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { IngestionModal } from '../jobs/IngestionModal';

export const MainLayout: React.FC = () => {
  const [ingestModalOpen, setIngestModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onQuickIngest={() => setIngestModalOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
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
