// 0G Chain API Service
// Fetches real blockchain data from 0G Chain testnet

const ZG_CHAIN_API_BASE = "https://chainscan-test.0g.ai/open";

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
  private lastBlockHeight: number = 5175740; // Fallback value
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache for real-time updates

  async getCurrentBlockHeight(): Promise<number> {
    const now = Date.now();

    // Use cache if recent data exists
    if (now - this.lastFetchTime < this.CACHE_DURATION) {
      return this.lastBlockHeight;
    }

    try {
      // Get latest block data from gas statistics (most reliable endpoint)
      const response = await fetch(`${ZG_CHAIN_API_BASE}/statistics/block/gas-used?limit=1`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ChainStatsResponse = await response.json();

      if (data.status === "1" && data.result.list.length > 0) {
        this.lastBlockHeight = data.result.list[0].blockNumber;
        this.lastFetchTime = now;
        console.log(`✓ Real-time block height update: ${this.lastBlockHeight}`);
        return this.lastBlockHeight;
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.warn(`Failed to fetch block height from 0G Chain API:`, error);

      // Try alternative endpoint
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const altResponse = await fetch(
          `${ZG_CHAIN_API_BASE}/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`
        );

        if (altResponse.ok) {
          const altData: BlockNumberResponse = await altResponse.json();
          if (altData.status === "1" && typeof altData.result === 'number') {
            this.lastBlockHeight = altData.result;
            this.lastFetchTime = now;
            console.log(`✓ Real-time block height from alternative API: ${this.lastBlockHeight}`);
            return this.lastBlockHeight;
          }
        }
      } catch (altError) {
        console.warn(`Alternative endpoint also failed:`, altError);
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
      chainId: 16601,
      networkName: "0G-Galileo-Testnet",
      rpcUrl: "https://rpc.ankr.com/0g_galileo_testnet_evm",
      blockExplorer: "https://chainscan-galileo.0g.ai",
      blockHeight,
      gasPrice,
    };
  }
}

// Export singleton instance
export const zgChainService = new ZGChainService();