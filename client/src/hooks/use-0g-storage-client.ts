/**
 * Hook untuk upload ke 0G Storage langsung dari client
 * User membayar gas fee sendiri menggunakan wallet mereka
 */

import { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

// 0G Storage Contract Configuration
const ZG_STORAGE_CONTRACT = process.env.VITE_ZG_STORAGE_CONTRACT || '0x...';
const ZG_RPC_URL = process.env.VITE_ZG_RPC_URL || 'https://evmrpc.0g.ai';

// Simplified ABI for 0G Storage
const ZG_STORAGE_ABI = [
    "function upload(bytes memory data) public payable returns (bytes32)",
    "function getUploadFee(uint256 size) public view returns (uint256)"
];

export interface UploadResult {
    success: boolean;
    hash?: string;
    transactionHash?: string;
    error?: string;
    gasUsed?: string;
    gasCost?: string;
}

export function use0GStorageClient() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    /**
     * Upload text content to 0G Storage
     * User pays gas fee from their wallet
     */
    const uploadContent = async (content: string): Promise<UploadResult> => {
        if (!isConnected || !address) {
            return {
                success: false,
                error: "Please connect your wallet first"
            };
        }

        if (!content || content.trim().length === 0) {
            return {
                success: false,
                error: "Content cannot be empty"
            };
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // 1. Get provider and signer from user's wallet
            if (!window.ethereum) {
                throw new Error("No wallet detected");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            setUploadProgress(20);

            // 2. Convert content to bytes
            const contentBytes = ethers.toUtf8Bytes(content);
            const contentSize = contentBytes.length;

            console.log('[0G Client Upload] Content size:', contentSize, 'bytes');

            // 3. Connect to 0G Storage contract
            const contract = new ethers.Contract(
                ZG_STORAGE_CONTRACT,
                ZG_STORAGE_ABI,
                signer
            );

            setUploadProgress(30);

            // 4. Get upload fee estimate
            const uploadFee = await contract.getUploadFee(contentSize);
            const feeInEther = ethers.formatEther(uploadFee);

            console.log('[0G Client Upload] Upload fee:', feeInEther, '0G');

            // 5. Check user balance
            const balance = await provider.getBalance(address);
            const balanceInEther = ethers.formatEther(balance);

            console.log('[0G Client Upload] User balance:', balanceInEther, '0G');

            if (balance < uploadFee) {
                throw new Error(`Insufficient balance. Need ${feeInEther} 0G but have ${balanceInEther} 0G`);
            }

            setUploadProgress(40);

            // 6. Show confirmation toast
            toast({
                title: "Confirm Transaction",
                description: `Upload fee: ${feeInEther} 0G. Please approve in your wallet.`,
            });

            // 7. Send transaction (user pays)
            const tx = await contract.upload(contentBytes, {
                value: uploadFee,
                gasLimit: 500000
            });

            console.log('[0G Client Upload] Transaction sent:', tx.hash);

            setUploadProgress(60);

            toast({
                title: "Transaction Sent",
                description: "Waiting for blockchain confirmation...",
            });

            // 8. Wait for confirmation
            const receipt = await tx.wait();

            setUploadProgress(80);

            console.log('[0G Client Upload] Transaction confirmed');
            console.log('[0G Client Upload] Block:', receipt.blockNumber);
            console.log('[0G Client Upload] Gas used:', receipt.gasUsed.toString());

            // 9. Extract storage hash from logs
            const storageHash = receipt.logs[0]?.topics[1] || tx.hash;

            // 10. Calculate actual gas cost
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice || tx.gasPrice;
            const gasCost = ethers.formatEther(gasUsed * gasPrice);

            setUploadProgress(100);

            toast({
                title: "Upload Successful",
                description: `Content uploaded to 0G Storage. Gas cost: ${gasCost} 0G`,
            });

            return {
                success: true,
                hash: storageHash,
                transactionHash: receipt.hash,
                gasUsed: gasUsed.toString(),
                gasCost
            };

        } catch (error: any) {
            console.error('[0G Client Upload] Error:', error);

            let errorMessage = "Failed to upload to 0G Storage";

            // Handle specific error types
            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = "Transaction rejected by user";
            } else if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
                errorMessage = "Insufficient balance to pay gas fee";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive"
            });

            return {
                success: false,
                error: errorMessage
            };

        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Upload media file to 0G Storage
     * User pays gas fee from their wallet
     */
    const uploadMedia = async (file: File): Promise<UploadResult> => {
        if (!isConnected || !address) {
            return {
                success: false,
                error: "Please connect your wallet first"
            };
        }

        if (!file) {
            return {
                success: false,
                error: "No file selected"
            };
        }

        // Check file size (max 10MB for now)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`
            };
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // 1. Read file as bytes
            const arrayBuffer = await file.arrayBuffer();
            const fileBytes = new Uint8Array(arrayBuffer);

            console.log('[0G Client Upload] File:', file.name);
            console.log('[0G Client Upload] Size:', file.size, 'bytes');
            console.log('[0G Client Upload] Type:', file.type);

            setUploadProgress(20);

            // 2. Get provider and signer
            if (!window.ethereum) {
                throw new Error("No wallet detected");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            setUploadProgress(30);

            // 3. Connect to contract
            const contract = new ethers.Contract(
                ZG_STORAGE_CONTRACT,
                ZG_STORAGE_ABI,
                signer
            );

            // 4. Get upload fee
            const uploadFee = await contract.getUploadFee(fileBytes.length);
            const feeInEther = ethers.formatEther(uploadFee);

            console.log('[0G Client Upload] Upload fee:', feeInEther, '0G');

            setUploadProgress(40);

            // 5. Check balance
            const balance = await provider.getBalance(address);
            if (balance < uploadFee) {
                throw new Error(`Insufficient balance. Need ${feeInEther} 0G`);
            }

            toast({
                title: "Uploading Media",
                description: `Fee: ${feeInEther} 0G. Please approve in your wallet.`,
            });

            // 6. Upload (user pays)
            const tx = await contract.upload(fileBytes, {
                value: uploadFee,
                gasLimit: 1000000 // Higher for media
            });

            console.log('[0G Client Upload] Transaction sent:', tx.hash);

            setUploadProgress(60);

            toast({
                title: "Transaction Sent",
                description: "Uploading media to 0G Storage...",
            });

            // 7. Wait for confirmation
            const receipt = await tx.wait();

            setUploadProgress(90);

            const storageHash = receipt.logs[0]?.topics[1] || tx.hash;
            const gasUsed = receipt.gasUsed;
            const gasPrice = receipt.gasPrice || tx.gasPrice;
            const gasCost = ethers.formatEther(gasUsed * gasPrice);

            setUploadProgress(100);

            toast({
                title: "Media Uploaded",
                description: `File uploaded successfully. Gas cost: ${gasCost} 0G`,
            });

            return {
                success: true,
                hash: storageHash,
                transactionHash: receipt.hash,
                gasUsed: gasUsed.toString(),
                gasCost
            };

        } catch (error: any) {
            console.error('[0G Client Upload] Media error:', error);

            let errorMessage = "Failed to upload media";

            if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
                errorMessage = "Transaction rejected by user";
            } else if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
                errorMessage = "Insufficient balance to pay gas fee";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive"
            });

            return {
                success: false,
                error: errorMessage
            };

        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Estimate upload cost before uploading
     */
    const estimateCost = async (sizeInBytes: number): Promise<string> => {
        try {
            if (!window.ethereum) {
                return '0';
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(
                ZG_STORAGE_CONTRACT,
                ZG_STORAGE_ABI,
                provider
            );

            const fee = await contract.getUploadFee(sizeInBytes);
            return ethers.formatEther(fee);

        } catch (error) {
            console.error('[0G Client] Failed to estimate cost:', error);
            return '0';
        }
    };

    /**
     * Check if user has enough balance
     */
    const checkBalance = async (requiredAmount: string): Promise<boolean> => {
        try {
            if (!isConnected || !address || !window.ethereum) {
                return false;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);
            const required = ethers.parseEther(requiredAmount);

            return balance >= required;

        } catch (error) {
            console.error('[0G Client] Failed to check balance:', error);
            return false;
        }
    };

    return {
        uploadContent,
        uploadMedia,
        estimateCost,
        checkBalance,
        isUploading,
        uploadProgress
    };
}
