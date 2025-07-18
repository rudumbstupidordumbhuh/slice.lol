# Vercel Deployment Guide for Custom Domain

This guide will help you deploy the stealth webhook system to Vercel with your custom domain.

## Prerequisites

- Vercel account
- Custom domain configured in Vercel
- Discord bot token and channel ID
- Discord webhook URLs

## Deployment Steps

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the build command to: `npm install`
3. Set the output directory to: `./`
4. Set the install command to: `npm install`

### 2. Add Environment Variables

Add these environment variables in Vercel:

| Name | Value | Environment |
|------|-------|-------------|
| `DISCORD_BOT_TOKEN` | `YOUR_BOT_TOKEN_HERE` | Production |
| `DISCORD_CHANNEL_ID` | `YOUR_CHANNEL_ID_HERE` | Production |
| `WEBSITE_NAME` | `YOUR_WEBSITE_NAME_HERE` | Production |
| `WEBHOOK_COUNT` | `13` | Production |
| `ENABLE_BOT` | `true` | Production |

### 3. Add Webhook URLs

Add these webhook URL environment variables (replace with your actual webhook URLs):

| Name | Value | Environment |
|------|-------|-------------|
| `WEBHOOK_URL_1` | `YOUR_WEBHOOK_URL_1` | Production |
| `WEBHOOK_URL_2` | `YOUR_WEBHOOK_URL_2` | Production |
| `WEBHOOK_URL_3` | `YOUR_WEBHOOK_URL_3` | Production |
| `WEBHOOK_URL_4` | `YOUR_WEBHOOK_URL_4` | Production |
| `WEBHOOK_URL_5` | `YOUR_WEBHOOK_URL_5` | Production |
| `WEBHOOK_URL_6` | `YOUR_WEBHOOK_URL_6` | Production |
| `WEBHOOK_URL_7` | `YOUR_WEBHOOK_URL_7` | Production |
| `WEBHOOK_URL_8` | `YOUR_WEBHOOK_URL_8` | Production |
| `WEBHOOK_URL_9` | `YOUR_WEBHOOK_URL_9` | Production |
| `WEBHOOK_URL_10` | `YOUR_WEBHOOK_URL_10` | Production |
| `WEBHOOK_URL_11` | `YOUR_WEBHOOK_URL_11` | Production |
| `WEBHOOK_URL_12` | `YOUR_WEBHOOK_URL_12` | Production |
| `WEBHOOK_URL_13` | `YOUR_WEBHOOK_URL_13` | Production |

### 4. Configure Custom Domain

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain (e.g., `yourdomain.com`)
4. Configure DNS records as instructed by Vercel
5. Wait for DNS propagation (can take up to 24 hours)

### 5. Test the Deployment

Once deployed, test these endpoints:

- **Health Check**: `https://yourdomain.com/api/health`
- **Basic Test**: `https://yourdomain.com/api/test`
- **Webhook Test**: `https://yourdomain.com/api/test-webhook`

### 6. Verify Bot Status

The Discord bot should automatically come online when:
- `ENABLE_BOT=true` is set
- `DISCORD_BOT_TOKEN` is valid
- The deployment is successful

## Custom Domain Features

With a custom domain, the system will:

1. **Automatically detect your domain name** from the `Host` header
2. **Display your actual website URL** in webhook messages
3. **Use your domain name** in the webhook embed titles and footers
4. **Handle subdomains** properly (e.g., `sub.yourdomain.com`)

## Troubleshooting

### Webhooks Not Sending

1. Check Vercel function logs for errors
2. Verify all environment variables are set correctly
3. Test the `/api/test-webhook` endpoint
4. Check Discord webhook URLs are valid

### Bot Not Online

1. Verify `DISCORD_BOT_TOKEN` is correct
2. Check `ENABLE_BOT=true` is set
3. Review Vercel function logs for bot startup errors
4. Ensure the bot has proper permissions in Discord

### Custom Domain Issues

1. Verify DNS records are configured correctly
2. Check domain is properly added in Vercel
3. Wait for DNS propagation
4. Test with both `www` and non-`www` versions

## Environment Variables Reference

### Required Variables

- `DISCORD_BOT_TOKEN`: Your Discord bot token
- `DISCORD_CHANNEL_ID`: The Discord channel ID for webhook creation
- `WEBHOOK_COUNT`: Number of webhook URLs (default: 13)
- `WEBHOOK_URL_1` through `WEBHOOK_URL_13`: Your Discord webhook URLs

### Optional Variables

- `WEBSITE_NAME`: Override the automatically detected website name
- `ENABLE_BOT`: Set to `true` to enable the Discord bot (default: enabled in production)

## Security Notes

- All webhook URLs and bot tokens are stored as environment variables
- No sensitive data is exposed in the code
- The system includes anti-spam protection
- Webhooks are automatically rotated on failure
- Rate limiting prevents abuse

## Support

If you encounter issues:

1. Check the Vercel function logs
2. Test individual endpoints
3. Verify environment variables
4. Check Discord bot permissions
5. Review webhook URLs for validity 