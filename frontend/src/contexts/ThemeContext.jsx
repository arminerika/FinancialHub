import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context - Manages dark mode and color theme preferences
 * Supports 6 color themes × 2 modes = 12 total combinations
 */

const ThemeContext = createContext();

// Available color themes
export const COLOR_THEMES = {
  green: {
    name: 'Green',
    light: {
      primary: 'bg-green-600 hover:bg-green-700',
      text: 'text-green-600',
      border: 'border-green-600',
      bg: 'bg-green-50'
    },
    dark: {
      primary: 'bg-green-500 hover:bg-green-600',
      text: 'text-green-400',
      border: 'border-green-500',
      bg: 'bg-green-900/20'
    }
  },
  blue: {
    name: 'Blue',
    light: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600',
      border: 'border-blue-600',
      bg: 'bg-blue-50'
    },
    dark: {
      primary: 'bg-blue-500 hover:bg-blue-600',
      text: 'text-blue-400',
      border: 'border-blue-500',
      bg: 'bg-blue-900/20'
    }
  },
  purple: {
    name: 'Purple',
    light: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      text: 'text-purple-600',
      border: 'border-purple-600',
      bg: 'bg-purple-50'
    },
    dark: {
      primary: 'bg-purple-500 hover:bg-purple-600',
      text: 'text-purple-400',
      border: 'border-purple-500',
      bg: 'bg-purple-900/20'
    }
  },
  orange: {
    name: 'Orange',
    light: {
      primary: 'bg-orange-600 hover:bg-orange-700',
      text: 'text-orange-600',
      border: 'border-orange-600',
      bg: 'bg-orange-50'
    },
    dark: {
      primary: 'bg-orange-500 hover:bg-orange-600',
      text: 'text-orange-400',
      border: 'border-orange-500',
      bg: 'bg-orange-900/20'
    }
  },
  pink: {
    name: 'Pink',
    light: {
      primary: 'bg-pink-600 hover:bg-pink-700',
      text: 'text-pink-600',
      border: 'border-pink-600',
      bg: 'bg-pink-50'
    },
    dark: {
      primary: 'bg-pink-500 hover:bg-pink-600',
      text: 'text-pink-400',
      border: 'border-pink-500',
      bg: 'bg-pink-900/20'
    }
  },
  teal: {
    name: 'Teal',
    light: {
      primary: 'bg-teal-600 hover:bg-teal-700',
      text: 'text-teal-600',
      border: 'border-teal-600',
      bg: 'bg-teal-50'
    },
    dark: {
      primary: 'bg-teal-500 hover:bg-teal-600',
      text: 'text-teal-400',
      border: 'border-teal-500',
      bg: 'bg-teal-900/20'
    }
  }
};

export function ThemeProvider({ children }) {
  // Load saved preferences from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved || 'green';
  });

  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);

  // Update document class for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Get current theme colors
  const getThemeColors = () => {
    const theme = COLOR_THEMES[colorTheme];
    return darkMode ? theme.dark : theme.light;
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const changeColorTheme = (newTheme) => {
    if (COLOR_THEMES[newTheme]) {
      setColorTheme(newTheme);
    }
  };

  const value = {
    darkMode,
    colorTheme,
    toggleDarkMode,
    changeColorTheme,
    getThemeColors,
    availableThemes: Object.keys(COLOR_THEMES)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default ThemeContext;
