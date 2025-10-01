import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  bio: text("bio"),
  avatar: text("avatar"),
  // Wave 2: Advanced Profile System
  nftProfilePicture: text("nft_profile_picture"), // NFT contract address + token ID
  nftProfileContract: text("nft_profile_contract"), // Contract address for NFT verification
  nftProfileTokenId: text("nft_profile_token_id"), // Token ID
  reputationScore: integer("reputation_score").default(0).notNull(),
  skillBadges: jsonb("skill_badges").default([]), // Array of skill badge objects
  verifiedLinks: jsonb("verified_links").default([]), // Social proofs and verified links
  // Premium features
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumExpiresAt: timestamp("premium_expires_at"),
  walletAddress: text("wallet_address"),
  isVerified: boolean("is_verified").default(false).notNull(),
  followingCount: integer("following_count").default(0).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  postsCount: integer("posts_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts: any = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  mediaType: text("media_type"), // 'image' | 'video' | null
  mediaStorageHash: text("media_storage_hash"), // 0G Storage hash for media files
  storageHash: text("storage_hash"), // 0G Storage content hash for decentralized storage
  transactionHash: text("transaction_hash"), // 0G Chain transaction hash
  // Wave 2: Advanced Content Features
  hashtags: jsonb("hashtags").default([]), // Array of hashtag strings
  communityId: varchar("community_id"), // Will add reference after communities table defined
  parentPostId: varchar("parent_post_id").references((): any => posts.id), // For threads/replies
  quotedPostId: varchar("quoted_post_id").references((): any => posts.id), // For quote posts
  isNftContent: boolean("is_nft_content").default(false).notNull(),
  nftContractAddress: text("nft_contract_address"), // NFT mint address
  nftTokenId: text("nft_token_id"), // NFT token ID
  isPremiumContent: boolean("is_premium_content").default(false).notNull(),
  contentCategory: text("content_category"), // AI-powered categorization
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  sharesCount: integer("shares_count").default(0).notNull(),
  bookmarksCount: integer("bookmarks_count").default(0).notNull(),
  isAiRecommended: boolean("is_ai_recommended").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  // Thread support for nested replies
  parentCommentId: varchar("parent_comment_id").references((): any => comments.id), // For threaded conversations
  replyDepth: integer("reply_depth").default(0).notNull(), // Track nesting level (max 3 levels)
  likesCount: integer("likes_count").default(0).notNull(),
  repliesCount: integer("replies_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reposts = pgTable("reposts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Communities/Groups
export const communities = pgTable("communities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  coverImage: text("cover_image"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  membersCount: integer("members_count").default(0).notNull(),
  postsCount: integer("posts_count").default(0).notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityMemberships = pgTable("community_memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  role: text("role").default("member").notNull(), // 'admin' | 'moderator' | 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  senderId: varchar("sender_id").references(() => users.id), // null for system notifications
  type: text("type").notNull(), // 'like' | 'comment' | 'follow' | 'repost' | 'mention' | 'system'
  title: text("title").notNull(), // Notification title
  postId: varchar("post_id").references(() => posts.id), // null for non-post notifications
  commentId: varchar("comment_id").references(() => comments.id), // for comment notifications
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  metadata: jsonb("metadata").default({}), // Additional data like post preview, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Governance & Voting
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  communityId: varchar("community_id").notNull().references(() => communities.id),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposalType: text("proposal_type").notNull(), // 'governance' | 'feature' | 'community'
  status: text("status").default("active").notNull(), // 'active' | 'passed' | 'rejected' | 'expired'
  votesFor: integer("votes_for").default(0).notNull(),
  votesAgainst: integer("votes_against").default(0).notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  voteType: text("vote_type").notNull(), // 'for' | 'against'
  weight: integer("weight").default(1).notNull(), // Reputation-based voting weight
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Bookmarks & Collections
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  collectionId: varchar("collection_id").references(() => collections.id), // Optional collection
  createdAt: timestamp("created_at").defaultNow(),
});

export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true).notNull(),
  bookmarksCount: integer("bookmarks_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Creator Economy - Tips & Subscriptions
export const tips = pgTable("tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  postId: varchar("post_id").references(() => posts.id), // Optional - tip for specific post
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(), // 0G tokens
  message: text("message"),
  transactionHash: text("transaction_hash"), // 0G Chain transaction
  status: text("status").default("pending").notNull(), // 'pending' | 'confirmed' | 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriberId: varchar("subscriber_id").notNull().references(() => users.id),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  tier: text("tier").default("basic").notNull(), // 'basic' | 'premium' | 'vip'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(), // Monthly amount in 0G tokens
  status: text("status").default("active").notNull(), // 'active' | 'cancelled' | 'expired'
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Hashtags for Content Discovery
export const hashtags = pgTable("hashtags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // Without # symbol
  postsCount: integer("posts_count").default(0).notNull(),
  trendingScore: integer("trending_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postHashtags = pgTable("post_hashtags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  hashtagId: varchar("hashtag_id").notNull().references(() => hashtags.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wave 2: Advanced Interaction Features

// Content sharing across communities and platforms
export const shares = pgTable("shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").notNull().references(() => posts.id),
  targetCommunityId: varchar("target_community_id").references(() => communities.id), // Share to specific community
  shareType: text("share_type").notNull(), // 'internal' | 'external' | 'cross_community'
  shareMessage: text("share_message"), // Optional message when sharing
  shareUrl: text("share_url"), // Generated sharing URL
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment likes for threaded conversations
export const commentLikes = pgTable("comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  commentId: varchar("comment_id").notNull().references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Direct Messages tables
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageId: varchar("last_message_id"),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  unreadCount1: integer("unread_count1").default(0).notNull(), // Unread count for participant1
  unreadCount2: integer("unread_count2").default(0).notNull(), // Unread count for participant2
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  encryptedContent: text("encrypted_content").notNull(),
  iv: text("iv").notNull(),
  tag: text("tag").notNull(),
  messageType: text("message_type").default("text").notNull(), // 'text' | 'image' | 'file'
  read: boolean("read").default(false).notNull(),
  storageHash: text("storage_hash"), // 0G Storage hash for persistence
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas  
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Profile update schema (for editing profile data)
export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  walletAddress: true, // Cannot change wallet address
  followingCount: true,
  followersCount: true,
  postsCount: true,
}).partial(); // All fields optional for updates

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  authorId: true, // Set server-side from session
  storageHash: true, // Auto-generated by 0G Storage
  transactionHash: true, // Auto-generated by 0G Chain
  mediaStorageHash: true // Auto-generated by 0G Storage for media
}).extend({
  // Web3 signature fields (optional for backward compatibility)
  signature: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.number().optional(),
  address: z.string().optional(),
  // Media upload fields
  mediaURL: z.string().optional(),
  mediaName: z.string().optional()
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageId: true,
  lastMessageTimestamp: true,
  unreadCount1: true,
  unreadCount2: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  storageHash: true, // Auto-generated by 0G Storage
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  authorId: true, // Set server-side from session
  likesCount: true,
  repliesCount: true,
  replyDepth: true, // Calculated server-side
});

export const insertRepostSchema = createInsertSchema(reposts).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
});

// Wave 2: Advanced schema validation
export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  membersCount: true,
  postsCount: true,
  creatorId: true, // Set server-side from session
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
  bookmarksCount: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  senderId: true, // Set server-side from session
  transactionHash: true,
  status: true,
});

