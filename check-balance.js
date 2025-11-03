#!/usr/bin/env node
/**
 * Quick script to check wallet balance
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function checkBalance() {
    const walletAddress = '0x6bbb59c971826380e0dda7bd527154ac337780e9';
    const rpcUrl = process.env.ZG_RPC_URL || 'https://evmrpc.0g.ai';

    console.log('💰 Checking Wallet Balance...\n');
    console.log('📍 Wallet:', walletAddress);
    console.log('🌐 RPC:', rpcUrl);
    console.log('');

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const balance = await provider.getBalance(walletAddress);
        const balanceInEther = ethers.formatEther(balance);

        console.log('✅ Balance:', balanceInEther, '0G');
        console.log('');

        const balanceNum = parseFloat(balanceInEther);

        if (balanceNum === 0) {
            console.log('❌ Wallet is empty!');
            console.log('⚠️  You need to top up this wallet to use 0G Storage.');
            console.log('');
            console.log('📝 How to top up:');
            console.log('   1. Open your wallet (MetaMask, etc)');
            console.log('   2. Connect to 0G Chain');
            console.log('   3. Send 0G tokens to:', walletAddress);
            console.log('');
            console.log('💡 Recommended: Send at least 10 0G for testing');
        } else if (balanceNum < 1) {
            console.log('⚠️  Low balance! Consider topping up.');
            console.log('');
            console.log('📊 With current balance, you can upload approximately:');
            console.log('   -', Math.floor(balanceNum / 0.001), 'text posts (1KB each)');
            console.log('   -', Math.floor(balanceNum / 0.01), 'image posts (1MB each)');
            console.log('   -', Math.floor(balanceNum / 0.1), 'video posts (10MB each)');
        } else if (balanceNum < 10) {
            console.log('✅ Balance is okay for testing.');
            console.log('');
            console.log('📊 With current balance, you can upload approximately:');
            console.log('   -', Math.floor(balanceNum / 0.001), 'text posts (1KB each)');
            console.log('   -', Math.floor(balanceNum / 0.01), 'image posts (1MB each)');
            console.log('   -', Math.floor(balanceNum / 0.1), 'video posts (10MB each)');
        } else {
            console.log('✅ Balance looks good!');
            console.log('');
            console.log('📊 With current balance, you can upload approximately:');
            console.log('   -', Math.floor(balanceNum / 0.001), 'text posts (1KB each)');
            console.log('   -', Math.floor(balanceNum / 0.01), 'image posts (1MB each)');
            console.log('   -', Math.floor(balanceNum / 0.1), 'video posts (10MB each)');
        }

        console.log('');
        console.log('🔗 View on explorer:');
        console.log('   https://chainscan-newton.0g.ai/address/' + walletAddress);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkBalance();
