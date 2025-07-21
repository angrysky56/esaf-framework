/**
 * Chat Interface Component for ESAF Framework
 * @fileoverview Interactive chat interface with AI agents
 */

import React, { useState, useRef, useEffect } from 'react';
import { ESAFOrchestrator } from '@/core/orchestrator.js';
import { TaskPriority } from '@/core/types.js';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
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
 * Chat interface for conversing with ESAF agents
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  frameworkInstance,
  isInitialized
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to ESAF Framework! I can help you analyze data, solve problems, and answer questions using our multi-agent cognitive system. What would you like to explore today?',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('intelligent_analysis');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle sending a message
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
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Create a task based on the user's message
      const taskId = await frameworkInstance.createTask(
        selectedAnalysisType,
        {
          query: inputMessage.trim(),
          analysisType: selectedAnalysisType,
          timestamp: Date.now()
        },
        TaskPriority.HIGH
      );

      // Add processing message
      const processingMessage: ChatMessage = {
        id: `processing-${Date.now()}`,
        type: 'system',
        content: `Processing your request with ${selectedAnalysisType} agents...`,
        timestamp: Date.now(),
        metadata: { taskId }
      };

      setMessages(prev => [...prev, processingMessage]);

      // Simulate agent processing and response
      setTimeout(async () => {
        try {
          // Get task results (in a real implementation, this would be from the framework)
          const responseMessage: ChatMessage = {
            id: `response-${Date.now()}`,
            type: 'agent',
            content: generateAgentResponse(inputMessage.trim(), selectedAnalysisType),
            timestamp: Date.now(),
            agentName: 'ESAF Cognitive System',
            metadata: { taskId, analysisType: selectedAnalysisType }
          };

          setMessages(prev => prev.filter(m => m.id !== processingMessage.id).concat(responseMessage));
        } catch (error) {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            type: 'system',
            content: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: Date.now(),
            metadata: { error: true }
          };

          setMessages(prev => prev.filter(m => m.id !== processingMessage.id).concat(errorMessage));
        } finally {
          setIsProcessing(false);
        }
      }, 2000);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        metadata: { error: true }
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  };

  /**
   * Generate a simulated agent response (replace with actual framework integration)
   */
  const generateAgentResponse = (query: string, analysisType: string): string => {
    const responses = {
      intelligent_analysis: `I've analyzed your query "${query}" using our multi-agent cognitive system. Here's what I found:

🧠 **Cognitive Analysis Results:**
- The query involves ${query.split(' ').length} key concepts
- Primary intent: Information seeking and analysis
- Complexity level: ${query.length > 50 ? 'High' : query.length > 20 ? 'Medium' : 'Low'}

📊 **Multi-Agent Processing:**
- Data Analysis Agent: Validated query structure and extracted key parameters
- Optimization Agent: Identified optimal processing pathway
- Game Theory Agent: Assessed strategic implications
- Decision Making Agent: Synthesized findings into actionable insights

🎯 **Recommendations:**
Based on the analysis, I recommend exploring this topic further through targeted data collection and hypothesis testing.`,

      data_validation: `Data validation complete for your query. The system has verified the input parameters and confirmed data integrity across all processing layers.`,

      feature_extraction: `Feature extraction performed on your query. Identified ${Math.floor(Math.random() * 10) + 5} key features and patterns for further analysis.`,

      anomaly_detection: `Anomaly detection scan completed. ${Math.random() > 0.7 ? 'Potential anomalies detected in the data pattern.' : 'No anomalies detected in the current dataset.'}`
    };

    return responses[analysisType as keyof typeof responses] || 
           `Processed your request using ${analysisType}. The agents have completed their analysis and provided insights based on your query.`;
  };

  /**
   * Handle enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * Get message styling classes
   */
  const getMessageClasses = (message: ChatMessage): string => {
    const baseClasses = "max-w-3xl mx-auto px-4 py-3 rounded-lg";
    
    switch (message.type) {
      case 'user':
        return `${baseClasses} bg-blue-600 text-white ml-auto`;
      case 'agent':
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white`;
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
              Powered by ESAF Multi-Agent Cognitive System
            </p>
          </div>
          
          {/* Analysis Type Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analysis Type:
            </label>
            <select
              value={selectedAnalysisType}
              onChange={(e) => setSelectedAnalysisType(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="intelligent_analysis">🧠 Intelligent Analysis</option>
              <option value="data_validation">🔍 Data Validation</option>
              <option value="feature_extraction">📊 Feature Extraction</option>
              <option value="anomaly_detection">⚠️ Anomaly Detection</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-2">
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={getMessageClasses(message)}>
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {message.type === 'agent' && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {message.type === 'user' ? 'You' : 
                       message.type === 'agent' ? (message.agentName || 'AI Agent') : 
                       'System'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                {/* Message Content */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {message.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  AI agents are thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about data analysis, problem solving, or general questions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
              disabled={!isInitialized}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !isInitialized || isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              onClick={() => {
                setMessages([{
                  id: '1',
                  type: 'system',
                  content: 'Chat cleared. How can I help you today?',
                  timestamp: Date.now()
                }]);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};
