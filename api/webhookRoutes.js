const express = require('express');
const WebhookService = require('./webhookService');

const router = express.Router();
const webhookService = new WebhookService();

// Middleware to add security headers
const addSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Apply security headers to all routes
router.use(addSecurityHeaders);

// IP logging endpoint - logs visitor IP to Discord webhook
router.post('/log-ip', async (req, res) => {
  try {
    const payload = {
      content: "🚨 **New Visitor Detected** 🚨",
      username: "guns.lol Logger",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/logo.png"
    };

    const result = await webhookService.sendMessage(payload, req);
    
    res.json({
      success: true,
      message: 'IP logged successfully',
      webhookId: result.webhookId
    });
  } catch (error) {
    console.error('IP logging failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to log IP address',
      message: error.message
    });
  }
});

// Custom message endpoint - send custom message to Discord
router.post('/send-message', async (req, res) => {
  try {
    const { message, title, color } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const payload = {
      content: message,
      username: "guns.lol Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/bot.png",
      embeds: title ? [{
        title: title,
        description: message,
        color: color || 0x00ff00,
        timestamp: new Date().toISOString()
      }] : undefined
    };

    const result = await webhookService.sendMessage(payload, req);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      webhookId: result.webhookId
    });
  } catch (error) {
    console.error('Message sending failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Webhook status endpoint - get status of all webhooks
router.get('/status', (req, res) => {
  try {
    const status = webhookService.getWebhookStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Status check failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook status',
      message: error.message
    });
  }
});

// Manual webhook reactivation endpoint
router.post('/reactivate/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const result = await webhookService.reactivateWebhook(webhookId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Webhook reactivation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate webhook',
      message: error.message
    });
  }
});

// Test webhook endpoint - test if webhook system is working
router.post('/test', async (req, res) => {
  try {
    const payload = {
      content: "🧪 **Webhook System Test** 🧪\n\n✅ System is working correctly!\n🕒 Test timestamp: " + new Date().toISOString(),
      username: "guns.lol Test Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/test.png"
    };

    const result = await webhookService.sendMessage(payload, req);
    
    res.json({
      success: true,
      message: 'Test message sent successfully',
      webhookId: result.webhookId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const status = webhookService.getWebhookStatus();
  const spamStats = webhookService.getSpamStats();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    webhooks: {
      total: status.total,
      active: status.active,
      inactive: status.inactive,
      spamDetected: status.spamDetected
    },
    spam: {
      detected: spamStats.spamDetected,
      threshold: spamStats.spamThreshold,
      window: spamStats.spamWindow
    },
    uptime: process.uptime()
  };

  // Consider unhealthy if more than 50% of webhooks are inactive or spam detected
  if (status.inactive > status.total / 2) {
    health.status = 'degraded';
  }

  res.json(health);
});

// Spam statistics endpoint
router.get('/spam-stats', (req, res) => {
  try {
    const spamStats = webhookService.getSpamStats();
    res.json({
      success: true,
      data: spamStats
    });
  } catch (error) {
    console.error('Spam stats failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get spam statistics',
      message: error.message
    });
  }
});

// Manual spam trigger for testing
router.post('/trigger-spam-test', async (req, res) => {
  try {
    const { webhookId } = req.body;
    
    if (!webhookId) {
      return res.status(400).json({
        success: false,
        error: 'Webhook ID is required'
      });
    }

    // Simulate spam by sending multiple messages quickly
    const promises = [];
    for (let i = 0; i < 15; i++) {
      promises.push(
        fetch(`${req.protocol}://${req.get('host')}/api/webhook/send-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Spam test message ${i + 1}`,
            title: 'Spam Test'
          })
        })
      );
    }

    await Promise.all(promises);
    
    res.json({
      success: true,
      message: 'Spam test triggered successfully',
      webhookId: webhookId
    });
  } catch (error) {
    console.error('Spam test failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger spam test',
      message: error.message
    });
  }
});

module.exports = router; 