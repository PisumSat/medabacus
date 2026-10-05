import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings,
  X,
  Check,
  RotateCcw,
  Hospital,
  FlaskConical,
  FileText,
  User,
  Sliders,
  Trash2,
  Bot,
  BedDouble,
  SlidersHorizontal,
  Palette,
  Sun,
  Moon,
} from 'lucide-react';
import {
  useUserSettings,
  type EhrFormatType,
  type StartupLandingView,
  COLOR_THEMES,
} from '../../context/UserSettingsContext';
import { useShiftCensus } from '../../context/ShiftCensusContext';
import { useCalculationHistory } from '../../context/CalculationHistoryContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    updateColorTheme,
    updateUnits,
    updateClinicianProfile,
    updateInterfacePrefs,
    resetSettings,
  } = useUserSettings();

  const { clearCensus, patients } = useShiftCensus();
  const { clearAllHistory, history } = useCalculationHistory();

  const [activeTab, setActiveTab] = useState<'appearance' | 'general' | 'units' | 'ehr' | 'data'>('appearance');
  const [dataFeedback, setDataFeedback] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const handleToggleThemeMode = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('medabacus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('medabacus_theme', 'light');
    }
  };

  // Keyboard escape listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setDataFeedback(msg);
    setTimeout(() => setDataFeedback(null), 2500);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-teal-100 shadow-2xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-title" className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Clinician Preferences & Settings
              </h2>
              <p className="text-[11px] text-teal-100/80">
                Customize your MEDABACUS workstation, units & EHR profiles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Settings"
            aria-label="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 pt-2 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'units'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Clinical Units</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ehr')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ehr'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EHR Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-teal-600 text-teal-700 dark:text-teal-300'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Shift Data</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {dataFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{dataFeedback}</span>
            </div>
          )}

          {/* TAB 0: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Workstation Color Theme
                </label>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                  Select a vibrant color palette. All calculators, buttons, badges, and EHR cards adapt with high-contrast accessibility:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = settings.colorTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          updateColorTheme(theme.id);
                          showFeedback(`Theme switched to ${theme.name}`);
                        }}
                        className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/60 shadow-xs ring-2 ring-teal-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Swatch preview dots */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-xs border border-white/60 dark:border-black/40 shrink-0"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="w-3 h-3 rounded-full opacity-80 shrink-0"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                            style={{ backgroundColor: theme.lightBg }}
                          />
                          {isSelected && (
                            <span className="ml-auto flex items-center justify-center w-4 h-4 rounded-full bg-teal-600 text-white shadow-2xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {theme.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day / Night Shift Mode (Light vs Dark) */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Shift Lighting Mode
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                  Toggle between daylight mode and dark mode for low-light night shifts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleThemeMode(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      !isDarkMode
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">Day Shift (Light)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">High contrast daylight</span>
                    </div>
                    {!isDarkMode && <Check className="w-3.5 h-3.5 ml-auto text-teal-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleThemeMode(true)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isDarkMode
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center shrink-0">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">Night Shift (Dark)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">OLED midnight slate</span>
                    </div>
                    {isDarkMode && <Check className="w-3.5 h-3.5 ml-auto text-teal-600 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Theme Live Preview Badge */}
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    UI
                  </div>
                  <div>
                    <span className="font-bold text-teal-950 dark:text-teal-200 block">
                      Active: {COLOR_THEMES.find(t => t.id === settings.colorTheme)?.name || 'Clinical Teal'}
                    </span>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400">
                      All calculations, buttons & EHR tools adapt in real time
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-teal-600 text-white font-extrabold text-[10px] uppercase shadow-2xs">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: GENERAL WORKFLOW */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Default Startup Ward & Landing View
                </label>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                  Choose which workstation loads automatically when you open MEDABACUS:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Wards Hub (All)', icon: <Hospital className="w-3.5 h-3.5" /> },
                    { id: 'internal_medicine', label: 'Internal Medicine', icon: <FlaskConical className="w-3.5 h-3.5" /> },
                    { id: 'surgery', label: 'General Surgery', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
                    { id: 'obgyn', label: 'OB / GYN', icon: <User className="w-3.5 h-3.5" /> },
                    { id: 'pediatrics', label: 'Pediatrics', icon: <User className="w-3.5 h-3.5" /> },
                    { id: 'shift_board', label: 'Shift Bed Board', icon: <BedDouble className="w-3.5 h-3.5" /> },
                    { id: 'ai_chat', label: 'Clinical AI Copilot', icon: <Bot className="w-3.5 h-3.5" /> },
                  ].map((opt) => {
                    const isSelected = settings.startupView === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateSettings({ startupView: opt.id as StartupLandingView })}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                          {opt.icon}
                        </div>
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-teal-600 dark:text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Preferences */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Interface Feel & Responsiveness
                </span>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Tactile Tap Feedback Animation
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Subtle bounce on buttons for responsive touchscreen feel
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.interfacePrefs.hapticFeedback}
                    onChange={(e) => updateInterfacePrefs({ hapticFeedback: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Compact Density Mode
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tighter padding for viewing more fields on smaller phone screens
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.interfacePrefs.compactDensity}
                    onChange={(e) => updateInterfacePrefs({ compactDensity: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL UNITS */}
          {activeTab === 'units' && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Standard Clinical Lab & Anthropometric Units
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                  Configures default display and conversion presets across all 105+ hospital formulas:
                </p>
              </div>

              {/* Glucose Unit */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Serum Glucose</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Electrolytes & DKA protocols</span>
                </div>
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateUnits({ glucose: 'mg_dl' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.glucose === 'mg_dl'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    mg/dL
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUnits({ glucose: 'mmol_l' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.glucose === 'mmol_l'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    mmol/L
                  </button>
                </div>
              </div>

              {/* Creatinine Unit */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Serum Creatinine</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">CKD-EPI, CrCl & MELD-Na</span>
                </div>
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateUnits({ creatinine: 'mg_dl' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.creatinine === 'mg_dl'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    mg/dL
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUnits({ creatinine: 'umol_l' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.creatinine === 'umol_l'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    µmol/L
                  </button>
                </div>
              </div>

              {/* Weight Unit */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Patient Weight</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Parkland, Peds Dosing, CrCl</span>
                </div>
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateUnits({ weight: 'kg' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.weight === 'kg'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    kg (Metric)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUnits({ weight: 'lb' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.weight === 'lb'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    lb (Imperial)
                  </button>
                </div>
              </div>

              {/* Height Unit */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Patient Height</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">BMI, Peds Percentiles, CrCl</span>
                </div>
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateUnits({ height: 'cm' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.height === 'cm'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUnits({ height: 'in' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      settings.units.height === 'in'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    inches
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EHR PROFILE & SIGNER */}
          {activeTab === 'ehr' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Default EHR Documentation Format
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2.5">
                  Pre-selects your primary electronic health record format when copying clinical notes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'soap', label: 'Standard SOAP Note', desc: 'Subjective, Objective, Assessment, Plan' },
                    { id: 'epic', label: 'Epic SmartPhrase', desc: 'Native dotphrase macros (@NAME@, @MRN@)' },
                    { id: 'cerner', label: 'Cerner PowerChart', desc: 'Structured electronic co-sign block' },
                    { id: 'sbar', label: 'SBAR Team Sign-Out', desc: 'Situation, Background, Assessment, Rec' },
                    { id: 'consult', label: 'Consultation Note', desc: 'Specialty consult question & recommendations' },
                  ].map((fmt) => {
                    const isSelected = settings.defaultEhrFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => updateSettings({ defaultEhrFormat: fmt.id as EhrFormatType })}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200 shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{fmt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinician Signer Defaults */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Clinician Signer Profiles
                </span>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Your Name & Title (Resident / Fellow / Attending)
                  </label>
                  <input
                    type="text"
                    value={settings.clinicianProfile.signerName}
                    onChange={(e) => updateClinicianProfile({ signerName: e.target.value })}
                    placeholder="e.g. Dr. Jane Doe, MD (PGY-2 Internal Medicine)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Attending Physician of Record
                  </label>
                  <input
                    type="text"
                    value={settings.clinicianProfile.attendingName}
                    onChange={(e) => updateClinicianProfile({ attendingName: e.target.value })}
                    placeholder="e.g. Dr. Marcus Vance, MD (Attending of Record)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.clinicianProfile.includeSignature}
                    onChange={(e) => updateClinicianProfile({ includeSignature: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Automatically append signature & co-signer blocks to copied EHR notes
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: SHIFT DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Shift Census & Calculation Audit Management
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                  Manage patient beds, serial calculation logs, and local browser cache:
                </p>
              </div>

              {/* Census Reset */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Clear Shift Bed Census ({patients.length} active beds)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Removes all tracked patients and active resuscitation countdown timers
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearCensus();
                    showFeedback('Shift bed census cleared successfully.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Clear Census
                </button>
              </div>

              {/* History Reset */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Clear Calculation History ({history.length} calculations logged)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Erases the timestamped audit log of calculations generated during your shift
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearAllHistory();
                    showFeedback('Calculation history log cleared successfully.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Clear History
                </button>
              </div>

              {/* Factory Reset */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Reset All Settings to Defaults
                    </span>
                    <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      Restores default ward, standard units, and clears clinician profile fields
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetSettings();
                      showFeedback('Settings restored to hospital defaults.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Preferences save automatically to your browser cache
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
