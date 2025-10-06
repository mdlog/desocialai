import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

// Definisi 0G Chain Galileo Testnet
export const zgChainGalileoTestnet: Chain = {
  id: 16602,
  name: 'Galileo (Testnet)',
  nativeCurrency: {
    decimals: 18,
    name: '0G Token',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
};

// Konfigurasi RainbowKit dengan 0G Chain
export const wagmiConfig = getDefaultConfig({
  appName: 'DeSocialAI',
  projectId: 'desocialai-zg-chain', // ID project untuk WalletConnect
  chains: [zgChainGalileoTestnet], // Hanya gunakan 0G Chain Galileo testnet
  ssr: false, // Disable server-side rendering untuk Vite
});