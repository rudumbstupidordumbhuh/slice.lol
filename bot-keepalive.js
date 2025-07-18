const { Client, GatewayIntentBits } = require('discord.js');
const WebhookService = require('./api/webhookService');

class BotKeepAlive {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.webhookService = new WebhookService();
    this.isOnline = false;
    this.keepAliveInterval = null;
    this.statusUpdateInterval = null;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Bot ready event
    this.client.on('ready', () => {
      console.log(`🤖 Bot is online as ${this.client.user.tag}`);
      this.isOnline = true;
      this.startKeepAlive();
      this.startStatusUpdates();
      this.setBotStatus();
    });

    // Bot disconnected event
    this.client.on('disconnect', () => {
      console.log('🔌 Bot disconnected, attempting to reconnect...');
      this.isOnline = false;
      this.reconnect();
    });

    // Bot error event
    this.client.on('error', (error) => {
      console.error('❌ Bot error:', error);
      this.reconnect();
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down bot gracefully...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down bot gracefully...');
      this.shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      this.reconnect();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      this.reconnect();
    });
  }

  async start() {
    try {
      console.log('🚀 Starting Discord bot...');
      await this.client.login('MTM5MzYzMzc0Mzc5NjY5OTEzNg.GNXETy.tKy8xRHWGYqAkYnuniw2FxXPjegZdh3plC4Z_U');
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      setTimeout(() => this.start(), 5000); // Retry after 5 seconds
    }
  }

  startKeepAlive() {
    // Send periodic pings to keep the connection alive
    this.keepAliveInterval = setInterval(() => {
      if (this.isOnline) {
        this.client.ws.ping();
        console.log('💓 Keep-alive ping sent');
      }
    }, 30000); // Every 30 seconds
  }

  startStatusUpdates() {
    // Update bot status periodically
    this.statusUpdateInterval = setInterval(() => {
      if (this.isOnline) {
        this.setBotStatus();
      }
    }, 60000); // Every minute
  }

  setBotStatus() {
    try {
      const status = this.webhookService.getWebhookStatus();
      const spamStats = this.webhookService.getSpamStats();
      
      const activityText = `🔗 ${status.active}/${status.total} webhooks | 🚨 ${spamStats.spamDetected} spam`;
      
      this.client.user.setActivity(activityText, { type: 'WATCHING' });
      this.client.user.setStatus('online');
      
      console.log(`📊 Status updated: ${activityText}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  }

  async reconnect() {
    console.log('🔄 Attempting to reconnect...');
    this.isOnline = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }

    try {
      await this.client.destroy();
      setTimeout(() => this.start(), 5000);
    } catch (error) {
      console.error('❌ Error during reconnection:', error);
      setTimeout(() => this.reconnect(), 10000);
    }
  }

  shutdown() {
    console.log('🛑 Shutting down bot...');
    this.isOnline = false;
    
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }

    this.client.destroy();
    process.exit(0);
  }

  // Get bot status for monitoring
  getStatus() {
    return {
      isOnline: this.isOnline,
      botTag: this.client.user?.tag || 'Unknown',
      guildCount: this.client.guilds?.cache?.size || 0,
      uptime: this.client.uptime || 0,
      ping: this.client.ws?.ping || 0
    };
  }
}

// Create and start the bot
const bot = new BotKeepAlive();

// Export for use in other parts of the application
module.exports = bot;

// Start the bot if this file is run directly
if (require.main === module) {
  bot.start();
} 