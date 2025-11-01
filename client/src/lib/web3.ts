// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

export interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: string | null;
}

export interface ChainStatus {
  network: string;
  chainId?: string;
  blockExplorer?: string;
  rpcUrl?: string;
  blockHeight: number;
  gasPrice: string;
}

export class Web3Service {
  private static instance: Web3Service;
  private walletStatus: WalletStatus = {
    connected: false,
    address: null,
    balance: null,
  };

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  async connectWallet(): Promise<WalletStatus> {
    // Mock wallet connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.walletStatus = {
          connected: true,
          address: "0x742d35Cc1234567890123456789012345678901234",
          balance: "1.234 0G",
        };
        resolve(this.walletStatus);
      }, 1000);
    });
  }

  async disconnectWallet(): Promise<void> {
    this.walletStatus = {
      connected: false,
      address: null,
      balance: null,
    };
  }

  getWalletStatus(): WalletStatus {
    return this.walletStatus;
  }

  async getChainStatus(): Promise<ChainStatus> {
    // 0G Mainnet chain status
    // Fetch real block height from API
    try {
      const response = await fetch('/api/web3/status');
      if (response.ok) {
        const data = await response.json();
        return {
          network: data.network || "0G Mainnet",
          blockHeight: data.blockHeight || 1000000,
          gasPrice: data.gasPrice || "0.1 gwei",
        };
      }
    } catch (error) {
      console.warn('Failed to fetch chain status:', error);
    }

    // Fallback to default values
    return {
      network: "0G Mainnet",
      blockHeight: 1000000,
      gasPrice: "0.1 gwei",
    };
  }

  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const web3Service = Web3Service.getInstance();
