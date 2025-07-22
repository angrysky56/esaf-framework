/**
 * Sidebar Component for ESAF Framework
 * @fileoverview Navigation sidebar with view switching and status
 */

import React from 'react';
import { FrameworkStatus } from '@/core/types';
import { ViewMode } from './MainInterface';

interface SidebarProps {
  isOpen: boolean;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  status: FrameworkStatus | null;
}

/**
 * Sidebar navigation component
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentView,
  onViewChange,
  status
}) => {
  const navigationItems = [
    {
      id: 'chat' as ViewMode,
      label: 'AI Chat',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'Chat with AI agents'
    },
    {
      id: 'data' as ViewMode,
      label: 'Data Input',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      description: 'Upload and process data'
    },    {
      id: 'dashboard' as ViewMode,
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'System monitoring'
    },
    {
      id: 'agents' as ViewMode,
      label: 'Agents',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Manage AI agents'
    },
    {
      id: 'settings' as ViewMode,
      label: 'Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Configure LLM settings'
    }
  ];

  return (
    <div className={`${
      isOpen ? 'w-64' : 'w-16'
    } bg-gray-900 text-white flex-shrink-0 transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Logo and brand */}
        <div className="flex items-center px-4 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
            </div>
            {isOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold">ESAF</h1>
                <p className="text-xs text-gray-400">Framework</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Status footer */}
        {isOpen && status && (
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={status.isRunning ? 'text-green-400' : 'text-red-400'}>
                  {status.isRunning ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Agents:</span>
                <span className="text-white">{status.activeAgents}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <span className="text-white">{status.pendingTasks}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
