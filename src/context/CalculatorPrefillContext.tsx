import React, { useState, useCallback } from 'react';
import { CalculatorPrefillContext } from './useCalculatorPrefill';

export const CalculatorPrefillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefills, setPrefills] = useState<Record<string, Record<string, any>>>({});
  const [version, setVersion] = useState(0);

  const setToolPrefill = useCallback((toolId: string, values: Record<string, any>) => {
    setPrefills((prev) => ({
      ...prev,
      [toolId]: {
        ...(prev[toolId] || {}),
        ...values,
      },
    }));
    setVersion((v) => v + 1);
  }, []);

  const getToolPrefill = useCallback(
    (toolId: string) => {
      return prefills[toolId];
    },
    [prefills]
  );

  const clearToolPrefill = useCallback((toolId: string) => {
    setPrefills((prev) => {
      const copy = { ...prev };
      delete copy[toolId];
      return copy;
    });
    setVersion((v) => v + 1);
  }, []);

  const hasPrefill = useCallback(
    (toolId: string) => {
      return Boolean(prefills[toolId] && Object.keys(prefills[toolId]).length > 0);
    },
    [prefills]
  );

  return (
    <CalculatorPrefillContext.Provider
      value={{
        prefills,
        setToolPrefill,
        getToolPrefill,
        clearToolPrefill,
        hasPrefill,
        version,
      }}
    >
      {children}
    </CalculatorPrefillContext.Provider>
  );
};
