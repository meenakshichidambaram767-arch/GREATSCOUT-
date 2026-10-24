import React, { useState } from 'react';
import { OpportunityPRD } from '../../types/api';
import { Button } from '../common/Button';
import { CloseIcon, CheckIcon, ArrowUpRightIcon } from '../common/Icons';

interface PRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  prd: OpportunityPRD | null;
  loading?: boolean;
}

export const PRDModal: React.FC<PRDModalProps> = ({
  isOpen,
  onClose,
  prd,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'prd' | 'architecture' | 'schema' | 'backlog'>('prd');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownload = () => {
    if (!prd) return;
    const blob = new Blob([prd.markdown_content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-prd.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLinearTicketsMarkdown = () => {
    if (!prd) return '';
    return prd.linear_tickets.map(t => (
`### [${t.identifier}] ${t.title}
**Priority:** ${t.priority} | **Estimate:** ${t.estimate} | **Label:** ${t.label}

${t.description}

**Acceptance Criteria:**
${t.acceptance_criteria.map(ac => `- [ ] ${ac}`).join('\n')}
`
    )).join('\n---\n\n');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#dbe7e7] rounded-[24px] max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden font-outfit relative">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#e5eeee] flex items-center justify-between shrink-0 bg-[#fbfdfd]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0e6670] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
              PLAN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-[#0e6670] uppercase tracking-wider">
                  Ready to Build
                </span>
                <span className="text-[#cce1e3]">•</span>
                <span className="text-[10px] font-mono text-[#55696e]">
                  Complete Product Guide & Task List
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1f2a2e] truncate max-w-md sm:max-w-xl">
                {prd ? prd.title : 'Preparing build plan from market research...'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {prd && (
              <>
                <button
                  onClick={() => handleCopy(prd.markdown_content, 'full')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-[#dbe7e7] bg-white text-[#1f2a2e] hover:border-[#0e6670] transition-colors cursor-pointer"
                >
                  {copiedType === 'full' ? (
                    <>
                      <CheckIcon size={12} className="text-[#0e6670]" />
                      <span className="text-[#0e6670]">Copied Plan</span>
                    </>
                  ) : (
                    <span>Copy Text</span>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0e6670] text-white hover:bg-[#0a4e56] transition-colors cursor-pointer"
                >
                  Download .md
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#55696e] hover:text-[#1f2a2e] hover:bg-[#eaf3f3] transition-colors focus:outline-none"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-white border-b border-[#e5eeee] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'prd', label: '1. Product Plan & Scope' },
              { id: 'architecture', label: '2. Recommended Tools' },
              { id: 'schema', label: '3. Database & Connections' },
              { id: 'backlog', label: '4. Step-by-Step Tasks' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#eaf3f3] text-[#0e6670] font-semibold border border-[#dbe7e7]'
                    : 'text-[#55696e] hover:text-[#1f2a2e]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Export Tools for Linear / Notion */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleCopy(getLinearTicketsMarkdown(), 'linear')}
              className="text-[11px] font-mono text-[#0e6670] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{copiedType === 'linear' ? 'Tasks Copied!' : 'Copy Tasks for Linear/Jira'}</span>
              <ArrowUpRightIcon size={11} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfdfd]">
          {loading || !prd ? (
            <div className="space-y-4 py-12 text-center">
              <div className="w-10 h-10 border-2 border-[#0e6670] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-mono text-[#55696e]">Preparing build plan from real customer feedback...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Product Overview & MVP Scope */}
              {activeTab === 'prd' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Persona & Problem Statement */}
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block mb-1">
                        Who This Is For
                      </span>
                      <h3 className="text-base font-bold text-[#1f2a2e]">
                        {prd.target_audience} ({prd.category})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[11px] font-mono font-semibold text-[#b3261e] block mb-1">
                          The Problem People Face:
                        </span>
                        <p className="text-xs text-[#3b4d52] leading-relaxed">
                          {prd.problem_thesis}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[11px] font-mono font-semibold text-[#0e6670] block mb-1">
                          The Proposed Solution:
                        </span>
                        <p className="text-xs text-[#3b4d52] leading-relaxed">
                          {prd.suggested_solution}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phased Scope Progression */}
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block mb-1">
                        Launch Roadmap
                      </span>
                      <h3 className="text-base font-bold text-[#1f2a2e]">
                        What to Build First (Phase by Phase)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {prd.mvp_phases.map((phase, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#fbfdfd] border border-[#dbe7e7] flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-[#0e6670] block mb-3 pb-2 border-b border-[#e5eeee]">
                              {phase.phase}
                            </span>
                            <ul className="space-y-2.5">
                              {phase.features.map((feat, fIdx) => (
                                <li key={fIdx} className="text-xs text-[#1f2a2e] flex items-start gap-2">
                                  <div className="w-4 h-4 rounded border border-[#0e6670] text-[#0e6670] flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckIcon size={10} />
                                  </div>
                                  <span className="leading-snug">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Edge Cases */}
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#b3261e] font-bold block">
                      Important Details to Get Right (Edge Cases)
                    </span>
                    <ul className="space-y-2">
                      {prd.edge_cases.map((ec, idx) => (
                        <li key={idx} className="text-xs text-[#55696e] flex items-start gap-2 p-2.5 rounded-lg bg-[#fbfdfd] border border-[#eaf0f0]">
                          <span className="font-mono text-[#0e6670] font-bold">0{idx + 1}.</span>
                          <span className="text-[#1f2a2e]">{ec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: Recommended Tools */}
              {activeTab === 'architecture' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block">
                          Recommended Tech Setup
                        </span>
                        <h3 className="text-base font-bold text-[#1f2a2e]">
                          The Best Tools to Build This Product
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-[#0e6670] bg-[#eaf3f3] px-2.5 py-1 rounded-md border border-[#dbe7e7]">
                        Production Tested
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                          User Interface (Frontend)
                        </span>
                        <p className="text-sm font-semibold text-[#1f2a2e]">{prd.tech_stack.frontend}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                          Server & Logic (Backend)
                        </span>
                        <p className="text-sm font-semibold text-[#1f2a2e]">{prd.tech_stack.backend}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                          Database & Queues
                        </span>
                        <p className="text-sm font-semibold text-[#1f2a2e]">{prd.tech_stack.database}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                        <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1">
                          Hosting & Cloud Provider
                        </span>
                        <p className="text-sm font-semibold text-[#1f2a2e]">{prd.tech_stack.infrastructure}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-[#fbfdfd] border border-[#dbe7e7]">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1.5">
                        Helpful Third-Party Services
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {prd.tech_stack.integrations.map((item, idx) => (
                          <span key={idx} className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-white border border-[#dbe7e7] text-[#0e6670]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-[#f4f8f8] border border-[#dbe7e7]">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#0e6670] block mb-1">
                        Why these tools work best:
                      </span>
                      <p className="text-xs text-[#3b4d52] leading-relaxed">
                        {prd.tech_stack.architecture_rationale}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Database & Connections */}
              {activeTab === 'schema' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* DDL Section */}
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block">
                          Database Structure
                        </span>
                        <h3 className="text-base font-bold text-[#1f2a2e]">Database Tables (PostgreSQL)</h3>
                      </div>
                      <button
                        onClick={() => handleCopy(prd.schema_ddl, 'ddl')}
                        className="text-xs font-mono text-[#0e6670] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedType === 'ddl' ? 'Copied SQL!' : 'Copy SQL'}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-[#11181c] text-[#e3eded] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#233036]">
                      {prd.schema_ddl}
                    </pre>
                  </div>

                  {/* REST API Endpoints */}
                  <div className="bg-white border border-[#dbe7e7] rounded-[18px] p-6 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block">
                        How the App Connects to the Server
                      </span>
                      <h3 className="text-base font-bold text-[#1f2a2e]">Web Endpoints (APIs)</h3>
                    </div>

                    <div className="space-y-3">
                      {prd.api_endpoints.map((ep, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-[#fbfdfd] border border-[#dbe7e7] space-y-3">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-[#0e6670] text-white font-bold">
                              {ep.method}
                            </span>
                            <span className="font-semibold text-[#1f2a2e]">{ep.path}</span>
                          </div>
                          <p className="text-xs text-[#55696e]">{ep.description}</p>

                          {ep.request_sample && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-[10px] font-mono text-[#55696e] uppercase block mb-1">Request data:</span>
                                <pre className="p-2.5 rounded-lg bg-[#11181c] text-[#a3c2c7] font-mono text-[10px] overflow-x-auto">
                                  {ep.request_sample}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-[#55696e] uppercase block mb-1">Server response:</span>
                                <pre className="p-2.5 rounded-lg bg-[#11181c] text-[#a3c2c7] font-mono text-[10px] overflow-x-auto">
                                  {ep.response_sample}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Step-by-Step Task List */}
              {activeTab === 'backlog' && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e5eeee]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0e6670] font-bold block">
                        Ready-to-Use Tasks
                      </span>
                      <h3 className="text-base font-bold text-[#1f2a2e]">
                        Step-by-Step Task List ({prd.linear_tickets.length} Tasks)
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(getLinearTicketsMarkdown(), 'all_tickets')}
                      className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-[#eaf3f3] text-[#0e6670] border border-[#dbe7e7] hover:bg-[#dbe7e7] transition-colors cursor-pointer"
                    >
                      {copiedType === 'all_tickets' ? 'All Tasks Copied!' : 'Copy All Tasks'}
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {prd.linear_tickets.map((t) => (
                      <div key={t.identifier} className="bg-white border border-[#dbe7e7] rounded-[18px] p-5 shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-bold text-[#0e6670] px-2 py-0.5 rounded bg-[#eaf3f3] border border-[#dbe7e7]">
                              {t.identifier}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#f4f8f8] border border-[#dbe7e7] text-[#55696e]">
                              {t.label}
                            </span>
                            <span className="text-[10px] font-semibold text-[#b3261e] bg-[#fdf2f2] px-2 py-0.5 rounded border border-[#f8cfcb]">
                              {t.priority}
                            </span>
                            <span className="text-[10px] text-[#55696e]">
                              Estimated: {t.estimate}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(`[${t.identifier}] ${t.title}\n\n${t.description}\n\nAcceptance Criteria:\n${t.acceptance_criteria.map(ac => `- [ ] ${ac}`).join('\n')}`, t.identifier)}
                            className="text-xs font-mono text-[#0e6670] hover:underline cursor-pointer shrink-0"
                          >
                            {copiedType === t.identifier ? 'Task Copied!' : 'Copy Task'}
                          </button>
                        </div>

                        <h4 className="text-base font-bold text-[#1f2a2e]">{t.title}</h4>
                        <p className="text-xs text-[#55696e] leading-relaxed">{t.description}</p>

                        <div className="p-3 rounded-xl bg-[#f8fafb] border border-[#eaf0f0]">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#55696e] block mb-1.5">
                            Checklist to complete:
                          </span>
                          <ul className="space-y-1">
                            {t.acceptance_criteria.map((ac, acIdx) => (
                              <li key={acIdx} className="text-xs text-[#3b4d52] flex items-center gap-2">
                                <span className="text-[#0e6670]">•</span>
                                <span>{ac}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#e5eeee] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#55696e] font-mono text-[11px]">
            <span>Format: Markdown Document</span>
            <span>•</span>
            <span>Ready for Notion, Linear, Jira, or your dev team</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            {prd && (
              <Button variant="primary" size="sm" onClick={handleDownload} showArrow={false}>
                Download Plan (.md)
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
