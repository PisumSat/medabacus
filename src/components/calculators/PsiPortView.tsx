import { StarButton } from '../ui/StarButton';
import { useState, useMemo } from 'react';
import { RotateCcw, Activity } from 'lucide-react';
import { calculatePsiPort, type PsiPortInput } from '../../calculators/internalMedicine';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface PsiPortViewProps {
  patientTag?: string;
}

export const PsiPortView = ({ patientTag }: PsiPortViewProps) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('psi_port');
  const [age, setAge] = useState(prefill?.age ?? 68);
  const [sex, setSex] = useState<'male' | 'female'>(prefill?.sex ?? 'male');
  const [nursingHome, setNursingHome] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Comorbidities
  const [neoplasm, setNeoplasm] = useState(false);
  const [liverDisease, setLiverDisease] = useState(false);
  const [chf, setChf] = useState(true);
  const [cerebrovascular, setCerebrovascular] = useState(false);
  const [renalDisease, setRenalDisease] = useState(false);

  // Physical Exam
  const [alteredMental, setAlteredMental] = useState(false);
  const [rr30, setRr30] = useState(prefill?.rr30 ?? true);
  const [sbp90, setSbp90] = useState(prefill?.sbp90 ?? false);
  const [tempAbnormal, setTempAbnormal] = useState(false);
  const [pulse125, setPulse125] = useState(false);

  // Labs & Radiology
  const [arterialPh, setArterialPh] = useState(false);
  const [bun30, setBun30] = useState(prefill?.bun30 ?? true);
  const [sodiumLow, setSodiumLow] = useState(prefill?.sodiumLow ?? false);
  const [glucoseHigh, setGlucoseHigh] = useState(prefill?.glucoseHigh ?? false);
  const [hematocritLow, setHematocritLow] = useState(false);
  const [pao2Low, setPao2Low] = useState(true);
  const [pleuralEffusion, setPleuralEffusion] = useState(false);

  const input: PsiPortInput = useMemo(
    () => ({
      ageYears: age,
      sex,
      nursingHomeResident: nursingHome,
      neoplasticDisease: neoplasm,
      liverDisease,
      congestiveHeartFailure: chf,
      cerebrovascularDisease: cerebrovascular,
      renalDisease,
      alteredMentalStatus: alteredMental,
      respiratoryRate30OrMore: rr30,
      systolicBpUnder90: sbp90,
      temperatureUnder35OrOver40: tempAbnormal,
      pulse125OrMore: pulse125,
      arterialPhUnder7_35: arterialPh,
      bun30OrMore: bun30,
      sodiumUnder130: sodiumLow,
      glucose250OrMore: glucoseHigh,
      hematocritUnder30: hematocritLow,
      pao2Under60OrSpo2Under90: pao2Low,
      pleuralEffusion,
    }),
    [
      age,
      sex,
      nursingHome,
      neoplasm,
      liverDisease,
      chf,
      cerebrovascular,
      renalDisease,
      alteredMental,
      rr30,
      sbp90,
      tempAbnormal,
      pulse125,
      arterialPh,
      bun30,
      sodiumLow,
      glucoseHigh,
      hematocritLow,
      pao2Low,
      pleuralEffusion,
    ]
  );

  const result = useMemo(() => calculatePsiPort(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    const positiveFindings: string[] = [];
    if (nursingHome) positiveFindings.push('Nursing home resident (+10)');
    if (neoplasm) positiveFindings.push('Neoplastic disease (+30)');
    if (liverDisease) positiveFindings.push('Liver disease (+20)');
    if (chf) positiveFindings.push('Congestive heart failure (+10)');
    if (cerebrovascular) positiveFindings.push('Cerebrovascular disease (+10)');
    if (renalDisease) positiveFindings.push('Renal disease (+10)');
    if (alteredMental) positiveFindings.push('Altered mental status (+20)');
    if (rr30) positiveFindings.push('RR >= 30/min (+20)');
    if (sbp90) positiveFindings.push('SBP < 90 mmHg (+20)');
    if (tempAbnormal) positiveFindings.push('Temp < 35°C or >= 40°C (+15)');
    if (pulse125) positiveFindings.push('Pulse >= 125 bpm (+10)');
    if (arterialPh) positiveFindings.push('Arterial pH < 7.35 (+30)');
    if (bun30) positiveFindings.push('BUN >= 30 mg/dL (+20)');
    if (sodiumLow) positiveFindings.push('Sodium < 130 mEq/L (+20)');
    if (glucoseHigh) positiveFindings.push('Glucose >= 250 mg/dL (+10)');
    if (hematocritLow) positiveFindings.push('Hct < 30% (+10)');
    if (pao2Low) positiveFindings.push('PaO2 < 60 mmHg or SpO2 < 90% (+10)');
    if (pleuralEffusion) positiveFindings.push('Pleural effusion (+10)');

    return `${prefix}PNEUMONIA SEVERITY INDEX (PSI / PORT SCORE):
- Patient: ${age}yo ${sex} | Demographic Base: ${sex === 'female' ? Math.max(0, age - 10) : age} pts
- Total PSI Score: ${result.score} points (${result.riskClass})
- 30-Day Predicted Mortality: ${result.mortality30DayPercent}%
- Recommended Care Setting: ${result.recommendedSetting}
- Documented Risk Factors: ${positiveFindings.length > 0 ? positiveFindings.join(', ') : 'None'}
- Clinical Management: ${result.managementGuideline}`;
  }, [patientTag, age, sex, nursingHome, neoplasm, liverDisease, chf, cerebrovascular, renalDisease, alteredMental, rr30, sbp90, tempAbnormal, pulse125, arterialPh, bun30, sodiumLow, glucoseHigh, hematocritLow, pao2Low, pleuralEffusion, result]);

  const resetDefaults = () => {
    setAge(68);
    setSex('male');
    setNursingHome(false);
    setNeoplasm(false);
    setLiverDisease(false);
    setChf(true);
    setCerebrovascular(false);
    setRenalDisease(false);
    setAlteredMental(false);
    setRr30(true);
    setSbp90(false);
    setTempAbnormal(false);
    setPulse125(false);
    setArterialPh(false);
    setBun30(true);
    setSodiumLow(false);
    setGlucoseHigh(false);
    setHematocritLow(false);
    setPao2Low(true);
    setPleuralEffusion(false);
    clearPrefill();
  };

  const references = [
    {
      source: 'Fine MJ, et al. N Engl J Med 1997;336(4):243-250',
      title: 'A Prediction Rule to Identify Low-Risk Patients with Community-Acquired Pneumonia',
      details: 'Derivation and multi-center validation of the Pneumonia Patient Outcomes Research Team (PORT) severity score across 14,199 inpatients and 944 outpatients.',
    },
    {
      source: 'Metlay JP, et al. Am J Respir Crit Care Med 2019;200(7):e45-e67',
      title: 'ATS / IDSA Clinical Practice Guideline on Diagnosis and Treatment of Adults with Community-Acquired Pneumonia',
      details: 'Strongly recommends PSI over CURB-65 because PSI has a higher discriminatory power and identifies a larger proportion of low-risk patients suitable for outpatient management.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-32 sm:pb-36 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pneumonia Severity Index (PSI / PORT)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                ATS / IDSA Gold Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fine et al. 20-variable prognostic stratification for community-acquired pneumonia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="psi_port" />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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

      {/* Primary Result Banner */}
      <div className={`p-4 rounded-2xl mb-6 border transition-colors ${
        result.riskClass === 'Class V'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-200'
          : result.riskClass === 'Class IV'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
            : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/80 text-teal-950 dark:text-teal-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black">{result.riskClass}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40">
                Score: {result.score} pts
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40">
                30-Day Mortality: {result.mortality30DayPercent}%
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              Recommended Disposition: <span className="underline font-black">{result.recommendedSetting}</span>
            </p>
          </div>
          <div className="text-xs opacity-90 leading-snug max-w-sm">
            {result.managementGuideline}
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
          1. Patient Demographics
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberStepper
            label="Patient Age"
            unit="years"
            value={age}
            min={18}
            max={110}
            step={1}
            onChange={setAge}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sex (Demographic Points)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSex('male')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  sex === 'male'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Male (+Age)
              </button>
              <button
                type="button"
                onClick={() => setSex('female')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  sex === 'female'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Female (Age - 10)
              </button>
            </div>
          </div>
          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={nursingHome}
                onChange={(e) => setNursingHome(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Nursing Home Resident (+10)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Comorbidities */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          2. Co-Existing Medical Conditions
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { label: 'Neoplastic Disease (active or diagnosed in past year) (+30)', val: neoplasm, set: setNeoplasm },
            { label: 'Liver Disease (cirrhosis or chronic active hepatitis) (+20)', val: liverDisease, set: setLiverDisease },
            { label: 'Congestive Heart Failure (history or active symptoms) (+10)', val: chf, set: setChf },
            { label: 'Cerebrovascular Disease (stroke or transient ischemic attack) (+10)', val: cerebrovascular, set: setCerebrovascular },
            { label: 'Renal Disease (history of chronic renal disease or high Cr) (+10)', val: renalDisease, set: setRenalDisease },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                item.val
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Physical Examination */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          3. Physical Examination Findings
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { label: 'Altered Mental Status (disorientation, stupor, coma) (+20)', val: alteredMental, set: setAlteredMental },
            { label: 'Respiratory Rate >= 30 breaths/min (+20)', val: rr30, set: setRr30 },
            { label: 'Systolic Blood Pressure < 90 mmHg (+20)', val: sbp90, set: setSbp90 },
            { label: 'Temperature < 35°C (95°F) or >= 40°C (104°F) (+15)', val: tempAbnormal, set: setTempAbnormal },
            { label: 'Pulse >= 125 beats/min (+10)', val: pulse125, set: setPulse125 },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                item.val
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Labs and Radiographic */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          4. Laboratory & Radiographic Findings
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { label: 'Arterial pH < 7.35 (+30)', val: arterialPh, set: setArterialPh },
            { label: 'BUN >= 30 mg/dL (10.7 mmol/L) (+20)', val: bun30, set: setBun30 },
            { label: 'Serum Sodium < 130 mEq/L (+20)', val: sodiumLow, set: setSodiumLow },
            { label: 'Glucose >= 250 mg/dL (13.9 mmol/L) (+10)', val: glucoseHigh, set: setGlucoseHigh },
            { label: 'Hematocrit < 30% (+10)', val: hematocritLow, set: setHematocritLow },
            { label: 'PaO2 < 60 mmHg or SpO2 < 90% on room air (+10)', val: pao2Low, set: setPao2Low },
            { label: 'Pleural Effusion on Chest X-Ray or CT (+10)', val: pleuralEffusion, set: setPleuralEffusion },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                item.val
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* EHR Documentation Snippet */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            EHR Clinical Note Snippet
          </span>
          <CopyNoteButton textToCopy={clinicalNote} label="Copy Snippet" />
        </div>
        <textarea
          readOnly
          rows={5}
          value={clinicalNote}
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 select-all"
        />
      </div>

      <ReferenceAccordion references={references} />

      <StickyMobileAction
        scoreBadge={`${result.riskClass} (${result.score} pts)`}
        categoryLabel={result.recommendedSetting}
        noteText={clinicalNote}
        severityColor={result.riskClass === 'Class V' ? 'rose' : result.riskClass === 'Class IV' ? 'amber' : 'teal'}
      />
    </div>
  );
};
