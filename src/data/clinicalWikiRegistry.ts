import type { WikiCalculatorItem } from './wikiTypes.ts';
import { WIKI_MEDICINE_TOOLS } from './wikiDataMedicine.ts';
import { WIKI_SURGERY_TOOLS } from './wikiDataSurgery.ts';
import { WIKI_PEDIATRICS_TOOLS } from './wikiDataPediatrics.ts';
import { WIKI_OBGYN_TOOLS } from './wikiDataObgyn.ts';

export const ALL_WIKI_TOOLS: WikiCalculatorItem[] = [
  ...WIKI_MEDICINE_TOOLS,
  ...WIKI_SURGERY_TOOLS,
  ...WIKI_PEDIATRICS_TOOLS,
  ...WIKI_OBGYN_TOOLS,
];

export function getWikiToolsByWard(wardId: string): WikiCalculatorItem[] {
  if (wardId === 'all') return ALL_WIKI_TOOLS;
  return ALL_WIKI_TOOLS.filter((t) => t.ward === wardId);
}

export function findWikiToolById(id: string): WikiCalculatorItem | undefined {
  return ALL_WIKI_TOOLS.find((t) => t.id === id);
}

export function searchWikiTools(query: string, wardId?: string): WikiCalculatorItem[] {
  const q = query.toLowerCase().trim();
  const baseList = wardId && wardId !== 'all' ? getWikiToolsByWard(wardId) : ALL_WIKI_TOOLS;
  if (!q) return baseList;

  return baseList.filter((tool) => {
    const inTitle = tool.title.toLowerCase().includes(q);
    const inShort = tool.shortTitle.toLowerCase().includes(q);
    const inCategory = tool.category.toLowerCase().includes(q);
    const inGuideline = tool.guideline.toLowerCase().includes(q);
    const inDesc = tool.description.toLowerCase().includes(q);
    const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));
    return inTitle || inShort || inCategory || inGuideline || inDesc || inKeywords;
  });
}
