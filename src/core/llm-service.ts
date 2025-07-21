/**
 * LLM Service Layer for ESAF Framework - ENHANCED VERSION
 * @fileoverview Unified interface for multiple LLM providers (Google GenAI, OpenAI, Anthropic, Ollama, LM Studio)
 */

import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Dynamic import for Ollama to avoid Node.js dependencies in browser
const importOllama = async () => {
  try {
    if (typeof window !== 'undefined') {
      // Browser environment - skip Ollama
      return null;
    }
    const { Ollama } = await import('ollama');
    return Ollama;
  } catch (error) {
    console.warn('Ollama not available:', error);
    return null;
  }
};

/**
 * Supported LLM providers
 */
export enum LLMProvider {
  GOOGLE_GENAI = 'google-genai',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
  LM_STUDIO = 'lm-studio'
}

/**
 * LLM request configuration
 */
export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: LLMProvider;
}

/**
 * LLM response structure
 */
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  timestamp: number;
  tokenUsage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Environment configuration interface
 */
interface EnvironmentConfig {
  // Default provider
  DEFAULT_LLM_PROVIDER: LLMProvider;

  // Google GenAI
  GOOGLE_GENAI_API_KEY?: string;
  GOOGLE_GENAI_MODEL: string;
  GOOGLE_GENAI_TEMPERATURE: number;
  GOOGLE_GENAI_MAX_TOKENS: number;

  // OpenAI
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  OPENAI_TEMPERATURE: number;
  OPENAI_MAX_TOKENS: number;
  OPENAI_BASE_URL: string;

  // Anthropic
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  ANTHROPIC_TEMPERATURE: number;
  ANTHROPIC_MAX_TOKENS: number;

  // Ollama
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  OLLAMA_TEMPERATURE: number;
  OLLAMA_MAX_TOKENS: number;
  OLLAMA_TIMEOUT: number;

  // LM Studio
  LM_STUDIO_BASE_URL: string;
  LM_STUDIO_API_KEY: string;
  LM_STUDIO_MODEL: string;
  LM_STUDIO_TEMPERATURE: number;
  LM_STUDIO_MAX_TOKENS: number;
  LM_STUDIO_TIMEOUT: number;

  // Framework settings
  MAX_CONCURRENT_LLM_REQUESTS: number;
  LLM_REQUEST_TIMEOUT: number;
  ENABLE_LLM_CACHING: boolean;
  LLM_CACHE_DURATION: number;
  LLM_DEBUG_LOGGING: boolean;
  MOCK_LLM_RESPONSES: boolean;
  MOCK_RESPONSE_DELAY: number;
}

/**
 * Get environment configuration with defaults
 */
function getConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    DEFAULT_LLM_PROVIDER: LLMProvider.GOOGLE_GENAI,

    // Google GenAI defaults
    GOOGLE_GENAI_API_KEY: import.meta.env?.VITE_GOOGLE_GENAI_API_KEY || '',
    GOOGLE_GENAI_MODEL: import.meta.env?.VITE_GOOGLE_GENAI_MODEL || 'gemini-2.0-flash',
    GOOGLE_GENAI_TEMPERATURE: parseFloat(import.meta.env?.VITE_GOOGLE_GENAI_TEMPERATURE || '0.7'),
    GOOGLE_GENAI_MAX_TOKENS: parseInt(import.meta.env?.VITE_GOOGLE_GENAI_MAX_TOKENS || '8164'),

    // OpenAI defaults
    OPENAI_API_KEY: import.meta.env?.VITE_OPENAI_API_KEY || '',
    OPENAI_MODEL: import.meta.env?.VITE_OPENAI_MODEL || 'gpt-4o',
    OPENAI_TEMPERATURE: parseFloat(import.meta.env?.VITE_OPENAI_TEMPERATURE || '0.7'),
    OPENAI_MAX_TOKENS: parseInt(import.meta.env?.VITE_OPENAI_MAX_TOKENS || '8164'),
    OPENAI_BASE_URL: import.meta.env?.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',

    // Anthropic defaults
    ANTHROPIC_API_KEY: import.meta.env?.VITE_ANTHROPIC_API_KEY || '',
    ANTHROPIC_MODEL: import.meta.env?.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    ANTHROPIC_TEMPERATURE: parseFloat(import.meta.env?.VITE_ANTHROPIC_TEMPERATURE || '0.7'),
    ANTHROPIC_MAX_TOKENS: parseInt(import.meta.env?.VITE_ANTHROPIC_MAX_TOKENS || '8164'),

    // Ollama defaults
    OLLAMA_BASE_URL: import.meta.env?.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    OLLAMA_MODEL: import.meta.env?.VITE_OLLAMA_MODEL || 'qwen3',
    OLLAMA_TEMPERATURE: parseFloat(import.meta.env?.VITE_OLLAMA_TEMPERATURE || '0.7'),
    OLLAMA_MAX_TOKENS: parseInt(import.meta.env?.VITE_OLLAMA_MAX_TOKENS || '8164'),
    OLLAMA_TIMEOUT: parseInt(import.meta.env?.VITE_OLLAMA_TIMEOUT || '30000'),

    // LM Studio defaults
    LM_STUDIO_BASE_URL: import.meta.env?.VITE_LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
    LM_STUDIO_API_KEY: import.meta.env?.VITE_LM_STUDIO_API_KEY || 'lm-studio',
    LM_STUDIO_MODEL: import.meta.env?.VITE_LM_STUDIO_MODEL || 'local-model',
    LM_STUDIO_TEMPERATURE: parseFloat(import.meta.env?.VITE_LM_STUDIO_TEMPERATURE || '0.7'),
    LM_STUDIO_MAX_TOKENS: parseInt(import.meta.env?.VITE_LM_STUDIO_MAX_TOKENS || '8164'),
    LM_STUDIO_TIMEOUT: parseInt(import.meta.env?.VITE_LM_STUDIO_TIMEOUT || '30000'),

    // Framework defaults
    MAX_CONCURRENT_LLM_REQUESTS: parseInt(import.meta.env?.VITE_MAX_CONCURRENT_LLM_REQUESTS || '3'),
    LLM_REQUEST_TIMEOUT: parseInt(import.meta.env?.VITE_LLM_REQUEST_TIMEOUT || '60000'),
    ENABLE_LLM_CACHING: import.meta.env?.VITE_ENABLE_LLM_CACHING === 'true',
    LLM_CACHE_DURATION: parseInt(import.meta.env?.VITE_LLM_CACHE_DURATION || '3600000'),
    LLM_DEBUG_LOGGING: import.meta.env?.VITE_LLM_DEBUG_LOGGING === 'true',
    MOCK_LLM_RESPONSES: import.meta.env?.VITE_MOCK_LLM_RESPONSES === 'true',
    MOCK_RESPONSE_DELAY: parseInt(import.meta.env?.VITE_MOCK_RESPONSE_DELAY || '1000'),
  };

  return config;
}

