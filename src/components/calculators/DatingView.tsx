import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Calendar, AlertCircle, CheckCircle2, Milestone, Baby, RotateCcw } from 'lucide-react';
import { evaluateACOG700Dating, formatDateShort, crlToGestationalAgeDays } from '../../calculators/dating';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface DatingViewProps {
  patientTag?: string;
}

export const DatingView: React.FC<DatingViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('dating');
  const [method, setMethod] = useState<'acog_both' | 'lmp_only' | 'us_only' | 'ivf'>('acog_both');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const defaultLmpStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70); // ~10 weeks ago
    return d.toISOString().split('T')[0];
  }, []);

  const [lmpStr, setLmpStr] = useState(prefill?.lmpDate ?? defaultLmpStr);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [scanDateStr, setScanDateStr] = useState(todayStr);
  const [usGaWeeks, setUsGaWeeks] = useState<number>(() => {
    if (prefill?.crl) {
      const days = crlToGestationalAgeDays(prefill.crl);
      return Math.floor(days / 7);
    }
    return 10;
  });
  const [usGaDays, setUsGaDays] = useState<number>(() => {
    if (prefill?.crl) {
      const days = crlToGestationalAgeDays(prefill.crl);
      return days % 7;
    }
    return 2;
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // IVF
  const [ivfDateStr, setIvfDateStr] = useState(todayStr);
  const [embryoType, setEmbryoType] = useState<'day3' | 'day5' | 'day6' | 'iui'>('day5');

  const resetDefaults = () => {
    setMethod('acog_both');
    setLmpStr(defaultLmpStr);
    setCycleLength(28);
    setScanDateStr(todayStr);
    setUsGaWeeks(10);
    setUsGaDays(2);
    setIvfDateStr(todayStr);
    setEmbryoType('day5');
    clearPrefill();
  };

  const datingResult = useMemo(() => {
    if (method === 'ivf') {
      const transferDate = new Date(ivfDateStr + 'T00:00:00');
      return evaluateACOG700Dating({
        ivfTransferDate: transferDate,
        ivfEmbryoType: embryoType,
      });
    }

    if (method === 'lmp_only') {
      const lmpDate = new Date(lmpStr + 'T00:00:00');
      return evaluateACOG700Dating({
        lmpDate,
        cycleLength,
      });
    }

    if (method === 'us_only') {
      const scanDate = new Date(scanDateStr + 'T00:00:00');
      return evaluateACOG700Dating({
        scanDate,
        usGaWeeks,
        usGaDays,
      });
    }

    // Default: both LMP and US
    const lmpDate = new Date(lmpStr + 'T00:00:00');
    const scanDate = new Date(scanDateStr + 'T00:00:00');
    return evaluateACOG700Dating({
      lmpDate,
      cycleLength,
      scanDate,
      usGaWeeks,
      usGaDays,
    });
  }, [method, lmpStr, cycleLength, scanDateStr, usGaWeeks, usGaDays, ivfDateStr, embryoType]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}OBSTETRIC GESTATIONAL DATING & EDD:
- Dating Method: ${datingResult.datingMethod}
- Clinical EDD: ${formatDateShort(datingResult.finalEdd)}
- Gestational Age Today: ${datingResult.gaToday.weeks} weeks ${datingResult.gaToday.days} days
${datingResult.discrepancyDays !== undefined ? `- Discrepancy: ${datingResult.discrepancyDays} days (${datingResult.acogDiscrepancyRuleApplied ? 'Redated by US' : 'Maintained by LMP'})` : ''}
- Assessment: ${datingResult.explanation}`;
  }, [datingResult, patientTag]);

  const references = [
    {
      source: 'ACOG / AIUM / SMFM',
      title: 'Committee Opinion No. 700: Methods for Estimating the Due Date (Reaffirmed 2023)',
      details: 'Establishes hierarchical standard for EDD assignment and ultrasound discrepancy margins across trimesters.',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 156: Obesity in Pregnancy & Dating Considerations',
      details: 'Emphasizes early first-trimester crown-rump length (CRL) as the most accurate metric.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Gestational Age & EDD Dating
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ACOG Committee Opinion 700 discrepancy resolver & IVF dating
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="dating" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* AI Auto-Populate Banner */}
      {hasPrefill && !bannerDismissed && (
        <AiPrefillBanner
          paramCount={prefill ? Object.keys(prefill).length : undefined}
          onReset={resetDefaults}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Mode Selector Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setMethod('acog_both')}
          className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'acog_both'
              ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          LMP + US (ACOG 700)
        </button>
        <button
          type="button"
          onClick={() => setMethod('lmp_only')}
          className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'lmp_only'
              ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          LMP Only
        </button>
        <button
          type="button"
          onClick={() => setMethod('us_only')}
          className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'us_only'
              ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Ultrasound Only
        </button>
        <button
          type="button"
          onClick={() => setMethod('ivf')}
          className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            method === 'ivf'
              ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          IVF / ART
        </button>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {/* IVF Mode */}
        {method === 'ivf' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transfer / Insemination Date
              </label>
              <input
                type="date"
                value={ivfDateStr}
                onChange={(e) => setIvfDateStr(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Embryo / Procedure Type
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['day3', 'day5', 'day6', 'iui'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEmbryoType(type)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      embryoType === type
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type === 'day3' ? 'Day 3' : type === 'day5' ? 'Day 5' : type === 'day6' ? 'Day 6' : 'IUI'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LMP Inputs */}
        {(method === 'acog_both' || method === 'lmp_only') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Menstrual Period (LMP)
              </label>
              <input
                type="date"
                value={lmpStr}
                onChange={(e) => setLmpStr(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <NumberStepper
                label="Average Cycle Length"
                unit="days"
                value={cycleLength}
                onChange={setCycleLength}
                min={21}
                max={45}
                helperText="Standard 28 days"
              />
            </div>
          </div>
        )}

        {/* Ultrasound Inputs with Touch Steppers */}
        {(method === 'acog_both' || method === 'us_only') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ultrasound Scan Date
              </label>
              <input
                type="date"
                value={scanDateStr}
                onChange={(e) => setScanDateStr(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <NumberStepper
                label="US Weeks"
                unit="wks"
                value={usGaWeeks}
                onChange={setUsGaWeeks}
                min={5}
                max={42}
              />
            </div>
            <div>
              <NumberStepper
                label="US Days"
                unit="days"
                value={usGaDays}
                onChange={setUsGaDays}
                min={0}
                max={6}
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Result Banner */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-md mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-300">
                Official Clinical Dating
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                via {datingResult.datingMethod}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>{datingResult.gaToday.weeks}</span>
              <span className="text-lg font-medium text-teal-200">weeks</span>
              <span>{datingResult.gaToday.days}</span>
              <span className="text-lg font-medium text-teal-200">days</span>
            </div>
            <p className="text-xs text-teal-100/90 pt-1">
              Estimated Due Date (EDD 40w0d):{' '}
              <span className="font-bold text-white underline decoration-teal-400">
                {formatDateShort(datingResult.finalEdd)}
              </span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-1.5 text-xs text-teal-50">
            <div className="flex justify-between items-center text-[11px] text-teal-200">
              <span>Total Gestational Days</span>
              <span className="font-bold text-white">{datingResult.gaToday.totalDays} d</span>
            </div>
            {datingResult.eddLmp && (
              <div className="flex justify-between items-center text-[11px]">
                <span>LMP EDD</span>
                <span className="font-medium text-teal-100">{formatDateShort(datingResult.eddLmp)}</span>
              </div>
            )}
            {datingResult.eddUs && (
              <div className="flex justify-between items-center text-[11px]">
                <span>Ultrasound EDD</span>
                <span className="font-medium text-teal-100">{formatDateShort(datingResult.eddUs)}</span>
              </div>
            )}
            {datingResult.discrepancyDays !== undefined && (
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/10">
                <span>Discrepancy</span>
                <span className={`font-bold ${datingResult.acogDiscrepancyRuleApplied ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {datingResult.discrepancyDays} days
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Interpretation Notice */}
        <div className="mt-4 pt-3.5 border-t border-white/15 flex items-start gap-2.5 text-xs text-teal-100/90 leading-relaxed">
          {datingResult.acogDiscrepancyRuleApplied ? (
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
          )}
          <span>{datingResult.explanation}</span>
        </div>
      </div>

      {/* Gestational Milestones Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          <Milestone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Antenatal Milestones & Scheduling Guide</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {datingResult.milestones.slice(0, 6).map((m, idx) => {
            const isPast = datingResult.gaToday.weeks >= m.week;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  isPast
                    ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500'
                    : 'bg-white dark:bg-slate-800 border-teal-200/80 dark:border-teal-800 text-slate-800 dark:text-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-0.5">
                  <span className="flex items-center gap-1 text-slate-900 dark:text-white">
                    <Baby className={`w-3.5 h-3.5 ${isPast ? 'text-slate-400' : 'text-teal-600 dark:text-teal-400'}`} />
                    <span>{m.week}w0d: {m.title}</span>
                  </span>
                  <span className={`text-[11px] font-bold ${isPast ? 'text-slate-400' : 'text-teal-700 dark:text-teal-300'}`}>
                    {formatDateShort(m.date)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{m.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Evidence Accordion */}
      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar for Phone screen */}
      <StickyMobileAction
        scoreBadge={`${datingResult.gaToday.weeks}w${datingResult.gaToday.days}d`}
        categoryLabel={`EDD: ${formatDateShort(datingResult.finalEdd)}`}
        noteText={clinicalNote}
        severityColor="teal"
      />
    </div>
  );
};
