import React from 'react';
import { Link } from 'react-router-dom';
import { AlertIcon, ArrowLeftIcon } from '../components/common/Icons';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] font-outfit p-6">
      <div className="bg-white border border-[#dbe7e7] rounded-[22px] text-center p-8 sm:p-10 max-w-md w-full shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] flex items-center justify-center mx-auto mb-4">
          <AlertIcon size={24} />
        </div>
        <span className="font-mono text-[11px] font-semibold text-[#0e6670] uppercase tracking-[0.08em] block mb-1">
          404 // Route Not Found
        </span>
        <h1 className="text-2xl font-bold text-[#1f2a2e] mb-2">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-[#55696e] mb-6 leading-relaxed">
          The requested intelligence view or dossier could not be located.
        </p>
        <Link to="/app">
          <Button variant="primary" showArrow={false} icon={<ArrowLeftIcon size={14} className="mr-2" />}>
            Back to Platform Overview
          </Button>
        </Link>
      </div>
    </div>
  );
};
