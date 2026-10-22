import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { CnRLandingPage } from './pages/CnRLandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { SignalsPage } from './pages/SignalsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IngestionJobsPage } from './pages/IngestionJobsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main C&R Research-styled Landing Page at root */}
          <Route path="/" element={<CnRLandingPage />} />
          <Route path="/landing" element={<CnRLandingPage />} />

          {/* GreatScout App Console under /app */}
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="opportunities" element={<OpportunitiesPage />} />
            <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="jobs" element={<IngestionJobsPage />} />
          </Route>

          {/* Legacy root app aliases for compatibility */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/opportunities" element={<Navigate to="/app/opportunities" replace />} />
          <Route path="/opportunities/:id" element={<Navigate to="/app/opportunities/:id" replace />} />
          <Route path="/signals" element={<Navigate to="/app/signals" replace />} />
          <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
          <Route path="/jobs" element={<Navigate to="/app/jobs" replace />} />

          {/* 404 handler */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
