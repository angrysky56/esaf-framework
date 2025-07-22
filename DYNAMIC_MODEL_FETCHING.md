# Dynamic Model Fetching - ESAF Framework

## Overview

The ESAF Framework now supports dynamic model fetching from all supported LLM providers. This feature allows you to programmatically retrieve available models, check provider health, and manage model information with intelligent caching.

## Features

### ✨ Key Capabilities

- **Dynamic Model Discovery**: Automatically fetch available models from each provider's API
- **Intelligent Caching**: Model lists are cached for 5 minutes to reduce API calls
- **Provider Health Monitoring**: Check connectivity and latency for each provider
- **Standardized Model Information**: Unified model metadata across all providers
- **Error Handling**: Graceful fallbacks when providers are unavailable
- **Bulk Operations**: Fetch models from all providers simultaneously

### 🔌 Supported Providers

| Provider | Method | Endpoint/API |
|----------|--------|-------------|
| **Google Gemini** | REST API | `/v1beta/models` |
| **LM Studio** | REST API | `/api/v0/models` |
| **Ollama** | REST API | `/api/tags` |
| **OpenAI** | SDK | `models.list()` |
| **Anthropic** | Static List | Known models |

## Usage

### Basic Model Fetching

```typescript
import { llmService, LLMProvider } from '@/core/llm-service';

// Get models for a specific provider
const models = await llmService.getModelsForProvider(LLMProvider.GOOGLE_GENAI);

// Force refresh (bypass cache)
const freshModels = await llmService.getModelsForProvider(LLMProvider.GOOGLE_GENAI, true);

// Get models from all providers
const allModels = await llmService.getAllModels();
```

### Provider Health Monitoring

```typescript
// Check a specific provider's health
const status = await llmService.checkProviderStatus(LLMProvider.OLLAMA);
console.log(`${status.provider}: ${status.available ? 'Available' : 'Unavailable'}`);

// Get health status for all providers
const healthStatuses = await llmService.getProvidersStatus();
healthStatuses.forEach(status => {
  console.log(`${status.provider}: ${status.available ? '✅' : '❌'} (${status.latency}ms)`);
});
```

### Cache Management

```typescript
// Clear cache for a specific provider
llmService.clearModelCache(LLMProvider.GOOGLE_GENAI);

// Clear cache for all providers
llmService.clearModelCache();
```

## Model Information Structure

Each model is returned with standardized metadata:

```typescript
interface ModelInfo {
  id: string;                    // Unique model identifier
  name: string;                  // Model name
  displayName?: string;          // Human-readable name
  provider: string;              // Provider identifier
  type?: 'text' | 'multimodal' | 'embedding' | 'vision';
  contextLength?: number;        // Maximum context length
  maxTokens?: number;           // Maximum output tokens
  parameterSize?: string;       // Model size (e.g., "7B", "13B")
  quantization?: string;        // Quantization level
  status?: 'available' | 'loaded' | 'not-loaded' | 'downloading' | 'error';
  metadata?: Record<string, unknown>; // Provider-specific metadata
}
```

## Provider-Specific Details

### Google Gemini API

- **Authentication**: Requires `VITE_GOOGLE_GENAI_API_KEY`
- **Models Returned**: Only models supporting `generateContent`
- **Metadata**: Includes version, description, token limits
- **Rate Limits**: Follows Google's API quotas

### LM Studio

- **Endpoint**: `http://localhost:1234/api/v0/models` (configurable)
- **Models Returned**: All downloaded models (loaded and unloaded)
- **Metadata**: Architecture, publisher, quantization details
- **Requirements**: LM Studio server must be running

### Ollama

- **Endpoint**: `http://localhost:11434/api/tags` (configurable)
- **Models Returned**: All locally available models
- **Metadata**: Model size, digest, family, format
- **Requirements**: Ollama server must be running

### OpenAI

- **Authentication**: Requires `VITE_OPENAI_API_KEY`
- **Models Returned**: GPT and O1 series models
- **Metadata**: Creation date, ownership
- **Rate Limits**: Follows OpenAI's API quotas

### Anthropic

- **Models**: Predefined list of known Claude models
- **Note**: Anthropic doesn't provide a models API
- **Authentication**: Not required for listing (but needed for usage)

## Configuration

Set up environment variables for dynamic model fetching:

```bash
# Google Gemini
VITE_GOOGLE_GENAI_API_KEY=your_api_key_here

# OpenAI
VITE_OPENAI_API_KEY=your_api_key_here

# LM Studio (if different from default)
VITE_LM_STUDIO_BASE_URL=http://localhost:1234

# Ollama (if different from default)
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

## Error Handling

The system handles errors gracefully:

- **Network Issues**: Returns cached models if available
- **Authentication Errors**: Logs error and continues with other providers
- **Timeout**: Configurable timeouts prevent hanging requests
- **Invalid Responses**: Validates API responses before processing

## Caching Strategy

- **Cache Duration**: 5 minutes (configurable)
- **Cache Key**: Provider-specific
- **Cache Invalidation**: Automatic expiry or manual clearing
- **Fallback**: Returns expired cache if fresh fetch fails

## Testing

Run the dynamic model fetching test:

```bash
node test-dynamic-models.js
```

This will:
1. Check provider health status
2. Fetch models from each available provider
3. Display model information and statistics
4. Test bulk fetching functionality

## Integration with Settings UI

The Settings component automatically uses dynamic model fetching:

- **Real-time Updates**: Fetches fresh models when API keys change
- **Provider Status**: Shows connection status for each provider
- **Model Selection**: Displays available models dynamically
- **Error Display**: Shows helpful error messages for connection issues

## Best Practices

1. **Cache Management**: Clear caches when switching environments
2. **Error Handling**: Always handle provider unavailability gracefully
3. **Rate Limiting**: Respect API quotas by using cached data when appropriate
4. **Environment Configuration**: Use proper environment variables for sensitive data
5. **Health Monitoring**: Regularly check provider status for reliability

## Troubleshooting

### Common Issues

1. **Provider Not Available**: Check if the service is running (LM Studio, Ollama)
2. **Authentication Errors**: Verify API keys are correctly set
3. **Network Issues**: Check firewall and network connectivity
4. **Empty Model Lists**: Ensure models are downloaded (LM Studio, Ollama)

### Debug Mode

Enable debug logging:

```bash
VITE_LLM_DEBUG_LOGGING=true
```

This will log detailed information about API calls and responses.

---

**🔄 Last Updated**: July 21, 2025  
**📖 Version**: 1.0.0  
**🛠️ Framework**: ESAF (Evolved Synergistic Agentic Framework)
