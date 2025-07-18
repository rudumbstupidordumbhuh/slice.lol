# 🔗 Webhook System Documentation

## Overview

The webhook system provides a robust, automated Discord webhook management solution with IP logging capabilities. It features automatic failover, protection mechanisms, and comprehensive monitoring.

## 🚀 Features

### Core Features
- **Multiple Webhook Support**: 13 Discord webhooks with automatic rotation
- **Automatic Failover**: Seamlessly switches to working webhooks when one fails
- **IP Logging**: Automatically logs visitor IP addresses with detailed information
- **Rate Limiting Protection**: Built-in protection against Discord rate limits
- **Health Monitoring**: Real-time status monitoring of all webhooks
- **Automatic Recovery**: Reactivates failed webhooks after cooldown period

### Protection Features
- **Anti-Spam System**: Detects and handles spam (10+ messages per second)
- **Automatic Webhook Regeneration**: Deletes spam webhooks and creates new ones
- **Discord Bot Integration**: Uses bot token for webhook management
- **Request Throttling**: 1-second delay between requests to prevent rate limiting
- **Failure Tracking**: Tracks webhook failures and marks them inactive after 3 failures
- **Validation**: Periodically validates webhook URLs to ensure they're working
- **Retry Logic**: Automatic retry with exponential backoff
- **Security Headers**: Added security headers to all API responses

## 📋 API Endpoints

### 1. IP Logging
```http
POST /api/webhook/log-ip
```
Logs visitor IP address with detailed information to Discord.

**Response:**
```json
{
  "success": true,
  "message": "IP logged successfully",
  "webhookId": "webhook_1"
}
```

### 2. Custom Message
```http
POST /api/webhook/send-message
Content-Type: application/json

{
  "message": "Your message here",
  "title": "Optional title",
  "color": 0x00ff00
}
```
Sends a custom message to Discord.

### 3. System Test
```http
POST /api/webhook/test
```
Tests the webhook system and sends a test message.

### 4. Status Check
```http
GET /api/webhook/status
```
Returns detailed status of all webhooks.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 13,
    "active": 12,
    "inactive": 1,
    "currentIndex": 0,
    "webhooks": [...]
  }
}
```

### 5. Health Check
```http
GET /api/webhook/health
```
Returns system health status.

### 6. Manual Reactivation
```http
POST /api/webhook/reactivate/{webhookId}
```
Manually reactivates a specific webhook.

### 7. Spam Statistics
```http
GET /api/webhook/spam-stats
```
Returns spam detection statistics.

### 8. Spam Test Trigger
```http
POST /api/webhook/trigger-spam-test
Content-Type: application/json

{
  "webhookId": "webhook_1"
}
```
Triggers a spam test to verify anti-spam functionality.

## 🎮 Webhook Monitor Interface

The system includes a built-in webhook monitor accessible through the application:

1. **Start Menu** → **Webhook Monitor**
2. **Real-time Status**: View active/inactive webhooks
3. **Manual Controls**: Test system and reactivate webhooks
4. **Auto-refresh**: Updates every 30 seconds

## 🔧 Configuration

### Webhook URLs
The system uses 13 Discord webhooks configured in `api/webhookService.js`:

```javascript
this.webhooks = [
  {
    url: 'https://discord.com/api/webhooks/...',
    id: 'webhook_1',
    status: 'active',
    // ... other properties
  },
  // ... more webhooks
];
```

### System Settings
```javascript
this.rateLimitDelay = 1000;        // 1 second between requests
this.maxFailures = 3;              // Max failures before marking inactive
this.retryDelay = 5000;            // 5 seconds before retry
```

## 🛡️ Protection Mechanisms

### Anti-Spam System
- **Spam Detection**: Monitors message frequency per webhook
- **Threshold**: 10 messages per second triggers spam detection
- **Automatic Action**: Deletes spam webhook and creates replacement
- **Notification**: Sends Discord embed when new webhook is created
- **Bot Integration**: Uses Discord bot token for webhook management

### Rate Limiting
- 1-second delay between webhook requests
- Respects Discord's `retry-after` headers
- Automatic backoff on rate limit errors

### Failure Handling
- Tracks failure count per webhook
- Marks webhook inactive after 3 consecutive failures
- Automatic reactivation after 5-minute cooldown
- Manual reactivation available

### Validation
- Periodic webhook URL validation
- 404 detection for deleted webhooks
- Timeout protection (5 seconds)

## 📊 IP Logging Details

When a visitor accesses the site, the system automatically logs:

- **IP Address**: Client's real IP address
- **Timestamp**: Exact time of visit
- **User Agent**: Browser and OS information
- **Referer**: Where the visitor came from
- **Geolocation**: Country and location data (if available)

### Discord Embed Format
```json
{
  "title": "🔍 IP Address Detected",
  "color": 0x00ff00,
  "fields": [
    {"name": "🌐 IP Address", "value": "192.168.1.1"},
    {"name": "🕒 Timestamp", "value": "2024-01-01T12:00:00Z"},
    {"name": "🌍 User Agent", "value": "Mozilla/5.0..."},
    {"name": "🔗 Referer", "value": "https://google.com"}
  ],
  "footer": {"text": "guns.lol - Automated IP Logger"},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🧪 Testing

Run the test script to verify the system:

```bash
node test-webhook.js
```

This will test:
1. Health check
2. Status monitoring
3. Message sending
4. Custom messages
5. IP logging

## 🚨 Troubleshooting

### Common Issues

1. **All webhooks inactive**
   - Check if Discord webhooks are still valid
   - Use manual reactivation in the monitor
   - Verify webhook URLs are correct

2. **Rate limiting errors**
   - System automatically handles this
   - Check Discord's rate limit documentation
   - Consider reducing request frequency

3. **IP not being logged**
   - Check server logs for errors
   - Verify middleware is properly configured
   - Test with the test script

### Debug Information

Enable debug logging by checking server console output:
- Webhook validation results
- Failure counts and reasons
- Rate limit handling
- Reactivation attempts

## 🔄 Automatic Features

### Anti-Spam Process
1. Monitors message count per webhook in 1-second windows
2. When threshold (10 messages) is exceeded:
   - Marks webhook as spam detected
   - Deletes webhook from Discord using bot token
   - Creates new webhook in the same channel
   - Sends notification embed about new webhook creation
   - Replaces old webhook in system with new one
3. Continues monitoring with new webhook

### Failover Process
1. System tries current webhook
2. If failed, moves to next available webhook
3. If all webhooks fail, attempts reactivation
4. Continues with working webhooks

### Reactivation Process
1. Checks inactive webhooks every 5 minutes
2. Validates webhook URL
3. If valid, marks as active and resets failure count
4. Continues monitoring

### IP Logging Process
1. Intercepts all non-static requests
2. Extracts client information
3. Sends to Discord asynchronously
4. Doesn't block user experience

## 📈 Monitoring

The system provides comprehensive monitoring:

- **Real-time Status**: Active/inactive webhook counts
- **Spam Detection**: Number of webhooks with spam detected
- **Failure Tracking**: Per-webhook failure statistics
- **Usage Statistics**: Last used timestamps and message counts
- **Health Metrics**: Overall system health status
- **Spam Statistics**: Threshold and detection window information

## 🔐 Security

- **Input Validation**: All inputs are validated
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Graceful error handling without exposing internals
- **Security Headers**: XSS protection and other security headers

## 📝 Logs

The system logs important events:
- Webhook failures and reasons
- Reactivation attempts
- Rate limit encounters
- System health changes

Check server console for detailed logs. 