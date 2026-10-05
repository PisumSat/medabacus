import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Grid3X3, RotateCcw } from 'lucide-react';
import { calculatePopqStage, type PopqGridInput } from '../../calculators/popq';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PopqViewProps {
  patientTag?: string;
}

interface PopqPointInputProps {
  label: string;
  sublabel: string;
  hint: string;
  value: number | '';
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

const PopqPointInput: React.FC<PopqPointInputProps> = ({
  label,
  sublabel,
  hint,
  value,
  min = -15,
  max = 15,
  step = 1,
  disabled = false,
  onChange,
}) => {
  const [localText, setLocalText] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused ? localText : (value === '' ? '' : String(value));

  const handleDecrement = () => {
    if (disabled || typeof value !== 'number') return;
    const next = Math.round((value - step) * 10) / 10;
    if (next >= min) {
      onChange(next);
      setLocalText(String(next));
    }
  };

  const handleIncrement = () => {
    if (disabled || typeof value !== 'number') return;
    const next = Math.round((value + step) * 10) / 10;
    if (next <= max) {
      onChange(next);
      setLocalText(String(next));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalText(raw);
    if (raw === '' || raw === '-' || raw === '+') return;
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (disabled) return;
    const parsed = parseFloat(localText);
    if (isNaN(parsed) || localText.trim() === '') {
      setLocalText(value === '' ? '' : String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, parsed));
      const formatted = Math.round(clamped * 10) / 10;
      setLocalText(String(formatted));
      onChange(formatted);
    }
  };

  return (
    <div
      className={`p-2 sm:p-2.5 rounded-xl border shadow-2xs transition-all ${
        disabled
          ? 'bg-slate-100 dark:bg-slate-900 opacity-60 border-slate-200 dark:border-slate-800'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
        <span>{label}</span>
        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{sublabel}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (typeof value === 'number' && value <= min)}
          className="w-6 sm:w-7 h-7 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-25 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 flex items-center justify-center transition-all"
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          disabled={disabled}
          autoComplete="off"
          value={disabled ? 'N/A' : displayValue}
          onFocus={(e) => {
            setIsFocused(true);
            setLocalText(value === '' ? '' : String(value));
            e.target.select();
          }}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className="w-full text-center font-black text-xs sm:text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg py-1 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (typeof value === 'number' && value >= max)}
          className="w-6 sm:w-7 h-7 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-25 rounded-lg text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 flex items-center justify-center transition-all"
        >
          +
        </button>
      </div>
      <span className="text-[10px] text-slate-400 block text-center mt-0.5 truncate">{hint}</span>
    </div>
  );
};

export const PopqView: React.FC<PopqViewProps> = ({ patientTag }) => {
  const [hasHysterectomy, setHasHysterectomy] = useState<boolean>(false);

  // POP-Q 9 points
  const [aa, setAa] = useState<number>(-1);
  const [ba, setBa] = useState<number>(+1);
  const [c, setC] = useState<number>(-4);
  const [gh, setGh] = useState<number>(4);
  const [pb, setPb] = useState<number>(3);
  const [tvl, setTvl] = useState<number>(9);
  const [ap, setAp] = useState<number>(-2);
  const [bp, setBp] = useState<number>(-2);
  const [d, setD] = useState<number>(-6);

  const resetDefaults = () => {
    setHasHysterectomy(false);
    setAa(-1);
    setBa(+1);
    setC(-4);
    setGh(4);
    setPb(3);
    setTvl(9);
    setAp(-2);
    setBp(-2);
    setD(-6);
  };

  const input: PopqGridInput = useMemo(
    () => ({
      aa,
      ba,
      c,
      gh,
      pb,
      tvl,
      ap,
      bp,
      d: hasHysterectomy ? undefined : d,
      hasHysterectomy,
    }),
    [aa, ba, c, gh, pb, tvl, ap, bp, d, hasHysterectomy]
  );

  const result = useMemo(() => calculatePopqStage(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const setPreset = (type: 'stage0' | 'cystocele' | 'procidentia') => {
    if (type === 'stage0') {
      setAa(-3);
      setBa(-3);
      setC(-7);
      setGh(3);
      setPb(3.5);
      setTvl(9);
      setAp(-3);
      setBp(-3);
      setD(-8);
    } else if (type === 'cystocele') {
      setAa(+1);
      setBa(+2);
      setC(-5);
      setGh(4);
      setPb(3);
      setTvl(9);
      setAp(-2);
      setBp(-2);
      setD(-7);
    } else if (type === 'procidentia') {
      setAa(+3);
      setBa(+5);
      setC(+6);
      setGh(5);
      setPb(2);
      setTvl(8);
      setAp(+2);
      setBp(+4);
      setD(+5);
    }
  };

  const references = [
    {
      source: 'ICS / IUGA',
      title: 'Standardization of Terminology of Pelvic Organ Prolapse and Pelvic Floor Dysfunction',
      details: 'Defines 9 precise centimeters anatomical landmarks measured relative to the hymenal ring during maximal Valsalva.',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 214: Pelvic Organ Prolapse',
      details: 'POP-Q is the universally accepted standard for objective clinical documentation and surgical staging.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-3.5 sm:p-6 transition-colors pb-32 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <Grid3X3 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                POP-Q Anatomical Staging Grid
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                ICS Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pelvic Organ Prolapse Quantification system (Stage 0 to IV)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="popq" showLabel />
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

      {/* Preset Action Bar & Cuff Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">
            Clinical Presets:
          </span>
          <button
            type="button"
            onClick={() => setPreset('stage0')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Normal (Stage 0)
          </button>
          <button
            type="button"
            onClick={() => setPreset('cystocele')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cystocele (Stage II)
          </button>
          <button
            type="button"
            onClick={() => setPreset('procidentia')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Procidentia (Stage IV)
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={hasHysterectomy}
            onChange={(e) => setHasHysterectomy(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 border-slate-300"
          />
          <span>Post-Hysterectomy (Cuff)</span>
        </label>
      </div>

      {/* 3x3 POP-Q Grid Table */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
          Enter 9 Examination Points (cm relative to hymen: - proximal, 0 hymen, + beyond)
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-xl mx-auto p-2.5 sm:p-3 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Row 1: Aa, Ba, C */}
          <PopqPointInput
            label="Point Aa"
            sublabel="-3 to +3"
            hint="Ant. wall (3cm)"
            value={aa}
            min={-3}
            max={3}
            step={1}
            onChange={setAa}
          />
          <PopqPointInput
            label="Point Ba"
            sublabel={`-3 to +${tvl}`}
            hint="Upper ant. wall"
            value={ba}
            min={-3}
            max={tvl}
            step={1}
            onChange={setBa}
          />
          <PopqPointInput
            label="Point C"
            sublabel="Cervix/Cuff"
            hint="Cervix / Vault"
            value={c}
            min={-tvl}
            max={tvl}
            step={1}
            onChange={setC}
          />

          {/* Row 2: gh, pb, tvl */}
          <PopqPointInput
            label="gh"
            sublabel="cm"
            hint="Genital Hiatus"
            value={gh}
            min={1}
            max={10}
            step={0.5}
            onChange={setGh}
          />
          <PopqPointInput
            label="pb"
            sublabel="cm"
            hint="Perineal Body"
            value={pb}
            min={1}
            max={10}
            step={0.5}
            onChange={setPb}
          />
          <PopqPointInput
            label="tvl"
            sublabel="cm"
            hint="Total Vaginal L."
            value={tvl}
            min={5}
            max={15}
            step={0.5}
            onChange={setTvl}
          />

          {/* Row 3: Ap, Bp, D */}
          <PopqPointInput
            label="Point Ap"
            sublabel="-3 to +3"
            hint="Post. wall (3cm)"
            value={ap}
            min={-3}
            max={3}
            step={1}
            onChange={setAp}
          />
          <PopqPointInput
            label="Point Bp"
            sublabel={`-3 to +${tvl}`}
            hint="Upper post. wall"
            value={bp}
            min={-3}
            max={tvl}
            step={1}
            onChange={setBp}
          />
          <PopqPointInput
            label="Point D"
            sublabel={hasHysterectomy ? 'N/A' : 'Post. Fornix'}
            hint="Post. fornix"
            value={hasHysterectomy ? '' : d}
            min={-tvl}
            max={tvl}
            step={1}
            disabled={hasHysterectomy}
            onChange={setD}
          />
        </div>
      </div>

      {/* Result Display */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              ICS Standard POP-Q Stage
            </span>
            <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
              <span>{result.stage}</span>
            </div>
            <div className="text-xs text-slate-300 mt-1">{result.stageDescription}</div>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Leading Prolapse Edge:</span>
            <div className="font-bold text-teal-200 text-sm">
              Point {result.leadingEdge.point} ({result.leadingEdge.valueCm >= 0 ? '+' : ''}{result.leadingEdge.valueCm} cm)
            </div>
            <div className="text-[11px] text-slate-300">{result.leadingEdge.compartment}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-200">
          <p className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-0.5">Clinical Management:</span>
            {result.clinicalRecommendation}
          </p>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={`POP-Q: ${result.stage}`}
        categoryLabel={`Edge: ${result.leadingEdge.point} (${result.leadingEdge.valueCm >= 0 ? '+' : ''}${result.leadingEdge.valueCm} cm)`}
        noteText={clinicalNote}
        severityColor="teal"
      />
    </div>
  );
};
