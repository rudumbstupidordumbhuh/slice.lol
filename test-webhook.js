const fetch = require('node-fetch');

async function testWebhookSystem() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Webhook System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/api/webhook/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData.status);
    console.log('📊 Webhooks:', healthData.webhooks);
    console.log('⏱️  Uptime:', Math.round(healthData.uptime), 'seconds\n');

    // Test 2: Status Check
    console.log('2. Testing Status Check...');
    const statusResponse = await fetch(`${baseUrl}/api/webhook/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status Check:', statusData.success ? 'PASSED' : 'FAILED');
    if (statusData.success) {
      console.log('📈 Total Webhooks:', statusData.data.total);
      console.log('🟢 Active Webhooks:', statusData.data.active);
      console.log('🔴 Inactive Webhooks:', statusData.data.inactive);
    }
    console.log('');

    // Test 3: Test Message
    console.log('3. Testing Message Sending...');
    const testResponse = await fetch(`${baseUrl}/api/webhook/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const testData = await testResponse.json();
    console.log('✅ Test Message:', testData.success ? 'SENT' : 'FAILED');
    if (testData.success) {
      console.log('🔗 Used Webhook:', testData.webhookId);
      console.log('⏰ Timestamp:', testData.timestamp);
    } else {
      console.log('❌ Error:', testData.error);
    }
    console.log('');

    // Test 4: Custom Message
    console.log('4. Testing Custom Message...');
    const customResponse = await fetch(`${baseUrl}/api/webhook/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '🚀 Webhook system is working perfectly!',
        title: 'System Test',
        color: 0x00ff00
      })
    });
    const customData = await customResponse.json();
    console.log('✅ Custom Message:', customData.success ? 'SENT' : 'FAILED');
    if (customData.success) {
      console.log('🔗 Used Webhook:', customData.webhookId);
    } else {
      console.log('❌ Error:', customData.error);
    }
    console.log('');

    // Test 5: IP Logging
    console.log('5. Testing IP Logging...');
    const ipResponse = await fetch(`${baseUrl}/api/webhook/log-ip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    });
    const ipData = await ipResponse.json();
    console.log('✅ IP Logging:', ipData.success ? 'SUCCESS' : 'FAILED');
    if (ipData.success) {
      console.log('🔗 Used Webhook:', ipData.webhookId);
    } else {
      console.log('❌ Error:', ipData.error);
    }
    console.log('');

    // Test 6: Spam Statistics
    console.log('6. Testing Spam Statistics...');
    const spamResponse = await fetch(`${baseUrl}/api/webhook/spam-stats`);
    const spamData = await spamResponse.json();
    console.log('✅ Spam Stats:', spamData.success ? 'RETRIEVED' : 'FAILED');
    if (spamData.success) {
      console.log('🚨 Spam Detected:', spamData.data.spamDetected);
      console.log('📊 Threshold:', spamData.data.spamThreshold, 'messages per', spamData.data.spamWindow, 'ms');
    } else {
      console.log('❌ Error:', spamData.error);
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('📋 Summary:');
    console.log('   - Health Check:', healthData.status);
    console.log('   - Active Webhooks:', statusData.success ? statusData.data.active : 'N/A');
    console.log('   - Test Message:', testData.success ? 'PASSED' : 'FAILED');
    console.log('   - Custom Message:', customData.success ? 'PASSED' : 'FAILED');
    console.log('   - IP Logging:', ipData.success ? 'PASSED' : 'FAILED');
    console.log('   - Spam Stats:', spamData.success ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running on port 3001');
    console.log('   Run: npm start or node server.js');
  }
}

// Run the test
testWebhookSystem(); 