# 🚀 Setup Guide - 0G Chain Mainnet

## 📋 Prerequisites

### 1. System Requirements
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

### 2. 0G Chain Requirements
- **Wallet with A0GI tokens** (minimum 0.1 A0GI for testing)
- **Private key** with sufficient balance
- **WalletConnect Project ID** (for frontend wallet connection)

---

## 🔧 Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url>
cd desocialai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

### 4. Configure Database
```bash
# Create PostgreSQL database
createdb desocialai

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/desocialai

# Push schema to database
npm run db:push
```

### 5. Configure 0G Chain Mainnet

#### Required Variables:
```env
# 0G Chain Mainnet
ZG_PRIVATE_KEY=your-mainnet-private-key-here
ZG_RPC_URL=https://evmrpc.0g.ai
ZG_INDEXER_RPC=https://indexer-storage-turbo.0g.ai
COMBINED_SERVER_PRIVATE_KEY=your-mainnet-private-key-here
COMBINED_SERVER_CHAIN_RPC=https://evmrpc.0g.ai

# 0G DA (Contact 0G Labs for endpoints or run your own)
ZG_DA_CLIENT_ENDPOINT=your-da-endpoint-here
ZG_DA_ENTRANCE_CONTRACT=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9

# Session Secret (generate with: openssl rand -base64 64)
SESSION_SECRET=your-super-secret-session-key-min-64-chars

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key

# WalletConnect (get from: https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 6. Start Development Server
```bash
npm run dev
```

Application will be available at: `http://localhost:5000`

---

## 🔑 Getting A0GI Tokens

### Option 1: Bridge from Other Chains
- Use official 0G Chain bridge
- Bridge from Ethereum, BSC, or other supported chains

### Option 2: Exchange
- Check supported exchanges for A0GI listings
- Purchase and withdraw to your wallet

### Option 3: Community Faucet (Limited)
- Check 0G Chain Discord for faucet links
- Limited amounts for testing purposes

---

## 🌐 Network Configuration

### 0G Chain Mainnet Details:
```
Chain ID:     16661
Network Name: 0G Mainnet
Native Token: A0GI
Gas Unit:     Gneuron (1 Gneuron = 10^9 Neuron)
RPC URL:      https://evmrpc.0g.ai
Explorer:     https://chainscan.0g.ai
Storage:      https://indexer-storage-turbo.0g.ai
```

### Add to MetaMask:
1. Open MetaMask
2. Click Networks → Add Network
3. Enter details:
   - Network Name: `0G Mainnet`
   - RPC URL: `https://evmrpc.0g.ai`
   - Chain ID: `16661`
   - Currency Symbol: `A0GI`
   - Block Explorer: `https://chainscan.0g.ai`

---

## 💰 Transaction Costs (Approximate)

### Gas Prices:
- **Current Gas Price**: ~0.1 Gneuron
- **1 Gneuron** = 10^9 Neuron (base unit)
- **1 A0GI** = 10^18 Neuron = 10^9 Gneuron

### Common Operations:
```
Simple Transfer:
  Gas: 21,000 units
  Cost: 21,000 × 0.1 Gneuron = 2,100 Gneuron
  In A0GI: 0.0000021 A0GI

Create Post:
  Gas: ~100,000 units
  Cost: 100,000 × 0.1 Gneuron = 10,000 Gneuron
  In A0GI: 0.00001 A0GI

Upload to Storage:
  Gas: ~200,000 units
  Cost: 200,000 × 0.1 Gneuron = 20,000 Gneuron
  In A0GI: 0.00002 A0GI
```

### Recommended Balance:
- **Minimum**: 0.1 A0GI (for testing)
- **Recommended**: 1 A0GI (for regular usage)
- **Production**: 10+ A0GI (for continuous operation)

---

## 🔍 Verify Setup

### 1. Check Database Connection
```bash
npm run db:push
```
Should complete without errors.

### 2. Check 0G Chain Connection
```bash
# Start server
npm run dev

# In another terminal, test API
curl http://localhost:5000/api/web3/status
```

Expected response:
```json
{
  "infrastructureConnected": true,
  "network": "0G Mainnet",
  "chainId": 16661,
  "blockHeight": 1000000,
  "gasPrice": "0.1 Gneuron"
}
```

