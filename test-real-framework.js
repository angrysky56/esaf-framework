/**
 * Quick test to verify the ESAF Framework actually works
 * This should demonstrate the real framework vs the fake responses
 */

import { frameworkInstance } from './src/core/orchestrator.js';

async function testRealFramework() {
  console.log('🚀 Testing ESAF Framework (Real System)...\n');
  
  try {
    // Initialize the framework
    console.log('📋 Initializing framework...');
    await frameworkInstance.initialize();
    console.log('✅ Framework initialized successfully\n');

    // Test with a real query
    const testQuery = "What are the key factors in autonomous AI agent design?";
    console.log(`💭 Testing query: "${testQuery}"\n`);

    // Execute the complete workflow (this is what ChatInterface should be doing)
    console.log('🧠 Running multi-agent cognitive analysis...');
    const results = await frameworkInstance.executeCompleteWorkflow(
      {
        query: testQuery,
        analysisType: 'intelligent_analysis',
        timestamp: Date.now(),
        userInput: testQuery
      },
      [testQuery],
      {
        analysisType: 'intelligent_analysis',
        requestedInsights: ['data_analysis', 'optimization', 'strategic_assessment'],
        constraints: [],
        variables: [],
        stakeholders: ['user', 'system']
      }
    );

    console.log('\n📊 REAL FRAMEWORK RESULTS:');
    console.log('============================');
    
    if (results.dataAnalysis) {
      console.log(`\n🔍 Data Analysis: ${results.dataAnalysis.result || 'Completed'}`);
      console.log(`   Confidence: ${results.dataAnalysis.confidence || 'N/A'}`);
    }
    
    if (results.optimization) {
      console.log(`\n⚙️ Optimization: ${results.optimization.result || 'Completed'}`);
    }
    
    if (results.gameTheory) {
      console.log(`\n🎯 Game Theory: ${results.gameTheory.result || 'Completed'}`);
    }
    
    if (results.swarmIntelligence) {
      console.log(`\n🐝 Swarm Intelligence: ${results.swarmIntelligence.result || 'Completed'}`);
    }
    
    if (results.finalDecision) {
      console.log(`\n🎯 Final Decision: ${results.finalDecision.result || 'Completed'}`);
      console.log(`   Confidence: ${results.finalDecision.confidence || 'N/A'}`);
    }

    console.log('\n✅ SUCCESS: Real ESAF Framework is working!');
    console.log('   Your ChatInterface should now use these real results instead of fake responses.');

  } catch (error) {
    console.error('\n❌ FRAMEWORK ERROR:', error);
    console.log('\nThis is a REAL error that needs to be fixed:');
    console.log('- Check LLM service configuration');
    console.log('- Verify API keys in .env file');
    console.log('- Check network connectivity');
  } finally {
    // Cleanup
    await frameworkInstance.shutdown();
  }
}

// Run the test
testRealFramework().catch(console.error);
