import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, ChevronRight, Sparkles } from 'lucide-react';
import type { ToolItem } from '../../constants/tools';
import type { HospitalWardId } from '../../types/wards';
import { useStarredTools } from '../../context/useStarredTools';

interface StarredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  tools: ToolItem[];
}

const wardBadgeColorMap: Record<HospitalWardId, { label: string; badgeClass: string }> = {
  all: {
    label: 'All',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  internal_medicine: {
    label: 'Internal Med',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800',
  },
  surgery: {
    label: 'Surgery',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800',
  },
  obgyn: {
    label: 'OB/GYN',
    badgeClass: 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200/70 dark:border-teal-800',
  },
  pediatrics: {
    label: 'Pediatrics',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800',
  },
};

export const StarredModal: React.FC<StarredModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  tools,
}) => {
  const { starredIds, toggleStar } = useStarredTools();

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

  const starredList = useMemo(() => {
    return starredIds
      .map((id) => tools.find((t) => t.id === id))
      .filter((t): t is ToolItem => Boolean(t));
  }, [starredIds, tools]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="starred-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-slideUp max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar on Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-500 shadow-2xs">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="starred-modal-title" className="text-base font-black text-slate-900 dark:text-white">
                  Starred Calculators
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  {starredList.length} {starredList.length === 1 ? 'Favorite' : 'Favorites'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                1-tap direct launch from any ward or homepage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tool List */}
        <div className="overflow-y-auto space-y-2 pr-0.5 flex-1 min-h-0">
          {starredList.length > 0 ? (
            starredList.map((tool) => {
              const meta = wardBadgeColorMap[tool.ward] || wardBadgeColorMap.all;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className="group p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-500/70 dark:hover:border-teal-400/80 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/70 group-hover:scale-105 transition-transform shrink-0">
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {tool.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tool.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(tool.id);
                      }}
                      className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-100/60 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No starred calculators yet
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Click the ★ icon next to any calculator in any ward to pin it here for instant 1-tap access.
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <span>Persisted in local device storage</span>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
