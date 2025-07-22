/**
 * Quick Agent Test for ESAF Framework
 * Run this to verify agents are working correctly
 */

import { frameworkInstance } from './src/core/orchestrator.js';

console.log('🧪 Testing ESAF Agent System...\n');

async function testAgents() {
  try {
    // Initialize framework
    console.log('1️⃣ Initializing framework...');
    await frameworkInstance.initialize();
    console.log('✅ Framework initialized\n');

    // Get agent status
    console.log('2️⃣ Checking agent status...');
    const agents = frameworkInstance.getAgentInfo();
    agents.forEach(agent => {
      console.log(`✅ ${agent.name}: ${agent.status}`);
    });
    console.log('');

    // Test simple data validation
    console.log('3️⃣ Testing Data Analysis Agent...');
    const testData = [1, 2, 3, 4, 5, null, 7, 8, 9, 10];
    const result = await frameworkInstance.processQuery('Validate this data array and check for anomalies: ' + JSON.stringify(testData));
    console.log('✅ Data analysis completed');
    console.log(`   Result preview: ${result.substring(0, 100)}...`);
    console.log('');

    // Check if all core agents are present
    console.log('4️⃣ Verifying core agents...');
    const requiredAgents = ['Data Analysis Agent', 'Optimization Agent', 'Game Theory Agent', 'Swarm Intelligence Agent', 'Decision Making Agent'];
    const agentNames = agents.map(a => a.name);
    requiredAgents.forEach(required => {
      if (agentNames.includes(required)) {
        console.log(`✅ ${required} present`);
      } else {
        console.log(`❌ ${required} MISSING`);
      }
    });

    console.log('\n✨ Agent system test complete!');
    console.log('If all checks passed, your agents are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Make sure you have API keys configured in .env file');
  }

  process.exit(0);
}

// Run the test
testAgents().catch(console.error);
