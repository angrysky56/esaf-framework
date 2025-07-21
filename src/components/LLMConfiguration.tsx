/**
 * LLM Configuration Component - Manages LLM provider settings
 * @fileoverview Interface for configuring and testing LLM providers
 */

import React, { useState, useEffect } from 'react';
import { llmService, LLMProvider } from '@/core/llm-service.js';

interface LLMStatus {
  provider: LLMProvider;
  available: boolean;
  testing: boolean;
  lastTest?: number;
  error?: string | undefined;
}

/**
 * Component for managing LLM provider configuration and testing
 */
export const LLMConfiguration: React.FC = () => {
  const [llmStatuses, setLLMStatuses] = useState<LLMStatus[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Initialize LLM status checking
   */
  useEffect(() => {
    updateLLMStatuses();
    setConfig(llmService.getConfig());
  }, []);

  /**
   * Update status of all LLM providers
   */
  const updateLLMStatuses = async () => {
    const providers = Object.values(LLMProvider);
    const statuses: LLMStatus[] = [];

    for (const provider of providers) {
      const status: LLMStatus = {
        provider,
        available: false,
        testing: false
      };

      try {
        // Check if provider is configured
        const availableProviders = llmService.getAvailableProviders();
        status.available = availableProviders.includes(provider);
      } catch (error) {
        status.error = error instanceof Error ? error.message : String(error);
      }

      statuses.push(status);
    }

    setLLMStatuses(statuses);
  };

  /**
   * Test connection to a specific provider
   */
  const testProvider = async (provider: LLMProvider) => {
    setLLMStatuses(prev => prev.map(status => 
      status.provider === provider 
        ? { ...status, testing: true, error: undefined }
        : status
    ));

    try {
      const isWorking = await llmService.testProvider(provider);
      
      setLLMStatuses(prev => prev.map(status => 
        status.provider === provider 
          ? { 
              ...status, 
              testing: false, 
              available: isWorking,
              lastTest: Date.now(),
              error: isWorking ? undefined : 'Connection test failed'
            }
          : status
      ));
    } catch (error) {
      setLLMStatuses(prev => prev.map(status => 
        status.provider === provider 
          ? { 
              ...status, 
              testing: false, 
              available: false,
              lastTest: Date.now(),
              error: error instanceof Error ? error.message : String(error)
            }
          : status
      ));
    }
  };

  /**
   * Get provider display name
   */
  const getProviderDisplayName = (provider: LLMProvider): string => {
    switch (provider) {
      case LLMProvider.GOOGLE_GENAI:
        return 'Google Gemini';
      case LLMProvider.OLLAMA:
        return 'Ollama (Local)';
      case LLMProvider.LM_STUDIO:
        return 'LM Studio';
      default:
        return provider;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: LLMStatus): string => {
    if (status.testing) return 'text-blue-600';
    if (status.available) return 'text-green-600';
    return 'text-red-600';
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: LLMStatus) => {
    if (status.testing) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      );
    }
    
    if (status.available) {
      return (
        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    return (
      <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  /**
   * Format last test time
   */
  const formatLastTest = (timestamp?: number): string => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  /**
   * Get configuration instructions for each provider
   */
  const getConfigInstructions = (provider: LLMProvider): string => {
    switch (provider) {
      case LLMProvider.GOOGLE_GENAI:
        return 'Set VITE_GOOGLE_GENAI_API_KEY in your .env file. Get API key from Google AI Studio.';
      case LLMProvider.OLLAMA:
        return 'Install Ollama and ensure it\'s running on localhost:11434. Pull a model like "ollama pull llama3.2".';
      case LLMProvider.LM_STUDIO:
        return 'Start LM Studio with local server enabled. Load a model and ensure API is accessible.';
      default:
        return 'Check provider documentation for configuration details.';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">LLM Configuration</h2>
            <p className="text-sm text-gray-500">
              Configure and test AI model providers for cognitive agents
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isExpanded ? 'Collapse' : 'Configure'}
          </button>
        </div>
      </div>

      {/* Provider Status Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {llmStatuses.map((status) => (
            <div key={status.provider} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {getProviderDisplayName(status.provider)}
                </h3>
                {getStatusIcon(status)}
              </div>
              
              <p className={`text-sm ${getStatusColor(status)}`}>
                {status.testing ? 'Testing...' : status.available ? 'Available' : 'Unavailable'}
              </p>
              
              {status.error && (
                <p className="text-xs text-red-600 mt-1">{status.error}</p>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  Last test: {formatLastTest(status.lastTest)}
                </span>
                <button
                  onClick={() => testProvider(status.provider)}
                  disabled={status.testing}
                  className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Configuration */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-md font-medium text-gray-900 mb-4">Configuration Instructions</h3>
          
          <div className="space-y-4">
            {llmStatuses.map((status) => (
              <div key={status.provider} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {getProviderDisplayName(status.provider)}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    status.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {status.available ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {getConfigInstructions(status.provider)}
                </p>
                
                {config && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {status.provider === LLMProvider.GOOGLE_GENAI && (
                      <>
                        <div>Model: {config.GOOGLE_GENAI_MODEL}</div>
                        <div>Temperature: {config.GOOGLE_GENAI_TEMPERATURE}</div>
                        <div>Max Tokens: {config.GOOGLE_GENAI_MAX_TOKENS}</div>
                      </>
                    )}
                    {status.provider === LLMProvider.OLLAMA && (
                      <>
                        <div>Base URL: {config.OLLAMA_BASE_URL}</div>
                        <div>Model: {config.OLLAMA_MODEL}</div>
                        <div>Timeout: {config.OLLAMA_TIMEOUT}ms</div>
                      </>
                    )}
                    {status.provider === LLMProvider.LM_STUDIO && (
                      <>
                        <div>Base URL: {config.LM_STUDIO_BASE_URL}</div>
                        <div>Model: {config.LM_STUDIO_MODEL}</div>
                        <div>Timeout: {config.LM_STUDIO_TIMEOUT}ms</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Quick Setup Guide</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copy .env.example to .env</li>
              <li>Configure at least one LLM provider in your .env file</li>
              <li>For Vite/React, use VITE_ prefix for environment variables</li>
              <li>Restart the application after configuration changes</li>
              <li>Test each provider using the Test buttons above</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
