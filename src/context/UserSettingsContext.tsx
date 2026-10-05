import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HospitalWardId } from '../types/wards';

export type StartupLandingView = HospitalWardId | 'shift_board' | 'ai_chat';
export type EhrFormatType = 'soap' | 'epic' | 'cerner' | 'sbar' | 'consult';
export type ColorThemeId = 'clinical' | 'ocean' | 'emerald' | 'amethyst' | 'amber' | 'rose';

export interface ColorThemeOption {
  id: ColorThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  lightBg: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    id: 'clinical',
    name: 'Clinical Teal',
    subtitle: 'Medical Teal & Emerald',
    primaryColor: '#0d9488',
    accentColor: '#10b981',
    lightBg: '#f0fdfa',
  },
  {
    id: 'ocean',
    name: 'Ocean Sapphire',
    subtitle: 'Royal Blue & Azure',
    primaryColor: '#2563eb',
    accentColor: '#60a5fa',
    lightBg: '#eff6ff',
  },
  {
    id: 'emerald',
    name: 'Nordic Emerald',
    subtitle: 'Forest Green & Mint',
    primaryColor: '#059669',
    accentColor: '#34d399',
    lightBg: '#ecfdf5',
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    subtitle: 'Vivid Violet & Orchid',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    lightBg: '#f5f3ff',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    subtitle: 'Warm Amber & Coral',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
    lightBg: '#fffbeb',
  },
  {
    id: 'rose',
    name: 'Rose Quartz',
    subtitle: 'Ruby Berry & Rose',
    primaryColor: '#e11d48',
    accentColor: '#fb7185',
    lightBg: '#fff1f2',
  },
];

export interface UserSettings {
  startupView: StartupLandingView;
  colorTheme: ColorThemeId;
  defaultEhrFormat: EhrFormatType;
  units: {
    glucose: 'mg_dl' | 'mmol_l';
    creatinine: 'mg_dl' | 'umol_l';
    weight: 'kg' | 'lb';
    height: 'cm' | 'in';
    bilirubin: 'mg_dl' | 'umol_l';
  };
  clinicianProfile: {
    signerName: string;
    attendingName: string;
    includeSignature: boolean;
    hospitalName: string;
  };
  interfacePrefs: {
    hapticFeedback: boolean;
    compactDensity: boolean;
  };
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  startupView: 'all',
  colorTheme: 'clinical',
  defaultEhrFormat: 'soap',
  units: {
    glucose: 'mg_dl',
    creatinine: 'mg_dl',
    weight: 'kg',
    height: 'cm',
    bilirubin: 'mg_dl',
  },
  clinicianProfile: {
    signerName: '',
    attendingName: '',
    includeSignature: true,
    hospitalName: '',
  },
  interfacePrefs: {
    hapticFeedback: true,
    compactDensity: false,
  },
};

const STORAGE_KEY = 'medabacus_user_settings';

export interface UserSettingsContextValue {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => void;
  updateColorTheme: (theme: ColorThemeId) => void;
  updateUnits: (unitsPartial: Partial<UserSettings['units']>) => void;
  updateClinicianProfile: (profilePartial: Partial<UserSettings['clinicianProfile']>) => void;
  updateInterfacePrefs: (prefsPartial: Partial<UserSettings['interfacePrefs']>) => void;
  resetSettings: () => void;
}

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const savedTheme = (localStorage.getItem('medabacus_color_theme') as ColorThemeId) || undefined;
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed,
          colorTheme: savedTheme || parsed.colorTheme || DEFAULT_USER_SETTINGS.colorTheme,
          units: { ...DEFAULT_USER_SETTINGS.units, ...(parsed.units || {}) },
          clinicianProfile: { ...DEFAULT_USER_SETTINGS.clinicianProfile, ...(parsed.clinicianProfile || {}) },
          interfacePrefs: { ...DEFAULT_USER_SETTINGS.interfacePrefs, ...(parsed.interfacePrefs || {}) },
        };
      } else if (savedTheme) {
        return {
          ...DEFAULT_USER_SETTINGS,
          colorTheme: savedTheme,
        };
      }
    } catch (e) {
      console.error('Failed to load user settings:', e);
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Apply theme to <html> data-theme attribute
  useEffect(() => {
    const theme = settings.colorTheme || 'clinical';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('medabacus_color_theme', theme);
    } catch (e) {
      console.error('Failed to save color theme:', e);
    }
  }, [settings.colorTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save user settings:', e);
    }
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings> | ((prev: UserSettings) => UserSettings)) => {
    setSettings((prev) => {
      if (typeof partial === 'function') {
        return partial(prev);
      }
      return { ...prev, ...partial };
    });
  };

  const updateColorTheme = (theme: ColorThemeId) => {
    setSettings((prev) => ({ ...prev, colorTheme: theme }));
  };

  const updateUnits = (unitsPartial: Partial<UserSettings['units']>) => {
    setSettings((prev) => ({
      ...prev,
      units: { ...prev.units, ...unitsPartial },
    }));
  };

  const updateClinicianProfile = (profilePartial: Partial<UserSettings['clinicianProfile']>) => {
    setSettings((prev) => ({
      ...prev,
      clinicianProfile: { ...prev.clinicianProfile, ...profilePartial },
    }));
  };

  const updateInterfacePrefs = (prefsPartial: Partial<UserSettings['interfacePrefs']>) => {
    setSettings((prev) => ({
      ...prev,
      interfacePrefs: { ...prev.interfacePrefs, ...prefsPartial },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_USER_SETTINGS);
  };

  return (
    <UserSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateColorTheme,
        updateUnits,
        updateClinicianProfile,
        updateInterfacePrefs,
        resetSettings,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};

export function useUserSettings(): UserSettingsContextValue {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return ctx;
}
