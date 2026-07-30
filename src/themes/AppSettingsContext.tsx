import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AppSettings {
  showBackground: boolean;
}

interface AppSettingsContextValue extends AppSettings {
  setShowBackground: (value: boolean) => void;
}

const STORAGE_KEY = 'app-settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { showBackground: true, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { showBackground: true };
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      ...settings,
      setShowBackground: (value) =>
        setSettings((prev) => ({ ...prev, showBackground: value })),
    }),
    [settings]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}
