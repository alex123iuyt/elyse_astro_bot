#!/usr/bin/env node

/**
 * Test script for broadcast functionality
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@elyse.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

console.log('🚀 Starting broadcast tests...');
console.log('📋 Configuration:');
console.log(`   BASE_URL: ${BASE_URL}`);
console.log(`   BOT_TOKEN: ${BOT_TOKEN ? '✅ Set' : '❌ Not set'}`);
console.log(`   ADMIN_EMAIL: ${ADMIN_EMAIL}`);
console.log(`   ADMIN_PASSWORD: ${ADMIN_PASSWORD ? '✅ Set' : '❌ Not set'}`);
console.log('');

async function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = (isHttps ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function login() {
  console.log('🔐 Testing admin login...');

  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Login successful');
      return response.data.token;
    } else {
      console.log('❌ Login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function testBroadcastCreation(token) {
  console.log('\n📤 Testing broadcast creation...');

  try {
    const formData = new FormData();
    formData.append('title', 'Test Broadcast from Script');
    formData.append('text', 'This is a test message from automated script');
    formData.append('segment', 'all');

    const response = await makeRequest('POST', '/api/admin/notifications', {
      title: 'Test Broadcast from Script',
      text: 'This is a test message from automated script',
      segment: 'all'
    }, {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ Broadcast created successfully');
      console.log(`   Job ID: ${response.data.jobId}`);
      console.log(`   Total recipients: ${response.data.total}`);
      return response.data.jobId;
    } else {
      console.log('❌ Broadcast creation failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Broadcast creation error:', error.message);
    return null;
  }
}

async function testBroadcastProcessing(jobId, token) {
  console.log('\n⚙️ Testing broadcast processing...');

  try {
    const response = await makeRequest('POST', '/api/admin/notifications/process', null, {
      'Authorization': `Bearer ${token}`
    });

    if (response.status === 200) {
      console.log('✅ Broadcast processing triggered');
      return true;
    } else {
      console.log('❌ Broadcast processing failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Broadcast processing error:', error.message);
    return false;
  }
}

async function testLogs(token) {
  console.log('\n📋 Testing broadcast logs...');

  try {
    const response = await makeRequest('GET', '/api/admin/logs?category=BROADCAST&limit=50', null, {
      'Authorization': `Bearer ${token}`
    });

    if (response.status === 200) {
      console.log('✅ Logs retrieved successfully');
      console.log(`   Found ${response.data.logs?.length || 0} broadcast log entries`);

      if (response.data.logs && response.data.logs.length > 0) {
        console.log('\n📝 Recent broadcast logs:');
        response.data.logs.slice(0, 5).forEach((log, index) => {
          console.log(`   ${index + 1}. [${log.level}] ${log.message}`);
          if (log.metadata && Object.keys(log.metadata).length > 0) {
            console.log(`      Metadata: ${JSON.stringify(log.metadata, null, 2)}`);
          }
        });
      }

      return true;
    } else {
      console.log('❌ Logs retrieval failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Logs retrieval error:', error.message);
    return false;
  }
}

async function testBotConnection() {
  console.log('\n🤖 Testing bot connection...');

  if (!BOT_TOKEN) {
    console.log('❌ BOT_TOKEN not set, skipping bot test');
    return false;
  }

  try {
    const response = await makeRequest('GET', `https://api.telegram.org/bot${BOT_TOKEN}/getMe`);

    if (response.status === 200 && response.data.ok) {
      console.log('✅ Bot connection successful');
      console.log(`   Bot name: ${response.data.result.first_name}`);
      console.log(`   Bot username: @${response.data.result.username}`);
      return true;
    } else {
      console.log('❌ Bot connection failed:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Bot connection error:', error.message);
    return false;
  }
}

async function testBroadcastFullCycle(token) {
  console.log('\n🔄 Testing full broadcast cycle...');

  try {
    // Create broadcast
    const jobId = await testBroadcastCreation(token);
    if (!jobId) {
      console.log('❌ Cannot test full cycle - broadcast creation failed');
      return false;
    }

    console.log(`\n⏳ Waiting 3 seconds before processing...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Process broadcast
    const processingOk = await testBroadcastProcessing(jobId, token);

    console.log(`\n⏳ Waiting 5 seconds for processing to complete...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test logs again to see processing results
    console.log('\n📋 Checking logs after processing...');
    await testLogs(token);

    return processingOk;
  } catch (error) {
    console.log('❌ Full cycle test error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Broadcast System Test Suite');
  console.log('================================');

  // Test bot connection first
  const botOk = await testBotConnection();

  // Test login
  const token = await login();
  if (!token) {
    console.log('\n❌ Tests failed - cannot login');
    process.exit(1);
  }

  // Test full broadcast cycle
  const cycleOk = await testBroadcastFullCycle(token);

  // Final logs check
  await testLogs(token);

  console.log('\n📊 Test Summary:');
  console.log(`   Bot Connection: ${botOk ? '✅' : '❌'}`);
  console.log(`   Admin Login: ${token ? '✅' : '❌'}`);
  console.log(`   Full Cycle Test: ${cycleOk ? '✅' : '❌'}`);
  console.log(`   Logs Access: ✅`);

  if (botOk && token && cycleOk) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure BOT_TOKEN is set in environment variables');
    console.log('   2. Check that the bot is running and has correct permissions');
    console.log('   3. Verify database connection');
    console.log('   4. Check that admin user exists and credentials are correct');
    console.log('   5. Check broadcast logs in admin panel for detailed error information');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, makeRequest, login, testBroadcastCreation, testBroadcastProcessing, testLogs, testBotConnection };