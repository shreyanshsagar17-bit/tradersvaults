import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    accent: {
      400: string;
      500: string;
      600: string;
    };
    success: {
      400: string;
      500: string;
      600: string;
    };
    danger: {
      400: string;
      500: string;
      600: string;
    };
  };
}

const themes: Theme[] = [
  {
    id: 'dark-blue',
    name: 'Dark Blue (Default)',
    colors: {
      primary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      accent: {
        400: '#facc15',
        500: '#f59e0b',
        600: '#d97706',
      },
      success: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      danger: {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
      }
    }
  },
  {
    id: 'emerald-night',
    name: 'Emerald Night',
    colors: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      accent: {
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
      },
      success: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      danger: {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
      }
    }
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    colors: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
      },
      accent: {
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
      },
      success: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      danger: {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
      }
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      accent: {
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
      },
      success: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      danger: {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
      }
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    colors: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },
      accent: {
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
      },
      success: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      danger: {
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
      }
    }
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('selectedTheme', themeId);
      applyTheme(theme);
    }
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(theme.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });
    
    Object.entries(theme.colors.success).forEach(([key, value]) => {
      root.style.setProperty(`--color-success-${key}`, value);
    });
    
    Object.entries(theme.colors.danger).forEach(([key, value]) => {
      root.style.setProperty(`--color-danger-${key}`, value);
    });
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};