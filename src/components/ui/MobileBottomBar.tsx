import React, { useState } from 'react';
import {
  Calendar,
  Baby,
  Activity,
  AlertTriangle,
  Pill,
  HeartPulse,
  ShieldAlert,
  Target,
  FlaskConical,
  Heart,
  Flame,
  Gauge,
  ShieldCheck,
  Wind,
  Droplets,
  Thermometer,
  X,
  ChevronUp,
  Check,
  Search,
  Bot,
  Star,
  BedDouble,
} from 'lucide-react';
import type { HospitalWardId } from '../../types/wards';
import type { ToolItem } from '../../constants/tools';
import { useStarredTools } from '../../context/useStarredTools';
import { useShiftCensus } from '../../context/ShiftCensusContext';

interface MobileBottomBarProps {
  activeView: 'home' | 'workstation' | 'shift_board' | 'ai_chat' | 'clinical_wiki';
  setActiveView: (view: 'home' | 'workstation' | 'shift_board' | 'ai_chat' | 'clinical_wiki') => void;
  activeWard: HospitalWardId;
  setActiveWard: (ward: HospitalWardId) => void;
  activeToolId: string;
  onSelectTool: (id: string) => void;
  tools: ToolItem[];
  onOpenSearch?: () => void;
  onOpenChat?: () => void;
  onOpenStarred?: () => void;
}

interface WardDomainTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  toolIds: string[];
}

