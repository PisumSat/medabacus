import { createContext, useContext } from 'react';

export interface CalculatorPrefillContextType {
  prefills: Record<string, Record<string, any>>;
  setToolPrefill: (toolId: string, values: Record<string, any>) => void;
  getToolPrefill: (toolId: string) => Record<string, any> | undefined;
  clearToolPrefill: (toolId: string) => void;
  hasPrefill: (toolId: string) => boolean;
  version: number;
}

export const CalculatorPrefillContext = createContext<CalculatorPrefillContextType | undefined>(undefined);

export function useCalculatorPrefill(toolId: string) {
  const context = useContext(CalculatorPrefillContext);
  if (!context) {
    return {
      prefill: undefined,
      clearPrefill: () => {},
      setPrefill: () => {},
      hasPrefill: false,
      version: 0,
    };
  }

  return {
    prefill: context.getToolPrefill(toolId),
    clearPrefill: () => context.clearToolPrefill(toolId),
    setPrefill: (values: Record<string, any>) => context.setToolPrefill(toolId, values),
    hasPrefill: context.hasPrefill(toolId),
    version: context.version,
  };
}

export function useCalculatorPrefillContext() {
  const context = useContext(CalculatorPrefillContext);
  if (!context) {
    throw new Error('useCalculatorPrefillContext must be used within a CalculatorPrefillProvider');
  }
  return context;
}
