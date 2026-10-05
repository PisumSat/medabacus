import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ChevronRight, Bot, TrendingUp } from 'lucide-react';
import type { ToolItem } from '../../constants/tools';
import type { HospitalWardId } from '../../types/wards';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolItem[];
  onSelectTool: (toolId: string) => void;
  onOpenChat?: () => void;
}

const QUICK_SEARCH_CHIPS = [
  { label: 'Electrolytes & ABG', query: 'electrolytes' },
  { label: 'CKD-EPI & CrCl', query: 'egfr' },
  { label: 'Wells PE & DVT', query: 'wells' },
  { label: 'MELD-Na Liver', query: 'meld' },
  { label: 'Parkland Burn', query: 'burn' },
  { label: 'ACOG Dating', query: 'dating' },
  { label: 'Bishop Score', query: 'bishop' },
  { label: 'PALS Vitals', query: 'pals' },
  { label: 'Holliday-Segar', query: 'fluids' },
  { label: 'Preeclampsia', query: 'preeclampsia' },
];

const WARD_LABELS: Record<HospitalWardId, { label: string; badgeClass: string }> = {
  all: { label: 'All', badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  internal_medicine: { label: 'Med', badgeClass: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300' },
  surgery: { label: 'Surgery', badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' },
  obgyn: { label: 'OB/GYN', badgeClass: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300' },
  pediatrics: { label: 'Peds', badgeClass: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300' },
};

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
  onOpenChat,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tools.filter((t) => {
      const inTitle = t.title.toLowerCase().includes(q);
      const inSubtitle = t.subtitle.toLowerCase().includes(q);
      const inKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
      const inBadge = t.badge.toLowerCase().includes(q);
      const inWard = t.ward.toLowerCase().includes(q);
      return inTitle || inSubtitle || inKeywords || inBadge || inWard;
    });
  }, [tools, query]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] animate-drawerSlideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Search Input */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Search 105+ Clinical Formulas
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer active:scale-95"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type formula name, disease, or biomarker..."
              className="w-full pl-9 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800/90 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 rounded-2xl border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick-Search Thumb Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-teal-600" />
              Top:
            </span>
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip.query}
                type="button"
                onClick={() => setQuery(chip.query)}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer tap-bounce shrink-0 border ${
                  query.toLowerCase() === chip.query
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-[180px] max-h-[50vh]">
          {query.trim() === '' ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap a quick chip above or search by medical term (e.g. &ldquo;burn&rdquo;, &ldquo;egfr&rdquo;, &ldquo;vbac&rdquo;, &ldquo;curb&rdquo;).
              </p>
              {onOpenChat && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 text-left flex items-center justify-between cursor-pointer hover:border-teal-400 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Unstructured Clinical Data?
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Paste full lab panels or notes into Clinical AI
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
                </div>
              )}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No calculators found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Try searching by abbreviation (e.g., &ldquo;ABG&rdquo;, &ldquo;PECARN&rdquo;, &ldquo;TIMI&rdquo;).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                {filteredResults.length} Matching Formula{filteredResults.length === 1 ? '' : 's'}
              </div>
              {filteredResults.map((tool) => {
                const wardMeta = WARD_LABELS[tool.ward];
                return (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-600 flex items-center justify-between gap-2.5 transition-all cursor-pointer tap-bounce group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                        {tool.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {tool.title}
                          </h4>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${wardMeta.badgeClass}`}>
                            {wardMeta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {tool.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
