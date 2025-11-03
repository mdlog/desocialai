import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Read DATABASE_URL from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1].trim() : null;

console.log('🔍 User Profile Checker');
console.log('DATABASE_URL found:', !!DATABASE_URL);

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function checkUserProfile() {
    try {
        console.log('\n📡 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!\n');

        // Get all users
        const result = await client.query(`
      SELECT 
        id,
        username,
        display_name as "displayName",
        email,
        bio,
        avatar,
        wallet_address as "walletAddress",
        is_verified as "isVerified",
        posts_count as "postsCount",
        followers_count as "followersCount",
        following_count as "followingCount",
        created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `);

        if (result.rows.length === 0) {
            console.log('⚠️  No users found in database');
        } else {
            console.log(`📊 Found ${result.rows.length} user(s):\n`);

            result.rows.forEach((user, index) => {
                console.log(`User #${index + 1}:`);
                console.log(`  ID: ${user.id}`);
                console.log(`  Username: ${user.username}`);
                console.log(`  Display Name: ${user.displayName}`);
                console.log(`  Email: ${user.email || 'N/A'}`);
                console.log(`  Bio: ${user.bio || 'N/A'}`);
                console.log(`  Avatar: ${user.avatar || 'N/A'}`);
                console.log(`  Wallet: ${user.walletAddress}`);
                console.log(`  Verified: ${user.isVerified ? 'Yes' : 'No'}`);
                console.log(`  Stats: ${user.postsCount} posts, ${user.followersCount} followers, ${user.followingCount} following`);
                console.log(`  Created: ${new Date(user.createdAt).toLocaleString()}`);
                console.log('');
            });
        }

        console.log('✅ Check completed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

checkUserProfile()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
