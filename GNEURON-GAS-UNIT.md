# ⚡ 0G Chain Gas Unit: Gneuron

## 🎯 Perubahan

0G Chain menggunakan **Gneuron** sebagai satuan gas, bukan Gwei seperti Ethereum.

---

## 📊 Konversi Unit

### Ethereum (ETH)
```
1 ETH = 10^18 Wei
1 Gwei = 10^9 Wei
1 ETH = 10^9 Gwei
```

### 0G Chain (A0GI)
```
1 A0GI = 10^18 Neuron (base unit)
1 Gneuron = 10^9 Neuron
1 A0GI = 10^9 Gneuron

Gneuron = Giga-neuron (10^9 neuron)
```

### Equivalence
```
1 Gneuron = 1 Gwei (in terms of decimal places)
Both represent 10^9 of the base unit
```

---

## 🔧 Implementation

### Backend Service

**File:** `server/services/zg-chain.ts`

```typescript
async getGasPrice(): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const feeData = await provider.getFeeData();
    
    if (feeData.gasPrice) {
      // Convert from Neuron (wei) to Gneuron (gwei equivalent)
      // 1 Gneuron = 10^9 Neuron
      const gasPriceGneuron = Number(feeData.gasPrice) / 1e9;
      return `${gasPriceGneuron.toFixed(2)} Gneuron`;  // ✅ 0G Chain unit
    }
    return "0.1 Gneuron";
  } catch (error) {
    return "0.1 Gneuron";
  }
}
```

### Frontend Display

**File:** `client/src/components/layout/left-sidebar.tsx`

```tsx
<div className="flex justify-between py-2">
  <span className="text-muted-foreground">Gas:</span>
  <span className="text-foreground font-mono">
    {chainStatus?.gasPrice || "0.1 Gneuron"}  {/* ✅ 0G Chain unit */}
  </span>
</div>
```

### API Response

**File:** `server/routes.ts`

```typescript
app.get("/api/web3/status", async (req, res) => {
  try {
    const chainInfo = await zgChainService.getChainInfo();
    res.json({
      blockHeight: chainInfo.blockHeight,
      gasPrice: chainInfo.gasPrice,  // "0.1 Gneuron" ✅
      // ...
    });
  } catch (error) {
    res.json({
      blockHeight: 1000000,
      gasPrice: "0.1 Gneuron",  // ✅ Fallback
      // ...
    });
  }
});
```

---

## 🎨 UI Display

### Network Status Card (Left Sidebar)

**Before:**
```
┌─────────────────────────────┐
│ Network Status              │
├─────────────────────────────┤
│ Network:  0G Mainnet        │
│ Block:    1,000,000         │
│ Gas:      0.1 Gwei          │ ❌ Wrong unit
└─────────────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│ Network Status              │
├─────────────────────────────┤
│ Network:  0G Mainnet        │
│ Block:    1,000,000         │
│ Gas:      0.1 Gneuron       │ ✅ Correct unit
└─────────────────────────────┘
```

---

## 📖 0G Chain Token Economics

### Native Token: A0GI

**Symbol:** A0GI  
**Base Unit:** Neuron  
**Decimals:** 18

### Unit Hierarchy

```
1 A0GI = 1,000,000,000 Gneuron (10^9)
1 Gneuron = 1,000,000,000 Neuron (10^9)
1 A0GI = 1,000,000,000,000,000,000 Neuron (10^18)
```

### Common Units

| Unit | Value | Use Case |
|------|-------|----------|
| Neuron | 1 | Base unit (like Wei) |
| Kneuron | 10^3 | Micro transactions |
| Mneuron | 10^6 | Small transactions |
| Gneuron | 10^9 | **Gas prices** ⚡ |
| A0GI | 10^18 | Token amounts |

---

## 🔍 Example Gas Calculations

### Transaction Cost

```typescript
// Gas used: 21,000 units
// Gas price: 0.1 Gneuron

Transaction Cost = Gas Used × Gas Price
                 = 21,000 × 0.1 Gneuron
                 = 2,100 Gneuron
                 = 0.0000021 A0GI
```

### Real-time Gas Price

```typescript
// From RPC
const feeData = await provider.getFeeData();
// feeData.gasPrice = 100000000 (in Neuron/wei)

// Convert to Gneuron
const gasPriceGneuron = Number(feeData.gasPrice) / 1e9;
// gasPriceGneuron = 0.1 Gneuron
```

---

## 🌐 Comparison with Other Chains

| Chain | Native Token | Gas Unit | Base Unit |
|-------|-------------|----------|-----------|
| Ethereum | ETH | Gwei | Wei |
| Polygon | MATIC | Gwei | Wei |
| BSC | BNB | Gwei | Wei |
| **0G Chain** | **A0GI** | **Gneuron** | **Neuron** |

---

## 📝 Why Gneuron?

### Branding
- Unique identity for 0G Chain
- Distinguishes from Ethereum ecosystem
- Reflects 0G's neural network theme

### Technical
- Same decimal precision as Gwei (10^9)
- Compatible with existing tools
- Easy conversion for developers

### User Experience
- Clear distinction from other chains
- Professional naming convention
- Aligns with 0G Chain terminology

---

## 🔗 References

### 0G Chain Documentation
- [0G Chain Official Docs](https://docs.0g.ai)
- [Token Economics](https://docs.0g.ai/tokenomics)
- [Gas Mechanics](https://docs.0g.ai/gas)

### RPC Endpoints
- **Mainnet RPC:** `https://evmrpc.0g.ai`
- **Chain ID:** 16661
- **Explorer:** `https://chainscan.0g.ai`

---

## ✅ Verification

### Check Gas Price

```bash
# Via API
curl http://localhost:5000/api/web3/status | jq '.gasPrice'
# Output: "0.1 Gneuron"

# Via RPC
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
# Output: {"jsonrpc":"2.0","id":1,"result":"0x5f5e100"}
# Convert: 0x5f5e100 = 100000000 Neuron = 0.1 Gneuron
```

### UI Display

1. Open application
2. Check left sidebar "Network Status"
3. Verify gas shows "Gneuron" not "Gwei"

---

## 🎯 Summary

**Changed:**
- ❌ Gwei → ✅ Gneuron
- ❌ Wei → ✅ Neuron
- ❌ ETH → ✅ A0GI

**Files Updated:**
- ✅ `server/services/zg-chain.ts`
- ✅ `server/routes.ts`
- ✅ `client/src/components/layout/left-sidebar.tsx`

**Status:** ✅ IMPLEMENTED

---

**Date:** 2025-01-03  
**Version:** 1.0.0  
**Chain:** 0G Mainnet (Chain ID: 16661)
