/**
 * Enhanced Chat Interface with Persistent History and Document Context
 * @fileoverview Uses persistent storage, conversation continuity, and document context
 */

import React, { useState, useRef, useEffect } from 'react';
import { ESAFOrchestrator } from '@/core/orchestrator';
import { llmService, LLMProvider, LLMRequest } from '@/core/llm-service';
import { storageManager, ChatMessage, ChatSession, DocumentSource } from '@/stores/storage-manager';
import { ChatHistory } from './ChatHistory';
import { DocumentLibrary } from './DocumentLibrary';

interface ChatInterfaceProps {
  frameworkInstance: ESAFOrchestrator;
  isInitialized: boolean;
}

/**
 * Enhanced chat interface with persistent history and document context
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  frameworkInstance,
  isInitialized
}) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentSource[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.GOOGLE_GENAI);
  const [model, setModel] = useState('gemini-2.0-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save messages whenever they change
    if (currentSession) {
      storageManager.saveChatMessages(currentSession.id, messages);
    }
  }, [messages, currentSession]);

  const initializeSession = () => {
    const currentSessionId = storageManager.getCurrentSessionId();
    
    if (currentSessionId) {
      // Load existing session
      const session = storageManager.getChatSession(currentSessionId);
      if (session) {
        setCurrentSession(session);
        const sessionMessages = storageManager.getChatMessages(currentSessionId);
        
        if (sessionMessages.length === 0) {
          // Add welcome message for existing empty session
          addWelcomeMessage(currentSessionId);
        } else {
          setMessages(sessionMessages);
        }
        return;
      }
    }
    
    // Create new session
    createNewSession();
  };

  const createNewSession = () => {
    const newSession = storageManager.createNewSession();
    setCurrentSession(newSession);
    addWelcomeMessage(newSession.id);
  };

  const addWelcomeMessage = (sessionId: string) => {
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'system',
      content: `🧠 **ESAF Framework - Enhanced Multi-Agent System**

I maintain **conversation continuity** and can work with your **document library**:

💬 **Conversational Memory**: I remember our entire conversation history
📚 **Document Context**: Select documents from your library for analysis
🔬 **Multi-Agent Processing**: I coordinate specialized agents for complex tasks
⚡ **Dynamic Adaptation**: I choose the best approach for each query

**New Features:**
- 💾 **Persistent History**: All conversations are automatically saved
- 📁 **Document Library**: Upload, manage, and select context documents
- 🔄 **Session Management**: Resume any previous conversation
- 🎯 **Smart Context**: I use selected documents to inform my responses

Select documents from the Library tab, and I'll use them as context for our conversation!`,
      timestamp: Date.now(),
      sessionId
    };
    
    setMessages([welcomeMessage]);
    storageManager.addMessageToSession(sessionId, welcomeMessage);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = storageManager.getChatSession(sessionId);
    if (session) {
      setCurrentSession(session);
      storageManager.setCurrentSessionId(sessionId);
      const sessionMessages = storageManager.getChatMessages(sessionId);
      setMessages(sessionMessages);
      setShowHistory(false);
    }
  };

  const handleNewSession = () => {
    createNewSession();
    setShowHistory(false);
  };

  const handleDocumentSelectionChange = (documents: DocumentSource[]) => {
    setSelectedDocuments(documents);
  };

  const buildConversationHistory = (): string => {
    // Build conversation context from recent messages (last 10 exchanges)
    const recentMessages = messages
      .filter(msg => msg.type === 'user' || msg.type === 'agent')
      .slice(-20); // Last 20 messages (10 exchanges)

    if (recentMessages.length === 0) {
      return '';
    }

    let context = '\n\nPREVIOUS CONVERSATION CONTEXT:\n';
    recentMessages.forEach((msg, index) => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      context += `\n${role}: ${msg.content}`;
    });
    
    return context;
  };

  const buildDocumentContext = (): string => {
    if (selectedDocuments.length === 0) {
      return '';
    }

    let context = '\n\nSELECTED DOCUMENTS FOR CONTEXT:\n';
    selectedDocuments.forEach((doc, index) => {
      context += `\n--- Document ${index + 1}: ${doc.name} ---\n`;
      if (doc.metadata.description) {
        context += `Description: ${doc.metadata.description}\n`;
      }
      context += `${doc.content.substring(0, 2000)}${doc.content.length > 2000 ? '...' : ''}\n`;
    });
    
    return context;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !currentSession) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: Date.now(),
      sessionId: currentSession.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Build enhanced prompt with conversation history and document context
      const conversationHistory = buildConversationHistory();
      const documentContext = buildDocumentContext();
      
      const systemPrompt = `You are the ESAF (Evolved Synergistic Agentic Framework) Assistant. You coordinate multiple specialized AI agents to provide comprehensive analysis and solutions.

CORE CAPABILITIES:
- Data Analysis (Bayesian methods, anomaly detection)
- Optimization (linear programming, constraint solving) 
- Game Theory (strategic analysis, equilibrium computation)
- Swarm Intelligence (adaptive learning, emergent behavior)
- Decision Making (multi-criteria analysis, synthesis)

CONVERSATION CONTINUITY INSTRUCTIONS:
- Remember and reference previous messages from our conversation
- Build upon previous analysis, decisions, and recommendations
- Maintain consistent reasoning and conclusions throughout
- If the user asks about something mentioned earlier, refer back to it
- Acknowledge when you're building on previous work or changing direction

CONTEXT AWARENESS:
- Use the selected documents as authoritative sources when relevant
- Cross-reference document information with the conversation
- Cite specific documents when using their information
- Explain how document content relates to the user's current question${conversationHistory}${documentContext}`;

      const enhancedPrompt = inputMessage;

      // Create LLM request with full context
      const request: LLMRequest = {
        prompt: enhancedPrompt,
        systemPrompt,
        provider,
        temperature: 0.7,
        maxTokens: 8164
      };

      console.log('🚀 Sending enhanced request with context:', {
        conversationHistory: conversationHistory.length > 0,
        documentContext: documentContext.length > 0,
        selectedDocs: selectedDocuments.length,
        provider,
        model
      });

      const response = await llmService.generateCompletion(request);

      const agentMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'agent',
        content: response.content,
        timestamp: Date.now(),
        agentName: 'ESAF Assistant',
        sessionId: currentSession.id,
        metadata: {
          provider: response.provider,
          model: response.model,
          tokenUsage: response.tokenUsage,
          conversationContext: conversationHistory.length > 0,
          documentContext: selectedDocuments.length,
          timestamp: response.timestamp
        }
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'system',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'An unexpected error occurred'}\n\nPlease check your API configuration in Settings and try again.`,
        timestamp: Date.now(),
        sessionId: currentSession.id
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (message: ChatMessage): React.ReactNode => {
    if (message.type === 'system') {
      return (
        <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <div 
            className="text-blue-100 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: message.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>')
                .replace(/\n/g, '<br/>')
            }}
          />
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words">
        {message.content.split('\n').map((line, index) => {
          if (line.trim() === '') {
            return <br key={index} />;
          }
          
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          return (
            <div 
              key={index}
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* History Sidebar */}
      {showHistory && (
        <div className="w-80 flex-shrink-0">
          <ChatHistory
            currentSessionId={currentSession?.id || ''}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showHistory 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                History
              </button>
              
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showLibrary 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Library {selectedDocuments.length > 0 && `(${selectedDocuments.length})`}
              </button>
            </div>

            <div className="flex items-center gap-4">
              {selectedDocuments.length > 0 && (
                <div className="text-sm text-green-400">
                  📚 {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                </div>
              )}
              
              <h1 className="text-xl font-bold text-white">
                {currentSession?.title || 'New Chat'}
              </h1>
              
              <div className="text-sm text-gray-400">
                {isInitialized ? (
                  <span className="text-green-400">● System Online</span>
                ) : (
                  <span className="text-yellow-400">● Initializing...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-4xl p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'system'
                    ? 'bg-gray-800 text-gray-100 w-full'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.type !== 'user' && message.type !== 'system' && (
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                    <span className="font-medium">{message.agentName || 'ESAF Assistant'}</span>
                    <span>•</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>ESAF Assistant</span>
                  </div>
                )}
                
                <div className="text-sm">
                  {formatMessage(message)}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>ESAF Assistant is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything - my Decision Making Agent will determine the optimal response approach..."
              className="flex-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows={2}
              disabled={isProcessing || !isInitialized}
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputMessage.trim() || !isInitialized}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Press Enter to send • Shift+Enter for new line
            {selectedDocuments.length > 0 && (
              <span className="ml-4 text-green-400">
                Using {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} as context
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Library Sidebar */}
      {showLibrary && (
        <div className="w-80 flex-shrink-0">
          <DocumentLibrary
            onDocumentSelectionChange={handleDocumentSelectionChange}
          />
        </div>
      )}
    </div>
  );
};