const WARD_DOMAIN_CONFIG: Record<Exclude<HospitalWardId, 'all'>, WardDomainTab[]> = {
  obgyn: [
    {
      id: 'dating',
      label: 'Dating',
      icon: <Calendar className="w-5 h-5" />,
      toolIds: ['dating', 'antenatal_fetal_suite'],
    },
    {
      id: 'ld',
      label: 'L&D',
      icon: <Baby className="w-5 h-5" />,
      toolIds: ['bishop', 'vbac', 'apgar', 'high_risk_maternal_suite'],
    },
    {
      id: 'fetal',
      label: 'Fetal',
      icon: <Activity className="w-5 h-5" />,
      toolIds: ['fetal_growth', 'antenatal_fetal_suite'],
    },
    {
      id: 'high_risk',
      label: 'High-Risk',
      icon: <AlertTriangle className="w-5 h-5" />,
      toolIds: ['preeclampsia', 'hemorrhage', 'high_risk_maternal_suite'],
    },
    {
      id: 'gyn_meds',
      label: 'Gyn/Meds',
      icon: <Pill className="w-5 h-5" />,
      toolIds: ['popq', 'ovarian', 'hcg', 'dosing', 'gyn_endocrine_suite'],
    },
  ],
  internal_medicine: [
    {
      id: 'renal',
      label: 'Renal',
      icon: <Activity className="w-5 h-5" />,
      toolIds: ['ckd_crcl', 'renal_fluids_suite'],
    },
    {
      id: 'cardio',
      label: 'Cardio',
      icon: <HeartPulse className="w-5 h-5" />,
      toolIds: ['afib_anticoag', 'cardiology_suite'],
    },
    {
      id: 'pulm_vte',
      label: 'Pulm/VTE',
      icon: <ShieldAlert className="w-5 h-5" />,
      toolIds: ['wells_vte', 'curb65', 'psi_port', 'critical_care_suite'],
    },
    {
      id: 'gi_liver',
      label: 'GI/Liver',
      icon: <Target className="w-5 h-5" />,
      toolIds: ['liver_meld_child'],
    },
    {
      id: 'metabolic',
      label: 'Metabolic',
      icon: <FlaskConical className="w-5 h-5" />,
      toolIds: ['electrolytes', 'neuro_systemic_suite'],
    },
  ],
  surgery: [
    {
      id: 'pre_op',
      label: 'Pre-Op',
      icon: <Heart className="w-5 h-5" />,
      toolIds: ['rcri_cardiac', 'goldman_nsqip', 'surgical_preop_suite'],
    },
    {
      id: 'abdomen',
      label: 'Abdomen',
      icon: <Activity className="w-5 h-5" />,
      toolIds: ['appendicitis', 'pancreatitis'],
    },
    {
      id: 'trauma_burn',
      label: 'Trauma/Burn',
      icon: <Flame className="w-5 h-5" />,
      toolIds: ['parkland_burn', 'trauma_acute_suite'],
    },
    {
      id: 'intra_op',
      label: 'Intra-Op',
      icon: <Gauge className="w-5 h-5" />,
      toolIds: ['surgical_apgar'],
    },
    {
      id: 'post_op',
      label: 'Post-Op',
      icon: <ShieldCheck className="w-5 h-5" />,
      toolIds: ['caprini_vte', 'surgical_preop_suite'],
    },
  ],
  pediatrics: [
    {
      id: 'airway_pals',
      label: 'Airway/PALS',
      icon: <Wind className="w-5 h-5" />,
      toolIds: ['pediatric_airway', 'pediatric_gcs', 'peds_emergency_suite'],
    },
    {
      id: 'fluids',
      label: 'Fluids',
      icon: <Droplets className="w-5 h-5" />,
      toolIds: ['holliday_segar'],
    },
    {
      id: 'dosing',
      label: 'Dosing',
      icon: <Pill className="w-5 h-5" />,
      toolIds: ['pediatric_dosing'],
    },
    {
      id: 'vitals',
      label: 'Vitals',
      icon: <Heart className="w-5 h-5" />,
      toolIds: ['pediatric_bp_vitals', 'neonatology_nicu_suite'],
    },
    {
      id: 'infect',
      label: 'Infect/Resp',
      icon: <Thermometer className="w-5 h-5" />,
      toolIds: ['mcisaac_strep', 'pram_asthma', 'peds_emergency_suite'],
    },
  ],
};

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeView,
  setActiveView,
  activeWard,
  activeToolId,
  onSelectTool,
  tools,
  onOpenSearch,
  onOpenChat,
  onOpenStarred,
}) => {
  const { starredIds } = useStarredTools();
  const { patients } = useShiftCensus();
  const [activeSheetDomain, setActiveSheetDomain] = useState<WardDomainTab | null>(null);

  // 0. Dedicated AI Chat View handles its own full-page input & swipe navigation
  if (activeView === 'ai_chat') {
    return null;
  }

  // 1. Floating Command Island for Homepage AND Shift Board
  if (activeView === 'home' || activeView === 'shift_board') {
    return (
      <nav
        aria-label="Mobile Clinical Command Dock"
        className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-[28px] p-2 transition-all"
      >
        <div className="grid grid-cols-4 items-center gap-1.5">
          {/* Symmetrical, Prominent Primary Search Pill */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl bg-teal-50/80 dark:bg-teal-950/50 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 tap-bounce cursor-pointer active:scale-95 transition-all min-h-[54px] shadow-2xs"
            title="Search all 105+ formulas"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center mb-0.5 shadow-xs">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-black tracking-tight text-teal-900 dark:text-teal-200">
              Search
            </span>
          </button>

          {/* Clinical AI */}
          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 tap-bounce cursor-pointer active:scale-95 transition-all min-h-[54px]"
              title="Open MEDABACUS Clinical AI"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center mb-0.5 shadow-2xs">
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Clinical AI</span>
            </button>
          )}

          {/* Starred Favorites */}
          {onOpenStarred && (
            <button
              type="button"
              onClick={onOpenStarred}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 tap-bounce cursor-pointer active:scale-95 transition-all min-h-[54px] relative"
              title="Starred Calculators"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center mb-0.5 shadow-2xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <span className="text-[10px] font-bold tracking-tight text-amber-800 dark:text-amber-300">
                Favorites
              </span>
              {starredIds.length > 0 && (
                <span className="absolute top-1 right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-white shadow-xs">
                  {starredIds.length}
                </span>
              )}
            </button>
          )}

          {/* Shift Board (Identical dock across Home and Shift Board) */}
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'shift_board' ? 'home' : 'shift_board')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl tap-bounce cursor-pointer active:scale-95 transition-all min-h-[54px] relative ${
              activeView === 'shift_board'
                ? 'bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 shadow-2xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={activeView === 'shift_board' ? 'Return to Wards Hub' : 'Open Shift Census & Bed Board'}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center mb-0.5 shadow-2xs ${
                activeView === 'shift_board'
                  ? 'bg-teal-600 dark:bg-teal-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700'
              }`}
            >
              <BedDouble
                className={`w-4 h-4 ${
                  activeView === 'shift_board' ? 'text-white' : 'text-teal-600 dark:text-teal-400'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight ${
                activeView === 'shift_board'
                  ? 'font-black text-teal-900 dark:text-teal-200'
                  : 'font-bold'
              }`}
            >
              {activeView === 'shift_board' ? 'Shift Active' : 'Shift Board'}
            </span>
            {patients.length > 0 && (
              <span className="absolute top-1 right-2 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-teal-600 text-white shadow-xs">
                {patients.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    );
  }

  // 3. Clinical Workstation 5-Domain Navigation
  const effectiveWard: Exclude<HospitalWardId, 'all'> =
    activeWard === 'all' ? 'obgyn' : activeWard;
  const domains = WARD_DOMAIN_CONFIG[effectiveWard] || WARD_DOMAIN_CONFIG.obgyn;

  const handleTabClick = (domain: WardDomainTab) => {
    if (activeSheetDomain?.id === domain.id) {
      setActiveSheetDomain(null);
    } else {
      setActiveSheetDomain(domain);
    }
  };

  const sheetTools = activeSheetDomain
    ? activeSheetDomain.toolIds
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is ToolItem => Boolean(t))
    : [];

  return (
    <>
      {/* Popover Sheet for multi-tool domains */}
      {activeSheetDomain && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={() => setActiveSheetDomain(null)}
        >
          <div
            className="absolute bottom-[calc(66px+max(0.625rem,env(safe-area-inset-bottom,0px)))] left-3 right-3 max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xl space-y-2 animate-drawerSlideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-1">
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {activeSheetDomain.label} Calculators
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-2">
                  ({sheetTools.length} Available)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheetDomain(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer active:scale-90 transition-transform"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
              {sheetTools.map((tool) => {
                const isSelected = activeToolId === tool.id;
                return (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      setActiveSheetDomain(null);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 shrink-0 mt-0.5 shadow-2xs">
                        {tool.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs truncate font-bold text-slate-900 dark:text-white">
                            {tool.title}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {tool.badge.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">
                          {tool.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 mt-1">
                      {isSelected && (
                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Docked Mobile Bottom Navigation Bar (Tailored 5-domain bar) */}
      <nav
        aria-label="Mobile hospital ward navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] transition-colors shadow-lg"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {domains.map((tab) => {
            const isTabActive = tab.toolIds.includes(activeToolId);
            const isSheetOpen = activeSheetDomain?.id === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all relative cursor-pointer select-none tap-bounce active:scale-90 ${
                  isSheetOpen
                    ? 'text-teal-700 dark:text-teal-400 font-extrabold bg-teal-100/80 dark:bg-teal-900/60 shadow-xs ring-1 ring-teal-500/30'
                    : isTabActive
                    ? 'text-teal-700 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/50 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  <ChevronUp
                    className={`w-2.5 h-2.5 absolute -top-1 -right-1 stroke-[3] transition-transform duration-200 ${
                      isSheetOpen
                        ? 'rotate-180 text-teal-600 dark:text-teal-400'
                        : isTabActive
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-bold">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
