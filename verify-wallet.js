/**
 * Script untuk verifikasi wallet address dari private key
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function verifyWallet() {
    console.log('🔍 Verifying Wallet Configuration...\n');

    const privateKey = process.env.ZG_PRIVATE_KEY || process.env.COMBINED_SERVER_PRIVATE_KEY;

    if (!privateKey) {
        console.error('❌ No private key found in .env');
        console.error('   Please set ZG_PRIVATE_KEY or COMBINED_SERVER_PRIVATE_KEY');
        process.exit(1);
    }

    try {
        // Add 0x prefix if not present
        const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

        // Create wallet from private key
        const wallet = new ethers.Wallet(formattedKey);

        console.log('✅ Private Key Valid');
        console.log('📍 Wallet Address:', wallet.address);
        console.log('📍 Wallet Address (lowercase):', wallet.address.toLowerCase());

        // Expected address
        const expectedAddress = '0x6bbb59c971826380e0dda7bd527154ac337780e9';

        console.log('\n🎯 Expected Address:', expectedAddress);
        console.log('🎯 Expected Address (lowercase):', expectedAddress.toLowerCase());

        // Compare
        if (wallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
            console.log('\n✅ ✅ ✅ MATCH! Private key corresponds to the expected wallet address!');
        } else {
            console.log('\n❌ ❌ ❌ MISMATCH! Private key does NOT match the expected address!');
            console.log('\n⚠️  Please check:');
            console.log('   1. Is the private key correct?');
            console.log('   2. Is the expected address correct?');
            process.exit(1);
        }

        // Check balance
        console.log('\n💰 Checking Balance...');
        const rpcUrl = process.env.ZG_RPC_URL || 'https://evmrpc.0g.ai';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const balance = await provider.getBalance(wallet.address);
        const balanceInEther = ethers.formatEther(balance);

        console.log('💰 Balance:', balanceInEther, '0G');

        if (parseFloat(balanceInEther) === 0) {
            console.log('\n⚠️  WARNING: Wallet balance is 0!');
            console.log('   You need to top up this wallet to pay for storage fees.');
            console.log('   Send some 0G tokens to:', wallet.address);
        } else if (parseFloat(balanceInEther) < 1) {
            console.log('\n⚠️  WARNING: Low balance!');
            console.log('   Consider topping up for sustained operations.');
        } else {
            console.log('\n✅ Balance looks good!');
        }

        // Estimate costs
        console.log('\n📊 Estimated Costs:');
        console.log('   Text post (1KB):   ~0.001 0G');
        console.log('   Image post (1MB):  ~0.01 0G');
        console.log('   Video post (10MB): ~0.1 0G');
        console.log('\n   With current balance, you can upload approximately:');
        console.log('   -', Math.floor(parseFloat(balanceInEther) / 0.001), 'text posts');
        console.log('   -', Math.floor(parseFloat(balanceInEther) / 0.01), 'image posts');
        console.log('   -', Math.floor(parseFloat(balanceInEther) / 0.1), 'video posts');

        console.log('\n✅ Wallet verification complete!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

verifyWallet();
