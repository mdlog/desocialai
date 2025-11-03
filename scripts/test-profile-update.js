import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Read DATABASE_URL from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1].trim() : null;

console.log('🧪 Testing Profile Update to Database\n');

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function testProfileUpdate() {
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Test 1: Create a test user
        console.log('📝 Test 1: Creating test user...');
        const testWallet = '0x' + Math.random().toString(16).substr(2, 40);

        const insertResult = await client.query(`
      INSERT INTO users (
        username, 
        display_name, 
        wallet_address, 
        bio,
        is_verified
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, display_name, wallet_address
    `, [
            'test_user_' + Date.now(),
            'Test User Original',
            testWallet,
            'Original bio',
            true
        ]);

        const user = insertResult.rows[0];
        console.log('✅ User created:', user);
        console.log('');

        // Test 2: Update username and display name
        console.log('📝 Test 2: Updating username and display_name...');
        const newUsername = 'updated_user_' + Date.now();
        const newDisplayName = 'Updated Display Name';

        const updateResult = await client.query(`
      UPDATE users 
      SET username = $1, display_name = $2
      WHERE id = $3
      RETURNING id, username, display_name, wallet_address
    `, [newUsername, newDisplayName, user.id]);

        const updatedUser = updateResult.rows[0];
        console.log('✅ User updated:', updatedUser);
        console.log('');

        // Test 3: Verify the update
        console.log('📝 Test 3: Verifying update from database...');
        const verifyResult = await client.query(`
      SELECT id, username, display_name, wallet_address, bio
      FROM users 
      WHERE id = $1
    `, [user.id]);

        const verifiedUser = verifyResult.rows[0];
        console.log('✅ Verified user:', verifiedUser);
        console.log('');

        // Test 4: Check if changes persisted
        console.log('📝 Test 4: Checking if changes persisted...');
        const success =
            verifiedUser.username === newUsername &&
            verifiedUser.display_name === newDisplayName;

        if (success) {
            console.log('✅ SUCCESS! Username and display_name are correctly saved!');
            console.log('  - Username changed from:', user.username, '→', verifiedUser.username);
            console.log('  - Display name changed from:', user.display_name, '→', verifiedUser.display_name);
        } else {
            console.log('❌ FAILED! Changes were not saved correctly');
            console.log('  - Expected username:', newUsername);
            console.log('  - Got username:', verifiedUser.username);
            console.log('  - Expected display_name:', newDisplayName);
            console.log('  - Got display_name:', verifiedUser.display_name);
        }
        console.log('');

        // Cleanup: Delete test user
        console.log('🧹 Cleaning up test user...');
        await client.query('DELETE FROM users WHERE id = $1', [user.id]);
        console.log('✅ Test user deleted');
        console.log('');

        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        await client.end();
    }
}

testProfileUpdate()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
