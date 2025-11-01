import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

// Definisi 0G Chain Mainnet
export const zgChainMainnet: Chain = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G Token',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
};

// Konfigurasi RainbowKit dengan 0G Chain
export const wagmiConfig = getDefaultConfig({
  appName: 'DeSocialAI',
  // IMPORTANT: Get a valid WalletConnect Project ID from https://cloud.walletconnect.com
  // Using a placeholder ID will cause 403 errors
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'desocialai-zg-chain',
  chains: [zgChainMainnet], // 0G Chain Mainnet
  ssr: false, // Disable server-side rendering untuk Vite
});