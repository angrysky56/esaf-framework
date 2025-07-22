/**
 * Integration test for all ESAF agents
 * @fileoverview Tests that all agents can be instantiated and basic functionality works
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { frameworkInstance } from '../core/orchestrator';
import { TaskPriority } from '../core/types';

describe('ESAF Framework Integration', () => {
  beforeAll(async () => {
    await frameworkInstance.initialize();
  });

  afterAll(async () => {
    await frameworkInstance.shutdown();
  });

  it('should initialize all core agents successfully', () => {
    const status = frameworkInstance.getStatus();
    expect(status.isRunning).toBe(true);
    expect(status.activeAgents).toBe(5); // DA, OA, GT, SI, DM
  });

  it('should have all agent types registered', () => {
    const agents = frameworkInstance.getAgentInfo();
    const agentTypes = agents.map(a => a.type);
    
    expect(agentTypes).toContain('DataAnalysis');
    expect(agentTypes).toContain('OptimizationAgent');
    expect(agentTypes).toContain('GameTheoryAgent');
    expect(agentTypes).toContain('SwarmIntelligenceAgent');
    expect(agentTypes).toContain('DecisionMakingAgent');
  });
});