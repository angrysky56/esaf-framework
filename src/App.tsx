/**
 * Main Application Component for ESAF Framework
 * @fileoverview Root component with dark mode, chat, and improved UI
 */

import React, { useState, useEffect } from 'react';
import { MainInterface } from '@/components/MainInterface';
import './App.css';

/**
 * Root application component with theme management
 */
const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('esaf-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = stored === 'dark' || (!stored && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    updateDocumentTheme(shouldUseDark);
  }, []);

  /**
   * Update document theme and localStorage
   */
  const updateDocumentTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('esaf-theme', dark ? 'dark' : 'light');
  };

  /**
   * Toggle theme handler
   */
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    updateDocumentTheme(newTheme);
  };

  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <MainInterface isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
    </div>
  );
};

export default App;
