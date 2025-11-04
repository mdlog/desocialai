<div align="center">
  <img src="./desocialai-logo.png" alt="DeSocialAI Logo" width="200"/>
  
  # DeSocialAI
  
  **Decentralized Social Media with AI on 0G Chain**
  
  Where users truly own their data, AI, and social experience.
  
  [![Live Platform](https://img.shields.io/badge/🚀_Live-desocialai.xyz-blue)](https://desocialai.xyz/)
  [![0G Chain](https://img.shields.io/badge/⛓️_Chain-0G_Mainnet-green)](https://chainscan.0g.ai)
  [![License](https://img.shields.io/badge/📄_License-MIT-yellow)](LICENSE)
  
</div>

## ✨ Key Features

- **🤖 AI Content Generation** - Powered by 0G Compute Network + OpenAI fallback
  - ✍️ Generate posts (professional, casual, enthusiastic, educational)
  - #️⃣ Auto-generate hashtags
  - 🌍 Translate to any language
  - 🎯 AI recommendations
- **🔐 E2E Encryption** - Secure direct messaging with AES-256-GCM
- **⛓️ Real On-Chain Data** - Live stats from 0G Storage, DA, and Chain
- **💬 Social Features** - Posts, comments, likes, reposts, hashtags
- **🎨 Modern UI** - Dark/light mode, infinite scroll, real-time updates
- **🔒 Wallet Auth** - Connect with MetaMask, WalletConnect, etc.
- **📊 Analytics** - AI-powered insights and viral content prediction
- **�️ DAaC Tools** - Governance, voting, treasury management

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Backend**: Express.js + PostgreSQL + Drizzle ORM + WebSocket  
**Blockchain**: 0G Chain Mainnet (Chain ID: 16661) + ethers.js v6  
**AI**: 0G Compute Network (Primary) + OpenAI GPT-4 (Fallback)  
**Storage**: 0G Storage Network + @0glabs/0g-ts-sdk  
**Encryption**: AES-256-GCM + ECDH

### 🤖 AI Integration Status

**0G Compute Network:**
- ✅ Full integration implemented
- ✅ Account created on mainnet (0.5 OG funded)
- ✅ 2 official providers configured (gpt-oss-120b, deepseek-r1-70b)
- ⚠️ Currently using OpenAI fallback due to SDK limitations
- 🔄 Will auto-switch to 0G Compute when SDK is updated

**Transaction Details:**
- TX Hash: `0xd4ce632982cb1c5b189b185cab4a7bd7ca93cb22f8bad654fcd104f83426e87c`
- Block: 11,542,506 (Confirmed ✅)
- Amount: 0.5 OG
- Wallet: `0x6BbB59c971826380e0DDa7BD527154AC337780e9`

**See:** [AI-CONTENT-GENERATION-0G-COMPUTE.md](./AI-CONTENT-GENERATION-0G-COMPUTE.md) for details  

## 🌐 0G Chain Mainnet

```
Chain ID:     16661
Network:      0G Mainnet
Native Token: A0GI
Gas Unit:     Gneuron (1 Gneuron = 10^9 Neuron)
RPC:          https://evmrpc.0g.ai
Explorer:     https://chainscan.0g.ai
```

**Real Data Sources:**
- Storage stats from 0G Storage Indexer
- DA stats from actual batches and transactions
- Chain stats from RPC (real-time block height & gas price)

## 🚀 Quick Start

```bash
# 1. Clone & Install
git clone <repository-url>
cd desocialai
npm install

# 2. Setup Environment
cp .env.example .env
# Edit .env with your values

# 3. Setup Database
npm run db:push

# 4. Start Development
npm run dev
```

**Required:**
- Node.js 18+
- PostgreSQL 14+
- 0G Chain wallet with A0GI tokens
- OpenAI API key (for AI features)
- WalletConnect Project ID

**See:** [SETUP-MAINNET.md](./SETUP-MAINNET.md) for detailed setup guide

## �  Security

- **E2E Encryption** - AES-256-GCM for direct messages
- **Wallet Auth** - Cryptographic signature verification
- **On-Chain Storage** - Immutable data with verifiable hashes
- **Session Management** - Secure cookie-based sessions

## 📊 Real Data Implementation

All infrastructure stats use **real data from 0G Chain**:

| Component | Source | Update Interval |
|-----------|--------|-----------------|
| Storage Stats | 0G Storage Indexer | 30 seconds |
| DA Stats | Actual batches & transactions | 5 seconds |
| Chain Stats | RPC (block height & gas) | 1 second |
| Network Activity | Database + storage hashes | 30 seconds |

**Gas Unit:** Gneuron (not Gwei)
- 1 A0GI = 10^9 Gneuron
- 1 Gneuron = 10^9 Neuron
- Example: 21,000 gas × 0.1 Gneuron = 2,100 Gneuron



## 📡 Key API Endpoints

**Posts:** `/api/posts/feed`, `/api/posts` (create)  
**Messages:** `/api/messages/conversations`, `/api/messages/send`  
**AI:** `/api/ai/content/generate-post`, `/api/ai/agents`  
**0G Stats:** `/api/zg/storage/stats`, `/api/zg/da/stats`, `/api/web3/status`  
**User:** `/api/users/me`, `/api/web3/connect`  

See full API documentation in code.

## 📚 Documentation

### Setup & Configuration
- **[SETUP-MAINNET.md](./SETUP-MAINNET.md)** - Complete setup guide
- **[GET-0G-ENDPOINTS.md](./GET-0G-ENDPOINTS.md)** - How to get 0G service endpoints
- **[REAL-DATA-FROM-0G-CHAIN.md](./REAL-DATA-FROM-0G-CHAIN.md)** - Real data implementation
- **[GNEURON-GAS-UNIT.md](./GNEURON-GAS-UNIT.md)** - Gas unit explanation

### AI & 0G Compute
- **[AI-CONTENT-GENERATION-0G-COMPUTE.md](./AI-CONTENT-GENERATION-0G-COMPUTE.md)** - Full AI integration guide
- **[INITIALIZE-0G-COMPUTE.md](./INITIALIZE-0G-COMPUTE.md)** - How to initialize 0G Compute account
- **[0G-COMPUTE-SDK-ANALYSIS.md](./0G-COMPUTE-SDK-ANALYSIS.md)** - SDK implementation analysis
- **[WHY-USING-OPENAI-FALLBACK.md](./WHY-USING-OPENAI-FALLBACK.md)** - Current AI status
- **[FINAL-SDK-LIMITATIONS-SUMMARY.md](./FINAL-SDK-LIMITATIONS-SUMMARY.md)** - Complete SDK analysis

## 🌐 Links

- **Live Platform**: https://desocialai.xyz/
- **0G Chain Docs**: https://docs.0g.ai
- **0G Explorer**: https://chainscan.0g.ai
- **Discord**: https://discord.gg/0glabs

---

<div align="center">
  
**Built with ❤️ on 0G Chain Mainnet**

Chain ID: 16661 | Gas Unit: Gneuron | 100% Real On-Chain Data

</div>
- Database query optimization