#!/usr/bin/env node

const { getBotUsersForBroadcast } = require('../lib/bot-users.ts');

async function testBotUsers() {
  console.log('🧪 Testing bot users functionality...');
  
  try {
    const users = await getBotUsersForBroadcast('all', 7, '');
    console.log(`✅ Found ${users.length} users for broadcast`);
    
    if (users.length > 0) {
      console.log('\n📋 Users details:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.telegram_id}) - ${user.is_premium ? 'Premium' : 'Free'}`);
      });
    } else {
      console.log('❌ No users found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBotUsers();
