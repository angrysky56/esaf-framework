/**
 * Base Agent interface and abstract implementation for ESAF agents
 * @fileoverview Defines the common contract and behavior for all ESAF agents
 */

import { ICognitiveSubstrate } from '../core/cognitive-substrate.js';
import { Task, AgentInfo, ESAFId, EventType, AnalysisResult } from '../core/types.js';

/**
 * Base interface that all ESAF agents must implement
 */
export interface IESAFAgent {
  /**
   * Unique identifier for this agent instance
   */
  readonly id: ESAFId;

  /**
   * Human-readable name for this agent
   */
  readonly name: string;

  /**
   * Agent type classification
   */
  readonly type: string;

  /**
   * Framework this agent operates under
   */
  readonly framework: string;

  /**
   * Algorithms this agent can execute
   */
  readonly algorithms: string[];

  /**
   * Initialize the agent with the cognitive substrate
   * @param substrate - The communication bus for inter-agent messaging
   */
  initialize(substrate: ICognitiveSubstrate): Promise<void>;

  /**
   * Process a task assigned to this agent
   * @param task - The task to process
   * @returns Promise resolving to the analysis result
   */
  processTask(task: Task): Promise<AnalysisResult>;

  /**
   * Get current agent status and information
   * @returns Current agent state
   */
  getInfo(): AgentInfo;

  /**
   * Shutdown the agent gracefully
   */
  shutdown(): Promise<void>;
}

/**
 * Abstract base class providing common agent functionality
 */
export abstract class BaseESAFAgent implements IESAFAgent {
  public readonly id: ESAFId;
  public readonly name: string;
  public readonly type: string;
  public readonly framework: string;
  public readonly algorithms: string[];

  protected substrate?: ICognitiveSubstrate;
  protected status: 'idle' | 'busy' | 'error' | 'offline' = 'offline';
  protected lastActivity: number = Date.now();
  protected taskQueue: ESAFId[] = [];
  protected subscriptions: (() => void)[] = [];

  constructor(
    id: ESAFId,
    name: string,
    type: string,
    framework: string,
    algorithms: string[]
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.framework = framework;
    this.algorithms = algorithms;
  }

  /**
   * Initialize the agent with cognitive substrate and set up subscriptions
   */
  async initialize(substrate: ICognitiveSubstrate): Promise<void> {
    this.substrate = substrate;
    this.status = 'idle';
    this.lastActivity = Date.now();

    // Subscribe to relevant events
    await this.setupSubscriptions();

    // Announce agent activation
    await this.substrate.publish(
      EventType.TASK_STARTED,
      this.id,
      {
        message: `${this.name} agent initialized`,
        agentInfo: this.getInfo()
      }
    );
  }

  /**
   * Process a task with error handling and event publishing
   */
  async processTask(task: Task): Promise<AnalysisResult> {
    if (!this.substrate) {
      throw new Error('Agent not initialized with cognitive substrate');
    }

    this.status = 'busy';
    this.lastActivity = Date.now();
    this.taskQueue.push(task.id);

    try {
      // Announce task start
      await this.substrate.publish(
        EventType.TASK_STARTED,
        this.id,
        { taskDetails: task },
        task.id
      );

      // Execute the agent-specific processing logic
      const result = await this.executeTask(task);

      // Announce successful completion
      await this.substrate.publish(
        EventType.TASK_COMPLETED,
        this.id,
        { result },
        task.id
      );

      this.status = 'idle';
      this.taskQueue = this.taskQueue.filter(id => id !== task.id);
      this.lastActivity = Date.now();

      return result;
    } catch (error) {
      this.status = 'error';
      
      // Announce task failure
      await this.substrate.publish(
        EventType.TASK_FAILED,
        this.id,
        {
          error: error instanceof Error ? error.message : String(error),
          taskId: task.id
        },
        task.id
      );

      throw error;
    }
  }

  /**
   * Get current agent information
   */
  getInfo(): AgentInfo {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      framework: this.framework,
      algorithms: this.algorithms,
      status: this.status,
      lastActivity: this.lastActivity,
      taskQueue: [...this.taskQueue]
    };
  }

  /**
   * Shutdown the agent and clean up subscriptions
   */
  async shutdown(): Promise<void> {
    this.status = 'offline';
    
    // Clean up all subscriptions
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];

    if (this.substrate) {
      await this.substrate.publish(
        EventType.TASK_COMPLETED,
        this.id,
        { message: `${this.name} agent shutting down` }
      );
    }
  }

  /**
   * Abstract method for agent-specific task processing
   * Must be implemented by concrete agent classes
   */
  protected abstract executeTask(task: Task): Promise<AnalysisResult>;

  /**
   * Setup agent-specific event subscriptions
   * Override in concrete implementations for custom event handling
   */
  protected async setupSubscriptions(): Promise<void> {
    // Default: no additional subscriptions
    // Concrete agents can override this method
  }

  /**
   * Helper method for publishing events with error handling
   */
  protected async publishEvent(
    eventType: EventType,
    payload: Record<string, unknown>,
    taskId?: ESAFId
  ): Promise<void> {
    if (!this.substrate) {
      console.warn(`Agent ${this.id} attempted to publish event without substrate`);
      return;
    }

    try {
      await this.substrate.publish(eventType, this.id, payload, taskId);
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
    }
  }
}
