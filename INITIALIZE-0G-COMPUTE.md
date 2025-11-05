# Initialize 0G Compute Account

## Overview

Untuk menggunakan 0G Compute Network, Anda perlu initialize account dengan menambahkan funds (minimum 10 OG tokens).

---

## 🚀 Quick Start

### Step 1: Check Current Status

```bash
curl http://localhost:5000/api/zg/compute/status
```

**Response:**
```json
{
  "isConfigured": true,
  "hasPrivateKey": true,
  "mode": "real",
  "acknowledgedProviders": [],
  "note": "Connected to real 0G Compute Network using official SDK"
}
```

### Step 2: Check Connection

```bash
curl http://localhost:5000/api/zg/compute/connection
```

**Possible Responses:**

**A. Account Exists (Ready to Use):**
```json
{
  "connected": true,
  "details": {
    "balance": "10.0",
    "availableServices": 2,
    "acknowledgedProviders": []
  }
}
```

**B. Account Doesn't Exist (Needs Initialization):**
```json
{
  "connected": false,
  "error": "Account does not exist. Please create an account first using 'add-account'.",
  "details": {
    "needsAccountSetup": true
  }
}
```

### Step 3: Initialize Account (If Needed)

```bash
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Successfully added 10 OG to 0G Compute account",
  "txHash": "0x...",
  "amount": "10",
  "note": "Account initialized successfully. You can now use 0G Compute for AI generation."
}
```

**Error Response (Account Already Exists):**
```json
{
  "success": true,
  "message": "0G Compute account already exists and is ready to use"
}
```

---

## 📋 API Endpoints

### 1. GET /api/zg/compute/status
Get environment status (broker configuration, private key, mode)

**Response:**
```json
{
  "isConfigured": true,
  "hasPrivateKey": true,
  "mode": "real",
  "acknowledgedProviders": ["0xf07240Efa67755B5311bc75784a061eDB47165Dd"],
  "note": "Connected to real 0G Compute Network using official SDK"
}
```

### 2. GET /api/zg/compute/connection
Check connection and account status

**Response:**
```json
{
  "connected": true,
  "details": {
    "balance": "10.0",
    "availableServices": 2,
    "acknowledgedProviders": []
  }
}
```

### 3. POST /api/zg/compute/initialize
Initialize account with funds

**Request:**
```json
{
  "amount": "10"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully added 10 OG to 0G Compute account",
  "txHash": "0x...",
  "amount": "10"
}
```

---

## 💰 Funding Requirements

### Minimum Amount
- **Development:** 0.1 OG (untuk testing)
- **Production:** 10 OG (recommended)

### Cost Estimation
- **Per AI Request:** ~0.001-0.01 OG
- **10 OG:** ~1,000-10,000 AI requests
- **Much cheaper than OpenAI API**

### How to Get OG Tokens
1. **Faucet (Testnet):** https://faucet.0g.ai
2. **Bridge (Mainnet):** Bridge from other chains
3. **Exchange:** Buy from exchanges

---

## 🔧 Implementation Details

### Code Flow

```typescript
// 1. Initialize broker
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const broker = await createZGComputeNetworkBroker(wallet);

// 2. Add funds to create account
await broker.ledger.addLedger("10"); // 10 OG tokens

// 3. Check balance
const account = await broker.ledger.getLedger();
console.log('Balance:', ethers.formatEther(account.totalBalance), 'OG');
```

### Network Selection

```typescript
// Choose your network
const RPC_URL = process.env.NODE_ENV === 'production'
  ? "https://evmrpc.0g.ai"           // Mainnet
  : "https://evmrpc-testnet.0g.ai";  // Testnet
```

---

## 🧪 Testing

### Test 1: Check Status
```bash
curl http://localhost:5000/api/zg/compute/status
```

### Test 2: Check Connection
```bash
curl http://localhost:5000/api/zg/compute/connection
```

### Test 3: Initialize with 10 OG
```bash
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'
```

### Test 4: Generate AI Content
```bash
curl -X POST http://localhost:5000/api/ai/content/generate-post \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write about blockchain"}'
```

**Check response source:**
```json
{
  "content": "...",
  "source": "0G-Compute"  // ✅ Using 0G Network!
}
```

---

## 🐛 Troubleshooting

