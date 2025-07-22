/**
 * Cognitive Substrate - The central event-driven communication bus for ESAF agents
 * @fileoverview Core event handling system that enables asynchronous agent communication
 */

import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { ESAFEvent, EventType, ESAFId, ESAFEventSchema } from './types';

/**
 * Subscription handler function type
 */
export type EventHandler<T = unknown> = (event: ESAFEvent & { payload: T }) => void | Promise<void>;

/**
 * Cognitive Substrate interface defining the event bus contract
 */
export interface ICognitiveSubstrate {
  /**
   * Publishes an event to all subscribers
   * @param eventType - Type of event being published
   * @param sourceAgentId - ID of the agent publishing the event
   * @param payload - Event data payload
   * @param taskId - Optional task ID this event relates to
   */
  publish<T = unknown>(
    eventType: EventType, 
    sourceAgentId: ESAFId, 
    payload: T,
    taskId?: ESAFId
  ): Promise<void>;

  /**
   * Subscribes to specific event types
   * @param eventType - Type of event to subscribe to
   * @param handler - Function to handle the event
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(
    eventType: EventType, 
    handler: EventHandler<T>
  ): () => void;

  /**
   * Gets all events for a specific task
   * @param taskId - Task ID to filter events
   * @returns Array of events related to the task
   */
  getTaskEvents(taskId: ESAFId): ESAFEvent[];

  /**
   * Gets the event history
   * @param limit - Maximum number of events to return
   * @returns Array of recent events
   */
  getEventHistory(limit?: number): ESAFEvent[];

  /**
   * Clears the event history (for testing and cleanup)
   */
  clearHistory(): void;
}

/**
 * In-memory implementation of the Cognitive Substrate
 * Uses EventEmitter3 for high-performance event handling
 */
export class CognitiveSubstrate implements ICognitiveSubstrate {
  private emitter: EventEmitter;
  private eventHistory: ESAFEvent[] = [];
  private readonly maxHistorySize: number;

  constructor(maxHistorySize: number = 10000) {
    this.emitter = new EventEmitter();
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Publishes an event to all subscribers with validation
   */
  async publish<T = unknown>(
    eventType: EventType,
    sourceAgentId: ESAFId,
    payload: T,
    taskId?: ESAFId
  ): Promise<void> {
    const event: ESAFEvent = {
      id: uuidv4(),
      type: eventType,
      timestamp: Date.now(),
      sourceAgentId,
      taskId,
      payload: payload as Record<string, unknown>
    };

    // Validate event structure
    const validationResult = ESAFEventSchema.safeParse(event);
    if (!validationResult.success) {
      throw new Error(`Invalid event structure: ${validationResult.error.message}`);
    }

    // Add to history with size management
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }

    // Emit to all subscribers
    this.emitter.emit(eventType, event);
    this.emitter.emit('*', event); // Wildcard for governance agent
  }

  /**
   * Subscribes to specific event types with error handling
   */
  subscribe<T = unknown>(
    eventType: EventType, 
    handler: EventHandler<T>
  ): () => void {
    const wrappedHandler = async (event: ESAFEvent) => {
      try {
        await handler(event as ESAFEvent & { payload: T });
      } catch (error) {
        // Publish error event to notify other agents
        await this.publish(
          EventType.AGENT_ERROR,
          'cognitive-substrate',
          {
            originalEvent: event,
            error: error instanceof Error ? error.message : String(error),
            handlerError: true
          }
        );
      }
    };

    this.emitter.on(eventType, wrappedHandler);
    
    return () => {
      this.emitter.off(eventType, wrappedHandler);
    };
  }

  /**
   * Gets all events for a specific task with efficient filtering
   */
  getTaskEvents(taskId: ESAFId): ESAFEvent[] {
    return this.eventHistory.filter(event => event.taskId === taskId);
  }

  /**
   * Gets the event history with optional limit
   */
  getEventHistory(limit?: number): ESAFEvent[] {
    if (limit === undefined) {
      return [...this.eventHistory];
    }
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clears the event history for testing and cleanup
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Subscribes to all events (used by governance agent)
   */
  subscribeToAll(handler: EventHandler): () => void {
    const wrappedHandler = async (event: ESAFEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error('Error in wildcard event handler:', error);
      }
    };

    this.emitter.on('*', wrappedHandler);
    
    return () => {
      this.emitter.off('*', wrappedHandler);
    };
  }
}
