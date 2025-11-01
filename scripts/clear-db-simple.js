import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Read DATABASE_URL from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1].trim() : null;

console.log('🗑️  Database Clear Script');
console.log('DATABASE_URL found:', !!DATABASE_URL);

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function clearDatabase() {
    try {
        console.log('\n📡 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!\n');

        const tables = [
            'messages',
            'conversations',
            'session',
            'comment_likes',
            'shares',
            'post_hashtags',
            'hashtags',
            'subscriptions',
            'tips',
            'bookmarks',
            'collections',
            'votes',
            'proposals',
            'notifications',
            'community_memberships',
            'communities',
            'reposts',
            'comments',
            'likes',
            'posts',
            'follows',
            'users'
        ];

        console.log('🧹 Clearing tables...\n');

        for (const table of tables) {
            try {
                await client.query(`TRUNCATE TABLE ${table} CASCADE`);
                console.log(`✅ ${table}`);
            } catch (error) {
                console.log(`⚠️  ${table}: ${error.message}`);
            }
        }

        console.log('\n📊 Verifying...\n');

        const verifyTables = ['users', 'posts', 'comments', 'likes', 'messages'];
        for (const table of verifyTables) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`${table}: ${result.rows[0].count} rows`);
            } catch (error) {
                console.log(`${table}: Error`);
            }
        }

        console.log('\n✅ Database cleared successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

clearDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
