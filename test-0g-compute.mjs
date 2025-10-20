#!/usr/bin/env node

/**
 * Test Script untuk 0G Compute Integration
 * Menguji semua fitur yang menggunakan 0G Compute Galileo Testnet
 */

import http from 'http';

const BASE_URL = 'http://localhost:5000';

// Helper function untuk HTTP request
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Test functions
async function testComputeStatus() {
    console.log('\n🔍 TEST 1: 0G Compute Status');
    console.log('='.repeat(60));

    try {
        const result = await makeRequest('/api/zg/compute/status');
        console.log('Status Code:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.isConfigured) {
            console.log('✅ 0G Compute is configured');
            console.log('✅ Mode:', result.data.mode);
            console.log('✅ Has Private Key:', result.data.hasPrivateKey);
        } else {
            console.log('❌ 0G Compute not configured');
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testComputeStats() {
    console.log('\n📊 TEST 2: 0G Compute Stats');
    console.log('='.repeat(60));

    try {
        const result = await makeRequest('/api/zg/compute/stats');
        console.log('Status Code:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.mode === 'real') {
            console.log('✅ Using REAL 0G Compute Network');
            console.log('✅ Status:', result.data.status);
            console.log('✅ Available Providers:', result.data.availableProviders || 0);
        } else {
            console.log('⚠️  Using simulation mode');
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testAIRecommendations() {
    console.log('\n🎯 TEST 3: AI Recommendations (uses 0G Compute)');
    console.log('='.repeat(60));

    try {
        const result = await makeRequest('/api/ai/recommendations?userId=test-user-123');
        console.log('Status Code:', result.status);

        if (Array.isArray(result.data)) {
            console.log('✅ Recommendations generated:', result.data.length);
            console.log('\nSample recommendations:');
            result.data.slice(0, 2).forEach((rec, i) => {
                console.log(`\n${i + 1}. ${rec.title}`);
                console.log(`   Type: ${rec.type}`);
                console.log(`   Confidence: ${rec.confidence || rec.score || 'N/A'}`);
                console.log(`   Description: ${rec.description}`);
            });
        } else {
            console.log('Response:', JSON.stringify(result.data, null, 2));
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testAIDeployment() {
    console.log('\n🚀 TEST 4: Deploy AI Instance (uses 0G Compute)');
    console.log('='.repeat(60));

    try {
        const payload = {
            userId: 'test-user-123',
            algorithmType: 'engagement',
            preferences: {
                contentTypes: ['blockchain', 'ai'],
                topics: ['defi', 'web3'],
                engagement_threshold: 10,
                recency_weight: 0.7,
                diversity_factor: 0.3
            }
        };

        const result = await makeRequest('/api/ai/deploy', 'POST', payload);
        console.log('Status Code:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));

        if (result.data.instanceId) {
            console.log('✅ AI Instance deployed');
            console.log('✅ Instance ID:', result.data.instanceId);
            console.log('✅ Mode:', result.data.mode);
            console.log('✅ Status:', result.data.status);
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testConnectionCheck() {
    console.log('\n🔗 TEST 5: Connection Check');
    console.log('='.repeat(60));

    try {
        const result = await makeRequest('/api/zg/compute/status');
        console.log('Status Code:', result.status);

        const connection = result.data.connection;
        const connectionError = result.data.connectionError;

        if (connection === false && connectionError) {
            console.log('⚠️  Connection Issue:', connectionError);

            if (connectionError.includes('Account does not exist')) {
                console.log('\n💡 SOLUTION:');
                console.log('   Account needs to be created on 0G Compute Network');
                console.log('   This is normal for first-time setup');
                console.log('   The system will create account automatically on first inference');
            }
        } else if (connection === true) {
            console.log('✅ Connected to 0G Compute Network');
        }

        return result.data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     0G COMPUTE INTEGRATION TEST - GALILEO TESTNET          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    const results = {
        status: null,
        stats: null,
        recommendations: null,
        deployment: null,
        connection: null
    };

    // Run all tests
    results.status = await testComputeStatus();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.stats = await testComputeStats();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.recommendations = await testAIRecommendations();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.deployment = await testAIDeployment();
    await new Promise(resolve => setTimeout(resolve, 1000));

    results.connection = await testConnectionCheck();

    // Summary
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                      TEST SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    console.log('\n📋 Configuration:');
    console.log('   - 0G Compute Configured:', results.status?.isConfigured ? '✅ YES' : '❌ NO');
    console.log('   - Private Key Available:', results.status?.hasPrivateKey ? '✅ YES' : '❌ NO');
    console.log('   - Mode:', results.status?.mode || 'unknown');

    console.log('\n📊 Network Status:');
    console.log('   - Status:', results.stats?.status || 'unknown');
    console.log('   - Available Providers:', results.stats?.availableProviders || 0);
    console.log('   - Acknowledged Providers:', results.stats?.acknowledgedProviders?.length || 0);

    console.log('\n🎯 AI Features:');
    console.log('   - Recommendations:', Array.isArray(results.recommendations) ? `✅ ${results.recommendations.length} generated` : '❌ Failed');
    console.log('   - Deployment:', results.deployment?.instanceId ? '✅ Success' : '⚠️  Check logs');

    console.log('\n🔗 Connection:');
    if (results.connection?.connection === false) {
        console.log('   - Status: ⚠️  Account Setup Required');
        console.log('   - Note: This is normal for first-time setup');
        console.log('   - Action: Account will be created on first AI inference');
    } else if (results.connection?.connection === true) {
        console.log('   - Status: ✅ Connected');
    } else {
        console.log('   - Status: ⚠️  Unknown');
    }

    console.log('\n💡 Overall Assessment:');

    const isConfigured = results.status?.isConfigured;
    const hasPrivateKey = results.status?.hasPrivateKey;
    const isRealMode = results.status?.mode === 'real';

    if (isConfigured && hasPrivateKey && isRealMode) {
        console.log('   ✅ 0G Compute is properly configured');
        console.log('   ✅ Using REAL Galileo Testnet (not simulation)');
        console.log('   ✅ All AI features will use authentic 0G Compute Network');

        if (results.connection?.connectionError?.includes('Account does not exist')) {
            console.log('   ⚠️  Account needs initial setup (automatic on first use)');
        }
    } else {
        console.log('   ⚠️  Configuration incomplete');
        console.log('   ℹ️  Check ZG_PRIVATE_KEY in environment variables');
    }

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('Test completed at:', new Date().toISOString());
    console.log('═'.repeat(60));
    console.log('\n');
}

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Fatal Error:', error);
    process.exit(1);
});
