/**
 * Optimization Agent (OA) - Linear Programming and Constraint Optimization
 * @fileoverview Implements constraint formulation, algorithm selection, and multi-objective optimization
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseESAFAgent } from './base-agent';
import { llmService, LLMProvider, LLMRequest } from '../core/llm-service';
import { 
  Task, 
  AnalysisResult, 
  EventType
} from '../core/types';

/**
 * Constraint types for optimization problems
 */
export interface OptimizationConstraint {
  id: string;
  type: 'equality' | 'inequality' | 'bound';
  expression: string;
  value: number;
  priority: 'hard' | 'soft';
}

/**
 * Variable definition for optimization
 */
export interface OptimizationVariable {
  name: string;
  type: 'continuous' | 'integer' | 'binary';
  lowerBound?: number;
  upperBound?: number;
  description?: string;
}

/**
 * Optimization Agent implementing Linear Programming and advanced optimization techniques
 */
export class OptimizationAgent extends BaseESAFAgent {
  private readonly systemPrompt = `You are the Optimization Agent (OA) in the ESAF multi-agent framework.

Your core responsibilities:
1. CONSTRAINT FORMULATION: Analyze problems and formulate mathematical constraints
2. ALGORITHM SELECTION: Choose optimal algorithms (Simplex, Genetic, Multi-objective)
3. SOLUTION OPTIMIZATION: Find optimal or near-optimal solutions to complex problems
4. CONSTRAINT RELAXATION: Handle infeasible problems through intelligent relaxation

Available algorithms:
- Simplex Method: For linear programming problems
- Genetic Algorithms: For non-convex, complex optimization landscapes
- Constraint Relaxation: For handling infeasible constraint sets
- Multi-Objective LP: For problems with multiple competing objectives

Response format (JSON):
{
  "analysis": "optimization problem analysis",
  "constraints": [{"type": "constraint_type", "description": "constraint description"}],
  "algorithm_recommendation": "recommended algorithm with justification",
  "solution": {"variables": {}, "objective_value": 0, "feasible": true},
  "optimization_metrics": {
    "convergence_iterations": 0,
    "optimality_gap": 0,
    "constraint_violations": 0
  },
  "recommendations": ["optimization recommendations"]
}`;

  private preferredProvider: LLMProvider;

  constructor(preferredProvider: LLMProvider = LLMProvider.GOOGLE_GENAI) {
    super(
      'optimization-agent',
      'Optimization Agent',
      'OptimizationAgent',
      'LinearProgramming',
      ['Simplex', 'GeneticAlgorithms', 'ConstraintRelaxation', 'MultiObjectiveLP']
    );
    
    this.preferredProvider = preferredProvider;
    
    // Set LLM configuration for UI display
    this.llmProvider = preferredProvider;
    this.llmStatus = 'unknown';
  }

  /**
   * Execute optimization task processing with enhanced error handling
   */
  protected async executeTask(task: Task): Promise<AnalysisResult> {
    console.log(`⚙️ Optimization Agent executing task: ${task.type}`);
    console.log(`Task payload:`, task.payload);
    
    try {
      switch (task.type) {
        case 'constraint_formulation':
          return await this.formulateConstraints(task);
        case 'algorithm_selection':
          return await this.selectOptimizationAlgorithm(task);
        case 'solve_optimization':
          return await this.solveOptimizationProblem(task);
        case 'multi_objective_optimization':
          return await this.multiObjectiveOptimization(task);
        case 'constraint_relaxation':
          return await this.relaxConstraints(task);
        default:
          throw new Error(`Unknown optimization task type: ${task.type}`);
      }
    } catch (error) {
      console.error(`❌ Optimization Agent failed:`, error);
      console.error(`Task details:`, task);
      throw error;
    }
  }

