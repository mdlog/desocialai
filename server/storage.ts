import { type User, type Post, type Follow, type Like, type Comment, type Repost, type InsertUser, type InsertPost, type InsertFollow, type InsertLike, type InsertComment, type InsertRepost, type PostWithAuthor, type UserProfile, type UpdateUserProfile, type Share, type CommentLike, type Bookmark, type Collection, type InsertShare, type InsertCommentLike, type InsertBookmark, type InsertCollection, users, posts, follows, likes, comments, reposts, shares, commentLikes, bookmarks, collections, notifications } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress?(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User>;
  searchUsers(query: string): Promise<User[]>;

  // Posts
  createPost(post: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]>;
  getPersonalizedFeed(userId: string, limit?: number, offset?: number): Promise<PostWithAuthor[]>;
  getGlobalFeed(currentUserId?: string, limit?: number, offset?: number): Promise<PostWithAuthor[]>;
  deletePost(id: string): Promise<void>;

  // Follows
  followUser(followerId: string, followingId: string): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowing(userId: string): Promise<User[]>;
  getFollowers(userId: string): Promise<User[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Likes
  likePost(userId: string, postId: string): Promise<Like>;
  unlikePost(userId: string, postId: string): Promise<void>;
  isPostLiked(userId: string, postId: string): Promise<boolean>;
  getPostLikes(postId: string): Promise<Like[]>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  getPostComments(postId: string): Promise<Comment[]>;

  // Reposts
  repostPost(userId: string, postId: string): Promise<Repost>;
  unrepostPost(userId: string, postId: string): Promise<void>;
  isPostReposted(userId: string, postId: string): Promise<boolean>;

  // Search
  searchPosts(query: string): Promise<Post[]>;

  // Stats
  getNetworkStats(): Promise<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
  }>;

  // Trending topics functionality
  getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>>;

  // Wave 2: Advanced Social Features Interface
  // Communities
  getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
  }): Promise<any[]>;
  createCommunity(data: any, creatorId: string): Promise<any>;
  joinCommunity(communityId: string, userId: string): Promise<void>;
  leaveCommunity(communityId: string, userId: string): Promise<void>;

  // Hashtags & Content Discovery
  getTrendingHashtags(limit: number, userId?: string): Promise<any[]>;
  getPostsByHashtag(hashtagName: string, page: number, limit: number, userId?: string): Promise<any[]>;

  // Bookmarks & Collections
  getUserBookmarks(userId: string, page: number, limit: number, collectionId?: string): Promise<any[]>;
  createBookmark(data: any, userId: string): Promise<any>;
  removeBookmark(postId: string, userId: string): Promise<void>;
  getUserCollections(userId: string, includeBookmarks?: boolean): Promise<any[]>;
  createCollection(data: any, userId: string): Promise<any>;

  // Creator Economy - Tips & Subscriptions
  createTip(data: any, senderId: string): Promise<any>;
  getReceivedTips(userId: string, page: number, limit: number): Promise<any[]>;
  getSentTips(userId: string, page: number, limit: number): Promise<any[]>;

  // Advanced Interaction Features
  // Thread Comments
  getComment(commentId: string): Promise<Comment | undefined>;
  updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment>;
  getThreadedComments(postId: string, page: number, limit: number): Promise<any[]>;
  getPostCommentsCount(postId: string): Promise<number>;

  // Comment Likes
  createCommentLike(data: { userId: string; commentId: string }): Promise<any>;
  deleteCommentLike(userId: string, commentId: string): Promise<void>;
  getCommentLike(userId: string, commentId: string): Promise<any>;
  getCommentLikesCount(commentId: string): Promise<number>;

  // Content Sharing
  createShare(data: any): Promise<any>;
  getPostShares(postId: string, page: number, limit: number): Promise<any[]>;
  getPostSharesCount(postId: string): Promise<number>;

  // Bookmarks & Collections (enhanced)
  getBookmark(userId: string, postId: string): Promise<any>;
  deleteBookmark(userId: string, postId: string): Promise<void>;
  updateCollection(collectionId: string, updates: any): Promise<any>;
  getCollectionBookmarksCount(collectionId: string): Promise<number>;

  // Update methods for counters
  updatePost(postId: string, updates: Partial<Post>): Promise<Post>;

  // Notification methods
  getNotifications(userId: string): Promise<any[]>;
  createNotification(data: any): Promise<any>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private posts = new Map<string, Post>();
  private follows = new Map<string, Follow>();
  private likes = new Map<string, Like>();
  private comments = new Map<string, Comment>();
  private reposts = new Map<string, Repost>();
  private shares = new Map<string, Share>();
  private commentLikes = new Map<string, CommentLike>();
  private bookmarks = new Map<string, Bookmark>();
  private collections = new Map<string, Collection>();
  private notifications = new Map<string, any>();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users for development
    const user1: User = {
      id: "user1",
      username: "alexc",
      displayName: "Alex Chen",
      email: "alex@example.com",
      bio: "Building the future of Web3",
      avatar: null,
      nftProfilePicture: null,
      nftProfileContract: null,
      nftProfileTokenId: null,
      reputationScore: 95,
      skillBadges: ["web3", "defi"],
      verifiedLinks: [],
      isPremium: false,
      premiumExpiresAt: null,
      walletAddress: "0x742d35Cc1234567890123456789012345678901234",
      isVerified: true,
      followingCount: 150,
      followersCount: 2400,
      postsCount: 342,
      createdAt: new Date(),
    };

    const user2: User = {
      id: "user2",
      username: "sarahj",
      displayName: "Sarah Johnson",
      email: "sarah@example.com",
      bio: "Smart contract developer on 0G Chain",
      avatar: null,
      nftProfilePicture: null,
      nftProfileContract: null,
      nftProfileTokenId: null,
      reputationScore: 88,
      skillBadges: ["solidity", "blockchain"],
      verifiedLinks: [],
      isPremium: false,
      premiumExpiresAt: null,
      walletAddress: "0x123d35Cc1234567890123456789012345678901234",
      isVerified: true,
      followingCount: 89,
      followersCount: 1200,
      postsCount: 156,
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const user: User = {
      ...insertUser,
      id,
      nftProfilePicture: insertUser.nftProfilePicture || null,
      nftProfileContract: insertUser.nftProfileContract || null,
      nftProfileTokenId: insertUser.nftProfileTokenId || null,
      reputationScore: insertUser.reputationScore || 0,
      skillBadges: insertUser.skillBadges || [],
      verifiedLinks: insertUser.verifiedLinks || [],
      isPremium: insertUser.isPremium || false,
      premiumExpiresAt: insertUser.premiumExpiresAt || null,
      followingCount: insertUser.followingCount || 0,
      followersCount: insertUser.followersCount || 0,
      postsCount: insertUser.postsCount || 0,
      createdAt: insertUser.createdAt || new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async searchUsers(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values()).filter(user =>
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery)
    );
  }

  // Post methods
  async createPost(insertPost: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      id,
      authorId: insertPost.authorId,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      mediaType: insertPost.mediaType || null,
      mediaStorageHash: insertPost.mediaStorageHash || null,
      storageHash: insertPost.storageHash || null,
      transactionHash: insertPost.transactionHash || null,
      hashtags: insertPost.hashtags || [],
      communityId: insertPost.communityId || null,
      parentPostId: insertPost.parentPostId || null,
      quotedPostId: insertPost.quotedPostId || null,
      isNftContent: insertPost.isNftContent || false,
      nftContractAddress: insertPost.nftContractAddress || null,
      nftTokenId: insertPost.nftTokenId || null,
      isPremiumContent: insertPost.isPremiumContent || false,
      contentCategory: insertPost.contentCategory || null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isAiRecommended: insertPost.isAiRecommended || false,
      createdAt: new Date(),
    };

    this.posts.set(id, post);

    // Increment the author's posts count
    const author = this.users.get(insertPost.authorId);
    if (author) {
      author.postsCount += 1;
      this.users.set(insertPost.authorId, author);
    }

    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit);
    return allPosts;
  }

  async getPostsByUser(userId: string, limit = 10, offset = 0): Promise<Post[]> {
    const userPosts = Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit);
    return userPosts;
  }

  async getPersonalizedFeed(userId: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    return this.getGlobalFeed(userId, limit, offset);
  }

  async getGlobalFeed(currentUserId?: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    const allPosts = await this.getPosts(limit, offset);
    const postsWithAuthor: PostWithAuthor[] = [];

    for (const post of allPosts) {
      let author = await this.getUser(post.authorId);

      // If no user found, try to find by wallet address or create a temp profile for wallet-based posts
      if (!author && post.authorId.startsWith('0x')) {
        author = await this.getUserByWalletAddress(post.authorId);

        if (!author) {
          // Create a temp profile for display purposes
          author = {
            id: post.authorId,
            username: `user_${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            displayName: `User ${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            email: null,
            bio: null,
            avatar: null,
            nftProfilePicture: null,
            nftProfileContract: null,
            nftProfileTokenId: null,
            reputationScore: 0,
            skillBadges: [],
            verifiedLinks: [],
            isPremium: false,
            premiumExpiresAt: null,
            walletAddress: post.authorId,
            isVerified: false,
            followingCount: 0,
            followersCount: 0,
            postsCount: 0,
            createdAt: new Date(),
          };
        }
      }

      if (author) {
        const isLiked = currentUserId ? await this.isPostLiked(currentUserId, post.id) : false;
        const isReposted = currentUserId ? await this.isPostReposted(currentUserId, post.id) : false;

        postsWithAuthor.push({
          ...post,
          author,
          isLiked,
          isReposted,
        });
      }
    }

    return postsWithAuthor;
  }

  async deletePost(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      this.posts.delete(id);
      // Decrement the author's posts count
      const author = this.users.get(post.authorId);
      if (author && author.postsCount > 0) {
        author.postsCount -= 1;
        this.users.set(post.authorId, author);
      }
    }
  }

  // Follow methods
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = {
      id,
      followerId,
      followingId,
      createdAt: new Date(),
    };

    this.follows.set(id, follow);

    // Update following count for follower
    const follower = this.users.get(followerId);
    if (follower) {
      follower.followingCount += 1;
      this.users.set(followerId, follower);
    }

    // Update followers count for followed user
    const followed = this.users.get(followingId);
    if (followed) {
      followed.followersCount += 1;
      this.users.set(followingId, followed);
    }

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // Find and delete the follow relationship
    for (const [id, follow] of this.follows.entries()) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        this.follows.delete(id);
        break;
      }
    }

    // Update following count for follower
    const follower = this.users.get(followerId);
    if (follower && follower.followingCount > 0) {
      follower.followingCount -= 1;
      this.users.set(followerId, follower);
    }

    // Update followers count for followed user
    const followed = this.users.get(followingId);
    if (followed && followed.followersCount > 0) {
      followed.followersCount -= 1;
      this.users.set(followingId, followed);
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingUsers = [];
    for (const follow of this.follows.values()) {
      if (follow.followerId === userId) {
        const user = this.users.get(follow.followingId);
        if (user) followingUsers.push(user);
      }
    }
    return followingUsers;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerUsers = [];
    for (const follow of this.follows.values()) {
      if (follow.followingId === userId) {
        const user = this.users.get(follow.followerId);
        if (user) followerUsers.push(user);
      }
    }
    return followerUsers;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    for (const follow of this.follows.values()) {
      if (follow.followerId === followerId && follow.followingId === followingId) {
        return true;
      }
    }
    return false;
  }

  // Like methods
  async likePost(userId: string, postId: string): Promise<Like> {
    const id = randomUUID();
    const like: Like = {
      id,
      userId,
      postId,
      createdAt: new Date(),
    };

    this.likes.set(id, like);

    // Update likes count in posts
    const post = this.posts.get(postId);
    if (post) {
      post.likesCount += 1;
      this.posts.set(postId, post);
    }

    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    // Find and delete the like
    for (const [id, like] of this.likes.entries()) {
      if (like.userId === userId && like.postId === postId) {
        this.likes.delete(id);
        break;
      }
    }

    // Update likes count in posts
    const post = this.posts.get(postId);
    if (post && post.likesCount > 0) {
      post.likesCount -= 1;
      this.posts.set(postId, post);
    }
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    for (const like of this.likes.values()) {
      if (like.userId === userId && like.postId === postId) {
        return true;
      }
    }
    return false;
  }

  async getPostLikes(postId: string): Promise<Like[]> {
    const postLikes = [];
    for (const like of this.likes.values()) {
      if (like.postId === postId) {
        postLikes.push(like);
      }
    }
    return postLikes;
  }

  // Comment methods
  async createComment(comment: InsertComment & { authorId: string }): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      id,
      postId: comment.postId,
      authorId: comment.authorId,
      content: comment.content,
      parentCommentId: comment.parentCommentId || null,
      replyDepth: 0,
      likesCount: 0,
      repliesCount: 0,
      createdAt: new Date(),
    };

    this.comments.set(id, newComment);

    // Update comments count in posts
    const post = this.posts.get(comment.postId);
    if (post) {
      post.commentsCount += 1;
      this.posts.set(comment.postId, post);
    }

    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<any[]> {
    const postComments = [];
    for (const comment of this.comments.values()) {
      if (comment.postId === postId) {
        const author = this.users.get(comment.authorId);
        postComments.push({
          id: comment.id,
          postId: comment.postId,
          authorId: comment.authorId,
          content: comment.content,
          createdAt: comment.createdAt,
          author: author ? {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar,
            walletAddress: author.walletAddress
          } : null
        });
      }
    }
    return postComments.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    const postComments = [];
    for (const comment of this.comments.values()) {
      if (comment.postId === postId) {
        postComments.push(comment);
      }
    }
    return postComments;
  }

  // Repost methods
  async repostPost(userId: string, postId: string): Promise<Repost> {
    const id = randomUUID();
    const repost: Repost = {
      id,
      userId,
      postId,
      createdAt: new Date(),
    };

    this.reposts.set(id, repost);

    // Update shares count in posts
    const post = this.posts.get(postId);
    if (post) {
      post.sharesCount += 1;
      this.posts.set(postId, post);
    }

    return repost;
  }

  async unrepostPost(userId: string, postId: string): Promise<void> {
    // Find and delete the repost
    for (const [id, repost] of this.reposts.entries()) {
      if (repost.userId === userId && repost.postId === postId) {
        this.reposts.delete(id);
        break;
      }
    }

    // Update shares count in posts
    const post = this.posts.get(postId);
    if (post && post.sharesCount > 0) {
      post.sharesCount -= 1;
      this.posts.set(postId, post);
    }
  }

  async isPostReposted(userId: string, postId: string): Promise<boolean> {
    for (const repost of this.reposts.values()) {
      if (repost.userId === userId && repost.postId === postId) {
        return true;
      }
    }
    return false;
  }

  // Search methods
  async searchPosts(query: string): Promise<Post[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.posts.values()).filter(post =>
      post.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Stats
  async getNetworkStats(): Promise<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postsToday = Array.from(this.posts.values()).filter(post => {
      const postDate = new Date(post.createdAt!);
      postDate.setHours(0, 0, 0, 0);
      return postDate.getTime() === today.getTime();
    });

    return {
      activeUsers: this.users.size,
      postsToday: postsToday.length,
      aiInteractions: 12500,
      dataStored: "2.5 PB",
    };
  }

  // Wave 2: Advanced Social Features Implementation (Stub methods for now)
  async getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
  }): Promise<any[]> {
    // TODO: Implement communities fetching with database queries
    return [];
  }

  async createCommunity(data: any, creatorId: string): Promise<any> {
    // TODO: Implement community creation
    throw new Error("Community creation not yet implemented");
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    // TODO: Implement join community
    throw new Error("Join community not yet implemented");
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    // TODO: Implement leave community
    throw new Error("Leave community not yet implemented");
  }

  async getTrendingHashtags(limit: number, userId?: string): Promise<any[]> {
    // TODO: Implement trending hashtags based on recent usage
    return [
      {
        id: "1",
        name: "0GChain",
        postsCount: 127,
        trendingScore: 95.5,
        isFollowing: false
      },
      {
        id: "2",
        name: "DeSocialAI",
        postsCount: 89,
        trendingScore: 87.2,
        isFollowing: true
      },
      {
        id: "3",
        name: "BlockchainSocial",
        postsCount: 56,
        trendingScore: 76.8,
        isFollowing: false
      }
    ];
  }

  async getPostsByHashtag(hashtagName: string, page: number, limit: number, userId?: string): Promise<any[]> {
    // TODO: Implement hashtag post filtering
    return [];
  }

  async getUserBookmarks(userId: string, page: number, limit: number, collectionId?: string): Promise<any[]> {
    // TODO: Implement user bookmarks fetching
    return [];
  }

  async createBookmark(data: any, userId: string): Promise<any> {
    // TODO: Implement bookmark creation
    throw new Error("Bookmark creation not yet implemented");
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    // TODO: Implement bookmark removal
    throw new Error("Remove bookmark not yet implemented");
  }

  async getUserCollections(userId: string, includeBookmarks?: boolean): Promise<any[]> {
    // TODO: Implement user collections fetching
    return [];
  }

  async createTip(data: any, senderId: string): Promise<any> {
    // TODO: Implement tip creation with 0G Chain transaction
    throw new Error("Tip creation not yet implemented");
  }

  async getReceivedTips(userId: string, page: number, limit: number): Promise<any[]> {
    // TODO: Implement received tips fetching
    return [];
  }

  async getSentTips(userId: string, page: number, limit: number): Promise<any[]> {
    // TODO: Implement sent tips fetching
    return [];
  }

  // Wave 2: Advanced Interaction Features Implementation

  async getComment(commentId: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId));
    return comment || undefined;
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment> {
    const [comment] = await db.update(comments).set(updates).where(eq(comments.id, commentId)).returning();
    if (!comment) throw new Error("Comment not found");
    return comment;
  }

  async getThreadedComments(postId: string, page: number, limit: number): Promise<any[]> {
    const offset = (page - 1) * limit;

    // Get top-level comments first
    const topLevelComments = await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    const commentsWithAuthor = [];

    for (const comment of topLevelComments) {
      const author = await this.getUser(comment.authorId);
      if (author) {
        // Get replies for this comment
        const replies = await this.getCommentReplies(comment.id);

        commentsWithAuthor.push({
          ...comment,
          author: {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar
          },
          replies
        });
      }
    }

    return commentsWithAuthor;
  }

  async getCommentReplies(parentCommentId: string): Promise<any[]> {
    const replies = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, parentCommentId))
      .orderBy(desc(comments.createdAt));

    const repliesWithAuthor = [];

    for (const reply of replies) {
      const author = await this.getUser(reply.authorId);
      if (author) {
        // Recursively get nested replies
        const nestedReplies = await this.getCommentReplies(reply.id);

        repliesWithAuthor.push({
          ...reply,
          author: {
            id: author.id,
            username: author.username,
            displayName: author.displayName,
            avatar: author.avatar
          },
          replies: nestedReplies
        });
      }
    }

    return repliesWithAuthor;
  }

  async getPostCommentsCount(postId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.postId, postId));

    return result[0]?.count || 0;
  }

  async createCommentLike(data: { userId: string; commentId: string }): Promise<any> {
    const [like] = await db.insert(commentLikes).values(data).returning();
    return like;
  }

  async deleteCommentLike(userId: string, commentId: string): Promise<void> {
    await db.delete(commentLikes).where(
      and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId))
    );
  }

  async getCommentLike(userId: string, commentId: string): Promise<any> {
    const [like] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)));

    return like || null;
  }

  async getCommentLikesCount(commentId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(commentLikes)
      .where(eq(commentLikes.commentId, commentId));

    return result[0]?.count || 0;
  }

  async createShare(data: any): Promise<any> {
    const [share] = await db.insert(shares).values(data).returning();
    return share;
  }

  async getPostShares(postId: string, page: number, limit: number): Promise<any[]> {
    const offset = (page - 1) * limit;

    const postShares = await db
      .select()
      .from(shares)
      .where(eq(shares.postId, postId))
      .orderBy(desc(shares.createdAt))
      .limit(limit)
      .offset(offset);

    const sharesWithDetails = [];

    for (const share of postShares) {
      const user = await this.getUser(share.userId);
      const post = await this.getPost(share.postId);

      if (user && post) {
        const postAuthor = await this.getUser(post.authorId);

        sharesWithDetails.push({
          ...share,
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar
          },
          post: {
            ...post,
            author: postAuthor ? {
              id: postAuthor.id,
              username: postAuthor.username,
              displayName: postAuthor.displayName,
              avatar: postAuthor.avatar
            } : null
          }
        });
      }
    }

    return sharesWithDetails;
  }

  async getPostSharesCount(postId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(shares)
      .where(eq(shares.postId, postId));

    return result[0]?.count || 0;
  }

  async getBookmark(userId: string, postId: string): Promise<any> {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));

    return bookmark || null;
  }

  async deleteBookmark(userId: string, postId: string): Promise<void> {
    await db.delete(bookmarks).where(
      and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId))
    );
  }

  async createCollection(data: any): Promise<any> {
    const [collection] = await db.insert(collections).values(data).returning();
    return collection;
  }

  async updateCollection(collectionId: string, updates: any): Promise<any> {
    const [collection] = await db.update(collections).set(updates).where(eq(collections.id, collectionId)).returning();
    if (!collection) throw new Error("Collection not found");
    return collection;
  }

  async getCollectionBookmarksCount(collectionId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .where(eq(bookmarks.collectionId, collectionId));

    return result[0]?.count || 0;
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    const [post] = await db.update(posts).set(updates).where(eq(posts.id, postId)).returning();
    if (!post) throw new Error("Post not found");
    return post;
  }

  async getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>> {
    // TODO: Implement trending topics analysis
    return [
      { topic: "0G Chain", count: 42, sentiment: "positive" },
      { topic: "DeSocialAI", count: 38, sentiment: "positive" },
      { topic: "Decentralization", count: 29, sentiment: "positive" },
    ];
  }

  // Notification methods
  async getNotifications(userId: string): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          metadata: notifications.metadata,
          sender: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatar: users.avatar
          }
        })
        .from(notifications)
        .leftJoin(users, eq(users.id, notifications.senderId))
        .where(eq(notifications.recipientId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);

      return result.map(notification => ({
        ...notification,
        createdAt: notification.createdAt ? notification.createdAt.toISOString() : null
      }));
    } catch (error) {
      console.error('[Get Notifications Error]', error);
      return [];
    }
  }

  async createNotification(data: any): Promise<any> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          recipientId: data.userId,
          senderId: data.senderId || null,
          type: data.type,
          title: data.title,
          message: data.message,
          isRead: data.isRead || false,
          postId: data.metadata?.postId || null,
          commentId: data.metadata?.commentId || null,
          metadata: data.metadata || {}
        })
        .returning();

      console.log(`[NOTIFICATION] ✅ Created notification: ${data.type} for user ${data.userId}`);
      return notification;
    } catch (error) {
      console.error('[Create Notification Error]', error);
      return null;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.recipientId, userId)));

      console.log(`[NOTIFICATION] ✅ Marked notification ${notificationId} as read for user ${userId}`);
    } catch (error) {
      console.error('[Mark Notification Read Error]', error);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.recipientId, userId));

      console.log(`[NOTIFICATION] ✅ Marked all notifications as read for user ${userId}`);
    } catch (error) {
      console.error('[Mark All Notifications Read Error]', error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }
}

