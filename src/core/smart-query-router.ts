/**
 * Smart Query Router for ESAF Framework
 * @fileoverview Intelligently routes user queries to appropriate agents based on natural language intent
 */

import { LLMProvider, LLMRequest, llmService } from '@/core/llm-service';

export interface QueryIntent {
  primaryAgent: 'data_analysis' | 'optimization' | 'game_theory' | 'swarm_intelligence' | 'decision_making';
  taskType: string;
  confidence: number;
  reasoning: string;
  suggestedFollowUps?: string[];
  requiresData: boolean;
}

export interface RoutingDecision {
  intents: QueryIntent[];
  executionPlan: {
    agentCalls: Array<{
      agent: string;
      taskType: string;
      priority: number;
    }>;
    runInParallel: boolean;
    estimatedComplexity: 'simple' | 'moderate' | 'complex';
  };
}

/**
 * Smart query router that understands user intent and routes to appropriate agents
 * Uses LLM for natural language understanding, then applies deterministic routing logic
 */
export class SmartQueryRouter {
  private preferredProvider: LLMProvider;

  constructor(preferredProvider: LLMProvider = LLMProvider.GOOGLE_GENAI) {
    this.preferredProvider = preferredProvider;
  }

  /**
   * Analyze user query and determine which agent(s) to call
   */
  async routeQuery(
    userQuery: string, 
    hasUploadedData: boolean = false,
    previousContext?: string[]
  ): Promise<RoutingDecision> {
    
    const intentAnalysisPrompt = `Analyze this user query and determine which ESAF agents should handle it:

USER QUERY: "${userQuery}"
HAS_UPLOADED_DATA: ${hasUploadedData}
PREVIOUS_CONTEXT: ${previousContext?.join(', ') || 'None'}

AVAILABLE AGENTS:
1. DATA_ANALYSIS: Statistical analysis, data validation, feature extraction, anomaly detection, data quality assessment
2. OPTIMIZATION: Algorithm selection, constraint solving, multi-objective optimization, finding best solutions
3. GAME_THEORY: Strategy formulation, conflict resolution, equilibrium analysis, competitive scenarios
4. SWARM_INTELLIGENCE: Adaptive learning, system optimization, emergent behavior analysis
5. DECISION_MAKING: Decision integration, multi-criteria analysis, final recommendations

ANALYZE THE QUERY AND RESPOND IN THIS EXACT JSON FORMAT:
{
  "primaryIntent": {
    "agent": "data_analysis|optimization|game_theory|swarm_intelligence|decision_making",
    "taskType": "specific_task_type",
    "confidence": 0.0-1.0,
    "reasoning": "why this agent",
    "requiresData": true|false
  },
  "secondaryIntents": [
    {
      "agent": "agent_name", 
      "taskType": "task_type",
      "confidence": 0.0-1.0,
      "reasoning": "why this agent might also help"
    }
  ],
  "executionStrategy": {
    "complexity": "simple|moderate|complex",
    "runInParallel": true|false,
    "suggestedFollowUps": ["suggestion1", "suggestion2"]
  }
}

ROUTING EXAMPLES:
- "analyze this data" → data_analysis (intelligent_analysis)
- "find anomalies" → data_analysis (anomaly_detection)  
- "what's the best solution" → optimization (algorithm_selection)
- "optimize this process" → optimization (multi_objective_optimization)
- "strategic recommendations" → game_theory (strategy_formulation)
- "how should we compete" → game_theory (conflict_resolution)
- "adaptive improvements" → swarm_intelligence (adaptive_learning)
- "final recommendation" → decision_making (decision_integration)
- "comprehensive analysis" → multiple agents (complex)

Be smart about routing - don't use all agents unless truly needed!`;

    const llmRequest: LLMRequest = {
      prompt: intentAnalysisPrompt,
      systemPrompt: `You are an intelligent query router that maps user intents to appropriate AI agents. 
Be precise and efficient - only route to agents that are actually needed for the query.`,
      provider: this.preferredProvider,
      temperature: 0.2,
      maxTokens: 1024
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const routingAnalysis = this.parseRoutingResponse(llmResponse.content);
      
      // Convert LLM analysis to structured routing decision
      return this.buildRoutingDecision(routingAnalysis, userQuery, hasUploadedData);
      
    } catch (error) {
      console.warn('Smart routing failed, falling back to simple routing:', error);
      return this.fallbackRouting(userQuery, hasUploadedData);
    }
  }

  /**
   * Parse LLM routing response
   */
  private parseRoutingResponse(response: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse routing response as JSON:', error);
    }
    
