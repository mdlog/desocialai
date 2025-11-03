// NFT Service - Fetch NFTs from 0G Chain Mainnet
import { ethers } from "ethers";

const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

class NFTService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.ZG_RPC_URL || "https://evmrpc.0g.ai"
    );
  }

  async getUserNFTs(walletAddress: string) {
    try {
      console.log('[NFT Service] Fetching NFTs for:', walletAddress);

      // Known NFT contracts on 0G Chain Mainnet (add more as needed)
      const nftContracts = [
        // Add known NFT contract addresses here
        // Example: "0x..."
      ];

      const allNFTs = [];

      for (const contractAddress of nftContracts) {
        try {
          const contract = new ethers.Contract(contractAddress, ERC721_ABI, this.provider);
          const balance = await contract.balanceOf(walletAddress);
          
          for (let i = 0; i < Number(balance); i++) {
            const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
            const tokenURI = await contract.tokenURI(tokenId);
            const name = await contract.name();
            const symbol = await contract.symbol();

            allNFTs.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${name} #${tokenId}`,
              contractAddress,
              tokenId: tokenId.toString(),
              tokenURI,
              collection: name,
              symbol,
              owner: walletAddress,
              isOwned: true
            });
          }
        } catch (error) {
          console.log(`[NFT Service] Error fetching from ${contractAddress}:`, error);
        }
      }

      console.log('[NFT Service] Found', allNFTs.length, 'NFTs');
      return allNFTs;
    } catch (error) {
      console.error('[NFT Service] Error:', error);
      return [];
    }
  }

  async fetchTokenMetadata(tokenURI: string) {
    try {
      // Handle IPFS URIs
      if (tokenURI.startsWith('ipfs://')) {
        tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      const response = await fetch(tokenURI);
      if (!response.ok) throw new Error('Failed to fetch metadata');
      
      return await response.json();
    } catch (error) {
      console.error('[NFT Service] Metadata fetch error:', error);
      return null;
    }
  }
}

export const nftService = new NFTService();
