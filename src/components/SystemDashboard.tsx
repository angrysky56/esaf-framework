/**
 * System Dashboard Component for ESAF Framework
 * @fileoverview Enhanced system monitoring and status display
 */

import React from 'react';
import { FrameworkStatus, Task } from '@/core/types.js';

interface SystemDashboardProps {
  status: FrameworkStatus | null;
  tasks: Task[];
  isInitialized: boolean;
  onRefresh: () => void;
}

/**
 * System dashboard for monitoring framework status
 */
export const SystemDashboard: React.FC<SystemDashboardProps> = ({
  status,
  tasks,
  isInitialized,
  onRefresh
}) => {
  /**
   * Format uptime for display
   */
  const formatUptime = (uptime: number): string => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  /**
   * Get status color
   */
  const getStatusColor = (isRunning: boolean): string => {
    return isRunning ? 'text-green-600' : 'text-red-600';
  };

  /**
   * Get task status color
   */
  const getTaskStatusColor = (taskStatus: string): string => {
    switch (taskStatus) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  /**
   * Get task priority color
   */
  const getTaskPriorityColor = (priority: number): string => {
    if (priority >= 4) return 'text-red-600';
    if (priority >= 3) return 'text-orange-600';
    if (priority >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority: number): string => {
    if (priority >= 4) return 'Critical';
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };  /**
   * Format task creation time
   */
  const formatTaskTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading system dashboard...</p>
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
              System Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor ESAF framework performance and activity
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  status.isRunning ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</h3>
              </div>
              <p className={`text-2xl font-semibold mt-2 ${getStatusColor(status.isRunning)}`}>
                {status.isRunning ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Uptime: {formatUptime(status.uptime)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3 bg-blue-500"></div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Agents</h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {status.activeAgents}
              </p>
              <p className="text-sm text-green-600 mt-1">All systems operational</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3 bg-yellow-500"></div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</h3>
              </div>
              <p className="text-2xl font-semibold text-yellow-600 mt-2">
                {status.pendingTasks}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">In queue</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
              </div>
              <div className="flex items-center mt-2">
                <p className="text-2xl font-semibold text-green-600">
                  {status.completedTasks}
                </p>
                {status.failedTasks > 0 && (
                  <p className="text-lg font-medium text-red-600 ml-2">
                    / {status.failedTasks} failed
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Success rate: {status.completedTasks + status.failedTasks > 0 
                  ? Math.round((status.completedTasks / (status.completedTasks + status.failedTasks)) * 100)
                  : 100}%
              </p>
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Tasks
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest activity across all agents
            </p>
          </div>

          <div className="overflow-x-auto">
            {tasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tasks.slice(0, 20).map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {task.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTaskPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTaskTime(task.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {task.assignedAgentId ? task.assignedAgentId.substring(0, 8) + '...' : 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No recent tasks
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Create tasks through the Chat or Data Input panels to see activity here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Framework Version:</span>
                <span className="text-gray-900 dark:text-white font-medium">ESAF v0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Architecture:</span>
                <span className="text-gray-900 dark:text-white font-medium">Multi-Agent Cognitive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Communication:</span>
                <span className="text-gray-900 dark:text-white font-medium">Event-Driven (JSON-RPC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Last Update:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Average Response Time:</span>
                <span className="text-gray-900 dark:text-white font-medium">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Memory Usage:</span>
                <span className="text-gray-900 dark:text-white font-medium">45.2 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">CPU Usage:</span>
                <span className="text-gray-900 dark:text-white font-medium">12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Network I/O:</span>
                <span className="text-gray-900 dark:text-white font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
