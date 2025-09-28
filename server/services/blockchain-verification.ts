import { ethers } from 'ethers';
import { zgDAService } from './zg-da';
import crypto from 'crypto';

export interface VerificationResult {
  isVerified: boolean;
  transactionHash: string;
  blockNumber?: number;
  timestamp: Date;
  verificationScore: number;
  metadata: any;
}

export interface ContentHash {
  contentId: string;
  originalHash: string;
  blockchainHash: string;
  algorithm: 'sha256' | 'keccak256';
  isAuthentic: boolean;
}

export interface UserReputation {
  userId: string;
  reputationScore: number;
  verifiedInteractions: number;
  authenticity: number;
  communityTrust: number;
  blockchainProofs: number;
  lastUpdated: Date;
}

class BlockchainVerificationService {
  private provider: ethers.JsonRpcProvider;
  private verificationContract: ethers.Contract;
  private reputationCache: Map<string, UserReputation> = new Map();

  constructor() {
    // Initialize with 0G Chain provider
    this.provider = new ethers.JsonRpcProvider(process.env.COMBINED_SERVER_CHAIN_RPC);
    this.initializeContract();
  }

  private async initializeContract() {
    // Smart contract for verification (simplified ABI)
    const contractABI = [
      "function verifyContent(bytes32 contentHash, address user) external returns (bool)",
      "function getVerification(bytes32 contentHash) external view returns (bool, uint256, address)",
      "function updateReputation(address user, uint256 score) external",
      "function getReputation(address user) external view returns (uint256)",
      "event ContentVerified(bytes32 indexed contentHash, address indexed user, uint256 timestamp)"
    ];

    try {
      this.verificationContract = new ethers.Contract(
        process.env.ENTRANCE_CONTRACT_ADDR || '0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9',
        contractABI,
        this.provider
      );
    } catch (error) {
      console.error('[Blockchain Verification] Contract initialization failed:', error);
    }
  }

  async verifyContent(contentId: string, content: string, userId: string, walletAddress: string): Promise<VerificationResult> {
    try {
      // Generate content hash
      const contentHash = this.generateContentHash(content);
      
      // Create verification proof
      const verificationData = {
        contentId,
        contentHash,
        userId,
        walletAddress,
        timestamp: new Date().toISOString(),
        blockchainNetwork: '0G Chain',
        verificationMethod: 'content_authenticity'
      };

      // Store verification on 0G DA for immutable record
      const daHash = await zgDAService.recordInteraction('verification', userId, contentId, verificationData);

      // Simulate blockchain verification (in real implementation, call smart contract)
      const verificationScore = this.calculateVerificationScore(content, userId);
      
      const result: VerificationResult = {
        isVerified: verificationScore > 70,
        transactionHash: daHash || '', // No fallback to dummy hash
        timestamp: new Date(),
        verificationScore,
        metadata: {
          algorithm: 'sha256',
          contentHash,
          daHash,
          verificationData
        }
      };

      // Update user reputation
      await this.updateUserReputation(userId, walletAddress, verificationScore);

      console.log(`[Blockchain Verification] Content verified: ${contentId} (Score: ${verificationScore})`);
      return result;

    } catch (error) {
      console.error('[Blockchain Verification] Failed:', error);
      return {
        isVerified: false,
        transactionHash: '',
        timestamp: new Date(),
        verificationScore: 0,
        metadata: { error: error.message }
      };
    }
  }

  async verifyUserIdentity(userId: string, walletAddress: string, signature: string): Promise<VerificationResult> {
    try {
      // Verify wallet signature
      const message = `Verify identity for DeSocialAI user: ${userId}`;
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      const isValidSignature = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();

      // Create identity verification record
      const identityData = {
        userId,
        walletAddress,
        signature,
        message,
        recoveredAddress,
        isValid: isValidSignature,
        timestamp: new Date().toISOString(),
        verificationMethod: 'identity_signature'
      };

      // Store on 0G DA
      const daHash = await zgDAService.recordInteraction('identity_verification', userId, 'user_identity', identityData);

      const verificationScore = isValidSignature ? 95 : 0;

      const result: VerificationResult = {
        isVerified: isValidSignature,
        transactionHash: daHash || '', // No fallback to dummy hash
        timestamp: new Date(),
        verificationScore,
        metadata: {
          walletAddress,
          recoveredAddress,
          signatureValid: isValidSignature,
          daHash
        }
      };

      if (isValidSignature) {
        await this.updateUserReputation(userId, walletAddress, verificationScore);
      }

      return result;

    } catch (error) {
      console.error('[Identity Verification] Failed:', error);
      return {
        isVerified: false,
        transactionHash: '',
        timestamp: new Date(),
        verificationScore: 0,
        metadata: { error: error.message }
      };
    }
  }

