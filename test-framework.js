/**
 * Test script to debug ESAF framework issues
 * @fileoverview Quick test to see what's failing in the framework
 */

// Test the real algorithms directly
import { 
  BayesianInference,
  StatisticalAnomalyDetection,
  StatisticalFeatureExtraction,
  MathematicalDataValidation
} from './src/core/real-algorithms.js';

// Test the data analysis agent
import { DataAnalysisAgent } from './src/agents/data-analysis-agent.js';
import { LLMProvider } from './src/core/llm-service.js';

console.log('🧪 Testing ESAF Framework Components...');

// Test 1: Real algorithms directly
console.log('\n📊 Testing Real Algorithms...');
try {
  const testData = [1, 2, 3, 4, 5, 100]; // Has one clear outlier
  
  // Test data validation
  const validation = MathematicalDataValidation.validateDataQuality(testData);
  console.log('✅ Data Validation:', validation.quality.toFixed(3));
  
  // Test feature extraction
  const features = StatisticalFeatureExtraction.extractNumericalFeatures(testData);
  console.log('✅ Feature Extraction - Mean:', features.descriptive.mean.toFixed(3));
  
  // Test anomaly detection
  const anomalies = StatisticalAnomalyDetection.detectZScoreAnomalies(testData);
  console.log('✅ Anomaly Detection - Found:', anomalies.anomalies.length, 'anomalies');
  
  // Test Bayesian inference
  const hypotheses = [
    { name: 'normal', prior: 0.8, likelihoodFunction: () => 0.9 },
    { name: 'anomalous', prior: 0.2, likelihoodFunction: () => 0.1 }
  ];
  const classification = BayesianInference.classify([1.5], hypotheses);
  console.log('✅ Bayesian Classification:', classification.hypothesis);
  
} catch (error) {
  console.error('❌ Real Algorithms Error:', error);
}

// Test 2: Data Analysis Agent
console.log('\n🤖 Testing Data Analysis Agent...');
try {
  const agent = new DataAnalysisAgent(LLMProvider.GOOGLE_GENAI);
  console.log('✅ Data Analysis Agent created successfully');
  console.log('Agent ID:', agent.id);
  console.log('Agent Type:', agent.type);
  
} catch (error) {
  console.error('❌ Data Analysis Agent Error:', error);
}

console.log('\n✅ Test completed!');
