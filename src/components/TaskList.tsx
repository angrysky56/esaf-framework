/**
 * TaskList Component - Displays and manages framework tasks
 * @fileoverview Shows task queue, status, and allows task management
 */

import React from 'react';
import { Task, TaskPriority } from '@/core/types.js';

interface TaskListProps {
  tasks: Task[];
}

/**
 * Component for displaying and managing framework tasks
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  /**
   * Get status badge color based on task status
   */
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'running':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get priority badge color based on task priority
   */
  const getPriorityBadgeColor = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-100 text-gray-600';
      case TaskPriority.MEDIUM:
        return 'bg-blue-100 text-blue-600';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-600';
      case TaskPriority.CRITICAL:
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Low';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.HIGH:
        return 'High';
      case TaskPriority.CRITICAL:
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  /**
   * Format task creation time
   */
  const formatCreatedAt = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  /**
   * Truncate long task types for display
   */
  const truncateTaskType = (type: string): string => {
    return type.length > 20 ? `${type.substring(0, 20)}...` : type;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
        <p className="text-sm text-gray-500">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No tasks</h3>
            <p className="text-sm text-gray-500">
              Create a task to get started with the ESAF framework.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {truncateTaskType(task.type)}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {task.id.substring(0, 8)}...</span>
                      <span>Created: {formatCreatedAt(task.createdAt)}</span>
                      {task.assignedAgentId && (
                        <span>Agent: {task.assignedAgentId}</span>
                      )}
                      {task.dependencies.length > 0 && (
                        <span>Dependencies: {task.dependencies.length}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.status === 'failed' && (
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    
                    {task.status === 'completed' && (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    
                    {(task.status === 'running' || task.status === 'assigned') && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
                
                {/* Task Payload Preview */}
                {Object.keys(task.payload).length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                    <span className="font-medium text-gray-700">Payload: </span>
                    <span className="text-gray-600">
                      {JSON.stringify(task.payload).length > 100
                        ? `${JSON.stringify(task.payload).substring(0, 100)}...`
                        : JSON.stringify(task.payload)
                      }
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
