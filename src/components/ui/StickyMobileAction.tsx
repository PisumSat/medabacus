import React from 'react';
import { CopyNoteButton } from '../CopyNoteButton';

interface StickyMobileActionProps {
  scoreBadge: string;
  categoryLabel?: string;
  noteText: string;
  severityColor?: 'emerald' | 'amber' | 'rose' | 'teal' | 'indigo';
}

export const StickyMobileAction: React.FC<StickyMobileActionProps> = ({
  scoreBadge,
  categoryLabel,
  noteText,
  severityColor = 'teal',
}) => {
  const colorMap = {
    emerald: 'bg-emerald-600 text-white shadow-emerald-500/20',
    amber: 'bg-amber-600 text-white shadow-amber-500/20',
    rose: 'bg-rose-600 text-white shadow-rose-500/20',
    teal: 'bg-teal-700 text-white shadow-teal-500/20',
    indigo: 'bg-indigo-700 text-white shadow-indigo-500/20',
  };

  return (
    <aside
      aria-label="Current calculation summary"
      className="fixed bottom-[calc(52px+max(0.625rem,env(safe-area-inset-bottom,0px)))] left-0 right-0 z-25 lg:hidden px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white shadow-lg animate-slideUp"
    >
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <span
            className={`h-8.5 px-3 rounded-xl text-xs font-black shrink-0 shadow-xs flex items-center justify-center tracking-tight ${colorMap[severityColor]}`}
          >
            {scoreBadge}
          </span>
          {categoryLabel && (
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">
              {categoryLabel}
            </span>
          )}
        </div>

        <CopyNoteButton
          textToCopy={noteText}
          variant="primary"
          label="Copy EHR"
          className="shrink-0"
        />
      </div>
    </aside>
  );
};