/**
 * Response cache for reducing API calls
 */
class LLMCache {
  private cache = new Map<string, { response: LLMResponse; expiry: number }>();

  generateKey(request: LLMRequest): string {
    return JSON.stringify({
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      provider: request.provider,
      temperature: request.temperature,
      maxTokens: request.maxTokens
    });
  }

  get(key: string): LLMResponse | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.response;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, response: LLMResponse, duration: number): void {
    this.cache.set(key, {
      response,
      expiry: Date.now() + duration
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Main LLM service class providing unified access to multiple providers
 */
export class LLMService {
  private config: EnvironmentConfig;
  private cache: LLMCache;
  private googleAI?: GoogleGenAI;
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private ollama?: any;
  private lmStudio?: OpenAI;
  private activeRequests = 0;

  constructor() {
    this.config = getConfig();
    this.cache = new LLMCache();
    this.initializeProviders();
  }

  /**
   * Initialize Ollama with dynamic import for browser compatibility
   */
  private async initializeOllama(): Promise<void> {
    try {
      const OllamaClass = await importOllama();
      if (OllamaClass) {
        this.ollama = new OllamaClass({
          host: this.config.OLLAMA_BASE_URL
        });
      }
    } catch (error) {
      console.warn('Failed to initialize Ollama:', error);
    }
  }

  /**
   * Initialize LLM provider clients
   */
  private initializeProviders(): void {
    // Initialize Google GenAI
    if (this.config.GOOGLE_GENAI_API_KEY) {
      try {
        this.googleAI = new GoogleGenAI({
          apiKey: this.config.GOOGLE_GENAI_API_KEY
        });
      } catch (error) {
        console.warn('Failed to initialize Google GenAI:', error);
      }
    }

    // Initialize OpenAI
    if (this.config.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: this.config.OPENAI_API_KEY,
          baseURL: this.config.OPENAI_BASE_URL,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.warn('Failed to initialize OpenAI:', error);
      }
    }

    // Initialize Anthropic
    if (this.config.ANTHROPIC_API_KEY) {
      try {
        this.anthropic = new Anthropic({
          apiKey: this.config.ANTHROPIC_API_KEY,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.warn('Failed to initialize Anthropic:', error);
      }
    }

    // Initialize Ollama (dynamic import for browser compatibility)
    this.initializeOllama();

    // Initialize LM Studio (OpenAI-compatible)
    try {
      this.lmStudio = new OpenAI({
        baseURL: this.config.LM_STUDIO_BASE_URL,
        apiKey: this.config.LM_STUDIO_API_KEY,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.warn('Failed to initialize LM Studio client:', error);
    }
  }

  /**
   * Generate completion using the specified or default provider
   */
  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    const provider = request.provider || this.config.DEFAULT_LLM_PROVIDER;

    // Check cache if enabled
    if (this.config.ENABLE_LLM_CACHING) {
      const cacheKey = this.cache.generateKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        if (this.config.LLM_DEBUG_LOGGING) {
          console.log('LLM cache hit:', cacheKey);
        }
        return cached;
      }
    }

    // Check concurrent request limit
    if (this.activeRequests >= this.config.MAX_CONCURRENT_LLM_REQUESTS) {
      throw new Error('Maximum concurrent LLM requests exceeded');
    }

    // Handle mock responses for testing
    if (this.config.MOCK_LLM_RESPONSES) {
      return this.generateMockResponse(request, provider);
    }

    this.activeRequests++;

    try {
      let response: LLMResponse;

      switch (provider) {
        case LLMProvider.GOOGLE_GENAI:
          response = await this.generateGoogleGenAI(request);
          break;
        case LLMProvider.OPENAI:
          response = await this.generateOpenAI(request);
          break;
        case LLMProvider.ANTHROPIC:
          response = await this.generateAnthropic(request);
          break;
        case LLMProvider.OLLAMA:
          response = await this.generateOllama(request);
          break;
        case LLMProvider.LM_STUDIO:
          response = await this.generateLMStudio(request);
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }

      // Cache the response if enabled
      if (this.config.ENABLE_LLM_CACHING) {
        const cacheKey = this.cache.generateKey(request);
        this.cache.set(cacheKey, response, this.config.LLM_CACHE_DURATION);
      }

      if (this.config.LLM_DEBUG_LOGGING) {
        console.log('LLM response generated:', { provider, model: response.model, length: response.content.length });
      }

      return response;
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Generate completion using Google GenAI
   */
  private async generateGoogleGenAI(request: LLMRequest): Promise<LLMResponse> {
    if (!this.googleAI) {
      throw new Error('Google GenAI not initialized. Check API key configuration.');
    }

    try {
      const contents = [];
      if (request.systemPrompt) {
        contents.push({
          role: 'system' as const,
          parts: [{ text: request.systemPrompt }]
        });
      }
      contents.push({
        role: 'user' as const,
        parts: [{ text: request.prompt }]
      });

      const result = await this.googleAI.models.generateContent({
        model: this.config.GOOGLE_GENAI_MODEL,
        contents,
        config: {
          temperature: request.temperature || this.config.GOOGLE_GENAI_TEMPERATURE,
          maxOutputTokens: request.maxTokens || this.config.GOOGLE_GENAI_MAX_TOKENS,
        }
      });

      const text = result.text || '';

      return {
        content: text,
        provider: LLMProvider.GOOGLE_GENAI,
        model: this.config.GOOGLE_GENAI_MODEL,
        timestamp: Date.now(),
        tokenUsage: {
          promptTokens: result.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.usageMetadata?.totalTokenCount || 0,
        },
        metadata: {
          finishReason: result.candidates?.[0]?.finishReason,
          safetyRatings: result.candidates?.[0]?.safetyRatings,
        }
      };
    } catch (error) {
      console.error('Google GenAI error:', error);
      throw new Error(`Google GenAI request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate completion using OpenAI
   */
  private async generateOpenAI(request: LLMRequest): Promise<LLMResponse> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized. Check API key configuration.');
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const completion = await this.openai.chat.completions.create({
      model: this.config.OPENAI_MODEL,
      messages,
      temperature: request.temperature || this.config.OPENAI_TEMPERATURE,
      max_tokens: request.maxTokens || this.config.OPENAI_MAX_TOKENS,
    });

    const message = completion.choices[0]?.message;
    if (!message?.content) {
      throw new Error('No content received from OpenAI');
    }

    return {
      content: message.content,
      provider: LLMProvider.OPENAI,
      model: this.config.OPENAI_MODEL,
      timestamp: Date.now(),
      tokenUsage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
      metadata: {
        finishReason: completion.choices[0]?.finish_reason,
        id: completion.id,
        object: completion.object,
      }
    };
  }

  /**
   * Generate completion using Anthropic
   */
  private async generateAnthropic(request: LLMRequest): Promise<LLMResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized. Check API key configuration.');
    }

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    messages.push({ role: 'user', content: request.prompt });

    const createParams: any = {
      model: this.config.ANTHROPIC_MODEL,
      max_tokens: request.maxTokens || this.config.ANTHROPIC_MAX_TOKENS,
      temperature: request.temperature || this.config.ANTHROPIC_TEMPERATURE,
      messages,
    };

    // Only add system if it's provided
    if (request.systemPrompt) {
      createParams.system = request.systemPrompt;
    }

    const completion = await this.anthropic.messages.create(createParams);

    if (!completion.content || completion.content.length === 0) {
      throw new Error('No content received from Anthropic');
    }

    const content = completion.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return {
      content: content.text,
      provider: LLMProvider.ANTHROPIC,
      model: this.config.ANTHROPIC_MODEL,
      timestamp: Date.now(),
      tokenUsage: {
        promptTokens: completion.usage.input_tokens,
        completionTokens: completion.usage.output_tokens,
        totalTokens: completion.usage.input_tokens + completion.usage.output_tokens,
      },
      metadata: {
        id: completion.id,
        role: completion.role,
        stopReason: completion.stop_reason,
        stopSequence: completion.stop_sequence,
      }
    };
  }

  /**
   * Generate completion using Ollama
   */
  private async generateOllama(request: LLMRequest): Promise<LLMResponse> {
    if (!this.ollama) {
      throw new Error('Ollama not initialized. Check server configuration.');
    }

    const messages: Array<{ role: string; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const response = await this.ollama.chat({
      model: this.config.OLLAMA_MODEL,
      messages,
      options: {
        temperature: request.temperature || this.config.OLLAMA_TEMPERATURE,
        num_predict: request.maxTokens || this.config.OLLAMA_MAX_TOKENS,
      },
    });

    return {
      content: response.message.content,
      provider: LLMProvider.OLLAMA,
      model: this.config.OLLAMA_MODEL,
      timestamp: Date.now(),
      metadata: {
        totalDuration: response.total_duration,
        loadDuration: response.load_duration,
        promptEvalCount: response.prompt_eval_count,
        evalCount: response.eval_count,
      }
    };
  }

  /**
   * Generate completion using LM Studio
   */
  private async generateLMStudio(request: LLMRequest): Promise<LLMResponse> {
    if (!this.lmStudio) {
      throw new Error('LM Studio not initialized. Check server configuration.');
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const completion = await this.lmStudio.chat.completions.create({
      model: this.config.LM_STUDIO_MODEL,
      messages,
      temperature: request.temperature || this.config.LM_STUDIO_TEMPERATURE,
      max_tokens: request.maxTokens || this.config.LM_STUDIO_MAX_TOKENS,
    });

    const message = completion.choices[0]?.message;
    if (!message?.content) {
      throw new Error('No content received from LM Studio');
    }

    return {
      content: message.content,
      provider: LLMProvider.LM_STUDIO,
      model: this.config.LM_STUDIO_MODEL,
      timestamp: Date.now(),
      tokenUsage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
      metadata: {
        finishReason: completion.choices[0]?.finish_reason,
        id: completion.id,
        object: completion.object,
      }
    };
  }

  /**
   * Generate mock response for testing
   */
  private async generateMockResponse(request: LLMRequest, provider: LLMProvider): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, this.config.MOCK_RESPONSE_DELAY));

    const mockContent = `Mock response from ${provider} for prompt: "${request.prompt.substring(0, 50)}..."

This is a simulated response for testing purposes. In production, this would be generated by the actual LLM provider.

Analysis: The request appears to be asking for ${request.prompt.includes('data') ? 'data analysis' : 'general information'}.
Confidence: 0.85
Reasoning: Mock reasoning based on prompt content.`;

    return {
      content: mockContent,
      provider,
      model: 'mock-model',
      timestamp: Date.now(),
      tokenUsage: {
        promptTokens: Math.floor(request.prompt.length / 4),
        completionTokens: Math.floor(mockContent.length / 4),
        totalTokens: Math.floor((request.prompt.length + mockContent.length) / 4),
      },
      metadata: {
        mock: true,
        originalProvider: provider,
      }
    };
  }

  /**
   * Get available providers based on configuration
   */
  getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];

    if (this.googleAI && this.config.GOOGLE_GENAI_API_KEY) {
      providers.push(LLMProvider.GOOGLE_GENAI);
    }

    if (this.openai && this.config.OPENAI_API_KEY) {
      providers.push(LLMProvider.OPENAI);
    }

    if (this.anthropic && this.config.ANTHROPIC_API_KEY) {
      providers.push(LLMProvider.ANTHROPIC);
    }

    if (this.ollama) {
      providers.push(LLMProvider.OLLAMA);
    }

    if (this.lmStudio) {
      providers.push(LLMProvider.LM_STUDIO);
    }

    return providers;
  }

  /**
   * Test connection to a specific provider
   */
  async testProvider(provider: LLMProvider): Promise<boolean> {
    try {
      const testRequest: LLMRequest = {
        prompt: 'Hello, this is a connection test. Please respond with "OK".',
        provider,
        temperature: 0,
        maxTokens: 10,
      };

      const response = await this.generateCompletion(testRequest);
      return response.content.toLowerCase().includes('ok');
    } catch (error) {
      console.error(`Provider test failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Clear the response cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }
}

/**
 * Global LLM service instance
 */
export const llmService = new LLMService();
