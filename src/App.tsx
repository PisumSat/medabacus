import { useState, useMemo } from 'react';
import {
  BedDouble,
  Check,
  Search,
} from 'lucide-react';

import { StarredToolsProvider } from './context/StarredToolsContext';
import { CalculatorPrefillProvider } from './context/CalculatorPrefillContext';
import { CalculationHistoryProvider } from './context/CalculationHistoryContext';
import { ShiftCensusProvider } from './context/ShiftCensusContext';
import { UserSettingsProvider, useUserSettings } from './context/UserSettingsContext';
import { useCalculatorPrefillContext } from './context/useCalculatorPrefill';
import { Navbar } from './components/Navbar';
import { MobileBottomBar } from './components/ui/MobileBottomBar';
import { AboutModal } from './components/ui/AboutModal';
import { StarredModal } from './components/ui/StarredModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { ClinicalChatModal } from './components/chat/ClinicalChatModal';
import { ClinicalChatView } from './components/chat/ClinicalChatView';
import { HistoryModal } from './components/history/HistoryModal';
import { MobileSearchModal } from './components/ui/MobileSearchModal';
import { ShiftBoardView } from './components/shift/ShiftBoardView';
import { WardHubHome } from './components/WardHubHome';
import type { HospitalWardId } from './types/wards';
import { TOOLS, type ToolItem } from './constants/tools';

// OB/GYN Views
import { DatingView } from './components/calculators/DatingView';
import { BishopView } from './components/calculators/BishopView';
import { VbacView } from './components/calculators/VbacView';
import { FetalGrowthView } from './components/calculators/FetalGrowthView';
import { ApgarView } from './components/calculators/ApgarView';
import { PreeclampsiaView } from './components/calculators/PreeclampsiaView';
import { HemorrhageView } from './components/calculators/HemorrhageView';
import { PopqView } from './components/calculators/PopqView';
import { OvarianView } from './components/calculators/OvarianView';
import { HcgView } from './components/calculators/HcgView';
import { MedicationView } from './components/calculators/MedicationView';

// Internal Medicine Views
import { CkdCrclView } from './components/calculators/CkdCrclView';
import { AfibAnticoagView } from './components/calculators/AfibAnticoagView';
import { VteWellsView } from './components/calculators/VteWellsView';
import { Curb65View } from './components/calculators/Curb65View';
import { PsiPortView } from './components/calculators/PsiPortView';
import { LiverMeldChildView } from './components/calculators/LiverMeldChildView';
import { ElectrolytesView } from './components/calculators/ElectrolytesView';

// General Surgery Views
import { ParklandBurnView } from './components/calculators/ParklandBurnView';
import { AppendicitisView } from './components/calculators/AppendicitisView';
import { RcriCardiacView } from './components/calculators/RcriCardiacView';
import { GoldmanNsqipView } from './components/calculators/GoldmanNsqipView';
import { CapriniVteView } from './components/calculators/CapriniVteView';
import { SurgicalApgarView } from './components/calculators/SurgicalApgarView';
import { PancreatitisView } from './components/calculators/PancreatitisView';

// Pediatrics Views
import { PediatricGcsView } from './components/calculators/PediatricGcsView';
import { HollidaySegarView } from './components/calculators/HollidaySegarView';
import { PediatricAirwayView } from './components/calculators/PediatricAirwayView';
import { PediatricBpVitalsView } from './components/calculators/PediatricBpVitalsView';
import { PediatricDosingView } from './components/calculators/PediatricDosingView';
import { McIsaacStrepView } from './components/calculators/McIsaacStrepView';
import { PramAsthmaView } from './components/calculators/PramAsthmaView';

