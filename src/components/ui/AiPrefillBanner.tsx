import React from 'react';
import { Bot, X, RotateCcw } from 'lucide-react';

interface AiPrefillBannerProps {
  onReset?: () => void;
  onDismiss?: () => void;
  paramCount?: number;
  sourceDescription?: string;
}

export const AiPrefillBanner: React.FC<AiPrefillBannerProps> = ({
  onReset,
  onDismiss,
  paramCount,
  sourceDescription = 'MEDABACUS Clinical AI',
}) => {
  return (
    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 dark:from-teal-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border border-teal-400/40 dark:border-teal-700/60 flex items-center justify-between gap-3 animate-fadeIn shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Bot className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-teal-950 dark:text-teal-200">
              Auto-Populated by {sourceDescription}
            </span>
            {paramCount && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                {paramCount} Parameters Auto-Filled
              </span>
            )}
          </div>
          <p className="text-[11px] text-teal-800 dark:text-teal-300 truncate">
            Clinical values have been matched and pre-filled into formula inputs.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-800 transition-colors cursor-pointer"
            title="Reset inputs to standard defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
            title="Dismiss notification"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
