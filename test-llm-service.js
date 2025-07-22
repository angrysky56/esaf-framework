/**
 * Test script to verify LLM service configuration
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing LLM Service Configuration...');

// Test environment variables
console.log('Environment Variables:');
console.log('VITE_DEFAULT_LLM_PROVIDER:', process.env.VITE_DEFAULT_LLM_PROVIDER);
console.log('VITE_GOOGLE_GENAI_API_KEY exists:', !!process.env.VITE_GOOGLE_GENAI_API_KEY);
console.log('VITE_GOOGLE_GENAI_MODEL:', process.env.VITE_GOOGLE_GENAI_MODEL);

// Check if we can import the LLM service
try {
  console.log('\nTesting dynamic import...');
  const { llmService, LLMProvider } = await import('./src/core/llm-service.js');
  
  console.log('LLM Service imported successfully');
  console.log('Available providers:', llmService.getAvailableProviders());
  
  // Test a simple request
  console.log('\nTesting simple LLM request...');
  const response = await llmService.generateCompletion({
    prompt: 'Hello, this is a test. Please respond with "OK".',
    provider: LLMProvider.GOOGLE_GENAI,
    temperature: 0,
    maxTokens: 10
  });
  
  console.log('LLM Response:', response);
  console.log('✅ LLM Service is working correctly!');
  
} catch (error) {
  console.error('❌ LLM Service error:', error);
  console.error('Stack trace:', error.stack);
}
