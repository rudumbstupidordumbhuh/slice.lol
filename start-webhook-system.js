#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Webhook System...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root directory.');
  process.exit(1);
}

try {
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  }

  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project built successfully!\n');

  // Start the server
  console.log('🌐 Starting server with webhook system...');
  console.log('📊 Webhook endpoints available:');
  console.log('   - POST /api/webhook/log-ip');
  console.log('   - POST /api/webhook/send-message');
  console.log('   - POST /api/webhook/test');
  console.log('   - GET  /api/webhook/status');
  console.log('   - GET  /api/webhook/health');
  console.log('   - POST /api/webhook/reactivate/:id');
  console.log('\n🎮 Access the webhook monitor through the application UI');
  console.log('🧪 Run "node test-webhook.js" to test the system\n');

  // Start the server
  execSync('node server.js', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Error starting webhook system:', error.message);
  process.exit(1);
} 