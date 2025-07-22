/**
 * Core type definitions for the ESAF (Evolved Synergistic Agentic Framework)
 * @fileoverview Defines the fundamental types and interfaces for the multi-agent system
 */

import { z } from 'zod';

/**
 * Unique identifier for tasks, agents, and events
 */
export type ESAFId = string;

/**
 * Task priority levels used by the orchestrator
 */
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

/**
 * Event types published to the Cognitive Substrate
 */
export enum EventType {
  TASK_CREATED = 'task_created',
  TASK_STARTED = 'task_started',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  DATA_VALIDATED = 'data_validated',
  ANOMALY_DETECTED = 'anomaly_detected',
  CONSTRAINT_VIOLATION = 'constraint_violation',
  AGENT_ERROR = 'agent_error',
  GOVERNANCE_VETO = 'governance_veto'
}

/**
 * Base event structure for all Cognitive Substrate communications
 */
export const ESAFEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(EventType),
  timestamp: z.number(),
  sourceAgentId: z.string(),
  taskId: z.string().optional(),
  payload: z.record(z.unknown())
});

export type ESAFEvent = z.infer<typeof ESAFEventSchema>;

/**
 * Task definition schema for agent processing
 */
export const TaskSchema = z.object({
  id: z.string(),
  type: z.string(),
  priority: z.nativeEnum(TaskPriority),
  dependencies: z.array(z.string()),
  payload: z.record(z.unknown()),
  createdAt: z.number(),
  assignedAgentId: z.string().optional(),
  status: z.enum(['pending', 'assigned', 'running', 'completed', 'failed'])
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Agent capability and status information
 */
export const AgentInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  framework: z.string(),
  algorithms: z.array(z.string()),
  status: z.enum(['idle', 'busy', 'error', 'offline']),
  lastActivity: z.number(),
  taskQueue: z.array(z.string()),
  llmProvider: z.string().optional(),
  llmModel: z.string().optional(),
  llmStatus: z.enum(['connected', 'disconnected', 'error', 'unknown']).optional()
});

export type AgentInfo = z.infer<typeof AgentInfoSchema>;

/**
 * Data source information for validation and tracking
 */
export const DataSourceSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  type: z.enum(['file', 'api', 'database', 'stream']),
  status: z.enum(['verified', 'unverified', 'error']),
  lastUpdated: z.number(),
  reliability: z.number().min(0).max(1)
});

export type DataSource = z.infer<typeof DataSourceSchema>;

/**
 * Analysis result with confidence metrics
 */
export const AnalysisResultSchema = z.object({
  id: z.string(),
  sourceTaskId: z.string(),
  agentId: z.string(),
  result: z.record(z.unknown()),
  confidence: z.number().min(0).max(1),
  timestamp: z.number(),
  metadata: z.record(z.unknown())
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Governance constraint for the Constitutional Keystore
 */
export const ConstraintSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['ethical', 'logical', 'performance', 'security']),
  rule: z.string(), // Logical expression or rule description
  severity: z.enum(['warning', 'error', 'critical']),
  active: z.boolean()
});

export type Constraint = z.infer<typeof ConstraintSchema>;

/**
 * Error information for system monitoring and debugging
 */
export const ESAFErrorSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  taskId: z.string().optional(),
  type: z.enum(['validation', 'processing', 'constraint', 'system']),
  message: z.string(),
  stack: z.string().optional(),
  timestamp: z.number(),
  context: z.record(z.unknown())
});

export type ESAFError = z.infer<typeof ESAFErrorSchema>;

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
 * Standardized model information across all providers
 */
export const ModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().optional(),
  provider: z.string(),
  type: z.enum(['text', 'multimodal', 'embedding', 'vision']).optional(),
  contextLength: z.number().optional(),
  maxTokens: z.number().optional(),
  parameterSize: z.string().optional(),
  quantization: z.string().optional(),
  status: z.enum(['available', 'loaded', 'not-loaded', 'downloading', 'error']).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type ModelInfo = z.infer<typeof ModelInfoSchema>;

/**
 * Model cache entry for storing fetched model lists
 */
export interface ModelCacheEntry {
  models: ModelInfo[];
  timestamp: number;
  expiry: number;
  provider: string;
}

/**
 * Provider health status for monitoring connectivity
 */
export interface ProviderStatus {
  provider: string;
  available: boolean;
  lastChecked: number;
  latency?: number;
  error?: string;
  modelCount?: number;
}
