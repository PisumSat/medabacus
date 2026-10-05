import React, { useState } from 'react';
import {
  BookOpen,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Check,
  Copy,
} from 'lucide-react';
import type { WikiCalculatorItem, WikiCalculatorResult } from '../../data/wikiTypes';
import { NumberStepper } from '../ui/NumberStepper';

interface WikiCardProps {
  item: WikiCalculatorItem;
  patientTag?: string;
  defaultExpanded?: boolean;
}

export const WikiCard: React.FC<WikiCardProps> = ({
  item,
  patientTag,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showCutoffs, setShowCutoffs] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize form state from default values
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    item.inputs.forEach((inp) => {
      init[inp.id] = inp.defaultValue;
    });
    return init;
  });

  const handleChange = (id: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  // Live calculation
  const result: WikiCalculatorResult = React.useMemo(() => {
    try {
      return item.calculate(formValues, patientTag);
    } catch {
      return {
        score: 'N/A',
        scoreLabel: 'Error',
        interpretation: 'Invalid parameter combinations.',
        severity: 'neutral',
        ehrNote: `[${item.title}]\n- Score: Incomplete or invalid values`,
      };
    }
  }, [item, formValues, patientTag]);

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(result.ehrNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getSeverityStyles = (severity: WikiCalculatorResult['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200';
      case 'high':
        return 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200';
      case 'moderate':
        return 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200';
      case 'low':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
      case 'neutral':
      default:
        return 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-200';
    }
  };

  const getScoreBadgeStyles = (severity: WikiCalculatorResult['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-purple-600 text-white';
      case 'high':
        return 'bg-rose-600 text-white';
      case 'moderate':
        return 'bg-amber-600 text-white';
      case 'low':
        return 'bg-emerald-600 text-white';
      case 'neutral':
      default:
        return 'bg-teal-600 text-white';
    }
  };

  return (
    <div id={`wiki-card-${item.id}`} className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 text-teal-800 dark:text-teal-300">
                <Award className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                {item.guideline}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label={isExpanded ? 'Collapse calculator' : 'Expand calculator'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
          {/* Inputs Section */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Clinical Parameters & Inputs</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {item.inputs.map((input) => (
                <div key={input.id} className="space-y-1">
                  {input.type === 'boolean' && (
                    <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer select-none">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 pr-2">
                        {input.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(formValues[input.id])}
                        onChange={(e) => handleChange(input.id, e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
                      />
                    </label>
                  )}

                  {input.type === 'number' && (
                    <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {input.label}
                        </span>
                        {input.unit && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {input.unit}
                          </span>
                        )}
                      </div>
                      <NumberStepper
                        value={Number(formValues[input.id])}
                        onChange={(val) => handleChange(input.id, val)}
                        min={input.min ?? 0}
                        max={input.max ?? 1000}
                        step={input.step ?? 1}
                        unit={input.unit}
                      />
                    </div>
                  )}

                  {input.type === 'select' && input.options && (
                    <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {input.label}
                      </label>
                      <select
                        value={formValues[input.id]}
                        onChange={(e) => handleChange(input.id, e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 outline-hidden font-medium"
                      >
                        {input.options.map((opt) => (
                          <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-3 pt-2">
            <div className={`p-4 rounded-xl border ${getSeverityStyles(result.severity)} space-y-2.5 transition-all shadow-xs`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-md shadow-xs ${getScoreBadgeStyles(result.severity)}`}>
                    {result.scoreLabel || result.score}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Result & Clinical Risk
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-current shadow-xs hover:bg-white dark:hover:bg-slate-900 transition-all"
                  title="Copy formatted note to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Note</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs font-medium leading-relaxed">
                {result.interpretation}
              </p>

              {result.details && result.details.length > 0 && (
                <div className="pt-2 border-t border-current/15 flex flex-wrap gap-2 text-[11px] opacity-90 font-mono">
                  {result.details.map((det) => (
                    <span key={det} className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {det}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Formula & Cutoffs Accordion */}
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setShowCutoffs(!showCutoffs)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>Formula Logic & Guideline Cutoffs</span>
                </div>
                {showCutoffs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCutoffs && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                  {result.formula && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Info className="w-3 h-3 text-teal-500" />
                        Formula / Methodology:
                      </span>
                      <p className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        {result.formula}
                      </p>
                    </div>
                  )}

                  {item.cutoffs && item.cutoffs.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        Interpretation & Reference Cutoffs:
                      </span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] divide-y divide-slate-200 dark:divide-slate-700">
                          <thead>
                            <tr className="text-slate-400">
                              <th className="py-1 pr-2">Score / Range</th>
                              <th className="py-1 px-2">Clinical Meaning</th>
                              <th className="py-1 pl-2">Recommended Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                            {item.cutoffs.map((row) => (
                              <tr key={row.range} className="text-slate-700 dark:text-slate-300">
                                <td className="py-1.5 pr-2 font-mono font-bold whitespace-nowrap text-teal-600 dark:text-teal-400">
                                  {row.range}
                                </td>
                                <td className="py-1.5 px-2">{row.meaning}</td>
                                <td className="py-1.5 pl-2 text-slate-500 dark:text-slate-400">{row.action || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
