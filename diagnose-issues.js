#!/usr/bin/env node

/**
 * ESAF Framework Diagnostic Script
 * Checks for common issues and provides solutions
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

console.log('🔍 ESAF Framework Diagnostic Tool\n');

// Check 1: Package.json integrity
console.log('1️⃣ Checking package.json...');
try {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  console.log('✅ Package.json is valid');
  console.log(`   - Tauri dev script: ${packageJson.scripts['tauri:dev'] ? '✅ Present' : '❌ Missing'}`);
  console.log(`   - Tauri build script: ${packageJson.scripts['tauri:build'] ? '✅ Present' : '❌ Missing'}`);
} catch (error) {
  console.log('❌ Package.json error:', error.message);
}

// Check 2: Tauri configuration
console.log('\n2️⃣ Checking Tauri configuration...');
const tauriConfPath = join(projectRoot, 'src-tauri', 'tauri.conf.json');
if (existsSync(tauriConfPath)) {
  try {
    const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'));
    console.log('✅ Tauri configuration found');
    console.log(`   - Dev URL: ${tauriConf.build.devUrl}`);
    console.log(`   - Product Name: ${tauriConf.productName}`);
  } catch (error) {
    console.log('❌ Tauri configuration error:', error.message);
  }
} else {
  console.log('❌ Tauri configuration missing');
}

// Check 3: Real algorithms module
console.log('\n3️⃣ Checking real-algorithms module...');
const realAlgorithmsPath = join(projectRoot, 'src', 'core', 'real-algorithms.ts');
if (existsSync(realAlgorithmsPath)) {
  console.log('✅ real-algorithms.ts exists');
  const content = readFileSync(realAlgorithmsPath, 'utf8');
  const exports = ['BayesianInference', 'StatisticalAnomalyDetection', 'StatisticalFeatureExtraction', 'MathematicalDataValidation'];
  exports.forEach(exp => {
    if (content.includes(`export class ${exp}`)) {
      console.log(`   ✅ ${exp} exported`);
    } else {
      console.log(`   ❌ ${exp} missing`);
    }
  });
} else {
  console.log('❌ real-algorithms.ts missing');
}

// Check 4: Storage manager
console.log('\n4️⃣ Checking storage manager...');
const storageManagerPath = join(projectRoot, 'src', 'stores', 'storage-manager.ts');
if (existsSync(storageManagerPath)) {
  console.log('✅ storage-manager.ts exists');
} else {
  console.log('❌ storage-manager.ts missing');
}

// Check 5: LLM service
console.log('\n5️⃣ Checking LLM service...');
const llmServicePath = join(projectRoot, 'src', 'core', 'llm-service.ts');
if (existsSync(llmServicePath)) {
  console.log('✅ llm-service.ts exists');
  const content = readFileSync(llmServicePath, 'utf8');
  if (content.includes('GOOGLE_GENAI')) {
    console.log('   ✅ Google Gemini support found');
  }
} else {
  console.log('❌ llm-service.ts missing');
}

// Check 6: Environment variables
console.log('\n6️⃣ Checking environment configuration...');
const envPath = join(projectRoot, '.env');
if (existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = readFileSync(envPath, 'utf8');
  const requiredVars = ['VITE_GOOGLE_GENAI_API_KEY', 'VITE_OPENAI_API_KEY', 'VITE_ANTHROPIC_API_KEY'];
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const hasValue = envContent.match(new RegExp(`${varName}=(.+)`));
      if (hasValue && hasValue[1] && hasValue[1].trim() && hasValue[1].trim() !== 'your_api_key_here') {
        console.log(`   ✅ ${varName} configured`);
      } else {
        console.log(`   ⚠️  ${varName} needs configuration`);
      }
    } else {
      console.log(`   ❌ ${varName} missing`);
    }
  });
} else {
  console.log('❌ .env file missing');
}

console.log('\n📋 Diagnostic Summary:');
console.log('If running HTTP instead of Tauri, use: npm run tauri:dev');
console.log('If agents are failing, check the algorithm imports and API keys');
console.log('If changes aren\'t visible, ensure you\'re accessing the Tauri app, not just the Vite dev server');