### Issue: "Account does not exist"

**Solution:**
```bash
# Initialize account with funds
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'
```

### Issue: "Insufficient balance"

**Solution:**
```bash
# Add more funds
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'
```

### Issue: "Broker not configured"

**Cause:** No ZG_PRIVATE_KEY in environment

**Solution:**
```bash
# Add to .env file
ZG_PRIVATE_KEY=your-private-key-here
ZG_RPC_URL=https://evmrpc.0g.ai
```

### Issue: "Decode error"

**Cause:** SDK version mismatch or network response format changed

**Solution:**
- AI generation will still work (tries 0G Compute, falls back to OpenAI)
- Stats endpoint may show error but doesn't affect functionality
- Update SDK if needed: `npm update @0glabs/0g-serving-broker`

---

## 📊 Monitoring

### Check Account Balance

```bash
# Via API
curl http://localhost:5000/api/zg/compute/connection

# Via ethers.js
const account = await broker.ledger.getLedger();
console.log('Balance:', ethers.formatEther(account.totalBalance), 'OG');
```

### Monitor Usage

```bash
# Get compute stats
curl http://localhost:5000/api/zg/compute/stats
```

### Track AI Requests

```bash
# Check logs for source
[0G Compute] ✅ Content generated using gpt-oss-120b
[Content Gen] ✅ 0G Compute generation successful
```

---

## 💡 Best Practices

### 1. Development
- Use **testnet** for development
- Start with **0.1 OG** for testing
- Monitor balance regularly

### 2. Production
- Use **mainnet** for production
- Fund with **10+ OG** for reliability
- Set up balance alerts
- Monitor usage and costs

### 3. Cost Optimization
- Cache AI responses when possible
- Use appropriate provider (gpt-oss-120b vs deepseek-r1-70b)
- Batch requests when feasible
- Set up auto-refill when balance low

### 4. Fallback Strategy
- Always have OpenAI as fallback
- Monitor both 0G Compute and OpenAI usage
- Alert when switching to fallback frequently

---

## 🎯 Complete Setup Example

```bash
# 1. Check environment
curl http://localhost:5000/api/zg/compute/status

# 2. Check connection
curl http://localhost:5000/api/zg/compute/connection

# 3. Initialize if needed
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'

# 4. Test AI generation
curl -X POST http://localhost:5000/api/ai/content/generate-post \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write about decentralized AI"}'

# 5. Verify using 0G Compute
# Check response has: "source": "0G-Compute"
```

---

## 📚 Resources

### Official Documentation
- [0G Compute SDK](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/sdk)
- [0G Serving Broker](https://github.com/0glabs/0g-serving-broker)
- [0G Chain RPC](https://evmrpc.0g.ai)

### Provider Information
- **gpt-oss-120b:** 0xf07240Efa67755B5311bc75784a061eDB47165Dd
- **deepseek-r1-70b:** 0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3

### Support
- Discord: https://discord.gg/0glabs
- GitHub: https://github.com/0glabs
- Docs: https://docs.0g.ai

---

## ✅ Summary

**Initialization Steps:**
1. ✅ Check status: `GET /api/zg/compute/status`
2. ✅ Check connection: `GET /api/zg/compute/connection`
3. ✅ Initialize account: `POST /api/zg/compute/initialize` with amount
4. ✅ Test AI generation: `POST /api/ai/content/generate-post`
5. ✅ Verify source: Check response has `"source": "0G-Compute"`

**Requirements:**
- ✅ ZG_PRIVATE_KEY configured
- ✅ Wallet with sufficient balance (3.86 A0GI ✅)
- ✅ Minimum 10 OG for compute account
- ✅ Network connectivity to 0G Chain

**Current Status:**
- ✅ Broker: Configured
- ✅ Wallet: Funded (3.86 A0GI)
- ⚠️ Compute Account: Needs initialization (10 OG)
- ✅ Fallback: OpenAI ready

**Next Step:**
```bash
# Initialize with 10 OG
curl -X POST http://localhost:5000/api/zg/compute/initialize \
  -H "Content-Type: application/json" \
  -d '{"amount": "10"}'
```

---

**Date:** 2025-01-15  
**Version:** 1.0.0  
**Status:** Ready for Initialization 🚀
