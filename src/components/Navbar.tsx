import { useRef, useEffect, useState } from 'react';
import {
  Search,
  X,
  BedDouble,
  Info,
  ArrowLeft,
  Hospital,
  Star,
  Bot,
  Check,
  History,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { AboutModal } from './ui/AboutModal';
import type { HospitalWardId } from '../types/wards';
import { useStarredTools } from '../context/useStarredTools';
import { useShiftCensus } from '../context/ShiftCensusContext';
import { useCalculationHistory } from '../context/CalculationHistoryContext';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeWard: HospitalWardId;
  setActiveWard: (ward: HospitalWardId) => void;
  activeView: 'home' | 'workstation' | 'shift_board' | 'ai_chat' | 'clinical_wiki';
  setActiveView: (view: 'home' | 'workstation' | 'shift_board' | 'ai_chat' | 'clinical_wiki') => void;
  patientTag: string;
  setPatientTag: (tag: string) => void;
  setActiveToolId: (id: string) => void;
  onOpenAbout?: () => void;
  onOpenStarred?: () => void;
  onOpenChat?: () => void;
  onOpenHistory?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

const wardDisplayMap: Record<HospitalWardId, string> = {
  all: 'All Wards',
  internal_medicine: 'Internal Medicine',
  surgery: 'Surgery',
  obgyn: 'OB/GYN',
  pediatrics: 'Pediatrics',
};

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  activeWard,
  activeView,
  setActiveView,
  patientTag,
  setPatientTag,
  onOpenAbout,
  onOpenStarred,
  onOpenChat,
  onOpenHistory,
  onOpenSearch,
  onOpenSettings,
}: NavbarProps) => {
  const { starredIds } = useStarredTools();
  const { patients } = useShiftCensus();
  const { history } = useCalculationHistory();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLocalAboutOpen, setIsLocalAboutOpen] = useState(false);
  const [isMobileBedPopoverOpen, setIsMobileBedPopoverOpen] = useState(false);
  const [tempBedTag, setTempBedTag] = useState(patientTag);
  const handleOpenAbout = onOpenAbout || (() => setIsLocalAboutOpen(true));

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGoHome = () => {
    setActiveView('home');
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Desktop / Tablet Layout (>= sm) */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Brand Logo & Dynamic Active Ward Badge + '← All Wards' Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={handleGoHome}
              title="Return to Hospital Ward Hub Homepage"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Hospital className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MEDABACUS
                </span>
                {activeView === 'workstation' && activeWard !== 'all' ? (
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                    • {wardDisplayMap[activeWard]}
                  </span>
                ) : activeView === 'ai_chat' ? (
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                    • Clinical AI
                  </span>
                ) : activeView === 'clinical_wiki' ? (
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                    • Clinical Wiki
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                    Hospital Suite
                  </span>
                )}
              </div>
            </div>

            {/* "← All Wards" Back Button when inside a ward workstation or AI chat */}
            {(activeView === 'workstation' || activeView === 'ai_chat') && (
              <button
                type="button"
                onClick={handleGoHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
                title="Return to Hospital Wards Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>All Wards</span>
              </button>
            )}

            {/* Shift Board / Census Toggle Button */}
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'shift_board' ? 'workstation' : 'shift_board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1 ${
                activeView === 'shift_board'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
              title="Open Ward Shift Census & Bed Board"
            >
              <BedDouble className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Shift Board</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-200/90 dark:bg-teal-900 text-teal-950 dark:text-teal-200 font-extrabold">
                {patients.length}
              </span>
            </button>
          </div>

          {/* Search Bar (Desktop Center) */}
          <div className="relative flex-1 max-w-sm mx-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search 105+ clinical formulas across all wards (Ctrl+K)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activeView === 'home') {
                  setActiveView('workstation');
                }
              }}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 rounded-xl border border-transparent focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Actions: AI Assistant, Starred, History, Patient Tag, About, ThemeToggle */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 text-white font-bold text-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xs cursor-pointer border border-white/20"
                title="Open MEDABACUS Clinical AI (Auto-Fill & Calculator Mapping)"
              >
                <Bot className="w-3.5 h-3.5 text-teal-200" />
                <span>Clinical AI</span>
              </button>
            )}

            {onOpenStarred && (
              <button
                type="button"
                onClick={onOpenStarred}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="View Starred Calculators"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Starred</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black">
                  {starredIds.length}
                </span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="View Calculation History & Shift Audit Trail"
              >
                <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden xl:inline">History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold">
                  {history.length}
                </span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={patientTag}
                onChange={(e) => setPatientTag(e.target.value)}
                placeholder="Bed / Pt Tag"
                className="w-20 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400 font-medium"
                title="Optional Patient Bed or ID to prepend to copied EHR notes"
              />
            </div>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                title="Clinician Preferences & Settings"
                aria-label="Clinician Settings"
              >
                <Settings className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Settings</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAbout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="About MEDABACUS & Evidence Guidelines"
              aria-label="About MEDABACUS"
            >
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>About</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Layout (< sm) - Sleek, Responsive Header */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between gap-1.5 h-10">
            {/* Left: Brand or Compact Back Pill */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {activeView !== 'home' ? (
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer min-w-0 max-w-[140px] tap-bounce active:scale-95"
                  title="Return to Hospital Ward Hub"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="truncate whitespace-nowrap">
                    {activeView === 'shift_board' ? 'Shift Board' : activeView === 'ai_chat' ? 'Clinical AI' : activeView === 'clinical_wiki' ? 'Clinical Wiki' : wardDisplayMap[activeWard]}
                  </span>
                </button>
              ) : (
                <div
                  className="flex items-center gap-1.5 cursor-pointer select-none shrink-0"
                  onClick={handleGoHome}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-xs shrink-0">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                      MEDABACUS
                    </span>
                    <span className="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 shrink-0">
                      Hub
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* When inside ward pages: display Search, AI, Starred, and Shift Board */}
              {activeView === 'workstation' && (
                <>
                  {onOpenSearch && (
                    <button
                      type="button"
                      onClick={onOpenSearch}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 tap-bounce cursor-pointer active:scale-95 shadow-2xs"
                      title="Search Formulas"
                      aria-label="Search"
                    >
                      <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </button>
                  )}

                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={onOpenChat}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 tap-bounce cursor-pointer active:scale-95 shadow-2xs"
                      title="Clinical AI Copilot"
                      aria-label="Clinical AI"
                    >
                      <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    </button>
                  )}

                  {onOpenStarred && (
                    <button
                      type="button"
                      onClick={onOpenStarred}
                      className="relative p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 tap-bounce cursor-pointer active:scale-95 shadow-2xs"
                      title="Starred Favorites"
                      aria-label="Starred"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      {starredIds.length > 0 && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-black px-1 rounded-full bg-amber-500 text-white">
                          {starredIds.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveView('shift_board')}
                    className="relative p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 tap-bounce cursor-pointer active:scale-95 shadow-2xs"
                    title="Shift Census & Bed Board"
                    aria-label="Shift Board"
                  >
                    <BedDouble className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {patients.length > 0 && (
                      <span className="absolute -top-1 -right-1 text-[8px] font-black px-1 rounded-full bg-teal-600 text-white">
                        {patients.length}
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Compact Bed Tag Button / Popover Trigger */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTempBedTag(patientTag);
                    setIsMobileBedPopoverOpen((prev) => !prev);
                  }}
                  className={`relative p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center tap-bounce active:scale-95 ${
                    patientTag
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title={patientTag ? `Patient Bed: ${patientTag}` : 'Set Patient Bed or Tag'}
                  aria-label="Patient Bed"
                >
                  <BedDouble className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  {patientTag && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal-500 ring-1 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Mobile Bed Tag Dropdown Popover */}
                {isMobileBedPopoverOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 z-50 w-52 p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-2 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <span>Patient Bed / Tag</span>
                      <button
                        type="button"
                        onClick={() => setIsMobileBedPopoverOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={tempBedTag}
                      onChange={(e) => setTempBedTag(e.target.value)}
                      placeholder="e.g. Bed 4A / MRN"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPatientTag('');
                          setTempBedTag('');
                          setIsMobileBedPopoverOpen(false);
                        }}
                        className="px-2 py-1 text-[10px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPatientTag(tempBedTag.trim());
                          setIsMobileBedPopoverOpen(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Button */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 tap-bounce cursor-pointer active:scale-95 shadow-2xs"
                  title="Clinician Settings"
                  aria-label="Clinician Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle className="p-1.5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {!onOpenAbout && (
        <AboutModal isOpen={isLocalAboutOpen} onClose={() => setIsLocalAboutOpen(false)} />
      )}
    </header>
  );
};
