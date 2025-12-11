import React, { useState } from "react";
import { useTheme, COLOR_THEMES } from "../contexts/ThemeContext";

/**
 * Theme Selector Component - Allows users to change color theme and toggle dark mode
 */

export default function ThemeSelector() {
  const {
    darkMode,
    colorTheme,
    toggleDarkMode,
    changeColorTheme,
    getThemeColors,
  } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const themeColors = getThemeColors();

  // Theme icons and colors for display
  const themeDisplay = {
    green: { icon: "🍏", color: "bg-green-500" },
    blue: { icon: "❄", color: "bg-blue-500" },
    purple: { icon: "🍆", color: "bg-purple-500" },
    orange: { icon: "🍊", color: "bg-orange-500" },
    pink: { icon: "🌺", color: "bg-pink-500" },
    teal: { icon: "🌊", color: "bg-teal-500" },
  };

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Theme Settings"
      >
        🎨
      </button>

      {/* Theme Picker Dropdown */}
      {showPicker && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker Panel */}
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Theme Settings
            </h3>

            {/* Dark Mode Toggle */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{darkMode ? "🌙" : "☀️"}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Color Theme Selector */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Color Theme
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(COLOR_THEMES).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => changeColorTheme(theme)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      colorTheme === theme
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{themeDisplay[theme].icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {COLOR_THEMES[theme].name}
                      </div>
                      <div
                        className={`h-1.5 w-full rounded-full mt-1 ${themeDisplay[theme].color}`}
                      />
                    </div>
                    {colorTheme === theme && (
                      <span className="text-blue-500 dark:text-blue-400">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Preview:
              </div>
              <button
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${themeColors.primary}`}
              >
                Sample Button
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
