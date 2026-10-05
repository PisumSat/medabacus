import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Pill, Siren, RotateCcw } from 'lucide-react';
import { evaluatePreeclampsia, type PreeclampsiaInput } from '../../calculators/preeclampsia';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface PreeclampsiaViewProps {
  patientTag?: string;
}

export const PreeclampsiaView: React.FC<PreeclampsiaViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('preeclampsia');
  const [gaWeeks, setGaWeeks] = useState<number>(33);
  const [gaDays, setGaDays] = useState<number>(4);
  const [sbp, setSbp] = useState<number>(prefill?.sbp ?? 164);
  const [dbp, setDbp] = useState<number>(prefill?.dbp ?? 104);
  const [proteinuria, setProteinuria] = useState<boolean>(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Severe features checkboxes
  const [plateletsLow, setPlateletsLow] = useState<boolean>(
    prefill?.platelets !== undefined ? prefill.platelets < 100 : false
  );
  const [creatinineElevated, setCreatinineElevated] = useState<boolean>(
    prefill?.cr !== undefined ? prefill.cr > 1.1 : false
  );
  const [liverElevated, setLiverElevated] = useState<boolean>(
    prefill?.astAlt !== undefined ? prefill.astAlt > 70 : true
  );
  const [pulmonaryEdema, setPulmonaryEdema] = useState<boolean>(false);
  const [neuroSymptoms, setNeuroSymptoms] = useState<boolean>(
    Boolean(prefill?.headache || prefill?.visionChanges || false)
  );

  const resetDefaults = () => {
    setGaWeeks(33);
    setGaDays(4);
    setSbp(164);
    setDbp(104);
    setProteinuria(true);
    setPlateletsLow(false);
    setCreatinineElevated(false);
    setLiverElevated(true);
    setPulmonaryEdema(false);
    setNeuroSymptoms(true);
    clearPrefill();
  };

  const input: PreeclampsiaInput = useMemo(
    () => ({
      gaWeeks,
      gaDays,
      sbp,
      dbp,
      proteinuria,
      plateletsLow,
      creatinineElevated,
      liverTransaminasesElevated: liverElevated,
      pulmonaryEdema,
      neurologicalSymptoms: neuroSymptoms,
    }),
    [gaWeeks, gaDays, sbp, dbp, proteinuria, plateletsLow, creatinineElevated, liverElevated, pulmonaryEdema, neuroSymptoms]
  );

  const result = useMemo(() => evaluatePreeclampsia(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const references = [
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia (Reaffirmed 2023)',
      details: 'Defines diagnostic criteria, severe features, delivery timing (37w vs 34w), and standardized intrapartum magnesium seizure prophylaxis.',
    },
    {
      source: 'SMFM & ACOG',
      title: 'Committee Opinion No. 767: Emergent Therapy for Acute-Onset, Severe Hypertension During Pregnancy',
      details: 'Recommends IV Labetalol, IV Hydralazine, or oral immediate-release Nifedipine within 30-60 minutes for SBP >= 160 or DBP >= 110.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Preeclampsia & Hypertensive Emergencies
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                ACOG PB 222
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diagnostic criteria with severe features, delivery timing & anti-hypertensive protocols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="preeclampsia" />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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

      {/* Vital Steppers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <NumberStepper
          label="GA Weeks"
          unit="wks"
          value={gaWeeks}
          onChange={setGaWeeks}
          min={20}
          max={42}
        />
        <NumberStepper
          label="GA Days"
          unit="days"
          value={gaDays}
          onChange={setGaDays}
          min={0}
          max={6}
        />
        <NumberStepper
          label="Systolic BP"
          unit="mmHg"
          value={sbp}
          onChange={setSbp}
          min={80}
          max={260}
          step={2}
          helperText="Severe >= 160"
        />
        <NumberStepper
          label="Diastolic BP"
          unit="mmHg"
          value={dbp}
          onChange={setDbp}
          min={40}
          max={160}
          step={2}
          helperText="Severe >= 110"
        />
      </div>

      {/* Proteinuria Toggle */}
      <div className="mb-5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Proteinuria (Significant)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            &ge; 300 mg/24h urine, or UPCR &ge; 0.3 mg/mg, or 2+ dipstick
          </span>
        </div>
        <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setProteinuria(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !proteinuria ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => setProteinuria(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              proteinuria ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Yes
          </button>
        </div>
      </div>

      {/* Severe Features Checklist */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
          Diagnostic Severe Features (ACOG Checklist)
        </label>
        <div className="space-y-2">
          {[
            {
              id: 'neuro',
              label: 'Persistent Severe Headache or Visual Symptoms',
              desc: 'Unresponsive to acetaminophen, scotomata, photopsia, or blurred vision',
              val: neuroSymptoms,
              set: setNeuroSymptoms,
            },
            {
              id: 'liver',
              label: 'Impaired Liver Function / Severe RUQ Pain',
              desc: 'Serum transaminases (AST/ALT) >= 2x upper limit of normal, or severe unyielding epigastric pain',
              val: liverElevated,
              set: setLiverElevated,
            },
            {
              id: 'plt',
              label: 'Thrombocytopenia',
              desc: 'Platelet count < 100,000 / uL',
              val: plateletsLow,
              set: setPlateletsLow,
            },
            {
              id: 'cr',
              label: 'Renal Insufficiency',
              desc: 'Serum creatinine > 1.1 mg/dL or doubling of serum creatinine without baseline renal disease',
              val: creatinineElevated,
              set: setCreatinineElevated,
            },
            {
              id: 'edema',
              label: 'Pulmonary Edema',
              desc: 'Acute pulmonary congestion or rales with dyspnea',
              val: pulmonaryEdema,
              set: setPulmonaryEdema,
            },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                item.val
                  ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <div>
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Result Display */}
      <div
        className={`p-5 rounded-2xl border transition-all mb-4 ${
          result.hasSevereFeatures || result.antihypertensiveIndicated
            ? 'bg-rose-900 text-white'
            : result.diagnosis.includes('Preeclampsia')
              ? 'bg-amber-900 text-white'
              : 'bg-slate-900 text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">
              Clinical Diagnostic Assessment
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>{result.diagnosis}</span>
            </div>
            <div className="text-xs text-rose-100/90 mt-1">
              GA: {gaWeeks}+{gaDays} weeks | Blood Pressure: {sbp}/{dbp} mmHg
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.magnesiumIndicated && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-100 text-xs font-bold">
                <Pill className="w-3.5 h-3.5" />
                <span>MgSO4 Indicated</span>
              </span>
            )}
            {result.antihypertensiveIndicated && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/40 border border-rose-400 text-rose-100 text-xs font-bold animate-pulse">
                <Siren className="w-3.5 h-3.5" />
                <span>Urgent Antihypertensive</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Directives */}
        <div className="mt-4 space-y-2.5 text-xs leading-relaxed">
          {result.urgentActions.map((action, idx) => (
            <div key={idx} className="p-3 bg-white/10 rounded-xl border border-white/15 text-rose-50 font-medium">
              {action}
            </div>
          ))}

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-100">
            <span className="font-bold text-white block mb-0.5">Delivery Timing Plan:</span>
            {result.deliveryRecommendation}
          </div>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={result.diagnosis}
        categoryLabel={`${sbp}/${dbp} mmHg`}
        noteText={clinicalNote}
        severityColor={result.hasSevereFeatures ? 'rose' : result.diagnosis.includes('Preeclampsia') ? 'amber' : 'teal'}
      />
    </div>
  );
};
