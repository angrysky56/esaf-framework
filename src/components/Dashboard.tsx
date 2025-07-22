/**
 * Main Dashboard Component for ESAF Framework
 * @fileoverview Displays system status, agent information, and task management
 */

import React, { useState, useEffect } from 'react';
import { frameworkInstance } from '@/core/orchestrator';
import { FrameworkStatus, AgentInfo, Task, TaskPriority } from '@/core/types';
import { AgentCard } from './AgentCard';
import { TaskList } from './TaskList';
import { EventLog } from './EventLog';
import { LLMConfiguration } from './LLMConfiguration';

/**
 * Main dashboard component managing the ESAF framework interface
 */
export const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<FrameworkStatus | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [newTaskType, setNewTaskType] = useState('data_validation');
  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        const interval = setInterval(updateDashboardData, 2000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Failed to initialize framework:', error);
        return () => {}; // Return empty cleanup function
      }
    };

    initializeFramework();
  }, []);

  /**
   * Update dashboard data from the framework
   */
  const updateDashboardData = () => {
    if (!isInitialized) return;

    const currentStatus = frameworkInstance.getStatus();
    const currentAgents = frameworkInstance.getAgentInfo();
    const currentTasks = frameworkInstance.getTasksByStatus('pending')
      .concat(frameworkInstance.getTasksByStatus('assigned'))
      .concat(frameworkInstance.getTasksByStatus('completed'))
      .slice(0, 20); // Limit to recent tasks

    setStatus(currentStatus);
    setAgents(currentAgents);
    setTasks(currentTasks);
  };

  /**
   * Handle creating a new test task with cognitive capabilities
   */
  const handleCreateTask = async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    try {
      let taskPayload: Record<string, unknown>;

      // Prepare different payloads based on task type
      switch (newTaskType) {
        case 'intelligent_analysis':
          taskPayload = {
            data: {
              sales: [1000, 1200, 950, 1400, 1100],
              customers: [45, 52, 41, 67, 58],
              products: ['A', 'B', 'C', 'D', 'E'],
              dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05']
            },
            query: customQuery || 'Analyze this sales data and identify trends, patterns, and provide actionable insights.'
          };
          break;
          
        case 'feature_extraction':
          taskPayload = {
            data: {
              user_profiles: [
                { age: 25, income: 50000, purchases: 12, category: 'tech' },
                { age: 34, income: 75000, purchases: 8, category: 'fashion' },
                { age: 45, income: 90000, purchases: 15, category: 'home' },
                { age: 28, income: 60000, purchases: 20, category: 'tech' }
              ]
            },
            extractionMethod: 'cognitive-bayesian'
          };
          break;
          
        case 'anomaly_detection':
          taskPayload = {
            data: [1, 2, 1.5, 2.1, 1.8, 2.3, 1.9, 15.7, 2.1, 1.7, 2.0] // Contains obvious outlier
          };
          break;
          
        default: // data_validation and data_backup
          taskPayload = {
            dataSources: [
              {
                id: 'sample-api-1',
                type: 'api',
                status: 'verified',
                lastUpdated: Date.now(),
                reliability: 0.85
              },
              {
                id: 'sample-file-1', 
                type: 'file',
                status: 'unverified',
                lastUpdated: Date.now() - 3600000, // 1 hour ago
                reliability: 0.6
              },
              {
                id: 'sample-db-1',
                type: 'database',
                status: 'verified',
                lastUpdated: Date.now() - 7200000, // 2 hours ago
                reliability: 0.92
              }
            ]
          };
          break;
      }

      await frameworkInstance.createTask(
        newTaskType,
        taskPayload,
        TaskPriority.MEDIUM
      );

      updateDashboardData();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format uptime for display
   */
  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Initializing ESAF Framework...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ESAF Framework Dashboard
          </h1>
          <p className="text-gray-600">
            Evolved Synergistic Agentic Framework - Multi-Agent Cognitive System
          </p>
        </div>

        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  status.isRunning ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {status.isRunning ? 'Running' : 'Stopped'}
              </p>
              <p className="text-sm text-gray-500">
                Uptime: {formatUptime(status.uptime)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
              <p className="text-2xl font-semibold text-gray-900">{status.activeAgents}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
              <p className="text-2xl font-semibold text-yellow-600">{status.pendingTasks}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Completed/Failed</h3>
              <p className="text-2xl font-semibold text-green-600">
                {status.completedTasks}
                <span className="text-red-600">/{status.failedTasks}</span>
              </p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agents Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Agents</h2>
              </div>
              <div className="p-6 space-y-4">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          </div>

          {/* Tasks and Controls Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Creation */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Create Cognitive Task</h2>
                <p className="text-sm text-gray-500">Test the AI-powered cognitive agents</p>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <label htmlFor="task-type-select" className="sr-only">
                    Task Type
                  </label>
                  <select
                    id="task-type-select"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Task Type"
                  >
                    <option value="data_validation">🔍 Data Validation (Bayesian Analysis)</option>
                    <option value="feature_extraction">📊 Feature Extraction (Cognitive Analysis)</option>
                    <option value="anomaly_detection">⚠️ Anomaly Detection (Pattern Recognition)</option>
                    <option value="intelligent_analysis">🧠 Intelligent Analysis (Custom Query)</option>
                    <option value="data_backup">💾 Data Backup (Intelligent Metadata)</option>
                  </select>
                  <button
                    onClick={handleCreateTask}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
                
                {/* Custom Query Input for Intelligent Analysis */}
                {newTaskType === 'intelligent_analysis' && (
                  <div className="mt-4">
                    <label htmlFor="custom-query" className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Analysis Query
                    </label>
                    <textarea
                      id="custom-query"
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      placeholder="Describe what you want the AI to analyze... e.g., 'Find correlations between customer age and purchase behavior'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                )}
                
                {/* Task Type Descriptions */}
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    {newTaskType === 'data_validation' && '🔍 Tests data source reliability using Bayesian confidence scoring'}
                    {newTaskType === 'feature_extraction' && '📊 Extracts meaningful features from user profile data using AI analysis'}
                    {newTaskType === 'anomaly_detection' && '⚠️ Detects outliers and anomalies in numerical data using pattern recognition'}
                    {newTaskType === 'intelligent_analysis' && '🧠 Performs custom AI analysis on sample sales data based on your query'}
                    {newTaskType === 'data_backup' && '💾 Creates intelligent backup with AI-generated metadata and tags'}
                  </p>
                </div>
              </div>
            </div>

            {/* LLM Configuration */}
            <LLMConfiguration />

            {/* Task List */}
            <TaskList tasks={tasks} />
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-8">
          <EventLog />
        </div>
      </div>
    </div>
  );
};