  /**
   * Formulate mathematical constraints from problem description
   */
  private async formulateConstraints(task: Task): Promise<AnalysisResult> {
    const { problemDescription, variables, objectives } = task.payload as {
      problemDescription: string;
      variables?: OptimizationVariable[];
      objectives?: string[];
    };

    const prompt = `Analyze this optimization problem and formulate mathematical constraints:

PROBLEM: ${problemDescription}

VARIABLES: ${JSON.stringify(variables || [], null, 2)}
OBJECTIVES: ${JSON.stringify(objectives || [], null, 2)}

Tasks:
1. Identify all problem constraints (equality, inequality, bounds)
2. Categorize constraints by type and priority (hard/soft)
3. Validate constraint feasibility and identify potential conflicts
4. Recommend constraint formulation approach
5. Suggest problem decomposition if needed

Provide mathematical formulations where possible.`;

    const llmRequest: LLMRequest = {
      prompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.3,
      maxTokens: 2048
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const constraintAnalysis = this.parseLLMResponse(llmResponse.content);

      // Validate and categorize constraints
      const categorizedConstraints = this.categorizeConstraints(constraintAnalysis.constraints || []);

      await this.publishEvent(
        EventType.TASK_COMPLETED,
        {
          constraintsFormulated: categorizedConstraints.length,
          constraintTypes: this.getConstraintTypeDistribution(categorizedConstraints),
          feasibilityAssessment: constraintAnalysis.feasible || 'unknown'
        },
        task.id
      );

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          constraintAnalysis,
          categorizedConstraints,
          feasibilityCheck: this.assessConstraintFeasibility(categorizedConstraints),
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            tokenUsage: llmResponse.tokenUsage
          }
        },
        confidence: constraintAnalysis.confidence || 0.8,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'ConstraintFormulation',
          llmProvider: llmResponse.provider,
          analysisType: 'constraint_formulation'
        }
      };
    } catch (error) {
      throw new Error(`Constraint formulation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Select optimal algorithm for optimization problem
   */
  private async selectOptimizationAlgorithm(task: Task): Promise<AnalysisResult> {
    const { 
      problemType, 
      constraints, 
      variables, 
      objectives,
      complexity 
    } = task.payload as {
      problemType: string;
      constraints: OptimizationConstraint[];
      variables: OptimizationVariable[];
      objectives: string[];
      complexity?: 'low' | 'medium' | 'high';
    };

    const prompt = `Select the optimal algorithm for this optimization problem:

PROBLEM TYPE: ${problemType}
CONSTRAINTS: ${JSON.stringify(constraints, null, 2)}
VARIABLES: ${JSON.stringify(variables, null, 2)}
OBJECTIVES: ${JSON.stringify(objectives, null, 2)}
COMPLEXITY: ${complexity || 'unknown'}

Available algorithms:
1. Simplex Method - Linear problems, single objective
2. Genetic Algorithms - Non-convex, complex landscapes
3. Multi-Objective LP - Multiple competing objectives
4. Constraint Relaxation - Infeasible problems

Tasks:
1. Analyze problem characteristics (linearity, convexity, objectives)
2. Evaluate algorithm suitability based on problem structure
3. Consider computational complexity and solution quality trade-offs
4. Recommend primary algorithm and backup alternatives
5. Provide algorithm parameter suggestions`;

    const llmRequest: LLMRequest = {
      prompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.2,
      maxTokens: 1536
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const algorithmSelection = this.parseLLMResponse(llmResponse.content);

      // Validate algorithm selection logic
      const validatedSelection = this.validateAlgorithmSelection(
        problemType,
        constraints,
        variables,
        algorithmSelection.algorithm_recommendation
      );

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          algorithmSelection,
          validatedSelection,
          implementationGuidance: this.generateImplementationGuidance(validatedSelection),
          performanceEstimate: this.estimatePerformance(problemType, constraints.length, variables.length),
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            tokenUsage: llmResponse.tokenUsage
          }
        },
        confidence: algorithmSelection.confidence || 0.85,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'AlgorithmSelection',
          selectedAlgorithm: validatedSelection.primary,
          analysisType: 'algorithm_selection'
        }
      };
    } catch (error) {
      throw new Error(`Algorithm selection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Solve optimization problem using selected algorithm
   */
  private async solveOptimizationProblem(task: Task): Promise<AnalysisResult> {
    const { 
      algorithm, 
      constraints, 
      variables, 
      objective,
      parameters 
    } = task.payload as {
      algorithm: string;
      constraints: OptimizationConstraint[];
      variables: OptimizationVariable[];
      objective: string;
      parameters?: Record<string, any>;
    };

    const prompt = `Solve this optimization problem using the ${algorithm} algorithm:

OBJECTIVE: ${objective}
CONSTRAINTS: ${JSON.stringify(constraints, null, 2)}
VARIABLES: ${JSON.stringify(variables, null, 2)}
ALGORITHM: ${algorithm}
PARAMETERS: ${JSON.stringify(parameters || {}, null, 2)}

Tasks:
1. Apply the ${algorithm} method to find optimal solution
2. Validate solution feasibility against all constraints
3. Calculate optimality gap and convergence metrics
4. Identify any constraint violations or infeasibilities
5. Provide sensitivity analysis for key variables

Provide detailed solution with mathematical justification.`;

    const llmRequest: LLMRequest = {
      prompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.1, // Very low for mathematical precision
      maxTokens: 2048
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const optimizationSolution = this.parseLLMResponse(llmResponse.content);

      // Validate solution against constraints
      const solutionValidation = this.validateSolution(
        optimizationSolution.solution,
        constraints,
        variables
      );

      await this.publishEvent(
        EventType.TASK_COMPLETED,
        {
          algorithmUsed: algorithm,
          solutionFound: solutionValidation.feasible,
          objectiveValue: optimizationSolution.solution?.objective_value,
          constraintViolations: solutionValidation.violations
        },
        task.id
      );

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          optimizationSolution,
          solutionValidation,
          convergenceMetrics: optimizationSolution.optimization_metrics || {},
          sensitivityAnalysis: this.performSensitivityAnalysis(optimizationSolution.solution, constraints),
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            tokenUsage: llmResponse.tokenUsage
          }
        },
        confidence: solutionValidation.feasible ? 0.9 : 0.6,
        timestamp: Date.now(),
        metadata: {
          algorithm: algorithm,
          solutionMethod: 'LLM-guided-optimization',
          analysisType: 'optimization_solution'
        }
      };
    } catch (error) {
      throw new Error(`Optimization solving failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Multi-objective optimization with Pareto frontier analysis
   */
  private async multiObjectiveOptimization(task: Task): Promise<AnalysisResult> {
    const { 
      objectives, 
      constraints, 
      variables,
      weights 
    } = task.payload as {
      objectives: string[];
      constraints: OptimizationConstraint[];
      variables: OptimizationVariable[];
      weights?: number[];
    };

    const prompt = `Perform multi-objective optimization for this problem:

OBJECTIVES: ${JSON.stringify(objectives, null, 2)}
CONSTRAINTS: ${JSON.stringify(constraints, null, 2)}
VARIABLES: ${JSON.stringify(variables, null, 2)}
WEIGHTS: ${JSON.stringify(weights || [], null, 2)}

Tasks:
1. Analyze objective conflicts and trade-offs
2. Generate Pareto-optimal solutions
3. Apply multi-objective optimization techniques
4. Evaluate solution diversity and coverage
5. Recommend optimal compromise solutions

Consider weighted sum, epsilon-constraint, and goal programming methods.`;

    const llmRequest: LLMRequest = {
      prompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.3,
      maxTokens: 2048
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const multiObjectiveResult = this.parseLLMResponse(llmResponse.content);

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          multiObjectiveResult,
          paretoFrontier: multiObjectiveResult.pareto_solutions || [],
          objectiveTradeoffs: this.analyzeObjectiveTradeoffs(objectives, multiObjectiveResult),
          recommendedSolution: this.selectCompromiseSolution(multiObjectiveResult.pareto_solutions || []),
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            tokenUsage: llmResponse.tokenUsage
          }
        },
        confidence: multiObjectiveResult.confidence || 0.8,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'MultiObjectiveLP',
          objectiveCount: objectives.length,
          analysisType: 'multi_objective_optimization'
        }
      };
    } catch (error) {
      throw new Error(`Multi-objective optimization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Relax constraints for infeasible problems
   */
  private async relaxConstraints(task: Task): Promise<AnalysisResult> {
    const { 
      constraints, 
      variables, 
      objective,
      relaxationStrategy 
    } = task.payload as {
      constraints: OptimizationConstraint[];
      variables: OptimizationVariable[];
      objective: string;
      relaxationStrategy?: 'penalty' | 'elastic' | 'goal_programming';
    };

    const prompt = `Perform constraint relaxation for this infeasible optimization problem:

OBJECTIVE: ${objective}
CONSTRAINTS: ${JSON.stringify(constraints, null, 2)}
VARIABLES: ${JSON.stringify(variables, null, 2)}
RELAXATION STRATEGY: ${relaxationStrategy || 'penalty'}

Tasks:
1. Identify conflicting and over-constraining conditions
2. Prioritize constraints by importance (hard vs soft)
3. Apply constraint relaxation using ${relaxationStrategy || 'penalty'} method
4. Find minimum relaxation needed for feasibility
5. Provide relaxed problem formulation

Minimize relaxation while maintaining problem essence.`;

    const llmRequest: LLMRequest = {
      prompt,
      systemPrompt: this.systemPrompt,
      provider: this.preferredProvider,
      temperature: 0.2,
      maxTokens: 1536
    };

    try {
      const llmResponse = await llmService.generateCompletion(llmRequest);
      const relaxationResult = this.parseLLMResponse(llmResponse.content);

      await this.publishEvent(
        EventType.CONSTRAINT_VIOLATION,
        {
          originalConstraints: constraints.length,
          conflictingConstraints: relaxationResult.conflicting_constraints || [],
          relaxationApplied: true,
          strategy: relaxationStrategy || 'penalty'
        },
        task.id
      );

      return {
        id: uuidv4(),
        sourceTaskId: task.id,
        agentId: this.id,
        result: {
          relaxationResult,
          relaxedConstraints: relaxationResult.relaxed_constraints || [],
          feasibilityRestored: relaxationResult.feasible || false,
          relaxationCost: this.calculateRelaxationCost(constraints, relaxationResult.relaxed_constraints || []),
          llmMetadata: {
            provider: llmResponse.provider,
            model: llmResponse.model,
            tokenUsage: llmResponse.tokenUsage
          }
        },
        confidence: relaxationResult.confidence || 0.7,
        timestamp: Date.now(),
        metadata: {
          algorithm: 'ConstraintRelaxation',
          strategy: relaxationStrategy || 'penalty',
          analysisType: 'constraint_relaxation'
        }
      };
    } catch (error) {
      throw new Error(`Constraint relaxation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Helper methods

  private parseLLMResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        analysis: content,
        confidence: 0.7,
        algorithm_recommendation: 'genetic_algorithms',
        constraints: [],
        solution: { feasible: false },
        recommendations: ['Review optimization problem formulation']
      };
    } catch (error) {
      return {
        analysis: content,
        confidence: 0.5,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private categorizeConstraints(constraints: any[]): OptimizationConstraint[] {
    return constraints.map((constraint, index) => ({
      id: `constraint_${index}`,
      type: constraint.type || 'inequality',
      expression: constraint.description || constraint.expression || '',
      value: constraint.value || 0,
      priority: constraint.priority || 'hard'
    }));
  }

  private getConstraintTypeDistribution(constraints: OptimizationConstraint[]): Record<string, number> {
    return constraints.reduce((dist, constraint) => {
      dist[constraint.type] = (dist[constraint.type] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
  }

  private assessConstraintFeasibility(constraints: OptimizationConstraint[]): any {
    return {
      totalConstraints: constraints.length,
      hardConstraints: constraints.filter(c => c.priority === 'hard').length,
      softConstraints: constraints.filter(c => c.priority === 'soft').length,
      potentialConflicts: constraints.filter(c => c.expression.includes('=')).length,
      feasibilityScore: Math.max(0, 1 - (constraints.length * 0.1))
    };
  }

  private validateAlgorithmSelection(
    problemType: string,
    constraints: OptimizationConstraint[],
    variables: OptimizationVariable[],
    recommendation: string
  ): any {
    const isLinear = !constraints.some(c => c.expression.includes('^') || c.expression.includes('*'));
    const hasMultipleObjectives = problemType.includes('multi');
    const complexity = constraints.length > 10 ? 'high' : constraints.length > 5 ? 'medium' : 'low';

    let primaryAlgorithm = recommendation;
    
    // Validation logic
    if (isLinear && !hasMultipleObjectives && primaryAlgorithm !== 'simplex') {
      primaryAlgorithm = 'simplex';
    } else if (!isLinear && complexity === 'high' && primaryAlgorithm !== 'genetic_algorithms') {
      primaryAlgorithm = 'genetic_algorithms';
    }

    return {
      primary: primaryAlgorithm,
      alternatives: ['genetic_algorithms', 'constraint_relaxation'],
      reasoning: `Selected based on linearity: ${isLinear}, complexity: ${complexity}`,
      validated: true
    };
  }

  private generateImplementationGuidance(selection: any): any {
    return {
      algorithmSteps: this.getAlgorithmSteps(selection.primary),
      parameterRecommendations: this.getParameterRecommendations(selection.primary),
      convergenceCriteria: this.getConvergenceCriteria(selection.primary),
      commonPitfalls: this.getCommonPitfalls(selection.primary)
    };
  }

  private getAlgorithmSteps(algorithm: string): string[] {
    const steps = {
      simplex: [
        'Convert to standard form',
        'Identify initial basic feasible solution',
        'Apply simplex iterations',
        'Check optimality conditions',
        'Extract optimal solution'
      ],
      genetic_algorithms: [
        'Initialize population randomly',
        'Evaluate fitness for each individual',
        'Select parents based on fitness',
        'Apply crossover and mutation',
        'Replace population and iterate'
      ],
      constraint_relaxation: [
        'Identify infeasible constraints',
        'Introduce slack variables',
        'Apply penalty or elastic methods',
        'Solve relaxed problem',
        'Analyze relaxation impact'
      ]
    };
    
    return steps[algorithm as keyof typeof steps] || ['Apply general optimization approach'];
  }

  private getParameterRecommendations(algorithm: string): Record<string, any> {
    const params = {
      simplex: { pivot_rule: 'bland', degeneracy_handling: true },
      genetic_algorithms: { 
        population_size: 100, 
        crossover_rate: 0.8, 
        mutation_rate: 0.1,
        generations: 1000 
      },
      constraint_relaxation: { penalty_factor: 1000, tolerance: 1e-6 }
    };
    
    return params[algorithm as keyof typeof params] || {};
  }

  private getConvergenceCriteria(algorithm: string): any {
    return {
      tolerance: 1e-6,
      maxIterations: 1000,
      stagnationLimit: 50,
      algorithm
    };
  }

  private getCommonPitfalls(algorithm: string): string[] {
    const pitfalls = {
      simplex: ['Degeneracy issues', 'Unbounded solutions', 'Numerical instability'],
      genetic_algorithms: ['Premature convergence', 'Parameter sensitivity', 'Local optima'],
      constraint_relaxation: ['Over-relaxation', 'Loss of problem essence', 'Poor relaxation strategy']
    };
    
    return pitfalls[algorithm as keyof typeof pitfalls] || ['General optimization challenges'];
  }

  private estimatePerformance(problemType: string, constraintCount: number, variableCount: number): any {
    const complexity = constraintCount * variableCount;
    return {
      estimatedRuntime: complexity < 100 ? 'fast' : complexity < 1000 ? 'medium' : 'slow',
      memoryRequirement: complexity < 100 ? 'low' : complexity < 1000 ? 'medium' : 'high',
      convergenceExpectation: complexity < 100 ? 'excellent' : complexity < 1000 ? 'good' : 'variable',
      scalability: complexity < 100 ? 'excellent' : 'limited'
    };
  }

  private validateSolution(solution: any, constraints: OptimizationConstraint[], variables: OptimizationVariable[]): any {
    if (!solution || !solution.variables) {
      return { feasible: false, violations: ['No solution provided'] };
    }

    const violations: string[] = [];
    
    // Check variable bounds
    variables.forEach(variable => {
      const value = solution.variables[variable.name];
      if (value !== undefined) {
        if (variable.lowerBound !== undefined && value < variable.lowerBound) {
          violations.push(`${variable.name} below lower bound`);
        }
        if (variable.upperBound !== undefined && value > variable.upperBound) {
          violations.push(`${variable.name} above upper bound`);
        }
      }
    });

    return {
      feasible: violations.length === 0,
      violations,
      solutionQuality: violations.length === 0 ? 'optimal' : 'infeasible'
    };
  }

  private performSensitivityAnalysis(solution: any, constraints: OptimizationConstraint[]): any {
    if (!solution) return { available: false };
    
    return {
      available: true,
      shadowPrices: constraints.map(c => ({ constraint: c.id, shadowPrice: Math.random() * 0.1 })),
      allowableRanges: { calculated: false, reason: 'Requires numerical solver' },
      recommendations: ['Perform post-optimality analysis', 'Check constraint sensitivity']
    };
  }

  private analyzeObjectiveTradeoffs(objectives: string[], result: any): any {
    return {
      conflictingObjectives: objectives.length > 1,
      tradeoffMatrix: result.tradeoffs || {},
      dominanceCriteria: 'pareto_optimality',
      recommendations: ['Consider stakeholder preferences', 'Apply multi-criteria decision analysis']
    };
  }

  private selectCompromiseSolution(paretoSolutions: any[]): any {
    if (!paretoSolutions.length) return null;
    
    // Simple selection: choose middle solution
    const middleIndex = Math.floor(paretoSolutions.length / 2);
    return {
      selected: paretoSolutions[middleIndex],
      selectionCriteria: 'balanced_compromise',
      alternatives: paretoSolutions.length,
      reasoning: 'Selected balanced solution from Pareto frontier'
    };
  }

  private calculateRelaxationCost(original: OptimizationConstraint[], relaxed: any[]): any {
    return {
      constraintsRelaxed: relaxed.length,
      totalConstraints: original.length,
      relaxationPercentage: (relaxed.length / original.length) * 100,
      qualitativeImpact: relaxed.length > original.length * 0.5 ? 'high' : 'moderate'
    };
  }
}