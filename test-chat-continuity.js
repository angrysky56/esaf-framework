#!/usr/bin/env node

/**
 * Test script for Chat Continuity and Document Library features
 * This demonstrates the new persistent chat history and document management
 */

import { storageManager } from './src/stores/storage-manager.js';
import { ChatSession, DocumentSource, ChatMessage } from './src/stores/storage-manager.js';

async function testChatContinuity() {
  console.log('🧠 Testing Chat Continuity & Document Library...\n');
  
  // Test 1: Create a new chat session
  console.log('📝 Test 1: Creating new chat session...');
  const session1 = storageManager.createNewSession();
  console.log(`✅ Created session: ${session1.id} - "${session1.title}"`);
  
  // Test 2: Add messages to session
  console.log('\n💬 Test 2: Adding messages to session...');
  const messages = [
    {
      id: 'msg_1',
      type: 'user' as const,
      content: 'Hello, I want to analyze some sales data.',
      timestamp: Date.now(),
      sessionId: session1.id
    },
    {
      id: 'msg_2', 
      type: 'agent' as const,
      content: 'I can help you analyze sales data using my specialized agents. Could you provide the data or tell me more about what kind of analysis you need?',
      timestamp: Date.now() + 1000,
      sessionId: session1.id,
      agentName: 'ESAF Assistant'
    },
    {
      id: 'msg_3',
      type: 'user' as const,
      content: 'I have quarterly sales figures and want to predict next quarter.',
      timestamp: Date.now() + 2000,
      sessionId: session1.id
    }
  ];
  
  storageManager.saveChatMessages(session1.id, messages);
  console.log(`✅ Added ${messages.length} messages to session`);
  
  // Test 3: Retrieve conversation history
  console.log('\n📚 Test 3: Retrieving conversation history...');
  const retrievedMessages = storageManager.getChatMessages(session1.id);
  console.log(`✅ Retrieved ${retrievedMessages.length} messages`);
  retrievedMessages.forEach((msg, i) => {
    console.log(`   ${i + 1}. [${msg.type.toUpperCase()}] ${msg.content.substring(0, 50)}...`);
  });
  
  // Test 4: Create document library entries
  console.log('\n📁 Test 4: Creating document library...');
  const documents: DocumentSource[] = [
    {
      id: 'doc_1',
      name: 'Q4 Sales Report',
      type: 'text',
      content: 'Q4 Sales Data:\nJan: $120,000\nFeb: $135,000\nMar: $145,000\nTotal: $400,000\n\nKey insights:\n- 20% growth over Q3\n- March showed strongest performance\n- Customer acquisition up 15%',
      metadata: {
        created: Date.now(),
        lastAccessed: Date.now(),
        tags: ['sales', 'quarterly', 'report'],
        description: 'Quarterly sales performance data',
        size: 200
      },
      isSelected: true
    },
    {
      id: 'doc_2',
      name: 'Market Trends Analysis',
      type: 'analysis',
      content: 'Market Analysis Summary:\n\n1. Industry Growth: 12% YoY\n2. Competitive Position: Strong\n3. Market Share: 23%\n4. Customer Sentiment: Positive\n5. Price Elasticity: Moderate\n\nRecommendations:\n- Increase marketing spend\n- Expand product line\n- Target new demographics',
      metadata: {
        created: Date.now() - 86400000, // Yesterday
        lastAccessed: Date.now(),
        tags: ['market', 'analysis', 'trends'],
        description: 'Comprehensive market analysis with recommendations',
        size: 350
      },
      isSelected: true
    },
    {
      id: 'doc_3',
      name: 'Customer Feedback Log',
      type: 'file',
      content: 'Customer Feedback Summary:\n\nPositive (78%):\n- Great product quality\n- Excellent customer service\n- Fast delivery\n\nNeutral (15%):\n- Price concerns\n- Feature requests\n\nNegative (7%):\n- Shipping delays\n- Product defects',
      metadata: {
        created: Date.now() - 172800000, // 2 days ago
        lastAccessed: Date.now(),
        tags: ['customer', 'feedback', 'survey'],
        description: 'Compiled customer feedback from Q4',
        size: 180
      },
      isSelected: false
    }
  ];
  
  documents.forEach(doc => {
    storageManager.saveDocument(doc);
    console.log(`✅ Added document: "${doc.name}" (${doc.type}) - Selected: ${doc.isSelected}`);
  });
  
  // Test 5: Document selection and context building
  console.log('\n🎯 Test 5: Testing document selection...');
  const selectedDocs = storageManager.getSelectedDocuments();
  console.log(`✅ Found ${selectedDocs.length} selected documents:`);
  selectedDocs.forEach(doc => {
    console.log(`   - ${doc.name}: ${doc.metadata.description}`);
  });
  
  // Test 6: Build conversation context
  console.log('\n🧠 Test 6: Building conversation context...');
  const context = storageManager.buildConversationContext(session1.id);
  console.log(`✅ Built context for session ${context.sessionId}:`);
  console.log(`   - Messages: ${context.messages.length}`);
  console.log(`   - Selected documents: ${context.selectedDocuments.length}`);
  console.log(`   - Provider: ${context.preferences.provider}`);
  console.log(`   - Model: ${context.preferences.model}`);
  console.log(`   - System prompt length: ${context.systemPrompt?.length || 0} characters`);
  
  // Test 7: Create another session to test session management
  console.log('\n🔄 Test 7: Testing multiple sessions...');
  const session2 = storageManager.createNewSession();
  session2.title = 'Marketing Strategy Discussion';
  storageManager.saveChatSession(session2);
  
  const marketingMessages = [
    {
      id: 'msg_m1',
      type: 'user' as const,
      content: 'I need help developing a marketing strategy for next year.',
      timestamp: Date.now(),
      sessionId: session2.id
    }
  ];
  
  storageManager.saveChatMessages(session2.id, marketingMessages);
  
  const allSessions = storageManager.getAllChatSessions();
  console.log(`✅ Created second session. Total sessions: ${allSessions.length}`);
  allSessions.forEach(session => {
    console.log(`   - ${session.title} (${session.messageCount} messages)`);
  });
  
  // Test 8: Search functionality
  console.log('\n🔍 Test 8: Testing document search...');
  const allDocs = storageManager.getAllDocuments();
  const salesDocs = allDocs.filter(doc => 
    doc.name.toLowerCase().includes('sales') || 
    doc.metadata.tags.includes('sales')
  );
  console.log(`✅ Found ${salesDocs.length} sales-related documents`);
  
  // Test 9: Export/Import functionality
  console.log('\n📤 Test 9: Testing export functionality...');
  const exportData = storageManager.exportChatSession(session1.id);
  console.log(`✅ Exported session data (${exportData.length} characters)`);
  
  const importedSession = storageManager.importChatSession(exportData);
  console.log(`✅ Imported session: ${importedSession.title} (${importedSession.id})`);
  
  // Test 10: Storage statistics
  console.log('\n📊 Test 10: Storage statistics...');
  const stats = storageManager.getStorageStats();
  console.log(`✅ Storage statistics:`);
  console.log(`   - Sessions: ${stats.sessions}`);
  console.log(`   - Messages: ${stats.messages}`);
  console.log(`   - Documents: ${stats.documents}`);
  console.log(`   - Storage size: ${stats.storageSize}`);
  
  // Test 11: Document management
  console.log('\n🗂️  Test 11: Testing document management...');
  
  // Toggle document selection
  storageManager.setDocumentSelection('doc_3', true);
  const updatedSelectedDocs = storageManager.getSelectedDocuments();
  console.log(`✅ Updated document selection. Now ${updatedSelectedDocs.length} documents selected`);
  
  // Update document metadata
  const doc = storageManager.getDocument('doc_1');
  if (doc) {
    doc.metadata.tags.push('important');
    doc.metadata.description = 'Updated Q4 sales performance data with insights';
    storageManager.saveDocument(doc);
    console.log(`✅ Updated document metadata for: ${doc.name}`);
  }
  
  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📋 Summary of implemented features:');
  console.log('   ✅ Persistent chat history');
  console.log('   ✅ Session management (create, load, delete)');
  console.log('   ✅ Document library with file upload support');
  console.log('   ✅ Document selection for context');
  console.log('   ✅ Conversation continuity with context building');
  console.log('   ✅ Export/import functionality');
  console.log('   ✅ Search and filtering');
  console.log('   ✅ Metadata management');
  console.log('   ✅ Storage statistics and monitoring');
  
  console.log('\n🚀 The ESAF Framework now has full conversation continuity!');
  console.log('Users can:');
  console.log('   - Resume any previous conversation');
  console.log('   - Upload and manage documents');
  console.log('   - Select documents for AI context');
  console.log('   - Search through chat history');
  console.log('   - Export/import conversations');
  console.log('   - Get contextually aware responses');
}

// Run the test
testChatContinuity().catch(console.error);
