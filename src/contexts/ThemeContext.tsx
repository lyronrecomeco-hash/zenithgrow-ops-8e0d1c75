import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  card: string;
  sidebar: string;
  success: string;
  warning: string;
  destructive: string;
}

const defaultColors: ThemeColors = {
  primary: '217 91% 60%',
  accent: '199 89% 48%',
  background: '220 25% 6%',
  card: '220 20% 10%',
  sidebar: '220 25% 7%',
  success: '152 69% 41%',
  warning: '38 92% 50%',
  destructive: '0 72% 51%',
};

interface ThemeContextType {
  colors: ThemeColors;
  setColor: (key: keyof ThemeColors, value: string) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyColors(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--ring', colors.primary);
  root.style.setProperty('--sidebar-primary', colors.primary);
  root.style.setProperty('--sidebar-ring', colors.primary);
  root.style.setProperty('--chart-1', colors.primary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--chart-2', colors.accent);
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--card', colors.card);
  root.style.setProperty('--popover', colors.card);
  root.style.setProperty('--sidebar-background', colors.sidebar);
  root.style.setProperty('--success', colors.success);
  root.style.setProperty('--chart-3', colors.success);
  root.style.setProperty('--warning', colors.warning);
  root.style.setProperty('--chart-4', colors.warning);
  root.style.setProperty('--destructive', colors.destructive);
  root.style.setProperty('--chart-5', colors.destructive);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('theme-colors');
    return saved ? JSON.parse(saved) : defaultColors;
  });

  useEffect(() => {
    applyColors(colors);
    localStorage.setItem('theme-colors', JSON.stringify(colors));
  }, [colors]);

  const setColor = (key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const resetColors = () => {
    setColors(defaultColors);
  };

  return (
    <ThemeContext.Provider value={{ colors, setColor, resetColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { defaultColors };