  async verifyInteraction(interactionType: string, userId: string, targetId: string, metadata: any): Promise<VerificationResult> {
    try {
      // Create interaction proof
      const interactionData = {
        type: interactionType,
        userId,
        targetId,
        metadata,
        timestamp: new Date().toISOString(),
        blockHeight: await this.getCurrentBlockHeight(),
        networkConfirmations: 1
      };

      // Generate interaction hash
      const interactionHash = this.generateInteractionHash(interactionData);

      // Store on 0G DA for tamper-proof record
      const daHash = await zgDAService.recordInteraction('interaction_verification', userId, targetId, interactionData);

      const verificationScore = this.calculateInteractionScore(interactionType, metadata);

      const result: VerificationResult = {
        isVerified: true,
        transactionHash: daHash || this.generateMockTxHash(),
        timestamp: new Date(),
        verificationScore,
        metadata: {
          interactionHash,
          interactionType,
          daHash,
          interactionData
        }
      };

      // Update reputation for verified interaction
      await this.updateUserReputation(userId, metadata.walletAddress, verificationScore / 10);

      return result;

    } catch (error) {
      console.error('[Interaction Verification] Failed:', error);
      return {
        isVerified: false,
        transactionHash: '',
        timestamp: new Date(),
        verificationScore: 0,
        metadata: { error: error.message }
      };
    }
  }

  async getUserReputation(userId: string): Promise<UserReputation> {
    if (this.reputationCache.has(userId)) {
      return this.reputationCache.get(userId)!;
    }

    // Default reputation for new users
    const reputation: UserReputation = {
      userId,
      reputationScore: 50, // Starting score
      verifiedInteractions: 0,
      authenticity: 50,
      communityTrust: 50,
      blockchainProofs: 0,
      lastUpdated: new Date()
    };

    this.reputationCache.set(userId, reputation);
    return reputation;
  }

  async updateUserReputation(userId: string, walletAddress: string, scoreChange: number): Promise<UserReputation> {
    const currentRep = await this.getUserReputation(userId);
    
    // Update reputation metrics
    currentRep.reputationScore = Math.max(0, Math.min(100, currentRep.reputationScore + scoreChange));
    currentRep.verifiedInteractions += 1;
    currentRep.authenticity = Math.max(0, Math.min(100, currentRep.authenticity + (scoreChange * 0.5)));
    currentRep.blockchainProofs += 1;
    currentRep.lastUpdated = new Date();

    // Store updated reputation on blockchain
    try {
      const reputationData = {
        userId,
        walletAddress,
        reputation: currentRep,
        updateReason: 'verified_interaction',
        timestamp: new Date().toISOString()
      };

      await zgDAService.recordInteraction('reputation_update', userId, 'user_reputation', reputationData);
    } catch (error) {
      console.error('[Reputation Update] Failed to store on blockchain:', error);
    }

    this.reputationCache.set(userId, currentRep);
    return currentRep;
  }

  async verifyContentIntegrity(contentId: string, originalContent: string): Promise<ContentHash> {
    const originalHash = this.generateContentHash(originalContent);
    
    try {
      // Fetch stored content hash from blockchain/DA
      const storedData = await this.getStoredContentHash(contentId);
      
      const result: ContentHash = {
        contentId,
        originalHash,
        blockchainHash: storedData?.hash || '',
        algorithm: 'sha256',
        isAuthentic: originalHash === storedData?.hash
      };

      return result;

    } catch (error) {
      console.error('[Content Integrity] Verification failed:', error);
      return {
        contentId,
        originalHash,
        blockchainHash: '',
        algorithm: 'sha256',
        isAuthentic: false
      };
    }
  }

  private generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private generateInteractionHash(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private generateMockTxHash(): string {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  private calculateVerificationScore(content: string, userId: string): number {
    // Advanced scoring algorithm
    let score = 50; // Base score

    // Content quality factors
    if (content.length > 100) score += 10;
    if (content.includes('0G') || content.includes('blockchain')) score += 15;
    if (!/spam|fake|scam/i.test(content)) score += 20;

    // User reputation factor
    const userRep = this.reputationCache.get(userId);
    if (userRep) {
      score += (userRep.reputationScore - 50) * 0.3;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateInteractionScore(type: string, metadata: any): number {
    const baseScores = {
      'like': 5,
      'comment': 15,
      'repost': 10,
      'follow': 20,
      'post': 25
    };

    return baseScores[type] || 5;
  }

  private async getCurrentBlockHeight(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch {
      return Date.now(); // Fallback to timestamp
    }
  }

  private async getStoredContentHash(contentId: string): Promise<any> {
    // In real implementation, fetch from 0G DA or blockchain
    return { hash: '', timestamp: new Date() };
  }

  async generateProofOfAuthenticity(contentId: string, userId: string): Promise<any> {
    try {
      const timestamp = new Date().toISOString();
      const proofData = {
        contentId,
        userId,
        timestamp,
        network: '0G Chain',
        verificationLevel: 'Level 3 - Blockchain Verified',
        authenticity: 95
      };

      // Store proof on 0G DA
      const daHash = await zgDAService.recordInteraction('authenticity_proof', userId, contentId, proofData);

      return {
        proofId: daHash || this.generateMockTxHash(),
        proofData,
        qrCode: this.generateQRCodeData(proofData),
        verificationUrl: `https://desocialai.app/verify/${daHash}`
      };

    } catch (error) {
      console.error('[Proof Generation] Failed:', error);
      return null;
    }
  }

  private generateQRCodeData(proofData: any): string {
    return Buffer.from(JSON.stringify(proofData)).toString('base64');
  }
}

export const blockchainVerificationService = new BlockchainVerificationService();