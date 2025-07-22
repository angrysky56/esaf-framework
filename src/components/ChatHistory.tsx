/**
 * Chat History Sidebar Component
 * @fileoverview Manages chat session history with search, filtering, and management
 */

import React, { useState, useEffect } from 'react';
import { storageManager, ChatSession } from '@/stores/storage-manager';

interface ChatHistoryProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentSessionId,
  onSessionSelect,
  onNewSession
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name'>('recent');
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = storageManager.getAllChatSessions();
    setSessions(allSessions);
  };

  const filteredSessions = sessions
    .filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.summary?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.lastActivity - a.lastActivity;
        case 'oldest':
          return a.created - b.created;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId);
    setShowActions(null);
  };

  const handleDeleteSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat session?')) {
      storageManager.deleteChatSession(sessionId);
      loadSessions();

      // If we deleted the current session, create a new one
      if (sessionId === currentSessionId) {
        onNewSession();
      }
    }
  };

  const handleExportSession = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const data = storageManager.exportChatSession(sessionId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `esaf-chat-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRenameSession = (session: ChatSession, event: React.MouseEvent) => {
    event.stopPropagation();
    const newTitle = prompt('Enter new title:', session.title);
    if (newTitle && newTitle.trim()) {
      session.title = newTitle.trim();
      storageManager.saveChatSession(session);
      loadSessions();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Chat History</h3>
          <button
            onClick={onNewSession}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            New Chat
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        />

        {/* Sort Options */}
        <select
          aria-label="Sort conversations"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full mt-2 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="name">By Name</option>
        </select>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            {searchTerm ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`relative p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                session.id === currentSessionId ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate text-sm">
                    {session.title}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {formatDate(session.lastActivity)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {session.messageCount} messages
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === session.id ? null : session.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    ⋮
                  </button>

                  {showActions === session.id && (
                    <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => handleRenameSession(session, e)}
                        className="block w-full px-3 py-2 text-left text-white hover:bg-gray-700 text-sm"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => handleExportSession(session.id, e)}
                        className="block w-full px-3 py-2 text-left text-white hover:bg-gray-700 text-sm"
                      >
                        Export
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="block w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {session.tags && session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {session.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {session.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{session.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
        <div>
          {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
