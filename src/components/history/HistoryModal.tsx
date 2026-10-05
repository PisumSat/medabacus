import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  History,
  Search,
  Download,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  BedDouble,
  Clock,
  Calendar,
} from 'lucide-react';
import { useCalculationHistory } from '../../context/CalculationHistoryContext';
import { useCalculatorPrefillContext } from '../../context/useCalculatorPrefill';
import type { HistoryEntry } from '../../types/shift';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCalculator?: (toolId: string, ward: string, prefillValues: Record<string, any>) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLaunchCalculator,
}) => {
  const { history, removeHistoryEntry, clearAllHistory, exportHistoryCsv } = useCalculationHistory();
  const { setToolPrefill } = useCalculatorPrefillContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (h) =>
        h.toolTitle.toLowerCase().includes(q) ||
        h.summaryScore.toLowerCase().includes(q) ||
        (h.patientTag && h.patientTag.toLowerCase().includes(q)) ||
        h.ward.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  if (!isOpen) return null;

  const handleCopyNote = async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.clinicalNoteSnippet);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleReload = (entry: HistoryEntry) => {
    if (entry.inputs) {
      setToolPrefill(entry.toolId, entry.inputs);
    }
    if (onLaunchCalculator) {
      onLaunchCalculator(entry.toolId, entry.ward, entry.inputs || {});
    }
    onClose();
  };

  const handleExportCsv = () => {
    const csvContent = exportHistoryCsv();
    if (!csvContent) return;

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `medabacus_shift_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      navigator.clipboard.writeText(csvContent);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2000);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4 animate-drawerSlideUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Calculation History & Audit Trail
                </h3>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800">
                  {history.length} Logged
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Persistent log of calculated scores with 1-click reload and shift export
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Action Bar */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by score, bed tag, or tool..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer tap-bounce"
                  title="Export Shift Audit Log as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="hidden sm:inline">{copiedCsv ? 'Copied CSV!' : 'Export CSV'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all calculation history?')) {
                      clearAllHistory();
                    }
                  }}
                  className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs cursor-pointer"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs font-bold">No calculations logged yet.</p>
              <p className="text-[11px]">
                As you use calculators or copy EHR notes, results will automatically be preserved here.
              </p>
            </div>
          ) : (
            filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-teal-400 dark:hover:border-teal-700 transition-colors shadow-2xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {entry.toolTitle}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {entry.summaryScore}
                    </span>
                    {entry.patientTag && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        <BedDouble className="w-2.5 h-2.5 text-teal-600" />
                        <span>{entry.patientTag}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-xs">{entry.clinicalNoteSnippet.slice(0, 60)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyNote(entry)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                    title="Copy clinical note"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReload(entry)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shadow-2xs tap-bounce"
                    title="Reload parameters back into calculator"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Reload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeHistoryEntry(entry.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