// Database Storage Implementation for Persistent Data
export class DatabaseStorage implements IStorage {
  constructor() {
    // Database storage - no initialization needed as data persists
  }

  // User methods - Database Implementation
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      id: insertUser.id || randomUUID(),
      username: insertUser.username,
      displayName: insertUser.displayName,
      email: insertUser.email || null,
      bio: insertUser.bio || null,
      avatar: insertUser.avatar || null,
      walletAddress: insertUser.walletAddress,
      isVerified: insertUser.isVerified || false,
      nftProfilePicture: insertUser.nftProfilePicture || null,
      nftProfileContract: insertUser.nftProfileContract || null,
      nftProfileTokenId: insertUser.nftProfileTokenId || null,
      reputationScore: insertUser.reputationScore || 0,
      skillBadges: insertUser.skillBadges || [],
      verifiedLinks: insertUser.verifiedLinks || [],
      isPremium: insertUser.isPremium || false,
      premiumExpiresAt: insertUser.premiumExpiresAt || null,
      followingCount: insertUser.followingCount || 0,
      followersCount: insertUser.followersCount || 0,
      postsCount: insertUser.postsCount || 0,
      createdAt: insertUser.createdAt || new Date(),
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    const allUsers = await db.select().from(users);
    const lowerQuery = query.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery)
    );
  }

  // For simplicity, delegate other methods to MemStorage temporarily
  // This ensures the app continues working while user data is persistent
  private memStorage = new MemStorage();

  async createPost(insertPost: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post> {
    console.log(`[DEBUG] DatabaseStorage.createPost called for authorId: ${insertPost.authorId}`);

    // Create post in database
    const [post] = await db.insert(posts).values({
      id: randomUUID(),
      authorId: insertPost.authorId,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      mediaType: insertPost.mediaType || null,
      mediaStorageHash: insertPost.mediaStorageHash || null,
      storageHash: insertPost.storageHash || null,
      transactionHash: insertPost.transactionHash || null,
      hashtags: insertPost.hashtags || [],
      communityId: insertPost.communityId || null,
      parentPostId: insertPost.parentPostId || null,
      quotedPostId: insertPost.quotedPostId || null,
      isNftContent: insertPost.isNftContent || false,
      nftContractAddress: insertPost.nftContractAddress || null,
      nftTokenId: insertPost.nftTokenId || null,
      isPremiumContent: insertPost.isPremiumContent || false,
      contentCategory: insertPost.contentCategory || null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isAiRecommended: insertPost.isAiRecommended || false,
      createdAt: new Date(),
    }).returning();

    console.log(`[DEBUG] DatabaseStorage.createPost - post created with ID: ${post.id}`);

    // Update user's post count in database
    try {
      const [updatedUser] = await db.update(users)
        .set({
          postsCount: sql`${users.postsCount} + 1`
        })
        .where(eq(users.id, insertPost.authorId))
        .returning();

      console.log(`[DEBUG] DatabaseStorage.createPost - updated postsCount for user: ${insertPost.authorId}, new count: ${updatedUser?.postsCount}`);
    } catch (error) {
      console.warn(`[DEBUG] DatabaseStorage.createPost - failed to update postsCount for user: ${insertPost.authorId}`, error);
    }

    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.memStorage.getPost(id);
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    console.log(`[DEBUG] DatabaseStorage.getPosts called with limit=${limit}, offset=${offset}`);
    const result = await db.select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
    console.log(`[DEBUG] DatabaseStorage.getPosts returning ${result.length} posts`);
    return result;
  }

  async getPostsByUser(userId: string, limit?: number, offset?: number): Promise<Post[]> {
    return this.memStorage.getPostsByUser(userId, limit, offset);
  }

  async getPersonalizedFeed(userId: string, limit?: number, offset?: number): Promise<PostWithAuthor[]> {
    return this.memStorage.getPersonalizedFeed(userId, limit, offset);
  }

  async getGlobalFeed(currentUserId?: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    console.log(`[DEBUG] DatabaseStorage.getGlobalFeed called with currentUserId=${currentUserId}, limit=${limit}, offset=${offset}`);
    // Use database posts with proper author resolution
    const posts = await this.getPosts(limit, offset);
    console.log(`[DEBUG] DatabaseStorage.getGlobalFeed got ${posts.length} posts from getPosts`);
    const postsWithAuthor: PostWithAuthor[] = [];

    for (const post of posts) {
      let author = await this.getUser(post.authorId);

      // If no user found, try to find by wallet address or create a temp profile for wallet-based posts
      if (!author && post.authorId.startsWith('0x')) {
        author = await this.getUserByWalletAddress(post.authorId);

        if (!author) {
          // Create a temp profile for display purposes
          author = {
            id: post.authorId,
            username: `user_${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            displayName: `User ${post.authorId.substring(0, 6)}...${post.authorId.substring(post.authorId.length - 4)}`,
            email: null,
            bio: null,
            avatar: null,
            nftProfilePicture: null,
            nftProfileContract: null,
            nftProfileTokenId: null,
            reputationScore: 0,
            skillBadges: [],
            verifiedLinks: [],
            isPremium: false,
            premiumExpiresAt: null,
            walletAddress: post.authorId,
            isVerified: false,
            followingCount: 0,
            followersCount: 0,
            postsCount: 0,
            createdAt: new Date(),
          };
        }
      }

      if (author) {
        const isLiked = currentUserId ? await this.isPostLiked(currentUserId, post.id) : false;
        const isReposted = currentUserId ? await this.isPostReposted(currentUserId, post.id) : false;

        postsWithAuthor.push({
          ...post,
          author,
          isLiked,
          isReposted,
        });
      }
    }

    return postsWithAuthor;
  }

  async deletePost(id: string): Promise<void> {
    return this.memStorage.deletePost(id);
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    console.log(`[DEBUG] DatabaseStorage.followUser: ${followerId} follows ${followingId}`);

    // Create follow relationship in database
    const [follow] = await db.insert(follows).values({
      id: randomUUID(),
      followerId,
      followingId,
      createdAt: new Date(),
    }).returning();

    // Update following count for follower
    await db.update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));

    // Update followers count for followed user
    await db.update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, followingId));

    console.log(`[DEBUG] DatabaseStorage.followUser - follow relationship created`);
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    console.log(`[DEBUG] DatabaseStorage.unfollowUser: ${followerId} unfollows ${followingId}`);

    // Remove follow relationship from database
    await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));

    // Update following count for follower
    await db.update(users)
      .set({ followingCount: sql`${users.followingCount} - 1` })
      .where(eq(users.id, followerId));

    // Update followers count for followed user
    await db.update(users)
      .set({ followersCount: sql`${users.followersCount} - 1` })
      .where(eq(users.id, followingId));

    console.log(`[DEBUG] DatabaseStorage.unfollowUser - follow relationship removed`);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingRelations = await db.select()
      .from(follows)
      .where(eq(follows.followerId, userId));

    const followingUsers = await Promise.all(
      followingRelations.map(async (follow) => {
        const user = await this.getUser(follow.followingId);
        return user!;
      })
    );

    return followingUsers.filter(Boolean);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerRelations = await db.select()
      .from(follows)
      .where(eq(follows.followingId, userId));

    const followerUsers = await Promise.all(
      followerRelations.map(async (follow) => {
        const user = await this.getUser(follow.followerId);
        return user!;
      })
    );

    return followerUsers.filter(Boolean);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await db.select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);

    return follow.length > 0;
  }

  // Utility method to sync user counts with actual database data
  async syncUserCounts(userId: string): Promise<void> {
    console.log(`[DEBUG] DatabaseStorage.syncUserCounts for user: ${userId}`);

    // Count actual posts
    const postsResult = await db.select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.authorId, userId));
    const actualPostsCount = postsResult[0]?.count || 0;

    // Count actual following relationships
    const followingResult = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));
    const actualFollowingCount = followingResult[0]?.count || 0;

    // Count actual followers
    const followersResult = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));
    const actualFollowersCount = followersResult[0]?.count || 0;

    // Update user with correct counts
    await db.update(users)
      .set({
        postsCount: actualPostsCount,
        followingCount: actualFollowingCount,
        followersCount: actualFollowersCount
      })
      .where(eq(users.id, userId));

    console.log(`[DEBUG] DatabaseStorage.syncUserCounts completed - Posts: ${actualPostsCount}, Following: ${actualFollowingCount}, Followers: ${actualFollowersCount}`);
  }

  async likePost(userId: string, postId: string): Promise<Like> {
    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    if (existingLike.length > 0) {
      throw new Error("Post already liked");
    }

    // Create new like
    const [newLike] = await db
      .insert(likes)
      .values({ userId, postId })
      .returning();

    // Update post likes count
    const currentPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (currentPost.length > 0) {
      await db
        .update(posts)
        .set({ likesCount: (currentPost[0].likesCount || 0) + 1 })
        .where(eq(posts.id, postId));
    }

    return newLike;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    // Delete the like
    const deletedLikes = await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .returning();

    if (deletedLikes.length === 0) {
      throw new Error("Like not found");
    }

    // Update post likes count
    const currentPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (currentPost.length > 0) {
      await db
        .update(posts)
        .set({ likesCount: Math.max(0, (currentPost[0].likesCount || 0) - 1) })
        .where(eq(posts.id, postId));
    }
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);

    return existingLike.length > 0;
  }

  async getPostLikes(postId: string): Promise<Like[]> {
    const postLikes = await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));

    return postLikes;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    // Create new comment
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();

    // Update post comments count
    const currentPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, comment.postId))
      .limit(1);

    if (currentPost.length > 0) {
      await db
        .update(posts)
        .set({ commentsCount: (currentPost[0].commentsCount || 0) + 1 })
        .where(eq(posts.id, comment.postId));
    }

    return newComment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const postComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
        content: comments.content,
        parentCommentId: comments.parentCommentId,
        replyDepth: comments.replyDepth,
        likesCount: comments.likesCount,
        repliesCount: comments.repliesCount,
        createdAt: comments.createdAt,
        // Include author info
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatar: users.avatar,
          isVerified: users.isVerified,
          walletAddress: users.walletAddress
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    return postComments.map(comment => ({
      ...comment,
      author: comment.author.id ? comment.author : null
    })) as Comment[];
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    return this.getCommentsByPost(postId);
  }

  async repostPost(userId: string, postId: string): Promise<Repost> {
    return this.memStorage.repostPost(userId, postId);
  }

  async unrepostPost(userId: string, postId: string): Promise<void> {
    return this.memStorage.unrepostPost(userId, postId);
  }

  async isPostReposted(userId: string, postId: string): Promise<boolean> {
    return this.memStorage.isPostReposted(userId, postId);
  }

  async searchPosts(query: string): Promise<Post[]> {
    return this.memStorage.searchPosts(query);
  }

  async getNetworkStats(): Promise<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
  }> {
    return this.memStorage.getNetworkStats();
  }

  async getTrendingTopics(): Promise<Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>> {
    return this.memStorage.getTrendingTopics();
  }

  async getCommunities(params: {
    page: number;
    limit: number;
    search?: string;
    userId?: string;
  }): Promise<any[]> {
    return this.memStorage.getCommunities(params);
  }

  async createCommunity(data: any, creatorId: string): Promise<any> {
    return this.memStorage.createCommunity(data, creatorId);
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    return this.memStorage.joinCommunity(communityId, userId);
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    return this.memStorage.leaveCommunity(communityId, userId);
  }

  async getTrendingHashtags(limit: number, userId?: string): Promise<any[]> {
    return this.memStorage.getTrendingHashtags(limit, userId);
  }

  async getPostsByHashtag(hashtagName: string, page: number, limit: number, userId?: string): Promise<any[]> {
    return this.memStorage.getPostsByHashtag(hashtagName, page, limit, userId);
  }

  async getUserBookmarks(userId: string, page: number, limit: number, collectionId?: string): Promise<any[]> {
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: bookmarks.id,
        userId: bookmarks.userId,
        postId: bookmarks.postId,
        collectionId: bookmarks.collectionId,
        createdAt: bookmarks.createdAt,
        post: {
          id: posts.id,
          content: posts.content,
          authorId: posts.authorId,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          createdAt: posts.createdAt,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatar: users.avatar,
            isVerified: users.isVerified
          }
        }
      })
      .from(bookmarks)
      .leftJoin(posts, eq(bookmarks.postId, posts.id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    if (collectionId) {
      query = query.where(and(eq(bookmarks.userId, userId), eq(bookmarks.collectionId, collectionId)));
    }

    const result = await query;

    return result.map(bookmark => ({
      ...bookmark,
      post: bookmark.post.id ? {
        ...bookmark.post,
        author: bookmark.post.author.id ? bookmark.post.author : null
      } : null
    })).filter(bookmark => bookmark.post);
  }

  async createBookmark(data: any, userId?: string): Promise<any> {
    const bookmarkData = {
      userId: data.userId || userId,
      postId: data.postId,
      collectionId: data.collectionId || null,
    };

    const [bookmark] = await db
      .insert(bookmarks)
      .values(bookmarkData)
      .returning();

    return bookmark;
  }

  async removeBookmark(postId: string, userId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
  }

  async getUserCollections(userId: string, includeBookmarks?: boolean): Promise<any[]> {
    return this.memStorage.getUserCollections(userId, includeBookmarks);
  }

  async createCollection(data: any, userId: string): Promise<any> {
    return this.memStorage.createCollection(data, userId);
  }

  async createTip(data: any, senderId: string): Promise<any> {
    return this.memStorage.createTip(data, senderId);
  }

  async getReceivedTips(userId: string, page: number, limit: number): Promise<any[]> {
    return this.memStorage.getReceivedTips(userId, page, limit);
  }

  async getSentTips(userId: string, page: number, limit: number): Promise<any[]> {
    return this.memStorage.getSentTips(userId, page, limit);
  }

  async getComment(commentId: string): Promise<Comment | undefined> {
    return this.memStorage.getComment(commentId);
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment> {
    return this.memStorage.updateComment(commentId, updates);
  }

  async getThreadedComments(postId: string, page: number, limit: number): Promise<any[]> {
    return this.memStorage.getThreadedComments(postId, page, limit);
  }

  async getPostCommentsCount(postId: string): Promise<number> {
    return this.memStorage.getPostCommentsCount(postId);
  }

  async createCommentLike(data: { userId: string; commentId: string }): Promise<any> {
    return this.memStorage.createCommentLike(data);
  }

  async deleteCommentLike(userId: string, commentId: string): Promise<void> {
    return this.memStorage.deleteCommentLike(userId, commentId);
  }

  async getCommentLike(userId: string, commentId: string): Promise<any> {
    return this.memStorage.getCommentLike(userId, commentId);
  }

  async getCommentLikesCount(commentId: string): Promise<number> {
    return this.memStorage.getCommentLikesCount(commentId);
  }

  async createShare(data: any): Promise<any> {
    return this.memStorage.createShare(data);
  }

  async getPostShares(postId: string, page: number, limit: number): Promise<any[]> {
    return this.memStorage.getPostShares(postId, page, limit);
  }

  async getPostSharesCount(postId: string): Promise<number> {
    return this.memStorage.getPostSharesCount(postId);
  }

  async getBookmark(userId: string, postId: string): Promise<any> {
    return this.memStorage.getBookmark(userId, postId);
  }

  async deleteBookmark(userId: string, postId: string): Promise<void> {
    return this.memStorage.deleteBookmark(userId, postId);
  }

  async updateCollection(collectionId: string, updates: any): Promise<any> {
    return this.memStorage.updateCollection(collectionId, updates);
  }

  async getCollectionBookmarksCount(collectionId: string): Promise<number> {
    return this.memStorage.getCollectionBookmarksCount(collectionId);
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    return this.memStorage.updatePost(postId, updates);
  }

  async getNotifications(userId: string): Promise<any[]> {
    return this.memStorage.getNotifications(userId);
  }

  async createNotification(data: any): Promise<any> {
    return this.memStorage.createNotification(data);
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    return this.memStorage.markNotificationAsRead(notificationId, userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.memStorage.markAllNotificationsAsRead(userId);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}

export const storage = new DatabaseStorage();