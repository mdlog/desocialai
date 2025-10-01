# DeSocialAI

Platform media sosial terdesentralisasi dengan AI yang dibangun di atas infrastruktur 0G Chain - dimana pengguna benar-benar memiliki data, AI, dan pengalaman sosial mereka.

## 🚀 Live Production
- **URL**: https://desocialai.xyz/
- **Status**: ✅ Aktif dan dipantau 24/7

## 🌟 Fitur Utama

### **🤖 Sistem AI Personal Assistant**
- 5 tipe AI agent khusus (Content, Engagement, Trend, Network, Scheduler)
- Integrasi 0G Compute Network untuk pemrosesan AI terdesentralisasi
- Operasi otonomous untuk menumbuhkan presence social media

### **📊 Analytics & Intelligence**
- Deep user analytics dan trend detection
- AI viral content predictor
- Real-time insights dan recommendations

### **🔐 Blockchain Verification**
- Content authenticity dengan cryptographic proof
- Identity verification berbasis wallet signature
- Semua data tersimpan di 0G Storage dengan hash verifiable

### **💬 Direct Messaging (E2E Encryption)**
- End-to-End encryption untuk semua pesan pribadi
- Messages tersimpan di 0G Storage dengan AES-256-GCM encryption
- Real-time notifications untuk pesan masuk
- Profile pictures dan user info integration

### **📱 Advanced UI/UX**
- Infinite scroll feed dengan pagination
- Auto-resize textarea untuk pesan panjang
- Progressive image loading dengan skeleton
- Real-time WebSocket updates
- Modern dark/light mode support

### **🔄 Real-time Features**
- Live block height updates dari 0G Chain
- WebSocket untuk real-time notifications
- Instant post updates tanpa refresh
- Optimistic UI updates untuk performa optimal

### **Core Features**
- True data ownership di 0G Chain
- Real-time updates dengan WebSocket
- Modern UI/UX dengan dark mode
- Media upload system dengan 0G Storage
- Admin dashboard dengan wallet access control
- Feed dengan infinite scroll dan cache optimization

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Query  
**Backend**: Express.js + PostgreSQL + Drizzle ORM + WebSocket  
**Blockchain**: 0G Chain (Galileo Testnet) + RainbowKit + Wagmi  
**AI**: OpenAI GPT-5 + 0G Compute Network  
**Encryption**: AES-256-GCM + ECDH + Web Crypto API  
**Real-time**: WebSocket + React Query + Optimistic Updates  

## 📊 Production Metrics
- **Block Height**: ~781K+ (Real-time sync setiap 2 detik)
- **API Performance**: <100ms average response
- **WebSocket**: Koneksi real-time stabil dengan auto-reconnect
- **Authentication**: Wallet-based dengan session management
- **Database**: PostgreSQL dengan Drizzle ORM
- **Cache**: React Query dengan intelligent caching

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd desocialai
   npm install
   ```

2. **Environment Variables**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/desocialai
   OPENAI_API_KEY=your_openai_api_key
   COMBINED_SERVER_PRIVATE_KEY=your_0g_private_key
   COMBINED_SERVER_CHAIN_RPC=https://evmrpc-testnet.0g.ai
   SESSION_SECRET=your_session_secret
   ZG_DA_CLIENT_ENDPOINT=localhost:51001
   ZG_DA_ENTRANCE_CONTRACT=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9
   ```

3. **Database Setup**
   ```bash
   npm run db:push
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📱 Usage

1. **Connect Wallet** - RainbowKit dengan multi-wallet support
2. **Create Posts** - Upload media hingga 2MB dengan 0G Storage
3. **Direct Messages** - Kirim pesan terenkripsi E2E ke pengguna lain
4. **AI Features** - AI agents bekerja otomatis untuk growth
5. **Analytics** - Monitor performance dengan AI insights
6. **Real-time Updates** - Semua aktivitas update secara real-time

## 🔒 Security Features

### **End-to-End Encryption**
- AES-256-GCM encryption untuk Direct Messages
- ECDH key exchange untuk shared secrets
- PBKDF2 key derivation
- Messages tersimpan di 0G Storage dengan hash verification

### **Blockchain Security**
- Wallet-based authentication
- Cryptographic proof untuk content authenticity
- 0G Storage dengan immutable data storage
- Real transaction hashes dari 0G Chain

## 🏆 Production Status

**✅ Live Features:**
- Complete 0G Chain integration (Storage, DA, Compute, Chain)
- Multi-agent AI system dengan authentic processing
- Advanced analytics dengan viral prediction
- Blockchain verification untuk content authenticity  
- Real-time WebSocket communication
- Production authentication dengan wallet verification
- End-to-End encrypted Direct Messaging
- Infinite scroll feed dengan cache optimization
- Progressive image loading dan auto-resize UI
- Real-time notifications system

**📊 Monitoring:**
- Real-time blockchain sync setiap 2 detik
- Zero simulation modes - implementasi authentic murni
- Performance monitoring dengan detailed logging
- Error handling dengan graceful fallbacks

**🔧 Recent Updates:**
- Fixed network error handling untuk post creation
- Implemented CORS headers untuk cross-origin requests
- Optimized React Query cache management
- Enhanced error messages dengan user-friendly feedback
- Improved feed pagination dengan infinite scroll
- Fixed encryption/decryption untuk Direct Messages
- Added comprehensive logging untuk debugging

## 🌐 API Endpoints

### **Posts & Feed**
- `GET /api/posts/feed` - Global feed dengan infinite scroll
- `POST /api/posts` - Create post dengan 0G Storage upload
- `GET /api/posts/user/:userId` - User-specific posts

### **Direct Messages**
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages/send` - Send encrypted message
- `GET /api/messages/unread-count` - Get unread message count
- `POST /api/messages/start-conversation` - Start new conversation

### **0G Integration**
- `GET /api/zg/da/stats` - Data Availability statistics
- `GET /api/zg/storage/stats` - Storage statistics
- `GET /api/zg/compute/stats` - Compute statistics
- `GET /api/web3/status` - Blockchain connection status

### **User Management**
- `GET /api/users/me` - Current user data
- `GET /api/users/:userId` - Get user by ID
- `POST /api/web3/connect` - Connect wallet
- `POST /api/web3/disconnect` - Disconnect wallet

## 🌐 Links

- **🚀 Live Platform**: https://desocialai.xyz/
- **📚 0G Chain Docs**: https://docs.0g.ai
- **🔗 0G Chain Explorer**: https://chainscan-galileo.0g.ai

---

**✅ Live in Production** - Built with ❤️ using authentic 0G Chain infrastructure

## 📝 Development Notes

### **Performance Optimizations**
- React Query dengan intelligent caching
- Infinite scroll untuk large datasets
- Progressive image loading
- WebSocket untuk real-time updates
- Optimistic UI updates

### **Security Best Practices**
- E2E encryption untuk sensitive data
- Wallet-based authentication
- Cryptographic content verification
- Secure session management
- CORS protection

### **Monitoring & Debugging**
- Comprehensive logging system
- Real-time error tracking
- Performance metrics
- Blockchain sync monitoring
- Database query optimization