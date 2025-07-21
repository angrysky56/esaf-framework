# LLM Provider Configuration Guide

The ESAF Framework supports multiple LLM providers for maximum flexibility and redundancy. This guide will help you configure and troubleshoot your LLM setup.

## Supported Providers

### 🤖 Google Gemini (Google GenAI)
- **Models**: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro-vision`
- **Best for**: Complex analysis, reasoning tasks
- **Setup**: Get API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 🚀 OpenAI (GPT Models)
- **Models**: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`
- **Best for**: General purpose, code generation
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 🔮 Anthropic (Claude Models)
- **Models**: `claude-sonnet-4-20250514`, `claude-opus-4`, `claude-haiku-4`
- **Best for**: Safe AI, long-form content, analysis
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)

### 🦙 Ollama (Local Models)
- **Models**: `llama3.2:latest`, `mistral:latest`, `codellama:latest`, etc.
- **Best for**: Privacy, offline usage, cost-free
- **Setup**: Install [Ollama](https://ollama.ai/) and run `ollama serve`

### 🏠 LM Studio (Local Server)
- **Models**: Any GGUF model compatible with LM Studio
- **Best for**: Custom models, local hosting
- **Setup**: Install [LM Studio](https://lmstudio.ai/) and start local server

## Quick Setup

1. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys** in `.env`:
   ```bash
   # Google Gemini
   VITE_GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   
   # OpenAI
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   # Anthropic
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. **Set your default provider**:
   ```bash
   VITE_DEFAULT_LLM_PROVIDER=google-genai
   ```

4. **Test the configuration**:
   ```bash
   node test-llm-service.js
   ```

## Environment Variables Reference

### Core Settings
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_DEFAULT_LLM_PROVIDER` | Primary provider to use | `google-genai` |
| `VITE_MOCK_LLM_RESPONSES` | Enable mock responses for testing | `false` |
| `VITE_LLM_DEBUG_LOGGING` | Enable detailed logging | `false` |
| `VITE_ENABLE_LLM_CACHING` | Cache responses to reduce API calls | `true` |

### Google GenAI (Gemini)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GOOGLE_GENAI_API_KEY` | API key from Google AI Studio | - |
| `VITE_GOOGLE_GENAI_MODEL` | Model to use | `gemini-1.5-pro` |
| `VITE_GOOGLE_GENAI_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `VITE_GOOGLE_GENAI_MAX_TOKENS` | Maximum response length | `8164` |

### OpenAI
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OPENAI_API_KEY` | API key from OpenAI Platform | - |
| `VITE_OPENAI_MODEL` | Model to use | `gpt-4o` |
| `VITE_OPENAI_BASE_URL` | API endpoint | `https://api.openai.com/v1` |
| `VITE_OPENAI_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `VITE_OPENAI_MAX_TOKENS` | Maximum response length | `8164` |

### Anthropic (Claude)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ANTHROPIC_API_KEY` | API key from Anthropic Console | - |
| `VITE_ANTHROPIC_MODEL` | Model to use | `claude-sonnet-4-20250514` |
| `VITE_ANTHROPIC_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `VITE_ANTHROPIC_MAX_TOKENS` | Maximum response length | `8164` |

### Ollama (Local)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `VITE_OLLAMA_MODEL` | Model to use | `llama3.2:latest` |
| `VITE_OLLAMA_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `VITE_OLLAMA_MAX_TOKENS` | Maximum response length | `8164` |
| `VITE_OLLAMA_TIMEOUT` | Request timeout (ms) | `30000` |

### LM Studio (Local)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LM_STUDIO_BASE_URL` | LM Studio server URL | `http://localhost:1234/v1` |
| `VITE_LM_STUDIO_API_KEY` | API key (usually `lm-studio`) | `lm-studio` |
| `VITE_LM_STUDIO_MODEL` | Loaded model name | `local-model` |
| `VITE_LM_STUDIO_TEMPERATURE` | Response creativity (0-1) | `0.7` |
| `VITE_LM_STUDIO_MAX_TOKENS` | Maximum response length | `8164` |
| `VITE_LM_STUDIO_TIMEOUT` | Request timeout (ms) | `30000` |

## Troubleshooting

### Common Issues

#### 1. "Provider not initialized" Error
**Problem**: API key is missing or invalid.
**Solution**: 
- Check your `.env` file has the correct API key
- Verify the API key is valid by testing it in the provider's console
- Ensure there are no extra spaces or quotes around the key

#### 2. "Connection refused" for Local Providers
**Problem**: Ollama or LM Studio server is not running.
**Solution**:
- **Ollama**: Run `ollama serve` in terminal
- **LM Studio**: Start the local server in LM Studio app
- Check the port numbers match your configuration

#### 3. Rate Limit Errors
**Problem**: Too many API requests.
**Solution**:
- Enable caching: `VITE_ENABLE_LLM_CACHING=true`
- Reduce concurrent requests: `VITE_MAX_CONCURRENT_LLM_REQUESTS=1`
- Add delays between requests

#### 4. Model Not Found
**Problem**: Specified model doesn't exist or isn't available.
**Solution**:
- Check available models in provider documentation
- For Ollama: Run `ollama pull model-name` first
- For LM Studio: Load the model in the LM Studio interface

#### 5. Timeout Errors
**Problem**: Requests taking too long.
**Solution**:
- Increase timeout values in `.env`
- Reduce `MAX_TOKENS` for faster responses
- Check network connectivity

### Testing Your Setup

Run the test script to diagnose issues:
```bash
node test-llm-service.js
```

This will:
- ✅ Show which providers are properly configured
- ❌ Identify missing API keys or connection issues
- 🔌 Test actual connections to each provider
- 📊 Display configuration summary

### Mock Mode for Development

Enable mock responses for testing without API calls:
```bash
VITE_MOCK_LLM_RESPONSES=true
VITE_MOCK_RESPONSE_DELAY=1000
```

This is useful for:
- Development without API costs
- Testing UI components
- Demonstrating the framework
- CI/CD pipelines

## Agent-Specific Configuration

Each ESAF agent can use a different LLM provider:

```bash
# Data Analysis Agent uses Google Gemini
VITE_DA_AGENT_LLM_PROVIDER=google-genai

# Optimization Agent uses OpenAI
VITE_OA_AGENT_LLM_PROVIDER=openai

# Game Theory Agent uses Anthropic
VITE_GT_AGENT_LLM_PROVIDER=anthropic

# Swarm Intelligence Agent uses Ollama
VITE_SI_AGENT_LLM_PROVIDER=ollama

# Decision Making Agent uses LM Studio
VITE_DM_AGENT_LLM_PROVIDER=lm-studio
```

This allows you to:
- Use the best model for each task
- Distribute load across multiple providers
- Have fallback options if one provider fails
- Optimize costs by using local models for some tasks

## Performance Optimization

### Caching
Enable response caching to reduce API calls:
```bash
VITE_ENABLE_LLM_CACHING=true
VITE_LLM_CACHE_DURATION=3600000  # 1 hour in ms
```

### Concurrent Requests
Limit concurrent requests to avoid rate limits:
```bash
VITE_MAX_CONCURRENT_LLM_REQUESTS=3
```

### Request Timeouts
Set appropriate timeouts:
```bash
VITE_LLM_REQUEST_TIMEOUT=60000  # 60 seconds
```

## Security Best Practices

1. **API Key Security**:
   - Never commit `.env` file to version control
   - Use environment variables in production
   - Rotate API keys regularly
   - Monitor API usage for anomalies

2. **Local Models**:
   - Keep Ollama/LM Studio updated
   - Use trusted model sources
   - Monitor resource usage

3. **Network Security**:
   - Use HTTPS for all API calls
   - Consider using VPN for sensitive data
   - Implement proper firewall rules for local servers

## Getting API Keys

### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key to your `.env` file

### Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in to your account
3. Navigate to API Keys
4. Click "Create Key"
5. Copy the key to your `.env` file

## Cost Optimization

1. **Use Local Models**: Ollama and LM Studio are free to run locally
2. **Enable Caching**: Reduce redundant API calls
3. **Optimize Token Usage**: Use appropriate `MAX_TOKENS` settings
4. **Choose Right Models**: Balance capability vs. cost
5. **Monitor Usage**: Track API consumption regularly

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Run the test script: `node test-llm-service.js`
3. Enable debug logging: `VITE_LLM_DEBUG_LOGGING=true`
4. Check provider status pages
5. Review recent changes to your configuration

For provider-specific issues, consult their documentation:
- [Google Gemini Docs](https://ai.google.dev/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Ollama Docs](https://ollama.ai/docs)
- [LM Studio Docs](https://lmstudio.ai/docs)
