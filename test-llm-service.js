/**
 * ESAF Framework - LLM Service Test
 * @fileoverview Test script to verify LLM service initialization and configuration
 */

import { LLMService, LLMProvider } from './src/core/llm-service.js';

/**
 * Test the LLM service initialization and provider availability
 */
async function testLLMService() {
  console.log('🚀 Testing ESAF Framework LLM Service...\n');

  try {
    // Initialize the service
    const llmService = new LLMService();

    // Get configuration
    const config = llmService.getConfig();
    console.log('📋 Configuration loaded:');
    console.log(`   Default Provider: ${config.DEFAULT_LLM_PROVIDER}`);
    console.log(`   Mock Responses: ${config.MOCK_LLM_RESPONSES}`);
    console.log(`   Debug Logging: ${config.LLM_DEBUG_LOGGING}`);
    console.log(`   Caching: ${config.ENABLE_LLM_CACHING}\n`);

    // Check available providers
    const availableProviders = llmService.getAvailableProviders();
    console.log('🔌 Available LLM Providers:');

    const allProviders = Object.values(LLMProvider);
    for (const provider of allProviders) {
      const isAvailable = availableProviders.includes(provider);
      const status = isAvailable ? '✅' : '❌';
      console.log(`   ${status} ${provider}`);

      if (isAvailable) {
        console.log(`      Testing connection...`);
        try {
          const isConnected = await llmService.testProvider(provider);
          console.log(`      Connection: ${isConnected ? '✅ OK' : '❌ Failed'}`);
        } catch (error) {
          console.log(`      Connection: ❌ Error - ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // Check why provider is not available
        switch (provider) {
          case LLMProvider.GOOGLE_GENAI:
            console.log(`      Missing: VITE_GOOGLE_GENAI_API_KEY`);
            break;
          case LLMProvider.OPENAI:
            console.log(`      Missing: VITE_OPENAI_API_KEY`);
            break;
          case LLMProvider.ANTHROPIC:
            console.log(`      Missing: VITE_ANTHROPIC_API_KEY`);
            break;
          case LLMProvider.OLLAMA:
            console.log(`      Server not running at: ${config.OLLAMA_BASE_URL}`);
            break;
          case LLMProvider.LM_STUDIO:
            console.log(`      Server not running at: ${config.LM_STUDIO_BASE_URL}`);
            break;
        }
      }
      console.log();
    }

    // Test mock response if enabled
    if (config.MOCK_LLM_RESPONSES) {
      console.log('🎭 Testing mock responses...');
      const testRequest = {
        prompt: 'Hello, this is a test request.',
        provider: LLMProvider.GOOGLE_GENAI,
        temperature: 0.7,
        maxTokens: 100,
      };

      const response = await llmService.generateCompletion(testRequest);
      console.log(`   Provider: ${response.provider}`);
      console.log(`   Model: ${response.model}`);
      console.log(`   Content length: ${response.content.length} characters`);
      console.log(`   Token usage: ${JSON.stringify(response.tokenUsage)}`);
      console.log();
    }

    console.log('✅ LLM Service test completed successfully!\n');

    // Print configuration guidance
    console.log('📚 Configuration Guide:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your API keys for the providers you want to use:');
    console.log('   - Google GenAI: https://aistudio.google.com/apikey');
    console.log('   - OpenAI: https://platform.openai.com/api-keys');
    console.log('   - Anthropic: https://console.anthropic.com/');
    console.log('3. For local providers:');
    console.log('   - Ollama: Install and run `ollama serve` (port 11434)');
    console.log('   - LM Studio: Start local server (port 1234)');
    console.log('4. Set VITE_DEFAULT_LLM_PROVIDER to your preferred provider');
    console.log('5. Enable VITE_MOCK_LLM_RESPONSES=true for testing without API calls');

  } catch (error) {
    console.error('❌ Error testing LLM service:', error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testLLMService().catch(console.error);
}

export { testLLMService };
