/**
 * Document Library Component
 * @fileoverview Manages document sources with selection, tagging, and organization
 */

import React, { useState, useEffect, useRef } from 'react';
import { storageManager, DocumentSource } from '@/stores/storage-manager';

interface DocumentLibraryProps {
  onDocumentSelectionChange: (selectedDocuments: DocumentSource[]) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  onDocumentSelectionChange
}) => {
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'selected' | 'file' | 'url' | 'text' | 'analysis'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    // Notify parent of selection changes
    const selectedDocs = documents.filter(doc => doc.isSelected);
    onDocumentSelectionChange(selectedDocs);
  }, [documents, onDocumentSelectionChange]);

  const loadDocuments = () => {
    const allDocuments = storageManager.getAllDocuments();
    setDocuments(allDocuments);
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.metadata.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = filterBy === 'all' ||
                           (filterBy === 'selected' && doc.isSelected) ||
                           doc.type === filterBy;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.metadata.lastAccessed - a.metadata.lastAccessed;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return (b.metadata.size || 0) - (a.metadata.size || 0);
        default:
          return 0;
      }
    });

  const handleToggleSelection = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      doc.isSelected = !doc.isSelected;
      storageManager.setDocumentSelection(documentId, doc.isSelected);
      setDocuments([...documents]);
    }
  };

  const handleDeleteDocument = (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      storageManager.deleteDocument(documentId);
      loadDocuments();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const document: DocumentSource = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: 'file',
          content,
          metadata: {
            size: file.size,
            format: file.type || 'unknown',
            created: Date.now(),
            lastAccessed: Date.now(),
            tags: [],
            description: `Uploaded file: ${file.name}`
          },
          isSelected: false
        };

        storageManager.saveDocument(document);
        loadDocuments();
      };

      reader.readAsText(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAddModal(false);
  };

  const handleAddFromURL = () => {
    const url = prompt('Enter URL to fetch content:');
    if (!url) return;

    fetch(url)
      .then(response => response.text())
      .then(content => {
        const document: DocumentSource = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: new URL(url).hostname,
          type: 'url',
          content,
          metadata: {
            size: content.length,
            format: 'text/html',
            created: Date.now(),
            lastAccessed: Date.now(),
            tags: ['web'],
            description: `Content from: ${url}`
          },
          isSelected: false
        };

        storageManager.saveDocument(document);
        loadDocuments();
        setShowAddModal(false);
      })
      .catch(error => {
        alert(`Failed to fetch content from URL: ${error.message}`);
      });
  };

  const handleAddText = () => {
    const name = prompt('Enter document name:');
    if (!name) return;

    const content = prompt('Enter text content:');
    if (!content) return;

    const document: DocumentSource = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'text',
      content,
      metadata: {
        size: content.length,
        format: 'text/plain',
        created: Date.now(),
        lastAccessed: Date.now(),
        tags: ['manual'],
        description: `Manual text entry: ${name}`
      },
      isSelected: false
    };

    storageManager.saveDocument(document);
    loadDocuments();
    setShowAddModal(false);
  };

  const handleEditDocument = (doc: DocumentSource, event: React.MouseEvent) => {
    event.stopPropagation();

    const newName = prompt('Enter new name:', doc.name);
    if (newName && newName.trim()) {
      doc.name = newName.trim();
    }

    const newDescription = prompt('Enter description:', doc.metadata.description || '');
    if (newDescription !== null) {
      doc.metadata.description = newDescription;
    }

    const newTags = prompt('Enter tags (comma-separated):', doc.metadata.tags.join(', '));
    if (newTags !== null) {
      doc.metadata.tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    storageManager.saveDocument(doc);
    loadDocuments();
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedCount = documents.filter(doc => doc.isSelected).length;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Document Library</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            Add Doc
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="mb-3 p-2 bg-blue-900 rounded-md">
            <span className="text-blue-200 text-sm">
              {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm mb-2"
        />

        {/* Filters */}
        <div className="flex gap-2">
          <select
            aria-label="Filter documents by type"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="all">All Types</option>
            <option value="selected">Selected</option>
            <option value="file">Files</option>
            <option value="url">URLs</option>
            <option value="text">Text</option>
            <option value="analysis">Analysis</option>
          </select>

          <select
            aria-label="Sort documents"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            {searchTerm || filterBy !== 'all' ? 'No matching documents' : 'No documents yet'}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`relative p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${
                doc.isSelected ? 'bg-gray-800 border-l-4 border-l-green-500' : ''
              }`}
              onClick={() => handleToggleSelection(doc.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={doc.isSelected}
                    onChange={() => handleToggleSelection(doc.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                    title={`Select document ${doc.name}`}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate text-sm">
                      {doc.name}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">
                      {doc.type.toUpperCase()} • {formatFileSize(doc.metadata.size)}
                    </p>
                    {doc.metadata.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                        {doc.metadata.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {formatDate(doc.metadata.lastAccessed)}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === doc.id ? null : doc.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    ⋮
                  </button>

                  {showActions === doc.id && (
                    <div className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => handleEditDocument(doc, e)}
                        className="block w-full px-3 py-2 text-left text-white hover:bg-gray-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="block w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {doc.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-6">
                  {doc.metadata.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.metadata.tags.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{doc.metadata.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-white font-semibold mb-4">Add Document</h3>

            <div className="space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Upload File
              </button>

              <button
                onClick={handleAddFromURL}
                className="w-full p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add from URL
              </button>

              <button
                onClick={handleAddText}
                className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Text
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.csv,.log"
        onChange={handleFileUpload}
        className="hidden"
        title="Upload document files"
      />

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
        <div>
          {documents.length} document{documents.length !== 1 ? 's' : ''} • {selectedCount} selected
        </div>
      </div>
    </div>
  );
};
