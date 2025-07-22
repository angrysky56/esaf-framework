/**
 * Persistent Storage Manager for ESAF Framework
 * @fileoverview Handles chat history, document library, and session management
 */

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'conversation' | 'thinking';
  content: string;
  timestamp: number;
  agentName?: string;
  metadata?: Record<string, unknown>;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created: number;
  lastActivity: number;
  messageCount: number;
  summary?: string;
  tags?: string[];
}

export interface DocumentSource {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text' | 'analysis';
  content: string;
  metadata: {
    size?: number;
    format?: string;
    created: number;
    lastAccessed: number;
    tags: string[];
    description?: string;
  };
  isSelected: boolean;
}

export interface ConversationContext {
  sessionId: string;
  messages: ChatMessage[];
  selectedDocuments: string[];
  systemPrompt?: string;
  preferences: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

class PersistentStorageManager {
  private static instance: PersistentStorageManager;
  private readonly STORAGE_PREFIX = 'esaf_';
  private readonly CHAT_SESSIONS_KEY = 'chat_sessions';
  private readonly DOCUMENTS_KEY = 'documents';
  private readonly CURRENT_SESSION_KEY = 'current_session';
  private readonly SETTINGS_KEY = 'settings';

  private constructor() {}

  static getInstance(): PersistentStorageManager {
    if (!PersistentStorageManager.instance) {
      PersistentStorageManager.instance = new PersistentStorageManager();
    }
    return PersistentStorageManager.instance;
  }

  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Chat Session Management
   */
  
  saveChatSession(session: ChatSession): void {
    const sessions = this.getAllChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    // Sort by last activity (most recent first)
    sessions.sort((a, b) => b.lastActivity - a.lastActivity);
    
    localStorage.setItem(
      this.getStorageKey(this.CHAT_SESSIONS_KEY), 
      JSON.stringify(sessions)
    );
  }

  getAllChatSessions(): ChatSession[] {
    const stored = localStorage.getItem(this.getStorageKey(this.CHAT_SESSIONS_KEY));
    return stored ? JSON.parse(stored) : [];
  }

  getChatSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllChatSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  deleteChatSession(sessionId: string): void {
    const sessions = this.getAllChatSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    
    localStorage.setItem(
      this.getStorageKey(this.CHAT_SESSIONS_KEY), 
      JSON.stringify(filtered)
    );
    
    // Also delete messages for this session
    this.deleteChatMessages(sessionId);
    
    // If this was the current session, clear it
    const currentSession = this.getCurrentSessionId();
    if (currentSession === sessionId) {
      this.setCurrentSessionId('');
    }
  }

  /**
   * Chat Messages Management
   */
  
  saveChatMessages(sessionId: string, messages: ChatMessage[]): void {
    const key = `chat_messages_${sessionId}`;
    localStorage.setItem(
      this.getStorageKey(key), 
      JSON.stringify(messages)
    );
    
    // Update session metadata
    const session = this.getChatSession(sessionId);
    if (session) {
      session.messageCount = messages.length;
      session.lastActivity = Date.now();
      
      // Generate title from first user message if not set
      if (!session.title || session.title === 'New Chat') {
        const firstUserMessage = messages.find(m => m.type === 'user');
        if (firstUserMessage) {
          session.title = this.generateChatTitle(firstUserMessage.content);
        }
      }
      
      this.saveChatSession(session);
    }
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    const key = `chat_messages_${sessionId}`;
    const stored = localStorage.getItem(this.getStorageKey(key));
    return stored ? JSON.parse(stored) : [];
  }

  deleteChatMessages(sessionId: string): void {
    const key = `chat_messages_${sessionId}`;
    localStorage.removeItem(this.getStorageKey(key));
  }

  addMessageToSession(sessionId: string, message: ChatMessage): void {
    const messages = this.getChatMessages(sessionId);
    messages.push(message);
    this.saveChatMessages(sessionId, messages);
  }

  /**
   * Document Library Management
   */
  
  saveDocument(document: DocumentSource): void {
    const documents = this.getAllDocuments();
    const existingIndex = documents.findIndex(d => d.id === document.id);
    
    document.metadata.lastAccessed = Date.now();
    
    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    localStorage.setItem(
      this.getStorageKey(this.DOCUMENTS_KEY), 
      JSON.stringify(documents)
    );
  }

  getAllDocuments(): DocumentSource[] {
    const stored = localStorage.getItem(this.getStorageKey(this.DOCUMENTS_KEY));
    return stored ? JSON.parse(stored) : [];
  }

  getDocument(documentId: string): DocumentSource | null {
    const documents = this.getAllDocuments();
    return documents.find(d => d.id === documentId) || null;
  }

  deleteDocument(documentId: string): void {
    const documents = this.getAllDocuments();
    const filtered = documents.filter(d => d.id !== documentId);
    
    localStorage.setItem(
      this.getStorageKey(this.DOCUMENTS_KEY), 
      JSON.stringify(filtered)
    );
  }

