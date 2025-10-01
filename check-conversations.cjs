const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { conversations, messages, users } = require('./shared/schema');
const { eq, or, and } = require('drizzle-orm');

const connectionString = 'postgresql://postgres:password@localhost:5432/desocialai';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkConversations() {
  console.log('=== CHECKING CONVERSATIONS ===');
  
  try {
    // Check all conversations
    console.log('1. Checking all conversations...');
    const allConversations = await db.select().from(conversations);
    console.log(`Total conversations: ${allConversations.length}`);
    console.log('Conversations:', JSON.stringify(allConversations, null, 2));
    
    // Check all messages
    console.log('\n2. Checking all messages...');
    const allMessages = await db.select().from(messages);
    console.log(`Total messages: ${allMessages.length}`);
    console.log('Messages:', JSON.stringify(allMessages, null, 2));
    
    // Check all users
    console.log('\n3. Checking all users...');
    const allUsers = await db.select().from(users);
    console.log(`Total users: ${allUsers.length}`);
    console.log('Users:', JSON.stringify(allUsers.map(u => ({ id: u.id, displayName: u.displayName, username: u.username })), null, 2));
    
    // Check conversations for specific user (from logs)
    const userId = 'ccc7fe18-90ab-4bb1-8bc8-5a3cbe30ca10';
    console.log(`\n4. Checking conversations for user: ${userId}`);
    
    const userConversations = await db.select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      );
    
    console.log(`User conversations: ${userConversations.length}`);
    console.log('User conversations:', JSON.stringify(userConversations, null, 2));
    
    if (userConversations.length > 0) {
      // Check messages for each conversation
      for (const conv of userConversations) {
        console.log(`\n5. Checking messages for conversation: ${conv.id}`);
        const convMessages = await db.select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id));
        console.log(`Messages in conversation ${conv.id}: ${convMessages.length}`);
        console.log('Messages:', JSON.stringify(convMessages, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkConversations();
