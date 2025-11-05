# 🔗 How to Get 0G Service Endpoints

## 📋 Overview

For production deployment, you need access to 0G infrastructure endpoints. This guide explains how to obtain them.

---

## 🌐 Public vs Private Endpoints

### Public Endpoints (Shared)
- ✅ Free to use
- ✅ Quick setup
- ⚠️ Shared resources
- ⚠️ May have rate limits
- ⚠️ Not recommended for production

### Private Endpoints (Dedicated)
- ✅ Dedicated resources
- ✅ No rate limits
- ✅ Better performance
- ✅ Production-ready
- ⚠️ Requires setup/cost

---

## 🔧 Required Endpoints

### 1. 0G Storage Node
**Purpose:** Upload and retrieve content from 0G Storage

**Options:**

#### A. Use Public Endpoint (Development)
Contact 0G Labs team for access to public storage nodes.

#### B. Run Your Own Node (Production)
```bash
# Clone 0G Storage Node
git clone https://github.com/0glabs/0g-storage-node.git
cd 0g-storage-node

# Follow setup instructions
# https://docs.0g.ai/run-a-node/storage-node
```

**Configuration:**
```env
ZGS_NODE_URL=http://your-storage-node-ip:5678
ZG_STORAGE_URL=http://your-storage-node-ip:5678
```

---

### 2. 0G Data Availability (DA) Client
**Purpose:** Submit data to 0G DA network

**Options:**

#### A. Use Public Endpoint (Development)
Contact 0G Labs team for access to public DA endpoints.

#### B. Run Your Own DA Client (Production)
```bash
# Clone 0G DA Client
git clone https://github.com/0glabs/0g-da-client.git
cd 0g-da-client

# Follow setup instructions
# https://docs.0g.ai/developer-hub/building-on-0g/da-integration
```

**Configuration:**
```env
ZG_DA_CLIENT_ENDPOINT=your-da-endpoint:51001
ZG_DA_GRPC_ENDPOINT=your-da-endpoint:51001
```

---

### 3. 0G Chain RPC
**Purpose:** Interact with 0G blockchain

**Public RPC (Available):**
```env
ZG_RPC_URL=https://evmrpc.0g.ai
```

**For Production:**
- Use public RPC with fallback
- Or run your own 0G Chain node
- Documentation: https://docs.0g.ai/run-a-node/validator-node

---

### 4. 0G Storage Indexer
**Purpose:** Query storage network statistics

**Public Indexer (Available):**
```env
ZG_INDEXER_RPC=https://indexer-storage-turbo.0g.ai
```

---

## 📞 How to Get Access

### Option 1: Contact 0G Labs Team

**Discord:**
1. Join 0G Labs Discord: https://discord.gg/0glabs
2. Go to #developer-support channel
3. Request access to public endpoints
4. Provide:
   - Project name
   - Use case
   - Expected usage volume

**Email:**
- Email: support@0g.ai
- Subject: "Request for 0G Service Endpoints"
- Include project details

**Telegram:**
- Join 0G Labs Telegram
- Contact team members
- Request endpoint access

---

### Option 2: Run Your Own Infrastructure

#### Requirements:
- **Server:** 8+ CPU cores, 32GB+ RAM, 1TB+ SSD
- **Network:** Static IP, open ports
- **OS:** Ubuntu 20.04+ or similar
- **Skills:** Linux administration, Docker

#### Steps:

**1. Setup 0G Storage Node**
```bash
# Install dependencies
sudo apt update
sudo apt install -y build-essential git

# Clone and build
git clone https://github.com/0glabs/0g-storage-node.git
cd 0g-storage-node
cargo build --release

# Configure
cp config.example.toml config.toml
nano config.toml

# Start node
./target/release/zgs_node --config config.toml
```

**2. Setup 0G DA Client**
```bash
# Clone repository
git clone https://github.com/0glabs/0g-da-client.git
cd 0g-da-client

# Build
make build

# Configure
cp config.example.yaml config.yaml
nano config.yaml

# Start client
./bin/da-client --config config.yaml
```

