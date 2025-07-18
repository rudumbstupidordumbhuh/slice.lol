#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ProductionManager {
  constructor() {
    this.isRunning = false;
    this.restartCount = 0;
    this.maxRestarts = 1000; // Unlimited restarts
    this.restartDelay = 5000; // 5 seconds between restarts
    this.lastRestart = 0;
  }

  async start() {
    console.log('🚀 Starting Production Webhook System...\n');

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

      // Start the production server
      this.startProductionServer();

    } catch (error) {
      console.error('❌ Error starting production system:', error.message);
      this.restart();
    }
  }

  startProductionServer() {
    if (this.isRunning) {
      console.log('⚠️  Server is already running');
      return;
    }

    console.log('🌐 Starting production server with stealth webhook system...');
    console.log('🤖 Discord bot will stay online forever');
    console.log('🔗 IP logging is completely invisible to users');
    console.log('🚨 Anti-spam protection is active');
    console.log('📊 Bot status updates every minute');
    console.log('\n💡 Press Ctrl+C to stop the server\n');

    this.isRunning = true;

    // Start the server process
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit',
      detached: false
    });

    // Handle server process events
    serverProcess.on('close', (code) => {
      console.log(`\n🔌 Server process exited with code ${code}`);
      this.isRunning = false;
      
      if (code !== 0) {
        console.log('🔄 Restarting server due to crash...');
        this.restart();
      }
    });

    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error);
      this.isRunning = false;
      this.restart();
    });

    // Handle process termination signals
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down production server...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down production server...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });

    // Monitor server health
    this.startHealthMonitoring();
  }

  startHealthMonitoring() {
    // Check server health every 30 seconds
    setInterval(() => {
      if (!this.isRunning) {
        console.log('⚠️  Server not running, attempting restart...');
        this.restart();
      }
    }, 30000);

    // Log uptime every 5 minutes
    setInterval(() => {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      console.log(`⏰ Server uptime: ${hours}h ${minutes}m | Restarts: ${this.restartCount}`);
    }, 300000);
  }

  restart() {
    const now = Date.now();
    
    // Prevent rapid restarts
    if (now - this.lastRestart < this.restartDelay) {
      console.log('⏳ Waiting before restart...');
      setTimeout(() => this.restart(), this.restartDelay);
      return;
    }

    if (this.restartCount >= this.maxRestarts) {
      console.error('❌ Maximum restart attempts reached');
      process.exit(1);
    }

    this.restartCount++;
    this.lastRestart = now;
    
    console.log(`🔄 Restarting server (attempt ${this.restartCount})...`);
    
    setTimeout(() => {
      this.startProductionServer();
    }, this.restartDelay);
  }

  // Get production status
  getStatus() {
    return {
      isRunning: this.isRunning,
      restartCount: this.restartCount,
      uptime: process.uptime(),
      maxRestarts: this.maxRestarts
    };
  }
}

// Create and start the production manager
const productionManager = new ProductionManager();

// Export for use in other parts of the application
module.exports = productionManager;

// Start the production system if this file is run directly
if (require.main === module) {
  productionManager.start();
} 