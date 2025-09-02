#!/usr/bin/env node

const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'broadcast.db');

console.log('🔍 Checking database state...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

// Проверяем существующие таблицы
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error getting tables:', err);
    return;
  }
  
  console.log('\n📋 Existing tables:');
  tables.forEach(table => console.log(`  - ${table.name}`));
  
  // Проверяем broadcast_jobs
  db.all("SELECT * FROM broadcast_jobs ORDER BY id DESC LIMIT 5", (err, jobs) => {
    if (err) {
      console.error('❌ Error getting jobs:', err);
    } else {
      console.log('\n📤 Recent broadcast jobs:');
      jobs.forEach(job => {
        console.log(`  ID: ${job.id}, Title: "${job.title}", Status: ${job.status}, Total: ${job.total}, Sent: ${job.sent || 0}, Failed: ${job.failed || 0}`);
      });
    }
    
    // Проверяем broadcast_recipients
    db.all("SELECT * FROM broadcast_recipients ORDER BY job_id DESC LIMIT 10", (err, recipients) => {
      if (err) {
        console.error('❌ Error getting recipients:', err);
      } else {
        console.log('\n👥 Recent recipients:');
        if (recipients.length === 0) {
          console.log('  No recipients found!');
        } else {
          recipients.forEach(recipient => {
            console.log(`  Job: ${recipient.job_id}, Telegram: ${recipient.telegram_id}, Status: ${recipient.status}`);
          });
        }
      }
      
      // Проверяем broadcast_logs
      db.all("SELECT * FROM broadcast_logs ORDER BY id DESC LIMIT 5", (err, logs) => {
        if (err) {
          console.error('❌ Error getting logs:', err);
        } else {
          console.log('\n📝 Recent logs:');
          logs.forEach(log => {
            console.log(`  ${log.level}: ${log.message}`);
          });
        }
        
        db.close();
        console.log('\n✅ Database check completed');
      });
    });
  });
});
