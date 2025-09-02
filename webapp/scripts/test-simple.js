#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const botUsersFile = path.join(__dirname, '..', 'data', 'bot-users.json');

console.log('🧪 Testing bot-users.json file...');
console.log('File path:', botUsersFile);

try {
  if (fs.existsSync(botUsersFile)) {
    console.log('✅ File exists');
    
    const data = fs.readFileSync(botUsersFile, 'utf-8');
    const parsed = JSON.parse(data);
    
    console.log(`📋 Found ${parsed.users?.length || 0} users`);
    
    if (parsed.users && parsed.users.length > 0) {
      console.log('\n👥 Users:');
      parsed.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.telegram_id})`);
      });
    }
  } else {
    console.log('❌ File does not exist');
  }
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}

