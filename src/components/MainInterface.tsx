/**
 * Main Interface Component for ESAF Framework
 * @fileoverview Modern interface with chat, data input, and system management
 */

import React, { useState, useEffect } from 'react';
import { frameworkInstance } from '@/core/orchestrator.js';
import { FrameworkStatus, AgentInfo, Task } from '@/core/types.js';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ChatInterface } from './ChatInterface.js';
import { DataInputPanel } from './DataInputPanel.js';
import { SystemDashboard } from './SystemDashboard.js';
import { AgentPanel } from './AgentPanel.js';

export type ViewMode = 'chat' | 'data' | 'dashboard' | 'agents';

interface MainInterfaceProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

/**
 * Main interface component managing all application views
 */
export const MainInterface: React.FC<MainInterfaceProps> = ({ 
  isDarkMode, 
  onToggleTheme 
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState<FrameworkStatus | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize the framework and start status polling
   */
  useEffect(() => {
    const initializeFramework = async () => {
      try {
        await frameworkInstance.initialize();
        setIsInitialized(true);
        updateDashboardData();

        // Start polling for updates
        const interval = setInterval(updateDashboardData, 3000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to initialize framework:', error);
        return () => {};
      }
    };

    initializeFramework();
  }, []);

  /**
   * Update dashboard data from the framework
   */
  const updateDashboardData = () => {
    if (!isInitialized) return;

    try {
      const currentStatus = frameworkInstance.getStatus();
      const currentAgents = frameworkInstance.getAgentInfo();
      const currentTasks = frameworkInstance.getTasksByStatus('pending')
        .concat(frameworkInstance.getTasksByStatus('assigned'))
        .concat(frameworkInstance.getTasksByStatus('completed'))
        .slice(0, 50);

      setStatus(currentStatus);
      setAgents(currentAgents);
      setTasks(currentTasks);
    } catch (error) {
      console.error('Error updating dashboard data:', error);
    }
  };

  /**
   * Handle view changes
   */
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  /**
   * Render current view content
   */
  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <ChatInterface 
            frameworkInstance={frameworkInstance}
            isInitialized={isInitialized}
          />
        );
      case 'data':
        return (
          <DataInputPanel
            frameworkInstance={frameworkInstance}
            isInitialized={isInitialized}
            onTaskCreated={updateDashboardData}
          />
        );
      case 'dashboard':
        return (
          <SystemDashboard
            status={status}
            tasks={tasks}
            isInitialized={isInitialized}
            onRefresh={updateDashboardData}
          />
        );
      case 'agents':
        return (
          <AgentPanel
            agents={agents}
            isInitialized={isInitialized}
            onRefresh={updateDashboardData}
          />
        );
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Initializing ESAF Framework
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Starting cognitive agents and preparing the system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        currentView={currentView}
        onViewChange={handleViewChange}
        status={status}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          currentView={currentView}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          status={status}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white dark:bg-gray-800">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};
