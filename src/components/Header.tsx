/**
 * Header Component for ESAF Framework
 * @fileoverview Top navigation bar with theme toggle and status
 */

import React from 'react';
import { FrameworkStatus } from '@/core/types';
import { ViewMode } from './MainInterface';

interface HeaderProps {
  currentView: ViewMode;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onMenuToggle: () => void;
  status: FrameworkStatus | null;
}

/**
 * Header component with navigation and controls
 */
export const Header: React.FC<HeaderProps> = ({
  currentView,
  isDarkMode,
  onToggleTheme,
  onMenuToggle,
  status
}) => {
  const getViewTitle = (view: ViewMode): string => {
    switch (view) {
      case 'chat': return 'AI Chat Interface';
      case 'data': return 'Data Input & Processing';
      case 'dashboard': return 'System Dashboard';
      case 'agents': return 'Agent Management';
      default: return 'ESAF Framework';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Open menu"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getViewTitle(currentView)}
            </h1>
            {status && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status.activeAgents} agents active • {status.pendingTasks} pending tasks
              </p>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Status indicator */}
          {status && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status.isRunning ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {status.isRunning ? 'System Online' : 'System Offline'}
              </span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