// Expanded Suite Views
import { CardiologySuiteView } from './components/calculators/CardiologySuiteView';
import { CriticalCarePulmView } from './components/calculators/CriticalCarePulmView';
import { RenalAcidBaseSuiteView } from './components/calculators/RenalAcidBaseSuiteView';
import { NeurologyStrokeSuiteView } from './components/calculators/NeurologyStrokeSuiteView';
import { TraumaAcuteSuiteView } from './components/calculators/TraumaAcuteSuiteView';
import { SurgicalRiskPreopView } from './components/calculators/SurgicalRiskPreopView';
import { NeonatologyNicuView } from './components/calculators/NeonatologyNicuView';
import { PediatricEmergencyView } from './components/calculators/PediatricEmergencyView';
import { AntenatalFetalSuiteView } from './components/calculators/AntenatalFetalSuiteView';
import { HighRiskMaternalView } from './components/calculators/HighRiskMaternalView';
import { GynEndocrineSuiteView } from './components/calculators/GynEndocrineSuiteView';

// Clinical Wiki Master Suites
import MedicineWikiSuiteView from './components/calculators/MedicineWikiSuiteView';
import SurgeryWikiSuiteView from './components/calculators/SurgeryWikiSuiteView';
import PediatricsWikiSuiteView from './components/calculators/PediatricsWikiSuiteView';
import ObgynWikiSuiteView from './components/calculators/ObgynWikiSuiteView';
import { MasterClinicalWikiView } from './components/wiki/MasterClinicalWikiView';
import { findWikiToolById } from './data/clinicalWikiRegistry';

const wardNameMap: Record<HospitalWardId, string> = {
  all: 'All Wards',
  internal_medicine: 'Internal Medicine',
  surgery: 'General Surgery & Trauma',
  obgyn: 'Obstetrics & Gynecology',
  pediatrics: 'Pediatrics & Resuscitation',
};

