/**
 * Main ESAF Framework Orchestrator
 * @fileoverview Coordinates all agents and manages the framework lifecycle
 */

import { CognitiveSubstrate } from '@/core/cognitive-substrate.js';
import { CognitiveDataAnalysisAgent } from '@/agents/cognitive-data-analysis-agent.js';
import { LLMProvider } from '@/core/llm-service.js';
import { 
  Task, 
  TaskPriority, 
  ESAFId, 
  EventType,
  AgentInfo,
  AnalysisResult,
  TaskSchema 
} from '@/core/types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Framework configuration options
 */
export interface ESAFConfig {
  maxConcurrentTasks: number;
  eventHistoryLimit: number;
  defaultTaskTimeout: number;
}

/**
 * Framework status information
 */
export interface FrameworkStatus {
  isRunning: boolean;
  activeAgents: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
  uptime: number;
}

/**
 * Main orchestrator for the ESAF framework
 * Manages agent lifecycle, task distribution, and system coordination
 */
export class ESAFOrchestrator {
  private substrate: CognitiveSubstrate;
  private agents = new Map<ESAFId, any>();
  private tasks = new Map<ESAFId, Task>();
  private results = new Map<ESAFId, AnalysisResult>();
  private isInitialized = false;
  private startTime = 0;
  private taskCounter = 0;
  private config: ESAFConfig;

  constructor(config: Partial<ESAFConfig> = {}) {
    this.config = {
      maxConcurrentTasks: 10,
      eventHistoryLimit: 10000,
      defaultTaskTimeout: 30000,
      ...config
    };
    
    this.substrate = new CognitiveSubstrate(this.config.eventHistoryLimit);
  }

  /**
   * Initialize the ESAF framework and register core agents
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Framework already initialized');
    }

    this.startTime = Date.now();

    // Initialize the Cognitive Data Analysis agent
    const cognitiveDataAgent = new CognitiveDataAnalysisAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(cognitiveDataAgent);

    // Subscribe to framework events
    this.setupEventSubscriptions();

    this.isInitialized = true;

    await this.substrate.publish(
      EventType.TASK_STARTED,
      'orchestrator',
      { message: 'ESAF Framework initialized', config: this.config }
    );
  }

  /**
   * Register a new agent with the framework
   */
  async registerAgent(agent: any): Promise<void> {
    await agent.initialize(this.substrate);
    this.agents.set(agent.id, agent);

    await this.substrate.publish(
      EventType.TASK_STARTED,
      'orchestrator',
      { 
        message: `Agent registered: ${agent.name}`,
        agentId: agent.id,
        agentType: agent.type
      }
    );
  }

  /**
   * Create and dispatch a new task
   */
  async createTask(
    type: string,
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dependencies: ESAFId[] = []
  ): Promise<ESAFId> {
    if (!this.isInitialized) {
      throw new Error('Framework not initialized');
    }

    const task: Task = {
      id: uuidv4(),
      type,
      priority,
      dependencies,
      payload,
      createdAt: Date.now(),
      status: 'pending'
    };

    // Validate task structure
    const validation = TaskSchema.safeParse(task);
    if (!validation.success) {
      throw new Error(`Invalid task structure: ${validation.error.message}`);
    }

    this.tasks.set(task.id, task);
    this.taskCounter++;

    await this.substrate.publish(
      EventType.TASK_CREATED,
      'orchestrator',
      { taskDetails: task },
      task.id
    );

    // Attempt to assign the task to an appropriate agent
    await this.assignTask(task);

    return task.id;
  }

  /**
   * Assign a task to the most suitable agent
   */
  private async assignTask(task: Task): Promise<void> {
    // For now, route data-related tasks to the DA agent
    // In a full implementation, this would use sophisticated agent selection logic
    let targetAgent: any = null;

    if (task.type.includes('data') || task.type.includes('validation') || task.type.includes('feature') || task.type.includes('intelligent')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'CognitiveDataAnalysis');
    }

    if (targetAgent) {
      task.assignedAgentId = targetAgent.id;
      task.status = 'assigned';
      this.tasks.set(task.id, task);

      try {
        const result = await targetAgent.processTask(task);
        this.results.set(task.id, result);
        task.status = 'completed';
      } catch (error) {
        task.status = 'failed';
        console.error(`Task ${task.id} failed:`, error);
      }
    } else {
      await this.substrate.publish(
        EventType.AGENT_ERROR,
        'orchestrator',
        { 
          message: `No suitable agent found for task type: ${task.type}`,
          taskId: task.id
        },
        task.id
      );
    }
  }

  /**
   * Get framework status information
   */
  getStatus(): FrameworkStatus {
    const now = Date.now();
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending').length;
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
    const failedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'failed').length;

    return {
      isRunning: this.isInitialized,
      activeAgents: this.agents.size,
      pendingTasks,
      completedTasks,
      failedTasks,
      uptime: now - this.startTime
    };
  }

  /**
   * Get information about all registered agents
   */
  getAgentInfo(): AgentInfo[] {
    return Array.from(this.agents.values()).map(agent => agent.getInfo());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: ESAFId): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get result by task ID
   */
  getResult(taskId: ESAFId): AnalysisResult | undefined {
    return this.results.get(taskId);
  }

  /**
   * Get all tasks matching a status
   */
  getTasksByStatus(status: Task['status']): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  /**
   * Get event history from the cognitive substrate
   */
  getEventHistory(limit?: number) {
    return this.substrate.getEventHistory(limit);
  }

  /**
   * Shutdown the framework gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // Shutdown all agents
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }

    this.agents.clear();
    this.substrate.clearHistory();
    this.isInitialized = false;

    console.log('ESAF Framework shutdown complete');
  }

  /**
   * Setup event subscriptions for framework coordination
   */
  private setupEventSubscriptions(): void {
    // Subscribe to task completion events
    this.substrate.subscribe(EventType.TASK_COMPLETED, (event) => {
      console.log(`Task completed: ${event.taskId} by agent: ${event.sourceAgentId}`);
    });

    // Subscribe to task failure events
    this.substrate.subscribe(EventType.TASK_FAILED, (event) => {
      console.error(`Task failed: ${event.taskId} by agent: ${event.sourceAgentId}`, event.payload);
    });

    // Subscribe to anomaly detection events
    this.substrate.subscribe(EventType.ANOMALY_DETECTED, (event) => {
      console.warn(`Anomaly detected by agent: ${event.sourceAgentId}`, event.payload);
    });

    // Subscribe to constraint violations
    this.substrate.subscribe(EventType.CONSTRAINT_VIOLATION, (event) => {
      console.error(`Constraint violation detected by agent: ${event.sourceAgentId}`, event.payload);
    });
  }
}

/**
 * Global framework instance (singleton pattern for UI access)
 */
export const frameworkInstance = new ESAFOrchestrator();
