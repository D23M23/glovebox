import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'gb_theme';
export const THEMES = [
  {
    id: 'light',
    label: 'Light',
    desc: 'Clean and bright',
    preview: ['#f9fafb', '#ffffff', '#2563eb'],
  },
  {
    id: 'dark',
    label: 'Dark',
    desc: 'Easy on the eyes',
    preview: ['#0f172a', '#1e293b', '#3b82f6'],
  },
  {
    id: 'access',
    label: 'Accessibility',
    desc: 'High contrast',
    preview: ['#000000', '#111111', '#ffff00'],
  },
  {
    id: 'classic',
    label: 'Classic',
    desc: 'Windows retro',
    preview: ['#c0c0c0', '#d4d0c8', '#000080'],
  },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(THEME_KEY) || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Apply stored theme immediately on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', stored);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