const wardBadgeMap: Record<HospitalWardId, { label: string; badgeClass: string; shortLabel: string }> = {
  all: {
    label: 'All Wards',
    shortLabel: 'All',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
  internal_medicine: {
    label: 'Internal Med',
    shortLabel: 'Med',
    badgeClass: 'bg-blue-100 dark:bg-blue-950/90 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  surgery: {
    label: 'Surgery',
    shortLabel: 'Surg',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  obgyn: {
    label: 'OB/GYN',
    shortLabel: 'OB',
    badgeClass: 'bg-teal-100 dark:bg-teal-950/90 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  pediatrics: {
    label: 'Pediatrics',
    shortLabel: 'Peds',
    badgeClass: 'bg-sky-100 dark:bg-sky-950/90 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
};

function AppContent() {
  const { settings } = useUserSettings();

  const [activeView, setActiveView] = useState<'home' | 'workstation' | 'shift_board' | 'ai_chat' | 'clinical_wiki'>(() => {
    if (settings.startupView === 'shift_board') return 'shift_board';
    if (settings.startupView === 'ai_chat') return 'ai_chat';
    if (settings.startupView !== 'all') return 'workstation';
    return 'home';
  });
  const [activeWard, setActiveWard] = useState<HospitalWardId>(() => {
    if (settings.startupView !== 'all' && settings.startupView !== 'shift_board' && settings.startupView !== 'ai_chat') {
      return settings.startupView;
    }
    return 'obgyn';
  });
  const [activeToolId, setActiveToolId] = useState<string>('dating');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientTag, setPatientTag] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isStarredOpen, setIsStarredOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { setToolPrefill, version } = useCalculatorPrefillContext();

  const isSearching = Boolean(searchQuery.trim());

  // Task 1: When searching, search across ALL 32 calculators across all wards.
  // When not searching, isolate strictly to the active ward.
  const filteredTools = useMemo(() => {
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      return TOOLS.filter((tool) => {
        const inTitle = tool.title.toLowerCase().includes(q);
        const inSubtitle = tool.subtitle.toLowerCase().includes(q);
        const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
        const inBadge = tool.badge.toLowerCase().includes(q);
        const inWard = tool.ward.toLowerCase().includes(q);
        return inTitle || inSubtitle || inKeywords || inBadge || inWard;
      });
    }

    return TOOLS.filter((tool) => {
      if (activeWard !== 'all' && tool.ward !== activeWard) {
        return false;
      }
      return true;
    });
  }, [searchQuery, isSearching, activeWard]);

  const activeTool = useMemo(() => {
    if (isSearching) {
      if (filteredTools.length === 0) return null;
      const foundInFiltered = filteredTools.find((t) => t.id === activeToolId);
      return foundInFiltered || filteredTools[0];
    }
    return filteredTools.find((t) => t.id === activeToolId) || filteredTools[0] || TOOLS[0];
  }, [activeToolId, filteredTools, isSearching]);

  const handleSelectToolInWorkstation = (tool: ToolItem) => {
    if (tool.id === 'clinical_wiki_master') {
      setActiveView('clinical_wiki');
      return;
    }
    setActiveToolId(tool.id);
    if (activeWard !== tool.ward) {
      setActiveWard(tool.ward);
    }
  };

  const handleLaunchTool = (toolId: string) => {
    if (toolId === 'clinical_wiki_master') {
      setActiveView('clinical_wiki');
      setSearchQuery('');
      return;
    }
    const target = TOOLS.find((t) => t.id === toolId);
    if (target) {
      setActiveWard(target.ward);
      setActiveToolId(target.id);
      setActiveView('workstation');
      setSearchQuery('');
      return;
    }
    const wikiTarget = findWikiToolById(toolId);
    if (wikiTarget) {
      setActiveWard(wikiTarget.ward);
      setActiveToolId(wikiTarget.id);
      setActiveView('clinical_wiki');
      setSearchQuery('');
      return;
    }
  };

  const handleSelectWardFromHome = (wardId: HospitalWardId) => {
    const effectiveWard = wardId === 'all' ? 'obgyn' : wardId;
    setActiveWard(effectiveWard);
    setActiveView('workstation');
    setSearchQuery('');
    const wardTools = TOOLS.filter((t) => t.ward === effectiveWard);
    if (wardTools.length > 0) {
      setActiveToolId(wardTools[0].id);
    }
  };

  const handleLaunchFromAi = (toolId: string, ward: string, prefillValues: Record<string, any>) => {
    setToolPrefill(toolId, prefillValues);
    const target = TOOLS.find((t) => t.id === toolId);
    const effectiveWard = (target?.ward || ward) as HospitalWardId;
    setActiveWard(effectiveWard);
    setActiveToolId(toolId);
    setActiveView('workstation');
    setSearchQuery('');
    setIsChatOpen(false);
  };

  const renderActiveCalculator = (id: string) => {
    switch (id) {
      // Internal Medicine
      case 'ckd_crcl':
        return <CkdCrclView patientTag={patientTag} />;
      case 'afib_anticoag':
        return <AfibAnticoagView patientTag={patientTag} />;
      case 'wells_vte':
        return <VteWellsView patientTag={patientTag} />;
      case 'curb65':
        return <Curb65View patientTag={patientTag} />;
      case 'psi_port':
        return <PsiPortView patientTag={patientTag} />;
      case 'liver_meld_child':
        return <LiverMeldChildView patientTag={patientTag} />;
      case 'electrolytes':
        return <ElectrolytesView patientTag={patientTag} />;

      // General Surgery
      case 'parkland_burn':
        return <ParklandBurnView patientTag={patientTag} />;
      case 'appendicitis':
        return <AppendicitisView patientTag={patientTag} />;
      case 'rcri_cardiac':
        return <RcriCardiacView patientTag={patientTag} />;
      case 'goldman_nsqip':
        return <GoldmanNsqipView patientTag={patientTag} />;
      case 'caprini_vte':
        return <CapriniVteView patientTag={patientTag} />;
      case 'surgical_apgar':
        return <SurgicalApgarView patientTag={patientTag} />;
      case 'pancreatitis':
        return <PancreatitisView patientTag={patientTag} />;

      // Pediatrics
      case 'pediatric_gcs':
        return <PediatricGcsView patientTag={patientTag} />;
      case 'holliday_segar':
        return <HollidaySegarView patientTag={patientTag} />;
      case 'pediatric_airway':
        return <PediatricAirwayView patientTag={patientTag} />;
      case 'pediatric_bp_vitals':
        return <PediatricBpVitalsView patientTag={patientTag} />;
      case 'pediatric_dosing':
        return <PediatricDosingView patientTag={patientTag} />;
      case 'mcisaac_strep':
        return <McIsaacStrepView patientTag={patientTag} />;
      case 'pram_asthma':
        return <PramAsthmaView patientTag={patientTag} />;

      // OB / GYN
      case 'dating':
        return <DatingView patientTag={patientTag} />;
      case 'bishop':
        return <BishopView patientTag={patientTag} />;
      case 'vbac':
        return <VbacView patientTag={patientTag} />;
      case 'fetal_growth':
        return <FetalGrowthView patientTag={patientTag} />;
      case 'apgar':
        return <ApgarView patientTag={patientTag} />;
      case 'preeclampsia':
        return <PreeclampsiaView patientTag={patientTag} />;
      case 'hemorrhage':
        return <HemorrhageView patientTag={patientTag} />;
      case 'popq':
        return <PopqView patientTag={patientTag} />;
      case 'ovarian':
        return <OvarianView patientTag={patientTag} />;
      case 'hcg':
        return <HcgView patientTag={patientTag} />;
      case 'dosing':
        return <MedicationView patientTag={patientTag} />;

      // Expanded Clinical Suites
      case 'cardiology_suite':
        return <CardiologySuiteView patientTag={patientTag} />;
      case 'critical_care_suite':
        return <CriticalCarePulmView patientTag={patientTag} />;
      case 'renal_fluids_suite':
        return <RenalAcidBaseSuiteView patientTag={patientTag} />;
      case 'neuro_systemic_suite':
        return <NeurologyStrokeSuiteView patientTag={patientTag} />;
      case 'trauma_acute_suite':
        return <TraumaAcuteSuiteView patientTag={patientTag} />;
      case 'surgical_preop_suite':
        return <SurgicalRiskPreopView patientTag={patientTag} />;
      case 'neonatology_nicu_suite':
        return <NeonatologyNicuView patientTag={patientTag} />;
      case 'peds_emergency_suite':
        return <PediatricEmergencyView patientTag={patientTag} />;
      case 'antenatal_fetal_suite':
        return <AntenatalFetalSuiteView patientTag={patientTag} />;
      case 'high_risk_maternal_suite':
        return <HighRiskMaternalView patientTag={patientTag} />;
      case 'gyn_endocrine_suite':
        return <GynEndocrineSuiteView patientTag={patientTag} />;

      // Clinical Wiki Master Suites & Tool Mappings
      case 'medicine_wiki_suite':
      case 'ascvd_risk':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="ascvd" />;
      case 'grace_score':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="grace" />;
      case 'geneva_pe':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="geneva" />;
      case 'saag_ascites':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="saag" />;
      case 'maddrey_mdf':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="maddrey" />;
      case 'four_ts_hit':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="hit" />;
      case 'burch_wartofsky':
        return <MedicineWikiSuiteView patientTag={patientTag} initialTab="bwps" />;

      case 'surgery_wiki_suite':
      case 'ripasa_score':
        return <SurgeryWikiSuiteView patientTag={patientTag} initialTab="ripasa" />;
      case 'canadian_cspine':
      case 'nexus_criteria':
        return <SurgeryWikiSuiteView patientTag={patientTag} initialTab="cspine" />;
      case 'lrinec_score':
        return <SurgeryWikiSuiteView patientTag={patientTag} initialTab="lrinec" />;
      case 'forrest_ulcer':
        return <SurgeryWikiSuiteView patientTag={patientTag} initialTab="forrest" />;
      case 'tokyo_tg18':
        return <SurgeryWikiSuiteView patientTag={patientTag} initialTab="tokyo" />;

      case 'pediatrics_wiki_suite':
      case 'bhutani_nomogram':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="bhutani" />;
      case 'kramer_jaundice':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="kramer" />;
      case 'downes_respiratory':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="downes" />;
      case 'bedside_pews':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="pews" />;
      case 'jones_rheumatic':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="jones" />;
      case 'who_muac':
        return <PediatricsWikiSuiteView patientTag={patientTag} initialTab="muac" />;

      case 'obgyn_wiki_suite':
      case 'roma_score':
        return <ObgynWikiSuiteView patientTag={patientTag} initialTab="roma" />;
      case 'amsel_bv':
        return <ObgynWikiSuiteView patientTag={patientTag} initialTab="amsel" />;
      case 'umbilical_doppler':
        return <ObgynWikiSuiteView patientTag={patientTag} initialTab="doppler" />;
      case 'swansea_aflp':
        return <ObgynWikiSuiteView patientTag={patientTag} initialTab="swansea" />;
      case 'palm_coein':
        return <ObgynWikiSuiteView patientTag={patientTag} initialTab="palm" />;

      case 'clinical_wiki_master':
        return (
          <MasterClinicalWikiView
            initialWard={activeWard}
            patientTag={patientTag}
            onBackToHub={() => setActiveView('home')}
          />
        );

      default: {
        const wikiTool = findWikiToolById(id);
        if (wikiTool) {
          return (
            <MasterClinicalWikiView
              initialWard={wikiTool.ward}
              initialToolId={wikiTool.id}
              patientTag={patientTag}
              onBackToHub={() => setActiveView('home')}
            />
          );
        }
        return <DatingView patientTag={patientTag} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-teal-500 selection:text-white text-slate-900 dark:text-slate-100 transition-colors w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeWard={activeWard}
        setActiveWard={setActiveWard}
        activeView={activeView}
        setActiveView={setActiveView}
        patientTag={patientTag}
        setPatientTag={setPatientTag}
        setActiveToolId={setActiveToolId}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenStarred={() => setIsStarredOpen(true)}
        onOpenChat={() => setActiveView('ai_chat')}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSearch={() => setIsMobileSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 ${
          activeView === 'ai_chat' ? 'pt-2 pb-2 sm:pt-4 sm:pb-4' : 'pt-4 pb-36 sm:pb-36 lg:pb-8'
        }`}
      >
        {activeView === 'home' ? (
          /* Uncluttered Homepage Ward Hub */
          <div key="home" className="animate-fadeIn">
            <WardHubHome
              onSelectWard={handleSelectWardFromHome}
              onSelectTool={handleLaunchTool}
              tools={TOOLS}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenChat={() => setActiveView('ai_chat')}
              onOpenWiki={() => setActiveView('clinical_wiki')}
            />
          </div>
        ) : activeView === 'shift_board' ? (
          /* Multi-Patient Ward Shift Board & Census */
          <div key="shift_board" className="animate-fadeIn">
            <ShiftBoardView
              onSelectToolForPatient={(toolId, bedTag) => {
                setPatientTag(bedTag);
                const tool = TOOLS.find((t) => t.id === toolId);
                if (tool) {
                  setActiveWard(tool.ward);
                  setActiveToolId(tool.id);
                  setActiveView('workstation');
                }
              }}
              onSetActiveBed={(bedTag) => setPatientTag(bedTag)}
              activePatientTag={patientTag}
            />
          </div>
        ) : activeView === 'ai_chat' ? (
          /* Dedicated Full-Page Clinical AI View with Swipe-to-Back */
          <div key="ai_chat" className="animate-fadeIn">
            <ClinicalChatView
              onLaunchCalculator={handleLaunchFromAi}
              onBack={() => setActiveView('home')}
            />
          </div>
        ) : activeView === 'clinical_wiki' ? (
          /* ALL-IN-ONE Clinical Calculator Wiki (200+ Scores & Scales) */
          <div key="clinical_wiki" className="animate-fadeIn">
            <MasterClinicalWikiView
              initialWard={activeWard}
              initialToolId={activeToolId}
              patientTag={patientTag}
              onBackToHub={() => setActiveView('home')}
            />
          </div>
        ) : (
          /* Clinical Workstation */
          <div key="workstation" className="animate-fadeIn">
            {/* Tablet / Mobile Quick Jump Horizontal Scrollbar */}
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-between gap-2 mb-2 overflow-hidden">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 truncate">
                  {isSearching ? (
                    `Search Results (${filteredTools.length})`
                  ) : (
                    <>
                      <span className="sm:hidden">{wardBadgeMap[activeWard].label} ({filteredTools.length})</span>
                      <span className="hidden sm:inline">{wardNameMap[activeWard]} ({filteredTools.length})</span>
                    </>
                  )}
                </span>
                {patientTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800 shrink-0">
                    <BedDouble className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{patientTag}</span>
                  </span>
                )}
              </div>

              {/* Decluttered Mobile Quick Jump Chips (Star removed, clean ward badge on search) */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {filteredTools.map((tool) => {
                  const isSelected = activeTool?.id === tool.id;
                  const wardMeta = wardBadgeMap[tool.ward];
                  return (
                    <div
                      key={tool.id}
                      onClick={() => handleSelectToolInWorkstation(tool)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-teal-700 dark:bg-teal-600 text-white border-teal-700 dark:border-teal-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className={isSelected ? 'text-white' : ''}>{tool.icon}</span>
                      <span>{tool.shortTitle}</span>
                      {isSearching && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold border ${
                            isSelected
                              ? 'bg-white/20 text-white border-white/30'
                              : `${wardMeta.badgeClass}`
                          }`}
                        >
                          {wardMeta.shortLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Master Sidebar (Desktop >= lg) */}
              <aside
                aria-label="Clinical calculator directory"
                className="hidden lg:block lg:col-span-4 xl:col-span-3.5 space-y-4 sticky top-20"
              >
                {/* Patient Bed Tag Card */}
                {patientTag ? (
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                        <BedDouble className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider block">
                          Active Patient Bed / ID
                        </span>
                        <span className="text-sm font-bold text-teal-950 dark:text-teal-100">
                          {patientTag.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPatientTag('')}
                      className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline px-2 py-1 cursor-pointer"
                      title="Clear patient tag"
                    >
                      Clear
                    </button>
                  </div>
                ) : null}

                {/* Calculator List Sidebar (Clean, Decluttered, Ward-Badged on Search) */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {isSearching ? 'All Wards Search' : wardNameMap[activeWard]}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {filteredTools.length}
                      </span>
                    </div>
                    {isSearching && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-[110px]">
                        &ldquo;{searchQuery}&rdquo;
                      </span>
                    )}
                  </div>

                  {/* Tool List */}
                  <div className="p-2 space-y-2 max-h-[calc(100vh-230px)] overflow-y-auto">
                    {filteredTools.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        No calculators match &ldquo;{searchQuery}&rdquo; across any ward.
                      </div>
                    ) : isSearching ? (
                      /* Grouped Search Results Across All 4 Wards */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1 text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">
                            Matches grouped by ward:
                          </span>
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>

                        {(['internal_medicine', 'surgery', 'obgyn', 'pediatrics'] as HospitalWardId[]).map((wardId) => {
                          const wardTools = filteredTools.filter((t) => t.ward === wardId);
                          if (wardTools.length === 0) return null;
                          const wardMeta = wardBadgeMap[wardId];

                          return (
                            <div key={wardId} className="space-y-1">
                              <div className="flex items-center justify-between px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <span>{wardNameMap[wardId]}</span>
                                <span className={`px-1.5 py-0.2 rounded border font-extrabold ${wardMeta.badgeClass}`}>
                                  {wardTools.length}
                                </span>
                              </div>

                              {wardTools.map((tool) => {
                                const isSelected = activeTool?.id === tool.id;
                                return (
                                  <div
                                    key={tool.id}
                                    onClick={() => handleSelectToolInWorkstation(tool)}
                                    className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 flex items-start gap-2.5 group cursor-pointer ${
                                      isSelected
                                        ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-400/80 dark:border-teal-700 ring-1 ring-teal-500/20 text-teal-950 dark:text-white shadow-2xs'
                                        : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <div
                                      className={`p-2 rounded-xl shrink-0 transition-colors ${
                                        isSelected
                                          ? 'bg-white dark:bg-slate-800 shadow-2xs'
                                          : 'bg-slate-100 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-700'
                                      }`}
                                    >
                                      {tool.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-0.5">
                                        <span
                                          className={`text-xs font-bold truncate ${
                                            isSelected ? 'text-teal-950 dark:text-teal-200' : 'text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300'
                                          }`}
                                        >
                                          {tool.title}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 line-clamp-1 leading-snug">
                                        {tool.subtitle}
                                      </p>
                                    </div>

                                    {isSelected && (
                                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Ward isolated tools */
                      filteredTools.map((tool) => {
                        const isSelected = activeTool?.id === tool.id;
                        return (
                          <div
                            key={tool.id}
                            onClick={() => handleSelectToolInWorkstation(tool)}
                            className={`w-full p-2.5 rounded-xl text-left transition-all duration-150 flex items-start gap-2.5 group cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-400/80 dark:border-teal-700 ring-1 ring-teal-500/20 text-teal-950 dark:text-white shadow-2xs'
                                : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-white dark:bg-slate-800 shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-700'
                              }`}
                            >
                              {tool.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span
                                  className={`text-xs font-bold truncate ${
                                    isSelected ? 'text-teal-950 dark:text-teal-200' : 'text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300'
                                  }`}
                                >
                                  {tool.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 line-clamp-1 leading-snug">
                                {tool.subtitle}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Sidebar Footer Info */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl+K</kbd> to search</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {isSearching ? `${filteredTools.length} found` : `${filteredTools.length} in Ward`}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                      <span>Crafted by <button type="button" onClick={() => setIsAboutOpen(true)} className="text-slate-700 dark:text-slate-300 font-bold hover:underline cursor-pointer">Pisum</button></span>
                      <button type="button" onClick={() => setIsAboutOpen(true)} className="text-teal-600 dark:text-teal-400 hover:underline font-medium cursor-pointer">About MEDABACUS</button>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right Detail Stage */}
              <section
                aria-label="Active calculator workspace"
                className="lg:col-span-8 xl:col-span-8.5 transition-opacity duration-200"
              >
                {activeTool ? (
                  <div key={`${activeTool.id}_${version}`} className="animate-slideInRight">
                    {renderActiveCalculator(activeTool.id)}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No calculators matched &ldquo;{searchQuery}&rdquo;.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Docked Mobile Bottom Navigation Bar (< lg) */}
      <MobileBottomBar
        activeView={activeView}
        setActiveView={setActiveView}
        activeWard={activeWard}
        setActiveWard={setActiveWard}
        activeToolId={activeTool?.id ?? ''}
        onSelectTool={(id) => {
          setActiveToolId(id);
          setActiveView('workstation');
          setSearchQuery('');
        }}
        tools={TOOLS}
        onOpenSearch={() => setIsMobileSearchOpen(true)}
        onOpenChat={() => setActiveView('ai_chat')}
        onOpenStarred={() => setIsStarredOpen(true)}
      />

      {/* Footer (Desktop & Tablet) */}
      <footer className="hidden lg:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium flex-wrap">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              <span>MEDABACUS</span>
              <span className="text-[9px] uppercase font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-200/60 dark:border-teal-800">
                Hospital Suite
              </span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Crafted by <button type="button" onClick={() => setIsAboutOpen(true)} className="font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer">Pisum</button></span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Contact: <a href="mailto:noraseth23@gmail.com" className="text-teal-700 dark:text-teal-400 hover:underline font-medium">noraseth23@gmail.com</a></span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">
            Point-of-care medical reference covering Internal Medicine, Surgery, OB/GYN, and Pediatrics.
          </p>
        </div>
      </footer>

      {/* Global About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Global Starred Favorites Modal */}
      <StarredModal
        isOpen={isStarredOpen}
        onClose={() => setIsStarredOpen(false)}
        onSelectTool={handleLaunchTool}
        tools={TOOLS}
      />

      {/* Standout Clinical AI Assistant Modal */}
      <ClinicalChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onLaunchCalculator={handleLaunchFromAi}
      />

      {/* Persistent Calculation History & Audit Trail Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLaunchCalculator={handleLaunchFromAi}
      />

      {/* Clinician Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* One-Hand Mobile Search Modal */}
      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        tools={TOOLS}
        onSelectTool={handleLaunchTool}
        onOpenChat={() => {
          setIsMobileSearchOpen(false);
          setActiveView('ai_chat');
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <UserSettingsProvider>
      <StarredToolsProvider>
        <CalculatorPrefillProvider>
          <CalculationHistoryProvider>
            <ShiftCensusProvider>
              <AppContent />
            </ShiftCensusProvider>
          </CalculationHistoryProvider>
        </CalculatorPrefillProvider>
      </StarredToolsProvider>
    </UserSettingsProvider>
  );
}

export default App;
