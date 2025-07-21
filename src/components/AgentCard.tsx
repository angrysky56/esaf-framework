/**
 * AgentCard Component - Displays individual agent status and information
 * @fileoverview Visual card showing agent details, status, and activity
 */

import React from 'react';
import { AgentInfo } from '@/core/types.js';

interface AgentCardProps {
  agent: AgentInfo;
}

/**
 * Visual card component for displaying agent information
 */
export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  /**
   * Get status color class based on agent status
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'idle':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format timestamp for display
   */
  const formatLastActivity = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return 'Just now';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Agent Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.type}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      {/* Framework */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Framework:</span> {agent.framework}
        </p>
      </div>

      {/* Algorithms */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Algorithms:</span>
        </p>
        <div className="flex flex-wrap gap-1">
          {agent.algorithms.map((algorithm, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {algorithm}
            </span>
          ))}
        </div>
      </div>

      {/* Task Queue */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Queue:</span> {agent.taskQueue.length} task{agent.taskQueue.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Last Activity */}
      <div className="text-xs text-gray-500">
        Last activity: {formatLastActivity(agent.lastActivity)}
      </div>
    </div>
  );
};
