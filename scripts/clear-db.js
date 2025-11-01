import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
    console.log('Starting database clear script...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('🗑️  Connected to database. Starting cleanup...\n');

        // Disable triggers for faster deletion
        await client.query("SET session_replication_role = 'replica'");

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

        for (const table of tables) {
            try {
                console.log(`Clearing ${table}...`);
                await client.query(`TRUNCATE TABLE ${table} CASCADE`);
                console.log(`✅ ${table} cleared`);
            } catch (error) {
                console.log(`⚠️  ${table}: ${error.message}`);
            }
        }

        // Re-enable triggers
        await client.query("SET session_replication_role = 'origin'");

        console.log('\n📊 Verifying tables are empty...\n');

        // Verify counts
        const verifyTables = ['users', 'posts', 'comments', 'likes', 'follows', 'messages', 'conversations'];
        for (const table of verifyTables) {
            try {
                const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`${table}: ${result.rows[0].count} rows`);
            } catch (error) {
                console.log(`${table}: Error checking`);
            }
        }

        console.log('\n✅ Database cleared successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
}

clearDatabase().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
