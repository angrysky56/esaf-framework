/**
 * Agent Panel Component for ESAF Framework
 * @fileoverview Interface for managing and monitoring individual agents
 */

import React, { useState } from 'react';
import { AgentInfo } from '@/core/types.js';

interface AgentPanelProps {
  agents: AgentInfo[];
  isInitialized: boolean;
  onRefresh: () => void;
}

/**
 * Agent management and monitoring panel
 */
export const AgentPanel: React.FC<AgentPanelProps> = ({
  agents,
  isInitialized,
  onRefresh
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'idle' | 'busy' | 'error' | 'offline'>('all');

  /**
   * Get agent status color
   */
  const getAgentStatusColor = (status: string): string => {
    switch (status) {
      case 'idle': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'busy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  /**
   * Get agent status icon
   */
  const getAgentStatusIcon = (status: string): string => {
    switch (status) {
      case 'idle': return '✅';
      case 'busy': return '⚡';
      case 'error': return '❌';
      case 'offline': return '⭕';
      default: return '❓';
    }
  };

  /**
   * Get agent type icon
   */
  const getAgentTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'data': return '📊';
      case 'optimization': return '🎯';
      case 'game_theory': return '🎲';
      case 'swarm_intelligence': return '🐜';
      case 'decision_making': return '🧠';
      case 'logic_analyzer': return '🧮';
      case 'emotion_analysis': return '😊';
      case 'bias_detection': return '⚖️';
      case 'ethical_analysis': return '🛡️';
      case 'temporal_analysis': return '⏰';
      default: return '🤖';
    }
  };

  /**
   * Filter agents based on status
   */
  const filteredAgents = agents.filter(agent => 
    filter === 'all' || agent.status === filter
  );

  /**
   * Format last activity time
   */
  const formatLastActivity = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  /**
   * Get selected agent details
   */
  const selectedAgentData = selectedAgent 
    ? agents.find(agent => agent.id === selectedAgent)
    : null;  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading agent information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage ESAF cognitive agents
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Agents</option>
              <option value="idle">Idle</option>
              <option value="busy">Busy</option>
              <option value="error">Error</option>
              <option value="offline">Offline</option>
            </select>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['idle', 'busy', 'error', 'offline'].map(status => {
            const count = agents.filter(agent => agent.status === status).length;
            return (
              <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getAgentStatusIcon(status)}</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                      {status}
                    </h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {count}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Agents ({filteredAgents.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAgents.length > 0 ? filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedAgent === agent.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{getAgentTypeIcon(agent.type)}</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {agent.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Framework: {agent.framework}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAgentStatusColor(agent.status)}`}>
                        {getAgentStatusIcon(agent.status)} {agent.status}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last active: {formatLastActivity(agent.lastActivity)}
                      </p>
                      {agent.taskQueue.length > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {agent.taskQueue.length} tasks queued
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No agents found
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filter !== 'all' 
                      ? `No agents with status "${filter}"`
                      : 'The system is initializing agents'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Agent Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Agent Details
              </h3>
            </div>

            {selectedAgentData ? (
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-4xl">{getAgentTypeIcon(selectedAgentData.type)}</div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedAgentData.name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAgentStatusColor(selectedAgentData.status)}`}>
                        {getAgentStatusIcon(selectedAgentData.status)} {selectedAgentData.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono">
                        {selectedAgentData.id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedAgentData.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Framework:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedAgentData.framework}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Activity:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatLastActivity(selectedAgentData.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Algorithms */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Algorithms
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgentData.algorithms.map((algorithm) => (
                      <span
                        key={algorithm}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-800 dark:text-gray-200"
                      >
                        {algorithm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Queue */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Task Queue ({selectedAgentData.taskQueue.length})
                  </h5>
                  {selectedAgentData.taskQueue.length > 0 ? (
                    <div className="space-y-2">
                      {selectedAgentData.taskQueue.slice(0, 5).map((taskId) => (
                        <div
                          key={taskId}
                          className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                        >
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                            {taskId.substring(0, 16)}...
                          </span>
                        </div>
                      ))}
                      {selectedAgentData.taskQueue.length > 5 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{selectedAgentData.taskQueue.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No tasks in queue
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">👆</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select an Agent
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Click on an agent from the list to view detailed information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