export const insertHashtagSchema = createInsertSchema(hashtags).omit({
  id: true,
  createdAt: true,
  postsCount: true,
  trendingScore: true,
});

export const insertShareSchema = createInsertSchema(shares).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
  shareUrl: true, // Generated server-side
});

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({
  id: true,
  createdAt: true,
  userId: true, // Set server-side from session
});

// Types
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Repost = typeof reposts.$inferSelect;

// Wave 2: Advanced Types
export type Community = typeof communities.$inferSelect;
export type CommunityMembership = typeof communityMemberships.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type Tip = typeof tips.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Hashtag = typeof hashtags.$inferSelect;
export type PostHashtag = typeof postHashtags.$inferSelect;
export type Share = typeof shares.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertRepost = z.infer<typeof insertRepostSchema>;

// Wave 2: Advanced Insert Types
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Extended types for API responses
export type PostWithAuthor = Post & {
  author: User;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked?: boolean;
  community?: Community;
  parentPost?: Post;
  quotedPost?: PostWithAuthor;
};

// User profile type for UI components
export type UserProfile = User & {
  isFollowing?: boolean;
};

// Wave 2: Advanced API Response Types
export type CommunityWithDetails = Community & {
  creator: User;
  membershipRole?: 'admin' | 'moderator' | 'member' | null;
  isMember?: boolean;
};

export type CollectionWithPosts = Collection & {
  owner: User;
  bookmarks: (Bookmark & { post: PostWithAuthor })[];
};

export type TrendingHashtag = Hashtag & {
  isFollowing?: boolean;
  recentPosts?: PostWithAuthor[];
};

// Advanced Interaction Types
export type CommentWithAuthor = Comment & {
  author: User;
  isLiked?: boolean;
  replies?: CommentWithAuthor[]; // For threaded conversations
  parentComment?: CommentWithAuthor;
};

export type ShareWithDetails = Share & {
  user: User;
  post: PostWithAuthor;
  targetCommunity?: Community;
};

// 0G Storage content metadata interface
export interface ContentMetadata {
  type: 'post' | 'image' | 'video' | 'audio';
  userId?: string;
  timestamp?: number;
  originalName?: string;
  size?: number;
  mimeType?: string;
  retryAttempt?: boolean;
  originalAttempt?: number;
  backgroundRetry?: boolean;
  manualRetry?: boolean;
  walletAddress?: string;
}

// 0G Storage response interface
export interface ZGStorageResponse {
  success: boolean;
  hash?: string;
  transactionHash?: string;
  error?: string;
  retryable?: boolean;
  errorType?: string;
  rawError?: string;
}
