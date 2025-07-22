/**
 * Main ESAF Framework Orchestrator
 * @fileoverview Coordinates all agents and manages the framework lifecycle
 */

import { CognitiveSubstrate } from '@/core/cognitive-substrate';
import { DataAnalysisAgent } from '@/agents/data-analysis-agent';
import { OptimizationAgent } from '@/agents/optimization-agent';
import { GameTheoryAgent } from '@/agents/game-theory-agent';
import { SwarmIntelligenceAgent } from '@/agents/swarm-intelligence-agent';
import { DecisionMakingAgent } from '@/agents/decision-making-agent';
import { LLMProvider } from '@/core/llm-service';
import { 
  Task, 
  TaskPriority, 
  ESAFId, 
  EventType,
  AgentInfo,
  AnalysisResult,
  TaskSchema 
} from '@/core/types';
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

    // Initialize all ESAF core agents with REAL algorithms
    const realDataAgent = new DataAnalysisAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(realDataAgent);

    const optimizationAgent = new OptimizationAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(optimizationAgent);

    const gameTheoryAgent = new GameTheoryAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(gameTheoryAgent);

    const swarmIntelligenceAgent = new SwarmIntelligenceAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(swarmIntelligenceAgent);

    const decisionMakingAgent = new DecisionMakingAgent(LLMProvider.GOOGLE_GENAI);
    await this.registerAgent(decisionMakingAgent);

    // Subscribe to framework events
    this.setupEventSubscriptions();

    this.isInitialized = true;

    await this.substrate.publish(
      EventType.TASK_STARTED,
      'orchestrator',
      { 
        message: 'ESAF Framework initialized with all core agents',
        config: this.config,
        agentCount: this.agents.size,
        registeredAgents: Array.from(this.agents.values()).map(a => ({ id: a.id, name: a.name, type: a.type }))
      }
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
    let targetAgent: any = null;

    // Enhanced task routing logic for all ESAF agents
    if (task.type.includes('data') || task.type.includes('validation') || 
        task.type.includes('feature') || task.type.includes('intelligent') ||
        task.type.includes('anomaly') || task.type.includes('backup')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'DataAnalysis');
    }
    
    else if (task.type.includes('optimization') || task.type.includes('constraint') || 
             task.type.includes('algorithm_selection') || task.type.includes('solve') ||
             task.type.includes('multi_objective') || task.type.includes('relaxation')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'OptimizationAgent');
    }
    
    else if (task.type.includes('strategy') || task.type.includes('equilibrium') || 
             task.type.includes('conflict') || task.type.includes('coalition') ||
             task.type.includes('game') || task.type.includes('mechanism')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'GameTheoryAgent');
    }
    
    else if (task.type.includes('adaptive') || task.type.includes('swarm') || 
             task.type.includes('learning') || task.type.includes('emergent') ||
             task.type.includes('memory') || task.type.includes('system_adaptation')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'SwarmIntelligenceAgent');
    }
    
    else if (task.type.includes('decision') || task.type.includes('integration') || 
             task.type.includes('criteria') || task.type.includes('contingency') ||
             task.type.includes('fallback') || task.type.includes('stakeholder') ||
             task.type.includes('final_recommendation')) {
      targetAgent = Array.from(this.agents.values()).find(agent => agent.type === 'DecisionMakingAgent');
    }

    if (targetAgent) {
      task.assignedAgentId = targetAgent.id;
      task.status = 'assigned';
      this.tasks.set(task.id, task);

      try {
        const result = await targetAgent.processTask(task);
        this.results.set(task.id, result);
        task.status = 'completed';
        
        await this.substrate.publish(
          EventType.TASK_COMPLETED,
          'orchestrator',
          { 
            message: `Task ${task.id} completed successfully`,
            taskType: task.type,
            agentUsed: targetAgent.type,
            confidence: result.confidence
          },
          task.id
        );
      } catch (error) {
        task.status = 'failed';
        console.error(`Task ${task.id} failed:`, error);
        
        await this.substrate.publish(
          EventType.TASK_FAILED,
          'orchestrator',
          { 
            message: `Task ${task.id} failed`,
            taskType: task.type,
            error: error instanceof Error ? error.message : String(error),
            agentAttempted: targetAgent.type
          },
          task.id
        );
      }
    } else {
      await this.substrate.publish(
        EventType.AGENT_ERROR,
        'orchestrator',
        { 
          message: `No suitable agent found for task type: ${task.type}`,
          taskId: task.id,
          availableAgents: Array.from(this.agents.values()).map(a => a.type)
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
   * Convenience method: Create a data analysis task
   */
  async createDataAnalysisTask(
    type: 'data_validation' | 'feature_extraction' | 'anomaly_detection' | 'data_backup' | 'intelligent_analysis',
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<ESAFId> {
    return this.createTask(type, payload, priority);
  }

  /**
   * Convenience method: Create an optimization task
   */
  async createOptimizationTask(
    type: 'constraint_formulation' | 'algorithm_selection' | 'solve_optimization' | 'multi_objective_optimization' | 'constraint_relaxation',
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<ESAFId> {
    return this.createTask(type, payload, priority);
  }

  /**
   * Convenience method: Create a game theory task
   */
  async createGameTheoryTask(
    type: 'strategy_formulation' | 'equilibrium_analysis' | 'conflict_resolution' | 'risk_assessment' | 'coalition_analysis' | 'mechanism_design',
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<ESAFId> {
    return this.createTask(type, payload, priority);
  }

  /**
   * Convenience method: Create a swarm intelligence task
   */
  async createSwarmIntelligenceTask(
    type: 'adaptive_learning' | 'swarm_optimization' | 'learning_rate_control' | 'emergent_behavior_analysis' | 'memory_retention' | 'system_adaptation',
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<ESAFId> {
    return this.createTask(type, payload, priority);
  }

  /**
   * Convenience method: Create a decision making task
   */
  async createDecisionMakingTask(
    type: 'decision_integration' | 'multi_criteria_analysis' | 'contingency_planning' | 'fallback_strategy' | 'stakeholder_synthesis' | 'final_recommendation',
    payload: Record<string, unknown>,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<ESAFId> {
    return this.createTask(type, payload, priority);
  }

  /**
   * Execute a complete ESAF analysis workflow
   * Runs all agents in sequence for comprehensive analysis
   */
  async executeCompleteWorkflow(
    initialData: any,
    analysisGoals: string[],
    context?: Record<string, any>
  ): Promise<{
    dataAnalysis: AnalysisResult;
    optimization: AnalysisResult;
    gameTheory: AnalysisResult;
    swarmIntelligence: AnalysisResult;
    finalDecision: AnalysisResult;
  }> {
    const workflowResults: any = {};

    try {
      // Step 1: Data Analysis
      const dataTaskId = await this.createDataAnalysisTask('intelligent_analysis', {
        data: initialData,
        query: analysisGoals.join(', '),
        context
      });
      
      // Wait for completion (in a real implementation, this would be more sophisticated)
      await this.waitForTaskCompletion(dataTaskId);
      workflowResults.dataAnalysis = this.getResult(dataTaskId);

      // Step 2: Optimization Analysis
      const optimizationTaskId = await this.createOptimizationTask('algorithm_selection', {
        problemType: 'multi_objective',
        constraints: context?.constraints || [],
        variables: context?.variables || [],
        objectives: analysisGoals
      });
      
      await this.waitForTaskCompletion(optimizationTaskId);
      workflowResults.optimization = this.getResult(optimizationTaskId);

      // Step 3: Game Theory Analysis
      const gameTheoryTaskId = await this.createGameTheoryTask('strategy_formulation', {
        scenario: 'Multi-agent decision scenario',
        players: context?.stakeholders || [],
        objectives: analysisGoals.reduce((obj, goal, idx) => {
          obj[`stakeholder_${idx}`] = goal;
          return obj;
        }, {} as Record<string, string>)
      });
      
      await this.waitForTaskCompletion(gameTheoryTaskId);
      workflowResults.gameTheory = this.getResult(gameTheoryTaskId);

      // Step 4: Swarm Intelligence Analysis
      const swarmTaskId = await this.createSwarmIntelligenceTask('adaptive_learning', {
        performanceData: [0.7, 0.8, 0.75, 0.85, 0.9], // Example performance metrics
        currentParameters: {
          learningRate: 0.1,
          decayFactor: 0.9,
          explorationRate: 0.3,
          memoryDepth: 10,
          adaptationThreshold: 0.1
        },
        adaptationGoals: analysisGoals
      });
      
      await this.waitForTaskCompletion(swarmTaskId);
      workflowResults.swarmIntelligence = this.getResult(swarmTaskId);

      // Step 5: Final Decision Integration
      const decisionTaskId = await this.createDecisionMakingTask('decision_integration', {
        agentInputs: {
          dataAnalysis: workflowResults.dataAnalysis?.result,
          optimization: workflowResults.optimization?.result,
          gameTheory: workflowResults.gameTheory?.result,
          swarmIntelligence: workflowResults.swarmIntelligence?.result
        },
        decisionContext: context || {},
        criteria: [
          { id: 'accuracy', name: 'Accuracy', weight: 0.6, type: 'benefit', scale: 'ratio' },
          { id: 'relevance', name: 'Relevance', weight: 0.4, type: 'benefit', scale: 'ratio' }
        ],
        alternatives: [
          { id: 'recommended', name: 'Primary Recommendation', scores: { accuracy: 0.9, relevance: 0.8 } },
          { id: 'alternative', name: 'Alternative Approach', scores: { accuracy: 0.8, relevance: 0.9 } }
        ]
      });
      
      await this.waitForTaskCompletion(decisionTaskId);
      workflowResults.finalDecision = this.getResult(decisionTaskId);

      return workflowResults;
    } catch (error) {
      console.error('Complete workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Wait for a task to complete (public method for ChatInterface)
   */
  async waitForTaskCompletion(taskId: ESAFId, timeoutMs: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const task = this.getTask(taskId);
      if (task?.status === 'completed' || task?.status === 'failed') {
        return;
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Task ${taskId} timed out after ${timeoutMs}ms`);
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
