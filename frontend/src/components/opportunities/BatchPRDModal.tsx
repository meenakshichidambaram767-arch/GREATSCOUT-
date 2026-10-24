import React, { useState } from 'react';
import { OpportunityPRD } from '../../types/api';
import { Button } from '../common/Button';
import { CloseIcon, CheckIcon, ArrowUpRightIcon } from '../common/Icons';

interface BatchPRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  prds: OpportunityPRD[];
  combinedMarkdown: string;
  loading?: boolean;
}

export const BatchPRDModal: React.FC<BatchPRDModalProps> = ({
  isOpen,
  onClose,
  prds,
  combinedMarkdown,
  loading = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPrd = prds[selectedIdx] || prds[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadAll = () => {
    const blob = new Blob([combinedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greatscout-batch-build-plans-${prds.length}-projects.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#dbe7e7] rounded-[24px] max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden font-outfit relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#e5eeee] flex items-center justify-between shrink-0 bg-[#fbfdfd]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0e6670] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
              ALL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-[#0e6670] uppercase tracking-wider">
                  Multi-Project Build Plans
                </span>
                <span className="text-[#cce1e3]">•</span>
                <span className="text-[10px] font-mono text-[#55696e]">
                  {prds.length} Projects Selected
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1f2a2e]">
                Batch Product Requirements & Engineering Blueprints
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(combinedMarkdown, 'all')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-[#dbe7e7] bg-white text-[#1f2a2e] hover:border-[#0e6670] transition-colors cursor-pointer"
            >
              {copiedType === 'all' ? (
                <>
                  <CheckIcon size={12} className="text-[#0e6670]" />
                  <span className="text-[#0e6670]">All Plans Copied!</span>
                </>
              ) : (
                <span>Copy All ({prds.length}) Plans</span>
              )}
            </button>

            <button
              onClick={handleDownloadAll}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0e6670] text-white hover:bg-[#0a4e56] transition-colors cursor-pointer"
            >
              Download All (.md)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3] transition-colors focus:outline-none"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Project Selector Pills */}
        <div className="px-6 py-2.5 bg-white border-b border-[#e5eeee] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-mono text-[#55696e] uppercase tracking-wider mr-1 shrink-0">
            Select Project:
          </span>
          {prds.map((item, idx) => (
            <button
              key={item.opportunity_id || idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedIdx === idx
                  ? 'bg-[#0e6670] text-white font-semibold shadow-sm'
                  : 'bg-[#f8fafb] text-[#55696e] border border-[#dbe7e7] hover:border-[#0e6670] hover:text-[#1f2a2e]'
              }`}
            >
              <span className="font-mono text-[10px] mr-1.5 opacity-80">#{idx + 1}</span>
              <span>{item.title.length > 30 ? item.title.slice(0, 30) + '...' : item.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfd]">
          {loading ? (
            <div className="space-y-4 py-12 text-center">
              <div className="w-10 h-10 border-2 border-[#0e6670] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-mono text-[#55696e]">Generating tailored specifications for selected projects...</p>
            </div>
          ) : !currentPrd ? (
            <div className="text-center py-12 text-sm text-[#55696e]">
              No plans available to display.
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Project Card Header */}
              <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#eaf3f3] text-[#0e6670] text-xs font-mono font-semibold border border-[#dbe7e7]">
                      {currentPrd.category}
                    </span>
                    <span className="text-xs font-mono text-[#55696e]">
                      Target: {currentPrd.target_audience}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(currentPrd.markdown_content, `single_${selectedIdx}`)}
                    className="text-xs font-mono text-[#0e6670] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{copiedType === `single_${selectedIdx}` ? 'Plan Copied!' : 'Copy This Plan'}</span>
                    <ArrowUpRightIcon size={11} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-[#1f2a2e] leading-snug">
                  {currentPrd.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#b3261e] block mb-1">
                      The Problem People Face:
                    </span>
                    <p className="text-xs text-[#3b4d52] leading-relaxed">
                      {currentPrd.problem_thesis}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#0e6670] block mb-1">
                      The Proposed Solution:
                    </span>
                    <p className="text-xs text-[#3b4d52] leading-relaxed">
                      {currentPrd.suggested_solution}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Tech Setup */}
              <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-[#0e6670] block">
                  Recommended Tech Setup
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                      Frontend
                    </span>
                    <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{currentPrd.tech_stack.frontend}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                      Backend
                    </span>
                    <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{currentPrd.tech_stack.backend}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                      Database
                    </span>
                    <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{currentPrd.tech_stack.database}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#f8fafb] border border-[#eaf0f0]">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                      Hosting
                    </span>
                    <p className="text-xs font-semibold text-[#1f2a2e] leading-snug">{currentPrd.tech_stack.infrastructure}</p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Ready Tasks */}
              <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#0e6670] block">
                    Ready-to-Build Tasks ({currentPrd.linear_tickets.length} Tasks)
                  </span>
                  <span className="text-[10px] font-mono text-[#55696e]">
                    Compatible with Linear & Jira
                  </span>
                </div>

                <div className="space-y-2.5">
                  {currentPrd.linear_tickets.map((t) => (
                    <div key={t.identifier} className="p-3.5 rounded-xl bg-[#fbfdfd] border border-[#dbe7e7] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-bold text-[#0e6670] bg-[#eaf3f3] px-2 py-0.5 rounded border border-[#dbe7e7]">
                            {t.identifier}
                          </span>
                          <span className="font-bold text-[#1f2a2e]">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#b3261e] bg-[#fdf2f2] px-2 py-0.5 rounded">
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-[#55696e] leading-relaxed">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#e5eeee] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#55696e] font-mono text-[11px]">
            <span>{prds.length} Project Plans ready for Linear, Jira, or Notion</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadAll} showArrow={false}>
              Download All Plans (.md)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
