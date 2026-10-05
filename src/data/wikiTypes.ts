export type WikiInputType = 'number' | 'boolean' | 'select' | 'radio';

export interface WikiSelectOption {
  label: string;
  value: string | number;
  points?: number;
}

export interface WikiInputDef {
  id: string;
  label: string;
  type: WikiInputType;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | boolean | string;
  unit?: string;
  options?: WikiSelectOption[];
  hint?: string;
}

export interface WikiCutoffRow {
  range: string;
  meaning: string;
  action?: string;
}

export interface WikiCalculatorResult {
  score?: number | string;
  scoreLabel?: string;
  interpretation: string;
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'neutral';
  formula?: string;
  details?: string[];
  ehrNote: string;
}

export interface WikiCalculatorItem {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  ward: 'internal_medicine' | 'surgery' | 'pediatrics' | 'obgyn';
  guideline: string;
  description: string;
  keywords: string[];
  inputs: WikiInputDef[];
  cutoffs: WikiCutoffRow[];
  calculate: (values: Record<string, any>, patientTag?: string) => WikiCalculatorResult;
}
