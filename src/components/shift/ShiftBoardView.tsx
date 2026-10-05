import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Trash2,
  Check,
  Copy,
  FileText,
  ArrowRight,
  RotateCcw,
  Timer,
  Play,
  Square,
  X,
} from 'lucide-react';
import { useShiftCensus } from '../../context/ShiftCensusContext';
import type { HospitalWardId } from '../../types/wards';

interface ShiftBoardViewProps {
  onSelectToolForPatient: (toolId: string, bedTag: string) => void;
  onSetActiveBed: (bedTag: string) => void;
  activePatientTag: string;
}

export const ShiftBoardView: React.FC<ShiftBoardViewProps> = ({
  onSelectToolForPatient,
  onSetActiveBed,
  activePatientTag,
}) => {
  const {
    patients,
    addPatient,
    removePatient,
    startPatientTimer,
    stopPatientTimer,
    generateSbarHandoff,
    resetToSampleData,
  } = useShiftCensus();

  // 5-second ticker for live protocol countdown updates
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBedTag, setNewBedTag] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newWard, setNewWard] = useState<HospitalWardId>('internal_medicine');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'M' | 'F' | 'Other'>('M');
  const [newNotes, setNewNotes] = useState('');

  const [isSbarModalOpen, setIsSbarModalOpen] = useState(false);
  const [sbarCopied, setSbarCopied] = useState(false);

  // Timer modal state
  const [timerPatientId, setTimerPatientId] = useState<string | null>(null);
  const [timerLabel, setTimerLabel] = useState('Parkland 8h Resuscitation');
  const [timerMinutes, setTimerMinutes] = useState('480');

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBedTag.trim() || !newDiagnosis.trim()) return;

    addPatient({
      bedTag: newBedTag.trim(),
      admittingDiagnosis: newDiagnosis.trim(),
      ward: newWard,
      age: newAge ? parseInt(newAge, 10) : undefined,
      gender: newGender,
      clinicalNotes: newNotes.trim(),
    });

    setNewBedTag('');
    setNewDiagnosis('');
    setNewAge('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleStartTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerPatientId || !timerLabel.trim()) return;
    const mins = parseInt(timerMinutes, 10) || 60;
    startPatientTimer(timerPatientId, timerLabel.trim(), mins);
    setTimerPatientId(null);
  };

  const handleCopySbar = async () => {
    try {
      await navigator.clipboard.writeText(generateSbarHandoff());
      setSbarCopied(true);
      setTimeout(() => setSbarCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] font-bold">
            <BedDouble className="w-3.5 h-3.5" />
            <span>Ward Shift Census & Multi-Patient Board</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Active Shift Census ({patients.length} Beds)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track serial calculated scores, protocol timers, and generate SBAR handoffs across your patient list.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={resetToSampleData}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold cursor-pointer tap-bounce flex items-center gap-1"
            title="Load sample ward data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Census</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSbarModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer tap-bounce flex items-center gap-1.5 border border-white/20"
          >
            <FileText className="w-3.5 h-3.5 text-teal-200" />
            <span>Generate SBAR Sign-Out</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer tap-bounce flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient Bed</span>
          </button>
        </div>
      </section>

      {/* Patient Bed Cards Grid */}
      {patients.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BedDouble className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
            No active beds in census
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add your admitted patients or click &ldquo;Demo Census&rdquo; to test multi-patient tracking, serial calculation logging, and SBAR generation.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold cursor-pointer tap-bounce"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Bed</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((pt) => {
            const isActive = activePatientTag.trim().toLowerCase() === pt.bedTag.toLowerCase();

            // Calculate timer progress if present
            let timerPercent = 0;
            let timerRemainingMinutes = 0;
            if (pt.timer) {
              const elapsed = currentTime - pt.timer.startedAt;
              timerPercent = Math.min(100, Math.round((elapsed / pt.timer.totalDurationMs) * 100));
              timerRemainingMinutes = Math.max(0, Math.round((pt.timer.totalDurationMs - elapsed) / 60000));
            }

            return (
              <div
                key={pt.id}
                className={`p-4 rounded-3xl border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-400 dark:border-teal-700 ring-2 ring-teal-500/20'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Bed Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {pt.bedTag}
                        </h3>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                            Active Bed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {pt.age ? `${pt.age}yo ` : ''}{pt.gender || ''} • {pt.ward.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePatient(pt.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Remove bed from census"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Admitting Diagnosis */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                    Admitting Diagnosis
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {pt.admittingDiagnosis}
                  </span>
                </div>

                {/* Active Scores Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Calculated Risk Evaluations ({pt.activeScores.length})
                  </span>
                  {pt.activeScores.length === 0 ? (
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                      No scores recorded yet. Set as active bed to log calculations.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {pt.activeScores.map((score, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-extrabold text-teal-950 dark:text-teal-200 block truncate text-[11px]">
                              {score.scoreBadge}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {score.summaryText}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectToolForPatient(score.toolId, pt.bedTag)}
                            className="p-1 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 cursor-pointer shrink-0"
                            title="Open calculator"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resuscitation Protocol Timer */}
                {pt.timer ? (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-[11px]">
                        <Timer className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span className="truncate">{pt.timer.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => stopPatientTimer(pt.id)}
                        className="p-0.5 text-amber-700 dark:text-amber-400 hover:text-amber-900 text-[10px] font-bold cursor-pointer"
                        title="Stop Timer"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-full h-1.5 bg-amber-200 dark:bg-amber-900/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${timerPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                      <span>{timerRemainingMinutes} min remaining</span>
                      <span>Target: {pt.timer.durationMinutes}m</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTimerPatientId(pt.id);
                    }}
                    className="w-full py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5" />
                    <span>Start Resuscitation Protocol Timer</span>
                  </button>
                )}

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSetActiveBed(isActive ? '' : pt.bedTag)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer tap-bounce ${
                      isActive
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isActive ? 'Active Target Bed' : 'Set as Active Bed'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Patient Bed */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-drawerSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Patient Bed to Shift Census
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bed / Room Tag *
                </label>
                <input
                  type="text"
                  required
                  value={newBedTag}
                  onChange={(e) => setNewBedTag(e.target.value)}
                  placeholder="e.g. Bed 4A, ICU 2, L&D Rm 3"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Admitting Diagnosis / Chief Problem *
                </label>
                <input
                  type="text"
                  required
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. DKA, Severe Burn 30%, PPH Stage 2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ward</label>
                  <select
                    value={newWard}
                    onChange={(e) => setNewWard(e.target.value as HospitalWardId)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="internal_medicine">Internal Med</option>
                    <option value="surgery">Surgery</option>
                    <option value="obgyn">OB/GYN</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 54"
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sex</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Clinical Notes / Key Watchouts
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Strict fluid balance; monitor urine output Q1H; call if SBP < 90"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer tap-bounce"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Start Resuscitation Timer */}
      {timerPatientId && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setTimerPatientId(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-3 animate-drawerSlideUp text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-500" />
                <span>Start Protocol Timer</span>
              </h3>
              <button
                type="button"
                onClick={() => setTimerPatientId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartTimer} className="space-y-2.5">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Protocol Target / Label
                </label>
                <input
                  type="text"
                  required
                  value={timerLabel}
                  onChange={(e) => setTimerLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Duration (Minutes)
                </label>
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                >
                  <option value="60">1 Hour (60 min - Vitals / QBL check)</option>
                  <option value="120">2 Hours (120 min - Recheck)</option>
                  <option value="240">4 Hours (240 min - DKA Electrolyte check)</option>
                  <option value="480">8 Hours (480 min - Parkland Initial 8h)</option>
                  <option value="960">16 Hours (960 min - Parkland Remaining 16h)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTimerPatientId(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold tap-bounce"
                >
                  Start Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full SBAR Shift Handoff Note */}
      {isSbarModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setIsSbarModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 space-y-3 animate-drawerSlideUp max-h-[92vh] flex flex-col text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  SBAR Ward Shift Handoff / Sign-Out
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSbarModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono leading-relaxed border border-slate-800 shadow-inner min-h-[220px]">
              <pre className="whitespace-pre-wrap select-all">{generateSbarHandoff()}</pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSbarModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopySbar}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-md tap-bounce"
              >
                {sbarCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{sbarCopied ? 'Copied SBAR Sign-Out!' : 'Copy Handoff Note'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
