#!/usr/bin/env node

/**
 * Test script for dynamic model fetching functionality
 * This demonstrates the new dynamic model fetching capabilities
 */

// Import the LLM service
import { LLMService, LLMProvider } from './src/core/llm-service.js';

async function testDynamicModelFetching() {
  console.log('🚀 Testing Dynamic Model Fetching...\n');
  
  const llmService = new LLMService();
  
  // Test each provider
  const providers = [
    LLMProvider.GOOGLE_GENAI,
    LLMProvider.LM_STUDIO,
    LLMProvider.OLLAMA,
    LLMProvider.OPENAI,
    LLMProvider.ANTHROPIC
  ];
  
  console.log('📋 Available Providers:', llmService.getAvailableProviders());
  console.log('');
  
  // Test provider health status
  console.log('🏥 Checking Provider Health Status...');
  try {
    const healthStatus = await llmService.getProvidersStatus();
    healthStatus.forEach(status => {
      console.log(`  ${status.provider}: ${status.available ? '✅ Available' : '❌ Unavailable'}`);
      if (status.latency) {
        console.log(`    Latency: ${status.latency}ms`);
      }
      if (status.modelCount) {
        console.log(`    Models: ${status.modelCount}`);
      }
      if (status.error) {
        console.log(`    Error: ${status.error}`);
      }
    });
    console.log('');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  // Test fetching models for each provider
  for (const provider of providers) {
    console.log(`📦 Testing ${provider} models...`);
    
    try {
      const models = await llmService.getModelsForProvider(provider);
      console.log(`  ✅ Found ${models.length} models:`);
      
      models.slice(0, 3).forEach(model => {
        console.log(`    - ${model.displayName || model.name} (${model.id})`);
        if (model.contextLength) {
          console.log(`      Context: ${model.contextLength} tokens`);
        }
        if (model.parameterSize) {
          console.log(`      Size: ${model.parameterSize}`);
        }
      });
      
      if (models.length > 3) {
        console.log(`    ... and ${models.length - 3} more`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Test getting all models at once
  console.log('🌐 Testing bulk model fetching...');
  try {
    const allModels = await llmService.getAllModels();
    const totalModels = Object.values(allModels).reduce((sum, models) => sum + models.length, 0);
    
    console.log(`  ✅ Found ${totalModels} total models across ${Object.keys(allModels).length} providers:`);
    
    Object.entries(allModels).forEach(([provider, models]) => {
      console.log(`    ${provider}: ${models.length} models`);
    });
    
  } catch (error) {
    console.error(`  ❌ Bulk fetch failed: ${error.message}`);
  }
  
  console.log('\n✨ Dynamic model fetching test completed!');
}

// Run the test
testDynamicModelFetching().catch(console.error);
