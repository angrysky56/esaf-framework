/**
 * Settings Component - Dynamic LLM Configuration Interface
 * @fileoverview Comprehensive settings panel for API keys, model selection, and agent configuration
 */

import React, { useState, useEffect } from 'react';
import { ESAFOrchestrator } from '@/core/orchestrator';
import { LLMProvider, llmService } from '@/core/llm-service';

interface SettingsProps {
  frameworkInstance: ESAFOrchestrator;
  isInitialized: boolean;
  onConfigurationChange: () => void;
}

interface ProviderConfig {
  name: string;
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  availableModels: string[];
  selectedModel: string;
  isLoading: boolean;
  isConnected: boolean | null;
  error?: string;
}

/**
 * Settings component for configuring LLM providers and models
 */
export const Settings: React.FC<SettingsProps> = ({
  frameworkInstance,
  isInitialized,
  onConfigurationChange
}) => {
  const [providers, setProviders] = useState<ProviderConfig[]>([
    {
      name: 'Google GenAI (Gemini)',
      provider: LLMProvider.GOOGLE_GENAI,
      apiKey: '',
      availableModels: [],
      selectedModel: '',
      isLoading: false,
      isConnected: null
    },
    {
      name: 'OpenAI (GPT)',
      provider: LLMProvider.OPENAI,
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      availableModels: [],
      selectedModel: '',
      isLoading: false,
      isConnected: null
    },
    {
      name: 'Anthropic (Claude)',
      provider: LLMProvider.ANTHROPIC,
      apiKey: '',
      availableModels: [],
      selectedModel: '',
      isLoading: false,
      isConnected: null
    },
    {
      name: 'Ollama (Local)',
      provider: LLMProvider.OLLAMA,
      apiKey: '',
      baseUrl: 'http://localhost:11434',
      availableModels: [],
      selectedModel: '',
      isLoading: false,
      isConnected: null
    },
    {
      name: 'LM Studio (Local)',
      provider: LLMProvider.LM_STUDIO,
      apiKey: 'lm-studio',
      baseUrl: 'http://localhost:1234/v1',
      availableModels: [],
      selectedModel: '',
      isLoading: false,
      isConnected: null
    }
  ]);

  const [activeTab, setActiveTab] = useState<LLMProvider>(LLMProvider.GOOGLE_GENAI);
  const [globalSettings, setGlobalSettings] = useState({
    defaultProvider: LLMProvider.GOOGLE_GENAI,
    temperature: 0.7,
    maxTokens: 8164,
    requestTimeout: 60000
  });

  /**
   * Load saved configuration on component mount
   */
  useEffect(() => {
    loadSavedConfiguration();
  }, []);

  /**
   * Load configuration from localStorage
   */
  const loadSavedConfiguration = () => {
    try {
      const savedConfig = localStorage.getItem('esaf-llm-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setProviders(prev => prev.map(provider => ({
          ...provider,
          ...config.providers?.[provider.provider]
        })));
        setGlobalSettings(prev => ({
          ...prev,
          ...config.global
        }));
      }
    } catch (error) {
      console.error('Failed to load saved configuration:', error);
    }
  };

  /**
   * Save configuration to localStorage
   */
  const saveConfiguration = async () => {
    try {
      const config = {
        providers: providers.reduce((acc, provider) => ({
          ...acc,
          [provider.provider]: {
            apiKey: provider.apiKey,
            baseUrl: provider.baseUrl,
            selectedModel: provider.selectedModel
          }
        }), {}),
        global: globalSettings,
        timestamp: Date.now()
      };

      localStorage.setItem('esaf-llm-config', JSON.stringify(config));
      
      // Also update environment variables for the session
      updateEnvironmentVariables(config);
      
      // Notify parent component of configuration change
      onConfigurationChange();
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Check console for details.');
    }
  };

  /**
   * Update environment variables with new configuration
   */
  const updateEnvironmentVariables = (config: any) => {
    // Update the window object for immediate use
    (window as any).esafConfig = config;
    
    // These would be used by the LLM service
    if (config.providers[LLMProvider.GOOGLE_GENAI]?.apiKey) {
      (window as any).VITE_GOOGLE_GENAI_API_KEY = config.providers[LLMProvider.GOOGLE_GENAI].apiKey;
    }
    if (config.providers[LLMProvider.OPENAI]?.apiKey) {
      (window as any).VITE_OPENAI_API_KEY = config.providers[LLMProvider.OPENAI].apiKey;
    }
    // Add other providers as needed
  };

  /**
   * Test connection to a provider and fetch available models
   */
  const testConnection = async (providerType: LLMProvider) => {
    setProviders(prev => prev.map(p => 
      p.provider === providerType 
        ? { ...p, isLoading: true, error: undefined }
        : p
    ));

    try {
      const provider = providers.find(p => p.provider === providerType);
      if (!provider) return;

      // Temporarily update the service configuration
      const tempConfig = {
        [providerType]: {
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
          model: provider.selectedModel || getDefaultModel(providerType)
        }
      };

      // Test the connection with a simple request
      const response = await llmService.generateCompletion({
        prompt: 'Hello',
        systemPrompt: 'Respond with just "OK"',
        temperature: 0,
        maxTokens: 10,
        provider: providerType
      });

      // Fetch available models (this is provider-specific)
      const models = await fetchAvailableModels(providerType, provider);

      setProviders(prev => prev.map(p => 
        p.provider === providerType
          ? {
              ...p,
              isConnected: true,
              availableModels: models,
              selectedModel: p.selectedModel || models[0] || '',
              isLoading: false
            }
          : p
      ));

    } catch (error) {
      setProviders(prev => prev.map(p => 
        p.provider === providerType
          ? {
              ...p,
              isConnected: false,
              error: error instanceof Error ? error.message : 'Connection failed',
              isLoading: false
            }
          : p
      ));
    }
  };

  /**
   * Get default model for a provider
   */
  const getDefaultModel = (provider: LLMProvider): string => {
    switch (provider) {
      case LLMProvider.GOOGLE_GENAI:
        return 'gemini-2.0-flash';
      case LLMProvider.OPENAI:
        return 'gpt-4';
      case LLMProvider.ANTHROPIC:
        return 'claude-sonnet-4-20250514';
      case LLMProvider.OLLAMA:
        return 'qwen3';
      case LLMProvider.LM_STUDIO:
        return 'qwen3-4b-128k';
      default:
        return '';
    }
  };

  /**
   * Fetch available models for a provider
   */
  const fetchAvailableModels = async (providerType: LLMProvider, config: ProviderConfig): Promise<string[]> => {
    try {
      switch (providerType) {
        case LLMProvider.GOOGLE_GENAI:
          return await fetchGoogleGenAIModels(config.apiKey);
          
        case LLMProvider.OPENAI:
          return await fetchOpenAIModels(config.apiKey, config.baseUrl || 'https://api.openai.com/v1');
          
        case LLMProvider.ANTHROPIC:
          // Anthropic doesn't have a public models API, return known models
          return ['claude-sonnet-4-20250514', 'claude-opus-4', 'claude-haiku-4'];
          
        case LLMProvider.OLLAMA:
          return await fetchOllamaModels(config.baseUrl || 'http://localhost:11434');
          
        case LLMProvider.LM_STUDIO:
          return await fetchLMStudioModels(config.baseUrl || 'http://localhost:1234/v1', config.apiKey || 'lm-studio');
          
        default:
          return [];
      }
    } catch (error) {
      console.warn(`Failed to fetch models for ${providerType}:`, error);
      // Return empty array on error - user will see "Test connection to load available models"
      return [];
    }
  };

  /**
   * Fetch Google GenAI models using the LLM Service
   */
  const fetchGoogleGenAIModels = async (apiKey: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    try {
      // Use the LLM service to fetch models
      const models = await llmService.getModelsForProvider(LLMProvider.GOOGLE_GENAI, true);
      
      // Extract model names from the response
      return models.map((model) => model.id).filter((name: string) => 
        // Filter for text generation models only
        name.includes('gemini') || name.includes('chat') || name.includes('text')
      );
        
    } catch (error) {
      console.error('Google GenAI model fetch failed:', error);
      return [];
    }
  };

  /**
   * Fetch OpenAI models
   */
  const fetchOpenAIModels = async (apiKey: string, baseUrl: string): Promise<string[]> => {
    if (!apiKey) return [];
    
    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.map((model: any) => model.id).filter((id: string) => 
        id.includes('gpt') || id.includes('davinci') || id.includes('babbage')
      ) || [];
      
    } catch (error) {
      console.error('OpenAI model fetch failed:', error);
      return [];
    }
  };

  /**
   * Fetch Ollama models
   */
  const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
      
    } catch (error) {
      console.error('Ollama model fetch failed:', error);
      return [];
    }
  };

  /**
   * Fetch LM Studio models
   */
  const fetchLMStudioModels = async (baseUrl: string, apiKey: string): Promise<string[]> => {
    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
      
    } catch (error) {
      console.error('LM Studio model fetch failed:', error);
      return [];
    }
  };

  /**
   * Update provider configuration
   */
  const updateProvider = (providerType: LLMProvider, updates: Partial<ProviderConfig>) => {
    setProviders(prev => prev.map(p => 
      p.provider === providerType ? { ...p, ...updates } : p
    ));
  };

  /**
   * Get status icon for connection state
   */
  const getStatusIcon = (isConnected: boolean | null, isLoading: boolean) => {
    if (isLoading) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    if (isConnected === true) {
      return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
    }
    if (isConnected === false) {
      return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
    }
    return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
  };

  const currentProvider = providers.find(p => p.provider === activeTab);

  return (
    <div className="h-full bg-white dark:bg-gray-800 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            LLM Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure API keys, select models, and test connections for your AI providers
          </p>
        </div>

        {/* Provider Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
            {providers.map((provider) => (
              <button
                key={provider.provider}
                onClick={() => setActiveTab(provider.provider)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === provider.provider
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(provider.isConnected, provider.isLoading)}
                  {provider.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Provider Configuration */}
        {currentProvider && (
          <div className="space-y-6">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={currentProvider.apiKey}
                  onChange={(e) => updateProvider(activeTab, { apiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={() => testConnection(activeTab)}
                  disabled={!currentProvider.apiKey || currentProvider.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentProvider.isLoading ? 'Testing...' : 'Test'}
                </button>
              </div>
              {currentProvider.error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {currentProvider.error}
                </p>
              )}
            </div>

            {/* Base URL (for local providers) */}
            {currentProvider.baseUrl !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={currentProvider.baseUrl}
                  onChange={(e) => updateProvider(activeTab, { baseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={currentProvider.selectedModel}
                onChange={(e) => updateProvider(activeTab, { selectedModel: e.target.value })}
                disabled={currentProvider.availableModels.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a model</option>
                {currentProvider.availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              {currentProvider.availableModels.length === 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Test connection to load available models
                </p>
              )}
            </div>

            {/* Connection Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Connection Status
              </h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentProvider.isConnected, currentProvider.isLoading)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentProvider.isLoading ? 'Testing connection...' :
                   currentProvider.isConnected === true ? 'Connected successfully' :
                   currentProvider.isConnected === false ? 'Connection failed' :
                   'Not tested'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Settings */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Global Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Provider
              </label>
              <select
                value={globalSettings.defaultProvider}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultProvider: e.target.value as LLMProvider }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {providers.map((provider) => (
                  <option key={provider.provider} value={provider.provider}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={globalSettings.temperature}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="32000"
                step="100"
                value={globalSettings.maxTokens}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Timeout (ms)
              </label>
              <input
                type="number"
                min="5000"
                max="300000"
                step="5000"
                value={globalSettings.requestTimeout}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, requestTimeout: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Save Configuration */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Save Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configuration is saved locally and applied immediately
              </p>
            </div>
            <button
              onClick={saveConfiguration}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
