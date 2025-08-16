import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <div className="space-y-2 px-4">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
            currentTheme.id === theme.id
              ? 'bg-accent-500/20 text-accent-400'
              : 'text-primary-300 hover:text-white hover:bg-primary-600'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.colors.accent[500] }}
            />
            <span className="text-sm">{theme.name}</span>
          </div>
          {currentTheme.id === theme.id && (
            <Check className="w-4 h-4" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;