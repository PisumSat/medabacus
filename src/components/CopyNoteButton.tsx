import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useCalculationHistory } from '../context/CalculationHistoryContext';
import { EhrNoteStudioModal } from './ui/EhrNoteStudioModal';

export interface CopyNoteButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'compact';
  toolTitle?: string;
  patientTag?: string;
  scoreBadge?: string;
  showStudioButton?: boolean;
}

export const CopyNoteButton: React.FC<CopyNoteButtonProps> = ({
  textToCopy,
  label = 'Copy EHR Note',
  className = '',
  variant = 'default',
  toolTitle,
  patientTag,
  scoreBadge,
  showStudioButton = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const { addHistoryEntry } = useCalculationHistory();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Auto-log to calculation history on copy
    if (textToCopy) {
      addHistoryEntry({
        toolId: toolTitle ? toolTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) : 'calculator',
        toolTitle: toolTitle || 'Clinical Calculator',
        ward: 'internal_medicine',
        patientTag: patientTag || undefined,
        summaryScore: scoreBadge || 'Calculated Note Copied',
        clinicalNoteSnippet: textToCopy.slice(0, 280),
      });
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const getVariantStyles = () => {
    if (copied) {
      return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
    }
    if (variant === 'primary') {
      return 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white border-teal-500/60 shadow-sm';
    }
    return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs';
  };

  const getStudioButtonStyles = () => {
    if (variant === 'primary') {
      return 'border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 shadow-2xs';
    }
    return 'border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 shadow-2xs';
  };

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all border active:scale-95 cursor-pointer tap-bounce h-8.5 ${getVariantStyles()}`}
          title="Copy clinical note snippet to clipboard & log to Shift History"
          aria-label="Copy EHR Note"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 opacity-90" />
              <span>{label}</span>
            </>
          )}
        </button>

        {showStudioButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStudioOpen(true);
            }}
            className={`w-8.5 h-8.5 flex items-center justify-center rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 tap-bounce ${getStudioButtonStyles()}`}
            title="Open Multi-EHR Smart SOAP Studio (Epic, Cerner, SBAR formats)"
            aria-label="Open SOAP Studio"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <EhrNoteStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        rawNote={textToCopy}
        toolTitle={toolTitle}
        patientTag={patientTag}
        scoreBadge={scoreBadge}
      />
    </>
  );
};