    // Fallback parsing
    return this.parseRoutingFallback(response);
  }

  /**
   * Fallback parsing when JSON extraction fails
   */
  private parseRoutingFallback(response: string): any {
    const lines = response.toLowerCase().split('\n');
    
    // Simple keyword-based fallback
    if (lines.some(line => line.includes('data') || line.includes('analyz') || line.includes('anomal'))) {
      return {
        primaryIntent: {
          agent: 'data_analysis',
          taskType: 'intelligent_analysis', 
          confidence: 0.7,
          reasoning: 'Detected data analysis keywords',
          requiresData: true
        },
        executionStrategy: { complexity: 'simple', runInParallel: false }
      };
    }
    
    if (lines.some(line => line.includes('optim') || line.includes('best') || line.includes('solution'))) {
      return {
        primaryIntent: {
          agent: 'optimization',
          taskType: 'algorithm_selection',
          confidence: 0.7, 
          reasoning: 'Detected optimization keywords',
          requiresData: false
        },
        executionStrategy: { complexity: 'simple', runInParallel: false }
      };
    }
    
    // Default to data analysis
    return {
      primaryIntent: {
        agent: 'data_analysis',
        taskType: 'intelligent_analysis',
        confidence: 0.5,
        reasoning: 'Default routing',
        requiresData: true
      },
      executionStrategy: { complexity: 'simple', runInParallel: false }
    };
  }

  /**
   * Build structured routing decision from LLM analysis
   */
  private buildRoutingDecision(analysis: any, userQuery: string, hasUploadedData: boolean): RoutingDecision {
    const intents: QueryIntent[] = [];
    
    // Primary intent
    if (analysis.primaryIntent) {
      intents.push({
        primaryAgent: analysis.primaryIntent.agent,
        taskType: analysis.primaryIntent.taskType,
        confidence: analysis.primaryIntent.confidence || 0.8,
        reasoning: analysis.primaryIntent.reasoning || 'Primary intent',
        requiresData: analysis.primaryIntent.requiresData || false
      });
    }
    
    // Secondary intents
    if (analysis.secondaryIntents && Array.isArray(analysis.secondaryIntents)) {
      analysis.secondaryIntents.forEach((intent: any) => {
        if (intent.confidence > 0.6) { // Only include high-confidence secondary intents
          intents.push({
            primaryAgent: intent.agent,
            taskType: intent.taskType,
            confidence: intent.confidence,
            reasoning: intent.reasoning || 'Secondary intent',
            requiresData: intent.requiresData || false
          });
        }
      });
    }

    // Build execution plan
    const agentCalls = intents.map((intent, index) => ({
      agent: intent.primaryAgent,
      taskType: intent.taskType,
      priority: index + 1
    }));

    const executionPlan = {
      agentCalls,
      runInParallel: (analysis.executionStrategy?.runInParallel === true) && (agentCalls.length > 1),
      estimatedComplexity: analysis.executionStrategy?.complexity || 'simple'
    };

    return {
      intents,
      executionPlan
    };
  }

  /**
   * Simple fallback routing when LLM routing fails
   */
  private fallbackRouting(userQuery: string, hasUploadedData: boolean): RoutingDecision {
    const lowerQuery = userQuery.toLowerCase();
    
    let primaryAgent: QueryIntent['primaryAgent'] = 'data_analysis';
    let taskType = 'intelligent_analysis';
    
    // Simple keyword matching
    if (lowerQuery.includes('optim') || lowerQuery.includes('best') || lowerQuery.includes('solution')) {
      primaryAgent = 'optimization';
      taskType = 'algorithm_selection';
    } else if (lowerQuery.includes('strategy') || lowerQuery.includes('compete') || lowerQuery.includes('game')) {
      primaryAgent = 'game_theory'; 
      taskType = 'strategy_formulation';
    } else if (lowerQuery.includes('adapt') || lowerQuery.includes('learn') || lowerQuery.includes('improv')) {
      primaryAgent = 'swarm_intelligence';
      taskType = 'adaptive_learning';
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('decide') || lowerQuery.includes('final')) {
      primaryAgent = 'decision_making';
      taskType = 'decision_integration';
    }

    return {
      intents: [{
        primaryAgent,
        taskType,
        confidence: 0.6,
        reasoning: 'Fallback keyword matching',
        requiresData: hasUploadedData
      }],
      executionPlan: {
        agentCalls: [{ agent: primaryAgent, taskType, priority: 1 }],
        runInParallel: false,
        estimatedComplexity: 'simple'
      }
    };
  }

  /**
   * Quick intent classification for common queries
   */
  quickClassify(userQuery: string): QueryIntent['primaryAgent'] {
    const lowerQuery = userQuery.toLowerCase();
    
    // Data analysis patterns
    if (lowerQuery.match(/\b(analyz|data|statistic|anomal|outlier|mean|median|variance|correlation|distribution)\b/)) {
      return 'data_analysis';
    }
    
    // Optimization patterns  
    if (lowerQuery.match(/\b(optim|best|solution|algorithm|constraint|objective|maximize|minimize)\b/)) {
      return 'optimization';
    }
    
    // Game theory patterns
    if (lowerQuery.match(/\b(strategy|compete|game|equilibrium|conflict|negotiat|stakeholder)\b/)) {
      return 'game_theory';
    }
    
    // Swarm intelligence patterns
    if (lowerQuery.match(/\b(adapt|learn|swarm|emergent|evolv|improv|parameter)\b/)) {
      return 'swarm_intelligence';
    }
    
    // Decision making patterns
    if (lowerQuery.match(/\b(recommend|decide|final|integrat|criteria|choice|conclusion)\b/)) {
      return 'decision_making';
    }
    
    // Default to data analysis
    return 'data_analysis';
  }
}