**3. Configure Application**
```env
# Your own endpoints
ZGS_NODE_URL=http://your-server-ip:5678
ZG_DA_CLIENT_ENDPOINT=your-server-ip:51001
```

---

### Option 3: Use Managed Services (Future)

0G Labs may offer managed services in the future:
- Hosted storage nodes
- Managed DA clients
- Enterprise support
- SLA guarantees

Check official website for updates: https://0g.ai

---

## 🔒 Security Best Practices

### 1. Endpoint Security
```bash
# Use firewall
sudo ufw allow 5678/tcp  # Storage node
sudo ufw allow 51001/tcp # DA client
sudo ufw enable

# Use reverse proxy (nginx)
sudo apt install nginx
# Configure SSL/TLS
```

### 2. Access Control
```bash
# Restrict by IP
iptables -A INPUT -p tcp --dport 5678 -s YOUR_APP_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 5678 -j DROP
```

### 3. Monitoring
```bash
# Install monitoring tools
sudo apt install prometheus grafana

# Monitor endpoints
- Uptime
- Response time
- Error rates
- Resource usage
```

---

## 📊 Endpoint Health Check

### Check Storage Node
```bash
curl http://your-storage-node:5678/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Check DA Client
```bash
grpcurl -plaintext your-da-endpoint:51001 list
```

Should list available gRPC services.

### Check RPC
```bash
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xf4240"
}
```

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to storage node"
**Solutions:**
1. Check node is running: `ps aux | grep zgs_node`
2. Check port is open: `netstat -tulpn | grep 5678`
3. Check firewall: `sudo ufw status`
4. Check logs: `tail -f logs/storage-node.log`

### Issue: "DA client connection failed"
**Solutions:**
1. Check client is running: `ps aux | grep da-client`
2. Check gRPC port: `netstat -tulpn | grep 51001`
3. Test with grpcurl: `grpcurl -plaintext localhost:51001 list`
4. Check logs: `tail -f logs/da-client.log`

### Issue: "RPC request timeout"
**Solutions:**
1. Try alternative RPC: Use fallback endpoint
2. Check network: `ping evmrpc.0g.ai`
3. Check DNS: `nslookup evmrpc.0g.ai`
4. Use VPN if blocked

---

## 📚 Additional Resources

### Official Documentation
- **0G Docs**: https://docs.0g.ai
- **Storage Node**: https://docs.0g.ai/run-a-node/storage-node
- **DA Integration**: https://docs.0g.ai/developer-hub/building-on-0g/da-integration
- **Validator Node**: https://docs.0g.ai/run-a-node/validator-node

### Community
- **Discord**: https://discord.gg/0glabs
- **Telegram**: https://t.me/web3_0glabs
- **Twitter**: https://twitter.com/0G_labs
- **GitHub**: https://github.com/0glabs

### Support
- **Email**: support@0g.ai
- **Developer Support**: #developer-support on Discord
- **Bug Reports**: GitHub Issues

---

## ✅ Checklist

### For Development:
- [ ] Contact 0G Labs for public endpoints
- [ ] Get Storage Node URL
- [ ] Get DA Client endpoint
- [ ] Test connectivity
- [ ] Update .env file

### For Production:
- [ ] Decide: Public vs Own infrastructure
- [ ] Setup dedicated server (if running own)
- [ ] Install and configure Storage Node
- [ ] Install and configure DA Client
- [ ] Setup monitoring
- [ ] Configure firewall
- [ ] Setup SSL/TLS
- [ ] Test all endpoints
- [ ] Setup fallback endpoints
- [ ] Document configuration

---

## 💡 Recommendations

### Development:
- ✅ Use public endpoints
- ✅ Contact 0G Labs team
- ✅ Join Discord community
- ✅ Test with small data first

### Production:
- ✅ Run your own infrastructure
- ✅ Setup monitoring
- ✅ Have fallback endpoints
- ✅ Regular backups
- ✅ Security hardening
- ✅ Performance optimization

---

**Need Help?** Join 0G Labs Discord: https://discord.gg/0glabs

**Date:** 2025-01-15  
**Version:** 1.0.0