### 3. Check Storage Stats
```bash
curl http://localhost:5000/api/zg/storage/stats
```

Expected response:
```json
{
  "totalStorage": "2.5 PB",
  "availableSpace": "1.8 PB",
  "networkNodes": 1247,
  "replicationFactor": 3
}
```

### 4. Check Frontend
Open browser: `http://localhost:5000`
- Should see DeSocialAI homepage
- Connect wallet button should work
- Network should show "0G Mainnet"

---

## 🐛 Troubleshooting

### Issue: "Failed to connect to database"
**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Issue: "Insufficient funds for gas"
**Solution:**
- Check wallet balance: `https://chainscan.0g.ai/address/YOUR_ADDRESS`
- Ensure you have at least 0.1 A0GI
- Get more A0GI from bridge or exchange

### Issue: "Failed to fetch block height"
**Solution:**
```bash
# Test RPC connection
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","id":1,"result":"0xf4240"}
```

### Issue: "WalletConnect not working"
**Solution:**
- Get Project ID from: https://cloud.walletconnect.com
- Add to .env: `VITE_WALLETCONNECT_PROJECT_ID=your-project-id`
- Restart dev server

### Issue: "Storage upload failed"
**Solution:**
- Check ZG_PRIVATE_KEY has sufficient balance
- Check ZG_INDEXER_RPC is accessible
- Check logs for detailed error message

---

## 📊 Monitoring

### Real-time Stats
All infrastructure stats are real data from 0G Chain:

1. **Storage Stats** (updates every 30s)
   - Source: 0G Storage Indexer
   - Real node count and capacity

2. **DA Stats** (updates every 5s)
   - Source: Actual batches and transactions
   - Real transaction count

3. **Chain Stats** (updates every 1s)
   - Source: 0G Chain RPC
   - Real-time block height and gas price

4. **Network Activity** (updates every 30s)
   - Source: Database + storage hashes
   - Real posts on-chain count

### Check Logs
```bash
# Server logs
npm run dev

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log

# Application logs
tail -f logs/app.log
```

---

## 🔒 Security Best Practices

### 1. Private Keys
- ✅ Never commit to Git
- ✅ Use environment variables
- ✅ Rotate regularly
- ✅ Use different keys for dev/prod
- ✅ Store production keys in secure vault

### 2. Session Secret
- ✅ Generate strong random value (min 64 chars)
- ✅ Use: `openssl rand -base64 64`
- ✅ Different for each environment

### 3. Database
- ✅ Use strong password
- ✅ Restrict network access
- ✅ Regular backups
- ✅ Enable SSL in production

### 4. API Keys
- ✅ Restrict by domain/IP
- ✅ Monitor usage
- ✅ Rotate regularly
- ✅ Use rate limiting

---

## 🚀 Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
PORT=5000
USE_HTTPS=true
ALLOWED_ORIGIN=https://desocialai.xyz

# Use production URLs
VITE_API_URL=https://desocialai.xyz
VITE_WS_URL=wss://desocialai.xyz

# Use production database
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/prod_db

# Use production keys
ZG_PRIVATE_KEY=production-private-key
SESSION_SECRET=production-session-secret-min-64-chars
```

### 2. Build
```bash
npm run build
```

### 3. Start Production Server
```bash
npm start
```

### 4. Use Process Manager
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "desocialai" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

---

## 📚 Additional Resources

- **0G Chain Docs**: https://docs.0g.ai
- **0G Chain Explorer**: https://chainscan.0g.ai
- **WalletConnect**: https://cloud.walletconnect.com
- **OpenAI API**: https://platform.openai.com

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Database created
- [ ] `.env` file configured
- [ ] A0GI tokens in wallet (min 0.1)
- [ ] WalletConnect Project ID obtained
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Development server started (`npm run dev`)
- [ ] Frontend accessible at http://localhost:5000
- [ ] Wallet connection working
- [ ] Network shows "0G Mainnet"
- [ ] Can create posts
- [ ] Storage upload working

---

**Ready to build on 0G Chain Mainnet!** 🎉

**Date:** 2025-01-15  
**Version:** 2.0.0  
**Network:** 0G Mainnet (Chain ID: 16661)
