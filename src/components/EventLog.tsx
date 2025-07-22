/**
 * EventLog Component - Displays real-time system events from the Cognitive Substrate
 * @fileoverview Shows framework events, agent communications, and system messages
 */

import React, { useState, useEffect } from 'react';
import { frameworkInstance } from '@/core/orchestrator';
import { ESAFEvent, EventType } from '@/core/types';

/**
 * Component for displaying real-time event log from the Cognitive Substrate
 */
export const EventLog: React.FC = () => {
  const [events, setEvents] = useState<ESAFEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<EventType>>(
    new Set(Object.values(EventType))
  );

  /**
   * Update events from framework
   */
  useEffect(() => {
    const updateEvents = () => {
      const recentEvents = frameworkInstance.getEventHistory(50);
      setEvents(recentEvents.reverse()); // Show newest first
    };

    updateEvents();
    const interval = setInterval(updateEvents, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Get event type color for styling
   */
  const getEventTypeColor = (eventType: EventType): string => {
    switch (eventType) {
      case EventType.TASK_CREATED:
        return 'bg-blue-100 text-blue-800';
      case EventType.TASK_STARTED:
        return 'bg-purple-100 text-purple-800';
      case EventType.TASK_COMPLETED:
        return 'bg-green-100 text-green-800';
      case EventType.TASK_FAILED:
        return 'bg-red-100 text-red-800';
      case EventType.DATA_VALIDATED:
        return 'bg-teal-100 text-teal-800';
      case EventType.ANOMALY_DETECTED:
        return 'bg-orange-100 text-orange-800';
      case EventType.CONSTRAINT_VIOLATION:
        return 'bg-red-100 text-red-800';
      case EventType.AGENT_ERROR:
        return 'bg-red-100 text-red-800';
      case EventType.GOVERNANCE_VETO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  /**
   * Filter events based on selected types
   */
  const filteredEvents = events.filter(event =>
    selectedEventTypes.has(event.type)
  );

  /**
   * Toggle event type filter
   */
  const toggleEventType = (eventType: EventType) => {
    const newSelection = new Set(selectedEventTypes);
    if (newSelection.has(eventType)) {
      newSelection.delete(eventType);
    } else {
      newSelection.add(eventType);
    }
    setSelectedEventTypes(newSelection);
  };

  /**
   * Get agent name from ID
   */
  const getAgentDisplayName = (agentId: string): string => {
    switch (agentId) {
      case 'da-agent':
        return 'Data Analysis';
      case 'orchestrator':
        return 'Orchestrator';
      case 'cognitive-substrate':
        return 'Substrate';
      default:
        return agentId;
    }
  };

  /**
   * Render event payload in a readable format
   */
  const renderEventPayload = (event: ESAFEvent): string => {
    if (event.payload.message) {
      return String(event.payload.message);
    }

    // Summarize complex payloads
    const keys = Object.keys(event.payload);
    if (keys.length === 0) {
      return 'No additional data';
    }

    if (keys.length === 1 && keys[0] !== undefined) {
      const key = keys[0];
      return `${key}: ${JSON.stringify(event.payload[key])?.substring(0, 50)}...`;
    }

    return `${keys.length} properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Event Log</h2>
            <p className="text-sm text-gray-500">
              Real-time events from the Cognitive Substrate ({filteredEvents.length} shown)
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Event Type Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(EventType).map((eventType) => (
            <button
              key={eventType}
              onClick={() => toggleEventType(eventType)}
              className={`px-2 py-1 text-xs rounded ${
                selectedEventTypes.has(eventType)
                  ? getEventTypeColor(eventType)
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {eventType.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96' : 'max-h-48'
      }`}>
        <div className="overflow-y-auto h-full">
          {filteredEvents.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No events</h3>
              <p className="text-sm text-gray-500">
                System events will appear here as the framework operates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <div key={event.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                        {event.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getAgentDisplayName(event.sourceAgentId)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                        {event.taskId && (
                          <span className="text-xs text-blue-600">
                            Task: {event.taskId.substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        {renderEventPayload(event)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
