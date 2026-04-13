import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'gb_theme';
const LAYOUT_KEY = 'gb_layout';

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
  const [layout, setLayoutState] = useState(
    () => localStorage.getItem(LAYOUT_KEY) || 'mobile'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', layout);
    localStorage.setItem(LAYOUT_KEY, layout);
  }, [layout]);

  // Apply stored preferences immediately on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) || 'light';
    const storedLayout = localStorage.getItem(LAYOUT_KEY) || 'mobile';
    document.documentElement.setAttribute('data-theme', storedTheme);
    document.documentElement.setAttribute('data-layout', storedLayout);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, layout, setLayout: setLayoutState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
