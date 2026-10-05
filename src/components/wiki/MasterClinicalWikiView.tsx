import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Layers,
  ArrowLeft,
  X,
  Stethoscope,
  Activity,
  Flame,
  Baby,
  Hospital,
} from 'lucide-react';
import { ALL_WIKI_TOOLS } from '../../data/clinicalWikiRegistry';
import { WikiCard } from './WikiCard';
import type { HospitalWardId } from '../../types/wards';

interface MasterClinicalWikiViewProps {
  initialWard?: HospitalWardId;
  initialToolId?: string;
  patientTag?: string;
  onBackToHub?: () => void;
}

export const MasterClinicalWikiView: React.FC<MasterClinicalWikiViewProps> = ({
  initialWard = 'all',
  initialToolId,
  patientTag,
  onBackToHub,
}) => {
  const [selectedWard, setSelectedWard] = useState<HospitalWardId>(() => {
    if (initialToolId) {
      const tool = ALL_WIKI_TOOLS.find((t) => t.id === initialToolId);
      if (tool) return tool.ward;
    }
    return initialWard;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll to targeted tool or top on mount
  useEffect(() => {
    if (initialToolId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`wiki-card-${initialToolId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [initialToolId]);

  // Filter tools by ward first
  const wardTools = useMemo(() => {
    if (selectedWard === 'all') return ALL_WIKI_TOOLS;
    return ALL_WIKI_TOOLS.filter((t) => t.ward === selectedWard);
  }, [selectedWard]);

  // Extract available categories in this ward
  const categories = useMemo(() => {
    const set = new Set<string>();
    wardTools.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [wardTools]);

  // Derive effective category if selectedCategory is not present in the current ward
  const activeCategory = selectedCategory !== 'all' && !categories.includes(selectedCategory)
    ? 'all'
    : selectedCategory;

  // Filter by category and search query
  const filteredTools = useMemo(() => {
    let list = wardTools;

    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const inTitle = t.title.toLowerCase().includes(q);
        const inShort = t.shortTitle.toLowerCase().includes(q);
        const inCategory = t.category.toLowerCase().includes(q);
        const inGuideline = t.guideline.toLowerCase().includes(q);
        const inKeywords = t.keywords.some((k) => k.toLowerCase().includes(q));
        return inTitle || inShort || inCategory || inGuideline || inKeywords;
      });
    }

    return list;
  }, [wardTools, activeCategory, searchQuery]);

  const wardTabs = [
    { id: 'all' as HospitalWardId, label: 'All Wards', icon: Hospital, count: ALL_WIKI_TOOLS.length },
    { id: 'internal_medicine' as HospitalWardId, label: 'Internal Medicine', icon: Activity, count: ALL_WIKI_TOOLS.filter(t => t.ward === 'internal_medicine').length },
    { id: 'surgery' as HospitalWardId, label: 'Surgery & Trauma', icon: Flame, count: ALL_WIKI_TOOLS.filter(t => t.ward === 'surgery').length },
    { id: 'pediatrics' as HospitalWardId, label: 'Pediatrics', icon: Baby, count: ALL_WIKI_TOOLS.filter(t => t.ward === 'pediatrics').length },
    { id: 'obgyn' as HospitalWardId, label: 'OB / GYN', icon: Stethoscope, count: ALL_WIKI_TOOLS.filter(t => t.ward === 'obgyn').length },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto w-full pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Hospital Hub</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>All-In-One Clinical Calculator Wiki</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {ALL_WIKI_TOOLS.length} Clinical Formulas & Scores
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Clinical Decision Scales & Calculator Wiki
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            High-yield evidence-based scores, diagnostic criteria, and staging systems across Medicine, Surgery, Pediatrics, and OB-GYN. Each card includes interactive inputs, guideline cutoffs, and instant EHR SOAP note export.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wiki by score, guideline, condition (e.g. BODE, DECAF, Sarnat, Robson, Rockall, Gail)..."
            className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ward Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 pt-1">
          {wardTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedWard === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedWard(tab.id);
                  setSelectedCategory('all');
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ml-1 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Sub-Filters */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({wardTools.length})
            </button>
            {categories.map((cat) => {
              const count = wardTools.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredTools.length}</strong> of{' '}
            {ALL_WIKI_TOOLS.length} Clinical Calculators
          </span>
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-teal-600 dark:text-teal-400 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Calculator Cards Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredTools.map((tool) => (
            <WikiCard
              key={tool.id}
              item={tool}
              patientTag={patientTag}
              defaultExpanded={filteredTools.length <= 4 || Boolean(searchQuery.trim()) || tool.id === initialToolId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Clinical Wiki Scores Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No calculators matched your current filter criteria for "{searchQuery}". Try clearing the search query or selecting "All Wards".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
