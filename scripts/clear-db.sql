-- Clear all data from database
-- Execute in order to respect foreign key constraints

-- Disable triggers temporarily for faster deletion
SET session_replication_role = 'replica';

-- Delete all data
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE session CASCADE;
TRUNCATE TABLE comment_likes CASCADE;
TRUNCATE TABLE shares CASCADE;
TRUNCATE TABLE post_hashtags CASCADE;
TRUNCATE TABLE hashtags CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE tips CASCADE;
TRUNCATE TABLE bookmarks CASCADE;
TRUNCATE TABLE collections CASCADE;
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE proposals CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE community_memberships CASCADE;
TRUNCATE TABLE communities CASCADE;
TRUNCATE TABLE reposts CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE likes CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE follows CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'follows', COUNT(*) FROM follows
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'communities', COUNT(*) FROM communities
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;