  getSelectedDocuments(): DocumentSource[] {
    return this.getAllDocuments().filter(d => d.isSelected);
  }

  setDocumentSelection(documentId: string, selected: boolean): void {
    const documents = this.getAllDocuments();
    const document = documents.find(d => d.id === documentId);
    
    if (document) {
      document.isSelected = selected;
      this.saveDocument(document);
    }
  }

  /**
   * Session State Management
   */
  
  getCurrentSessionId(): string {
    return localStorage.getItem(this.getStorageKey(this.CURRENT_SESSION_KEY)) || '';
  }

  setCurrentSessionId(sessionId: string): void {
    localStorage.setItem(this.getStorageKey(this.CURRENT_SESSION_KEY), sessionId);
  }

  createNewSession(): ChatSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      created: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      tags: []
    };
    
    this.saveChatSession(session);
    this.setCurrentSessionId(sessionId);
    
    return session;
  }

  /**
   * Context Management for AI Conversations
   */
  
  buildConversationContext(sessionId: string): ConversationContext {
    const messages = this.getChatMessages(sessionId);
    const selectedDocuments = this.getSelectedDocuments().map(d => d.id);
    const settings = this.getSettings();
    
    return {
      sessionId,
      messages,
      selectedDocuments,
      systemPrompt: this.buildSystemPrompt(selectedDocuments),
      preferences: {
        provider: settings.defaultProvider || 'google-genai',
        model: settings.defaultModel || 'gemini-2.0-flash',
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 8164
      }
    };
  }

  private buildSystemPrompt(selectedDocumentIds: string[]): string {
    let systemPrompt = `You are the ESAF (Evolved Synergistic Agentic Framework) Assistant. You coordinate multiple specialized AI agents to provide comprehensive analysis and solutions.

CORE CAPABILITIES:
- Data Analysis (Bayesian methods, anomaly detection)
- Optimization (linear programming, constraint solving)
- Game Theory (strategic analysis, equilibrium computation)
- Swarm Intelligence (adaptive learning, emergent behavior)
- Decision Making (multi-criteria analysis, synthesis)

CONVERSATION CONTINUITY:
- Remember previous messages in this session
- Build upon previous analysis and recommendations
- Reference earlier decisions and their outcomes
- Maintain consistent reasoning throughout the conversation`;

    if (selectedDocumentIds.length > 0) {
      const selectedDocs = selectedDocumentIds
        .map(id => this.getDocument(id))
        .filter(Boolean) as DocumentSource[];
      
      systemPrompt += `\n\nAVAILABLE CONTEXT DOCUMENTS:
${selectedDocs.map(doc => 
  `- ${doc.name} (${doc.type}): ${doc.metadata.description || 'No description'}`
).join('\n')}

When relevant to the user's query, reference these documents and use their content to inform your responses.`;
    }

    return systemPrompt;
  }

  /**
   * Settings Management
   */
  
  saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(
      this.getStorageKey(this.SETTINGS_KEY), 
      JSON.stringify(settings)
    );
  }

  getSettings(): Record<string, any> {
    const stored = localStorage.getItem(this.getStorageKey(this.SETTINGS_KEY));
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Utility Methods
   */
  
  private generateChatTitle(firstMessage: string): string {
    // Extract a meaningful title from the first message
    const words = firstMessage.trim().split(/\s+/).slice(0, 6);
    let title = words.join(' ');
    
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title || 'New Chat';
  }

  exportChatSession(sessionId: string): string {
    const session = this.getChatSession(sessionId);
    const messages = this.getChatMessages(sessionId);
    
    return JSON.stringify({
      session,
      messages,
      exportedAt: Date.now(),
      version: '1.0'
    }, null, 2);
  }

  importChatSession(jsonData: string): ChatSession {
    const data = JSON.parse(jsonData);
    const session = data.session;
    const messages = data.messages;
    
    // Generate new ID to avoid conflicts
    session.id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update message session IDs
    messages.forEach((msg: ChatMessage) => {
      msg.sessionId = session.id;
    });
    
    this.saveChatSession(session);
    this.saveChatMessages(session.id, messages);
    
    return session;
  }

  clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  getStorageStats(): {
    sessions: number;
    messages: number;
    documents: number;
    storageSize: string;
  } {
    const sessions = this.getAllChatSessions();
    const documents = this.getAllDocuments();
    
    let totalMessages = 0;
    sessions.forEach(session => {
      totalMessages += this.getChatMessages(session.id).length;
    });
    
    // Calculate storage size
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    });
    
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    return {
      sessions: sessions.length,
      messages: totalMessages,
      documents: documents.length,
      storageSize: `${sizeInMB} MB`
    };
  }
}

export const storageManager = PersistentStorageManager.getInstance();
