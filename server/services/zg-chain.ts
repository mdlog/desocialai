// 0G Chain API Service
// Fetches real blockchain data from 0G Chain mainnet

const ZG_CHAIN_API_BASE = "https://chainscan.0g.ai/open";

interface BlockData {
  blockNumber: number;
  timestamp: number;
  gasUsed: string;
}

interface ChainStatsResponse {
  status: string;
  message: string;
  result: {
    total: number;
    list: BlockData[];
  };
}

interface BlockNumberResponse {
  status: string;
  message: string;
  result: number;
}

export class ZGChainService {
  private lastBlockHeight: number = 1000000; // Fallback value for mainnet
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache for real-time updates

  async getCurrentBlockHeight(): Promise<number> {
    const now = Date.now();

    // Use cache if recent data exists
    if (now - this.lastFetchTime < this.CACHE_DURATION) {
      return this.lastBlockHeight;
    }

    try {
      // Use RPC directly for most accurate block height
      const rpcUrl = process.env.ZG_RPC_URL || process.env.COMBINED_SERVER_CHAIN_RPC || 'https://evmrpc.0g.ai';

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.result) {
        // Convert hex to decimal
        this.lastBlockHeight = parseInt(data.result, 16);
        this.lastFetchTime = now;
        console.log(`✓ Real-time block height from RPC: ${this.lastBlockHeight}`);
        return this.lastBlockHeight;
      }

      throw new Error("Invalid RPC response format");
    } catch (error) {
      console.warn(`Failed to fetch block height from RPC:`, error);

      // Try explorer API as fallback
      try {
        const response = await fetch(`${ZG_CHAIN_API_BASE}/statistics/block/gas-used?limit=1`);

        if (response.ok) {
          const data: ChainStatsResponse = await response.json();
          if (data.status === "1" && data.result.list.length > 0) {
            this.lastBlockHeight = data.result.list[0].blockNumber;
            this.lastFetchTime = now;
            console.log(`✓ Real-time block height from explorer API: ${this.lastBlockHeight}`);
            return this.lastBlockHeight;
          }
        }
      } catch (apiError) {
        console.warn(`Explorer API also failed:`, apiError);
      }

      // Return cached value or fallback
      console.log(`Using cached/fallback block height: ${this.lastBlockHeight}`);
      return this.lastBlockHeight;
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      // In a real implementation, you might fetch this from the RPC
      // For now, we'll use a reasonable default for 0G Chain
      return "0.1 gwei";
    } catch (error) {
      console.warn(`Failed to fetch gas price:`, error);
      return "0.1 gwei";
    }
  }

  /**
   * Get transaction status from 0G Chain
   */
  async getTransactionStatus(txHash: string): Promise<{
    success: boolean;
    status?: string;
    blockNumber?: number;
    confirmations?: number;
    timestamp?: number;
  }> {
    try {
      // Check transaction status using 0G Chain API
      const response = await fetch(
        `${ZG_CHAIN_API_BASE}/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "1") {
        // Get current block height for confirmations
        const currentBlock = await this.getCurrentBlockHeight();

        return {
          success: true,
          status: data.result?.status || "1",
          blockNumber: data.result?.blockNumber || 0,
          confirmations: currentBlock - (data.result?.blockNumber || 0),
          timestamp: data.result?.timestamp || Date.now() / 1000
        };
      }

      return { success: false };
    } catch (error) {
      console.warn(`Failed to get transaction status from 0G Chain:`, error);
      return { success: false };
    }
  }

  async getChainInfo() {
    const blockHeight = await this.getCurrentBlockHeight();
    const gasPrice = await this.getGasPrice();

    return {
      chainId: 16661,
      networkName: "0G Mainnet",
      rpcUrl: "https://evmrpc.0g.ai",
      blockExplorer: "https://chainscan.0g.ai",
      blockHeight,
      gasPrice,
    };
  }
}

// Export singleton instance
export const zgChainService = new ZGChainService();