/**
 * Enhanced Chat Interface with Intelligent Decision Making
 * @fileoverview Uses Decision Making Agent to determine optimal response strategy
 */

import React, { useState, useRef, useEffect } from 'react';
import { ESAFOrchestrator } from '@/core/orchestrator';
import { sharedDataContext } from '@/core/shared-data-context';
import { llmService, LLMProvider, LLMRequest } from '@/core/llm-service';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'conversation' | 'thinking';
  content: string;
  timestamp: number;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

interface ChatInterfaceProps {
  frameworkInstance: ESAFOrchestrator;
  isInitialized: boolean;
}

/**
 * Intelligent chat interface using Decision Making Agent for routing decisions
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  frameworkInstance,
  isInitialized
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: `🧠 **ESAF Framework - Intelligent Multi-Agent System**

I use my Decision Making Agent to determine the best way to help you:

💬 **Simple questions** → Direct conversation
🔬 **Complex analysis** → Specialized agent coordination
📊 **Data-driven tasks** → Mathematical algorithms + expert interpretation

Just ask naturally - my Decision Making Agent will determine the optimal approach!`,
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Enhanced message handler using Decision Making Agent for intelligent routing
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isInitialized || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    try {
      await handleIntelligentRouting(userQuery);
    } catch (error) {
      console.error('Intelligent routing failed:', error);
      await handleError(error, userQuery);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Use Decision Making Agent to determine optimal response strategy
   */
  const handleIntelligentRouting = async (userQuery: string) => {
    // Show thinking process
    const thinkingMessage: ChatMessage = {
      id: `thinking-${Date.now()}`,
      type: 'thinking',
      content: `🤔 **Decision Making Agent Evaluating...**

Query: "${userQuery}"

Analyzing available capabilities and determining optimal response strategy...`,
      timestamp: Date.now(),
      metadata: { temporary: true }
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Get current system context
      const dataContext = sharedDataContext.getAgentContext();
      
      // Create decision task for the Decision Making Agent
      console.log('🎯 Engaging Decision Making Agent for routing decision...');
      
      const decisionTaskId = await frameworkInstance.createDecisionMakingTask(
        'decision_integration',
        {
          query: userQuery,
          systemContext: {
            availableAgents: [
              {
                name: 'Data Analysis',
                capabilities: ['statistical analysis', 'anomaly detection', 'pattern recognition', 'data validation'],
                optimal_for: 'numerical data analysis, finding insights in datasets'
              },
              {
                name: 'Optimization', 
                capabilities: ['algorithm selection', 'constraint solving', 'multi-objective optimization'],
                optimal_for: 'finding best solutions, optimizing processes'
              },
              {
                name: 'Game Theory',
                capabilities: ['strategy formulation', 'conflict resolution', 'equilibrium analysis'],
                optimal_for: 'competitive scenarios, strategic planning'
              },
              {
                name: 'Swarm Intelligence',
                capabilities: ['adaptive learning', 'emergent behavior analysis', 'system optimization'],
                optimal_for: 'complex system optimization, learning from patterns'
              },
              {
                name: 'Direct Conversation',
                capabilities: ['explanations', 'Q&A', 'educational content', 'general assistance'],
                optimal_for: 'questions, explanations, general help'
              }
            ],
            availableData: dataContext.availableData,
            dataTypes: dataContext.dataSummary,
            conversationHistory: messages.slice(-3).map(m => m.content)
          },
          decisionCriteria: [
            {
              id: 'value_added',
              name: 'Value Added by Specialized Processing',
              weight: 0.4,
              type: 'benefit',
              scale: 'ratio',
              description: 'How much additional value would specialized agents provide over direct conversation?'
            },
            {
              id: 'complexity',
              name: 'Query Complexity',
              weight: 0.3,
              type: 'benefit', 
              scale: 'ratio',
              description: 'Does this require specialized algorithms or can be answered conversationally?'
            },
            {
              id: 'data_utilization',
              name: 'Data Utilization Potential',
              weight: 0.2,
              type: 'benefit',
              scale: 'ratio',
              description: 'Would this benefit from analyzing available data?'
            },
            {
              id: 'user_intent',
              name: 'User Intent Clarity',
              weight: 0.1,
              type: 'benefit',
              scale: 'ratio',
              description: 'Is the user seeking explanation or actual analysis?'
            }
          ],
          alternatives: [
            {
              id: 'direct_conversation',
              name: 'Direct Conversational Response',
              scores: { value_added: 0.3, complexity: 0.2, data_utilization: 0.1, user_intent: 0.8 },
              metadata: { approach: 'llm_direct', estimated_time: '2-5 seconds' }
            },
            {
              id: 'single_agent',
              name: 'Single Specialized Agent',
              scores: { value_added: 0.7, complexity: 0.6, data_utilization: 0.8, user_intent: 0.6 },
              metadata: { approach: 'single_agent', estimated_time: '10-30 seconds' }
            },
            {
              id: 'multi_agent',
              name: 'Multi-Agent Analysis',
              scores: { value_added: 0.9, complexity: 0.9, data_utilization: 0.9, user_intent: 0.4 },
              metadata: { approach: 'multi_agent', estimated_time: '30-60 seconds' }
            }
          ]
        }
      );

      // Wait for decision
      await frameworkInstance.waitForTaskCompletion(decisionTaskId);
      const decisionResult = frameworkInstance.getResult(decisionTaskId);

      // Remove thinking message
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));

      if (decisionResult?.result) {
        await executeDecisionMakingRecommendation(decisionResult.result, userQuery);
      } else {
        // Fallback to conversation if decision making fails
        console.warn('Decision Making Agent failed, falling back to conversation');
        await handleDirectConversation(userQuery, 'Decision Making Agent unavailable');
      }

    } catch (error) {
      console.error('Decision Making Agent failed:', error);
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      await handleDirectConversation(userQuery, 'Decision making failed');
    }
  };

  /**
   * Execute the recommendation from Decision Making Agent
   */
  const executeDecisionMakingRecommendation = async (
    decision: any, 
    userQuery: string
  ) => {
    console.log('🎯 Decision Making Agent recommendation:', decision);

    // Parse the decision and determine approach
    const approach = decision.recommendedApproach || decision.analysis || 'direct_conversation';
    
    // Extract the recommended strategy from the decision
    if (typeof decision === 'string') {
      if (decision.toLowerCase().includes('direct') || 
          decision.toLowerCase().includes('conversation') ||
          decision.toLowerCase().includes('explain') ||
          decision.toLowerCase().includes('simple')) {
        await handleDirectConversation(userQuery, 'Decision Agent recommends direct conversation');
      } else {
        await handleAgentCoordination(userQuery, decision);
      }
    } else if (decision.recommendedApproach) {
      switch (decision.recommendedApproach) {
        case 'direct_conversation':
          await handleDirectConversation(userQuery, 'Decision Agent: Direct conversation optimal');
          break;
        case 'single_agent':
        case 'multi_agent':
          await handleAgentCoordination(userQuery, decision);
          break;
        default:
          await handleDirectConversation(userQuery, 'Default approach selected');
      }
    } else {
      // If we can't parse the decision, look for key indicators
      const decisionText = JSON.stringify(decision).toLowerCase();
      if (decisionText.includes('agent') && 
          (decisionText.includes('data') || decisionText.includes('analysis'))) {
        await handleAgentCoordination(userQuery, decision);
      } else {
        await handleDirectConversation(userQuery, 'Decision analysis suggests conversation');
      }
    }
  };

  /**
   * Handle direct conversational response
   */
  const handleDirectConversation = async (query: string, reason: string) => {
    console.log(`💬 ${reason}: "${query}"`);
    
    try {
      const conversationPrompt = `The user asked: "${query}"

You are an AI assistant that's part of the ESAF multi-agent system. Your Decision Making Agent determined that this question is best answered through direct conversation rather than specialized agent processing.

Provide a helpful, informative response. If the topic relates to data analysis, optimization, game theory, or other technical subjects, explain the concepts clearly but mention that if they have specific data or problems to work with, your specialized agents can provide deeper analysis.

Be conversational, helpful, and educational.`;

      const llmRequest: LLMRequest = {
        prompt: conversationPrompt,
        systemPrompt: 'You are a helpful AI assistant with access to specialized analysis agents when needed.',
        provider: LLMProvider.GOOGLE_GENAI,
        temperature: 0.7,
        maxTokens: 1024
      };

      const response = await llmService.generateCompletion(llmRequest);

      const conversationMessage: ChatMessage = {
        id: `conversation-${Date.now()}`,
        type: 'conversation',
        content: `## 💬 Direct Response

${response.content}

---
*Decision Making Agent determined direct conversation was optimal for this query. For data analysis or complex problem-solving, just ask and I'll coordinate my specialized agents!*`,
        timestamp: Date.now(),
        agentName: 'ESAF Assistant',
        metadata: { 
          provider: response.provider, 
          mode: 'conversation',
          reason
        }
      };

      setMessages(prev => [...prev, conversationMessage]);

    } catch (error) {
      console.error('Direct conversation failed:', error);
      
      const fallbackMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        type: 'conversation',
        content: `I understand you're asking: "${query}"

I'm having trouble with my conversation system right now, but I'm here to help! If you need analysis of data or complex problem-solving, I can coordinate my specialized agents for that.`,
        timestamp: Date.now(),
        agentName: 'ESAF Assistant',
        metadata: { mode: 'fallback' }
      };

      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  /**
   * Handle specialized agent coordination
   */
  const handleAgentCoordination = async (userQuery: string, decision: any) => {
    console.log(`🧠 Decision Agent recommends agent coordination for: "${userQuery}"`);
    
    // Show coordination process
    const coordinationMessage: ChatMessage = {
      id: `coordination-${Date.now()}`,
      type: 'thinking',
      content: `🎯 **Orchestrator Coordinating Specialized Agents**

Decision Making Agent determined this query would benefit from specialized processing.

Engaging appropriate agents based on query analysis...`,
      timestamp: Date.now(),
      metadata: { temporary: true }
    };

    setMessages(prev => [...prev, coordinationMessage]);

    try {
      // Get data context
      const dataContext = sharedDataContext.getAgentContext();
      
      // Determine which agents to engage based on query
      const results: Record<string, any> = {};
      
      // For now, start with Data Analysis Agent for most analytical queries
      console.log('📊 Engaging Data Analysis Agent...');
      const dataTaskId = await frameworkInstance.createDataAnalysisTask(
        'intelligent_analysis',
        {
          query: userQuery,
          data: dataContext.numericalData.length > 0 ? dataContext.numericalData : dataContext.tabularData,
          context: dataContext.dataSummary,
          availableData: dataContext.availableData,
          decisionContext: decision
        }
      );

      await frameworkInstance.waitForTaskCompletion(dataTaskId);
      const dataResult = frameworkInstance.getResult(dataTaskId);
      
      if (dataResult) {
        results.data_analysis = dataResult;
      }

      // Remove coordination message and show results
      setMessages(prev => prev.filter(m => m.id !== coordinationMessage.id));

      const responseMessage: ChatMessage = {
        id: `response-${Date.now()}`,
        type: 'agent',
        content: formatAgentResults(results, userQuery, decision),
        timestamp: Date.now(),
        agentName: 'ESAF Multi-Agent System',
        metadata: {
          decision,
          results,
          approach: 'agent_coordination'
        }
      };

      setMessages(prev => [...prev, responseMessage]);

    } catch (error) {
      console.error('Agent coordination failed:', error);
      setMessages(prev => prev.filter(m => m.id !== coordinationMessage.id));
      await handleDirectConversation(userQuery, 'Agent coordination failed, using conversation');
    }
  };

  /**
   * Format results from agent coordination
   */
  const formatAgentResults = (
    results: Record<string, any>,
    originalQuery: string,
    decision: any
  ): string => {
    const sections = [];

    sections.push(`# 🎯 Intelligent Analysis Results`);
    sections.push(`**Your Query**: "${originalQuery}"`);
    sections.push('');

    if (results.data_analysis && !results.data_analysis.error) {
      sections.push(`## 📊 Data Analysis`);
      const analysis = results.data_analysis.result;
      
      if (analysis?.interpretation) {
        sections.push(analysis.interpretation);
      } else if (analysis?.analysis) {
        sections.push(analysis.analysis);
      }

      if (analysis?.insights) {
        sections.push(`**Key Insights**:`);
        if (Array.isArray(analysis.insights)) {
          analysis.insights.forEach((insight: string) => sections.push(`• ${insight}`));
        }
      }
      sections.push('');
    }

    sections.push(`---`);
    sections.push(`*Decision Making Agent coordinated this response for optimal value*`);

    return sections.join('\n');
  };

  /**
   * Handle errors gracefully
   */
  const handleError = async (error: any, originalQuery: string) => {
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      type: 'system',
      content: `❌ **System Error**

Query: "${originalQuery}"
Error: ${error instanceof Error ? error.message : 'Unknown error'}

The Decision Making Agent and Orchestrator are having trouble. Try refreshing or asking a simpler question.`,
      timestamp: Date.now(),
      metadata: { error: true }
    };

    setMessages(prev => [...prev, errorMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageClasses = (message: ChatMessage): string => {
    const baseClasses = "max-w-3xl mx-auto px-4 py-3 rounded-lg";

    switch (message.type) {
      case 'user':
        return `${baseClasses} bg-blue-600 text-white ml-auto`;
      case 'agent':
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white`;
      case 'conversation':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800`;
      case 'thinking':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800`;
      case 'system':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Chat Interface
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Decision Making Agent determines optimal response strategy
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{isInitialized ? 'Connected' : 'Initializing...'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={getMessageClasses(message)}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {message.type === 'user' ? 'You' : message.agentName || 'ESAF'}
                </span>
                {message.type === 'conversation' && (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                    Direct Response
                  </span>
                )}
                {message.type === 'agent' && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
                    Agent Coordination
                  </span>
                )}
                {message.type === 'thinking' && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
                    Processing
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything - my Decision Making Agent will determine the optimal response approach..."
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={2}
            disabled={!isInitialized || isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isInitialized || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isProcessing ? '🧠' : 'Send'}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Decision Making Agent evaluates each query for optimal processing approach
        </div>
      </div>
    </div>
  );
};
