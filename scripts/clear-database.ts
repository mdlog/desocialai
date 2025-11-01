import { db } from "../server/db";
import { sql } from "drizzle-orm";
import {
    users,
    posts,
    follows,
    likes,
    comments,
    reposts,
    communities,
    communityMemberships,
    notifications,
    proposals,
    votes,
    bookmarks,
    collections,
    tips,
    subscriptions,
    hashtags,
    postHashtags,
    shares,
    commentLikes,
    sessions,
    conversations,
    messages,
} from "../shared/schema";

async function clearDatabase() {
    console.log("🗑️  Starting database cleanup...");

    try {
        // Delete in correct order to respect foreign key constraints
        console.log("Deleting messages...");
        await db.delete(messages);

        console.log("Deleting conversations...");
        await db.delete(conversations);

        console.log("Deleting sessions...");
        await db.delete(sessions);

        console.log("Deleting comment likes...");
        await db.delete(commentLikes);

        console.log("Deleting shares...");
        await db.delete(shares);

        console.log("Deleting post hashtags...");
        await db.delete(postHashtags);

        console.log("Deleting hashtags...");
        await db.delete(hashtags);

        console.log("Deleting subscriptions...");
        await db.delete(subscriptions);

        console.log("Deleting tips...");
        await db.delete(tips);

        console.log("Deleting bookmarks...");
        await db.delete(bookmarks);

        console.log("Deleting collections...");
        await db.delete(collections);

        console.log("Deleting votes...");
        await db.delete(votes);

        console.log("Deleting proposals...");
        await db.delete(proposals);

        console.log("Deleting notifications...");
        await db.delete(notifications);

        console.log("Deleting community memberships...");
        await db.delete(communityMemberships);

        console.log("Deleting communities...");
        await db.delete(communities);

        console.log("Deleting reposts...");
        await db.delete(reposts);

        console.log("Deleting comments...");
        await db.delete(comments);

        console.log("Deleting likes...");
        await db.delete(likes);

        console.log("Deleting posts...");
        await db.delete(posts);

        console.log("Deleting follows...");
        await db.delete(follows);

        console.log("Deleting users...");
        await db.delete(users);

        console.log("✅ Database cleared successfully!");
        console.log("\n📊 Summary:");
        console.log("- All user data deleted");
        console.log("- All posts and interactions deleted");
        console.log("- All messages and conversations deleted");
        console.log("- All communities and memberships deleted");
        console.log("- All sessions cleared");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
}

clearDatabase();
