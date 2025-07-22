/**
 * Data Input Panel Component for ESAF Framework
 * @fileoverview Interface for uploading and processing various data types
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ESAFOrchestrator } from '@/core/orchestrator';
import { TaskPriority } from '@/core/types';
import { sharedDataContext, DataItem } from '@/core/shared-data-context';

interface DataInputPanelProps {
  frameworkInstance: ESAFOrchestrator;
  isInitialized: boolean;
  onTaskCreated: () => void;
}

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'text' | 'url' | 'json' | 'csv';
  content: string | File;
  size?: number;
  lastModified?: number;
}

/**
 * Data input and processing panel
 */
export const DataInputPanel: React.FC<DataInputPanelProps> = ({
  frameworkInstance,
  isInitialized,
  onTaskCreated
}) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [sharedDataItems, setSharedDataItems] = useState<DataItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [selectedProcessingType, setSelectedProcessingType] = useState('intelligent_analysis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Subscribe to shared data context changes
  useEffect(() => {
    const updateSharedData = () => {
      setSharedDataItems(sharedDataContext.getDataItems());
    };

    updateSharedData(); // Initial load
    const unsubscribe = sharedDataContext.subscribe(updateSharedData);

    return unsubscribe;
  }, []);

  /**
   * Handle file upload via drag and drop
   */
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      const dataSource: DataSource = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.includes('json') ? 'json' :
              file.type.includes('csv') ? 'csv' : 'file',
        content: file,
        size: file.size,
        lastModified: file.lastModified
      };

      setDataSources(prev => [...prev, dataSource]);

      // Add to shared data context for chat access
      try {
        await sharedDataContext.addDataItem({
          name: file.name,
          content: file,
          type: dataSource.type,
          metadata: {
            size: file.size,
            lastModified: file.lastModified,
            mimeType: file.type,
            uploadedAt: Date.now()
          }
        });
      } catch (error) {
        console.warn('Failed to add file to shared context:', error);
      }
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const dataSource: DataSource = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.includes('json') ? 'json' :
              file.type.includes('csv') ? 'csv' : 'file',
        content: file,
        size: file.size,
        lastModified: file.lastModified
      };

      setDataSources(prev => [...prev, dataSource]);
    });
  };  /**
   * Add text data source
   */
  const addTextData = async () => {
    if (!textInput.trim()) return;

    const dataSource: DataSource = {
      id: Date.now().toString(),
      name: `Text Input (${new Date().toLocaleTimeString()})`,
      type: 'text',
      content: textInput
    };

    setDataSources(prev => [...prev, dataSource]);

    // Add to shared data context for chat access
    try {
      await sharedDataContext.addDataItem({
        name: dataSource.name,
        content: textInput,
        type: 'text'
      });
    } catch (error) {
      console.warn('Failed to add text to shared context:', error);
    }

    setTextInput('');
  };

  /**
   * Add URL data source
   */
  const addUrlData = () => {
    if (!urlInput.trim()) return;

    const dataSource: DataSource = {
      id: Date.now().toString(),
      name: `URL: ${urlInput}`,
      type: 'url',
      content: urlInput
    };

    setDataSources(prev => [...prev, dataSource]);
    setUrlInput('');
  };

  /**
   * Add JSON data source
   */
  const addJsonData = () => {
    if (!jsonInput.trim()) return;

    try {
      JSON.parse(jsonInput); // Validate JSON
      const dataSource: DataSource = {
        id: Date.now().toString(),
        name: `JSON Data (${new Date().toLocaleTimeString()})`,
        type: 'json',
        content: jsonInput
      };

      setDataSources(prev => [...prev, dataSource]);
      setJsonInput('');
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  };

  /**
   * Remove data source
   */
  const removeDataSource = (id: string) => {
    setDataSources(prev => prev.filter(source => source.id !== id));
  };

  /**
   * Process all data sources
   */
  const processDataSources = async () => {
    if (dataSources.length === 0 || !isInitialized) return;

    setIsProcessing(true);

    try {
      // Create a comprehensive data processing task
      await frameworkInstance.createTask(
        selectedProcessingType,
        {
          dataSources: dataSources.map(source => ({
            id: source.id,
            name: source.name,
            type: source.type,
            content: typeof source.content === 'string' ? source.content : '[FILE_CONTENT]',
            metadata: {
              size: source.size,
              lastModified: source.lastModified
            }
          })),
          processingType: selectedProcessingType,
          timestamp: Date.now()
        },
        TaskPriority.HIGH
      );

      onTaskCreated();

      // Clear processed data sources
      setDataSources([]);

      alert(`Successfully created ${selectedProcessingType} task for ${dataSources.length} data source(s).`);

    } catch (error) {
      console.error('Error processing data sources:', error);
      alert(`Failed to process data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb > 1) return `${mb.toFixed(1)} MB`;
    if (kb > 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} bytes`;
  };

  /**
   * Get icon for data source type
   */
  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'json':
        return '📋';
      case 'csv':
        return '📊';
      case 'text':
        return '📝';
      case 'url':
        return '🌐';
      case 'file':
      default:
        return '📄';
    }
  };
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Data Input & Processing
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload files, input text, or provide URLs for AI analysis
          </p>
        </div>

        {/* Data Input Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📁 File Upload
            </h3>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-4xl">📤</div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports CSV, JSON, TXT, and other data files
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  accept=".csv,.json,.txt,.xlsx,.xls"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📝 Text Input
            </h3>

            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your text data here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={addTextData}
                disabled={!textInput.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Text Data
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🌐 URL Data Source
            </h3>

            <div className="space-y-4">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/data-api"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={addUrlData}
                disabled={!urlInput.trim()}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add URL Source
              </button>
            </div>
          </div>

          {/* JSON Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 JSON Data
            </h3>

            <div className="space-y-4">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"key": "value", "data": [1, 2, 3]}'
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={addJsonData}
                disabled={!jsonInput.trim()}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add JSON Data
              </button>
            </div>
          </div>
        </div>

        {/* Data Sources List */}
        {dataSources.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📂 Data Sources ({dataSources.length})
              </h3>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="processing-type-select"
                  className="sr-only"
                >
                  Select Processing Type
                </label>
                <select
                  id="processing-type-select"
                  value={selectedProcessingType}
                  onChange={(e) => setSelectedProcessingType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  aria-label="Select Processing Type"
                >
                  <option value="intelligent_analysis">🧠 Intelligent Analysis</option>
                  <option value="data_validation">🔍 Data Validation</option>
                  <option value="feature_extraction">📊 Feature Extraction</option>
                  <option value="anomaly_detection">⚠️ Anomaly Detection</option>
                </select>
                <button
                  onClick={processDataSources}
                  disabled={isProcessing || !isInitialized}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Process Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getDataSourceIcon(source.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {source.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {source.type.toUpperCase()} • {formatFileSize(source.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDataSource(source.id)}
                    className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                    title="Remove data source"
                    aria-label="Remove data source"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🚀 Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Supported Data Types:</h4>
              <ul className="space-y-1">
                <li>• CSV files for tabular data</li>
                <li>• JSON for structured data</li>
                <li>• Text files for content analysis</li>
                <li>• URLs for web data sources</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Processing Options:</h4>
              <ul className="space-y-1">
                <li>• Intelligent Analysis: Comprehensive AI analysis</li>
                <li>• Data Validation: Check data quality</li>
                <li>• Feature Extraction: Extract key patterns</li>
                <li>• Anomaly Detection: Find outliers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
