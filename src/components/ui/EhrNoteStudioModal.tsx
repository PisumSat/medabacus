import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Copy,
  Check,
  Sparkles,
  BedDouble,
  User,
  Shield,
  Send,
} from 'lucide-react';
import { formatEhrNote, type EhrFormatType } from '../../utils/ehrNoteFormatter';
import { useShiftCensus } from '../../context/ShiftCensusContext';
import { useCalculationHistory } from '../../context/CalculationHistoryContext';

interface EhrNoteStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawNote: string;
  toolTitle?: string;
  patientTag?: string;
  scoreBadge?: string;
}

const FORMAT_OPTIONS: { id: EhrFormatType; label: string; tag: string }[] = [
  { id: 'soap', label: 'Standard SOAP', tag: 'Universal' },
  { id: 'epic', label: 'Epic SmartPhrase', tag: '@DOTPHRASE@' },
  { id: 'cerner', label: 'Cerner PowerChart', tag: 'PowerChart' },
  { id: 'sbar', label: 'SBAR Handoff', tag: 'Sign-Out' },
  { id: 'consult', label: 'Consult Note', tag: 'Specialty' },
];

export const EhrNoteStudioModal: React.FC<EhrNoteStudioModalProps> = ({
  isOpen,
  onClose,
  rawNote,
  toolTitle = 'Clinical Calculator',
  patientTag = '',
  scoreBadge = '',
}) => {
  const { patients, attachScoreToPatient } = useShiftCensus();
  const { addHistoryEntry } = useCalculationHistory();

  const [activeFormat, setActiveFormat] = useState<EhrFormatType>('soap');
  const [attendingName, setAttendingName] = useState('Dr. Smith, MD');
  const [residentName, setResidentName] = useState('Dr. Resident / Fellow, MD');
  const [customImpression, setCustomImpression] = useState('');
  const [selectedBed, setSelectedBed] = useState(patientTag);
  const [prevPatientTag, setPrevPatientTag] = useState(patientTag);
  const [copied, setCopied] = useState(false);
  const [attachedToBedSuccess, setAttachedToBedSuccess] = useState(false);

  if (patientTag !== prevPatientTag) {
    setPrevPatientTag(patientTag);
    setSelectedBed(patientTag);
  }

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

  const formattedNote = useMemo(() => {
    return formatEhrNote(rawNote, activeFormat, {
      patientTag: selectedBed,
      attendingName,
      residentName,
      toolTitle,
      customImpression,
    });
  }, [rawNote, activeFormat, selectedBed, attendingName, residentName, toolTitle, customImpression]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedNote);
      setCopied(true);

      // Auto-log to calculation history
      addHistoryEntry({
        toolId: toolTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20),
        toolTitle,
        ward: 'internal_medicine',
        patientTag: selectedBed || undefined,
        summaryScore: scoreBadge || toolTitle,
        clinicalNoteSnippet: formattedNote.slice(0, 280),
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAttachToCensus = () => {
    if (!selectedBed.trim()) return;
    const ok = attachScoreToPatient(selectedBed, {
      toolId: toolTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20),
      toolTitle,
      scoreBadge: scoreBadge || 'Score Logged',
      summaryText: customImpression || rawNote.split('\n')[0] || 'Evaluated in workstation.',
    });

    if (ok) {
      setAttachedToBedSuccess(true);
      setTimeout(() => setAttachedToBedSuccess(false), 2500);
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Multi-EHR Smart SOAP Studio
                </h3>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800">
                  {toolTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Format and auto-structure bedside notes for Epic, Cerner, or SBAR sign-out
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

        {/* Format Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = activeFormat === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveFormat(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer tap-bounce ${
                  isSelected
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Customizable Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <BedDouble className="w-3 h-3 text-teal-600" />
              <span>Target Patient / Bed</span>
            </label>
            <input
              type="text"
              value={selectedBed}
              onChange={(e) => setSelectedBed(e.target.value)}
              placeholder="e.g. Bed 4A / ICU 2"
              className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-teal-600" />
              <span>Signer / Resident</span>
            </label>
            <input
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-teal-600" />
              <span>Attending of Record</span>
            </label>
            <input
              type="text"
              value={attendingName}
              onChange={(e) => setAttendingName(e.target.value)}
              className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Custom Assessment / Clinical Impression input */}
        <div className="shrink-0">
          <input
            type="text"
            value={customImpression}
            onChange={(e) => setCustomImpression(e.target.value)}
            placeholder="Add custom clinical impression or plan modification (optional)..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 placeholder:text-slate-400"
          />
        </div>

        {/* Formatted Note Preview Body */}
        <div className="flex-1 overflow-y-auto min-h-[160px] bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
          <pre className="whitespace-pre-wrap select-all">{formattedNote}</pre>
        </div>

        {/* Footer Actions: Copy, Bind to Census */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedBed && patients.some((p) => p.bedTag.toLowerCase() === selectedBed.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={handleAttachToCensus}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 hover:bg-teal-100 cursor-pointer tap-bounce"
              >
                {attachedToBedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5" />}
                <span>{attachedToBedSuccess ? 'Score Attached to Bed!' : `Attach to ${selectedBed}`}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer tap-bounce"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy {FORMAT_OPTIONS.find((f) => f.id === activeFormat)?.label}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
