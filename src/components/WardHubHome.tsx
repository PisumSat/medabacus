import React from 'react';
import {
  Search,
  ChevronRight,
  Hospital,
  Bot,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import type { ToolItem } from '../constants/tools';
import type { HospitalWardId } from '../types/wards';
import { HOSPITAL_WARDS } from '../constants/wards';

interface WardHubHomeProps {
  onSelectWard: (wardId: HospitalWardId) => void;
  onSelectTool: (toolId: string) => void;
  tools: ToolItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenChat?: () => void;
  onOpenWiki?: () => void;
}

const WARD_MOBILE_META: Record<HospitalWardId, { title: string; subtitle: string; highYield: string; badge: string }> = {
  internal_medicine: {
    title: 'Internal Medicine',
    subtitle: 'Renal, Cardio, Liver, Critical Care',
    highYield: 'eGFR • AFib • MELD • ABG',
    badge: '65+ Tools',
  },
  surgery: {
    title: 'General Surgery',
    subtitle: 'Trauma, Burns, Pre-Op Clearance',
    highYield: 'Parkland • Appy • VTE • SAS',
    badge: '45+ Tools',
  },
  obgyn: {
    title: 'OB / GYN',
    subtitle: 'Maternal-Fetal, Labor & Delivery',
    highYield: 'Dating • Bishop • VBAC • PET',
    badge: '45+ Tools',
  },
  pediatrics: {
    title: 'Pediatrics',
    subtitle: 'PALS, Resuscitation, Fluids',
    highYield: 'PALS • Holliday • ETT • GCS',
    badge: '45+ Tools',
  },
  all: {
    title: 'All Wards',
    subtitle: 'Complete Clinical Suite',
    highYield: '200+ Clinical Formulas',
    badge: '200+ Tools',
  },
};

export const WardHubHome: React.FC<WardHubHomeProps> = ({
  onSelectWard,
  onSelectTool,
  tools,
  searchQuery,
  setSearchQuery,
  onOpenChat,
  onOpenWiki,
}) => {
  const isSearching = Boolean(searchQuery.trim());

  const searchResults = React.useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tool) => {
      const inTitle = tool.title.toLowerCase().includes(q);
      const inSubtitle = tool.subtitle.toLowerCase().includes(q);
      const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
      const inBadge = tool.badge.toLowerCase().includes(q);
      const inWard = tool.ward.toLowerCase().includes(q);
      return inTitle || inSubtitle || inKeywords || inBadge || inWard;
    });
  }, [tools, searchQuery, isSearching]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 max-w-4xl mx-auto w-full">
      {/* Homepage Header */}
      <section className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px] font-bold">
            <Hospital className="w-3 h-3" />
            <span>Point-of-Care Clinical Suite</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isSearching ? `Search Results for "${searchQuery}"` : 'Hospital Wards Hub'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isSearching
              ? `Found ${searchResults.length} calculator${searchResults.length === 1 ? '' : 's'} across hospital wards`
              : 'Choose a specialized ward workstation or search 105+ clinical calculators across all hospital services.'}
          </p>
        </div>
      </section>

      {/* When searching, show results grouped by ward directly on the Homepage */}
      {isSearching ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Calculators Found Across Wards
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                {searchResults.length} {searchResults.length === 1 ? 'Match' : 'Matches'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400 opacity-50" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No calculators matched &ldquo;{searchQuery}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try searching for clinical entities like &ldquo;burn&rdquo;, &ldquo;egfr&rdquo;, &ldquo;vbac&rdquo;, &ldquo;curb&rdquo;, &ldquo;electrolytes&rdquo;, or &ldquo;pals&rdquo;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {HOSPITAL_WARDS.map((ward) => {
                const wardMatches = searchResults.filter((t) => t.ward === ward.id);
                if (wardMatches.length === 0) return null;

                return (
                  <div
                    key={ward.id}
                    className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-2xs">
                          {ward.icon}
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {ward.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {wardMatches.length} {wardMatches.length === 1 ? 'Calculator' : 'Calculators'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {wardMatches.map((tool) => (
                        <div
                          key={tool.id}
                          onClick={() => onSelectTool(tool.id)}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/50 dark:bg-slate-800/60 dark:hover:bg-teal-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-400 dark:hover:border-teal-700 transition-all cursor-pointer flex items-center justify-between gap-2.5 group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 group-hover:scale-105 transition-transform shrink-0">
                              {tool.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                                {tool.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {tool.subtitle}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-teal-600 dark:text-teal-400 font-bold text-xs">
                            <span className="hidden sm:inline text-[11px]">Open</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Desktop/Tablet Clinical AI Banner (Hidden on Mobile to eliminate duplication) */}
          {onOpenChat && (
            <div
              onClick={onOpenChat}
              className="hidden sm:flex p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 items-center justify-between gap-3 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      MEDABACUS Clinical AI
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                      Auto-Fill Copilot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Paste clinical notes or upload photos/CSV to auto-fill ward calculators
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-600 group-hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all shrink-0">
                <span>Launch AI</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* Master Clinical Calculator Wiki Banner Card */}
          <div
            onClick={onOpenWiki ? onOpenWiki : () => onSelectTool('clinical_wiki_master')}
            className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10 dark:from-teal-950/30 dark:via-sky-950/20 dark:to-indigo-950/30 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-3 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    ALL-IN-ONE Clinical Calculator Wiki
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                    200+ Scores & Scales
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Medicine • Surgery • Pediatrics • OB-GYN guidelines, cutoffs & SOAP notes
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-600 group-hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all shrink-0">
              <span>Explore Wiki</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Large, Touch-Friendly 2x2 Grid of 4 Hospital Ward Buttons */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hospital Wards Directory
              </h2>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Tap ward to open clinical workstation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4.5">
              {HOSPITAL_WARDS.map((ward) => {
                const meta = WARD_MOBILE_META[ward.id];

                return (
                  <button
                    key={ward.id}
                    type="button"
                    onClick={() => onSelectWard(ward.id)}
                    className={`p-3.5 sm:p-6 rounded-3xl border ${ward.borderColor} ${ward.lightBg} ${ward.darkBg} flex flex-col justify-between text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] tap-bounce cursor-pointer group min-h-[155px] sm:min-h-[175px] shadow-xs min-w-0`}
                  >
                    {/* Top Row: Large Ward Icon + Clean Non-Wrapping Badge */}
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        {ward.icon}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-white/95 dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-2xs shrink-0 whitespace-nowrap">
                        {meta.badge}
                      </span>
                    </div>

                    {/* Middle & Bottom: Prominent Title, Clinical Indicators, and Tap Arrow */}
                    <div className="space-y-1.5 mt-auto">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight">
                          {meta.title}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
                      </div>

                      {/* High Yield Key Clinical Tools Tags */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {meta.highYield}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
