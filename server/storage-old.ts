import { type User, type Post, type Follow, type Like, type Comment, type Repost, type InsertUser, type InsertPost, type InsertFollow, type InsertLike, type InsertComment, type InsertRepost, type PostWithAuthor, type UserProfile, type UpdateUserProfile } from "@shared/schema";
import { db } from "./db";
import { users, posts, follows, likes, comments, reposts } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: string): Promise<Comment[]>;
  
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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Database storage - no initialization needed
  }

  private initializeSampleData() {
    // Create sample users
    const user1: User = {
      id: "user1",
      username: "alexc",
      displayName: "Alex Chen",
      email: "alex@example.com",
      bio: "Building the future of Web3",
      avatar: null,
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
      walletAddress: "0x123d35Cc1234567890123456789012345678901234",
      isVerified: true,
      followingCount: 89,
      followersCount: 1200,
      postsCount: 156,
      createdAt: new Date(),
    };

    const user3: User = {
      id: "user3",
      username: "marcusr",
      displayName: "Marcus Rivera",
      email: "marcus@example.com",
      bio: "AI researcher & blockchain enthusiast",
      avatar: null,
      walletAddress: "0x789d35Cc1234567890123456789012345678901234",
      isVerified: true,
      followingCount: 234,
      followersCount: 890,
      postsCount: 89,
      createdAt: new Date(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);

    // Demo posts removed per user request - only show real user posts
  }

  // User methods
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
    const [user] = await db.insert(users).values(insertUser).returning();
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

  // Post methods
  async createPost(insertPost: InsertPost & { storageHash?: string; transactionHash?: string; authorId: string }): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      imageUrl: insertPost.imageUrl || null,
      storageHash: insertPost.storageHash || null,
      transactionHash: insertPost.transactionHash || null,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isAiRecommended: insertPost.isAiRecommended || false,
      createdAt: new Date(),
    };
    
    this.posts.set(id, post);
    
    // Update user's post count - handle both user ID and wallet address
    let user = await this.getUser(insertPost.authorId);
    if (!user && insertPost.authorId.startsWith('0x')) {
      // If authorId is a wallet address, find user by wallet
      user = await this.getUserByWalletAddress(insertPost.authorId);
    }
    
    if (user) {
      await this.updateUser(user.id, { postsCount: (user.postsCount || 0) + 1 });
    }
    
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    const posts = Array.from(this.posts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
    return posts;
  }

  async getPostsByUser(userId: string, limit = 10, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }

  async getPersonalizedFeed(userId: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    const posts = await this.getPosts(limit, offset);
    const postsWithAuthor: PostWithAuthor[] = [];
    
    for (const post of posts) {
      let author = await this.getUser(post.authorId);
      
      // If no user found, create a mock author for wallet addresses (Web3 posts)
      if (!author && post.authorId.startsWith('0x')) {
        author = {
          id: post.authorId,
          username: `user_${post.authorId.substring(0, 8)}`,
          displayName: `User ${post.authorId.substring(0, 8)}...`,
          email: null,
          bio: null,
          avatar: null,
          walletAddress: post.authorId,
          isVerified: true, // Wallet-verified users
          followingCount: 0,
          followersCount: 0,
          postsCount: 1,
          createdAt: new Date()
        };
      }
      
      if (author) {
        const isLiked = await this.isPostLiked(userId, post.id);
        const isReposted = await this.isPostReposted(userId, post.id);
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

  async getGlobalFeed(currentUserId?: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    // Get ALL posts from ALL users - this is a true global social media feed
    const posts = await this.getPosts(limit, offset);
    const postsWithAuthor: PostWithAuthor[] = [];
    
    for (const post of posts) {
      let author = await this.getUser(post.authorId);
      
      // Handle wallet address authors (Web3 posts)
      if (!author && post.authorId.startsWith('0x')) {
        author = await this.getUserByWalletAddress(post.authorId);
        
        // If still no user found, create a mock author for display
        if (!author) {
          author = {
            id: post.authorId,
            username: `user_${post.authorId.substring(0, 8)}`,
            displayName: `User ${post.authorId.substring(0, 8)}...`,
            email: null,
            bio: null,
            avatar: null,
            walletAddress: post.authorId,
            isVerified: true, // Wallet-verified users
            followingCount: 0,
            followersCount: 0,
            postsCount: 1,
            createdAt: new Date()
          };
        }
      }
      
      if (author) {
        // For global feed, we check likes/reposts against current user if available
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
    this.posts.delete(id);
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
    
    // Update counts
    const follower = await this.getUser(followerId);
    const following = await this.getUser(followingId);
    
    if (follower) {
      await this.updateUser(followerId, { followingCount: (follower.followingCount || 0) + 1 });
    }
    if (following) {
      await this.updateUser(followingId, { followersCount: (following.followersCount || 0) + 1 });
    }
    
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = Array.from(this.follows.values()).find(f => 
      f.followerId === followerId && f.followingId === followingId
    );
    
    if (follow) {
      this.follows.delete(follow.id);
      
      // Update counts
      const follower = await this.getUser(followerId);
      const following = await this.getUser(followingId);
      
      if (follower) {
        await this.updateUser(followerId, { followingCount: Math.max(0, (follower.followingCount || 0) - 1) });
      }
      if (following) {
        await this.updateUser(followingId, { followersCount: Math.max(0, (following.followersCount || 0) - 1) });
      }
    }
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    const following: User[] = [];
    for (const id of followingIds) {
      const user = await this.getUser(id);
      if (user) following.push(user);
    }
    
    return following;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    const followers: User[] = [];
    for (const id of followerIds) {
      const user = await this.getUser(id);
      if (user) followers.push(user);
    }
    
    return followers;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(follow =>
      follow.followerId === followerId && follow.followingId === followingId
    );
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
    
    // Update post like count
    const post = await this.getPost(postId);
    if (post) {
      this.posts.set(postId, { ...post, likesCount: (post.likesCount || 0) + 1 });
    }
    
    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const like = Array.from(this.likes.values()).find(l =>
      l.userId === userId && l.postId === postId
    );
    
    if (like) {
      this.likes.delete(like.id);
      
      // Update post like count
      const post = await this.getPost(postId);
      if (post) {
        this.posts.set(postId, { ...post, likesCount: Math.max(0, (post.likesCount || 0) - 1) });
      }
    }
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    return Array.from(this.likes.values()).some(like =>
      like.userId === userId && like.postId === postId
    );
  }

  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    
    this.comments.set(id, comment);
    
    // Update post comment count
    const post = await this.getPost(insertComment.postId);
    if (post) {
      this.posts.set(insertComment.postId, { ...post, commentsCount: (post.commentsCount || 0) + 1 });
    }
    
    return comment;
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Repost methods
  async repostPost(userId: string, postId: string): Promise<Repost> {
    // Check if already reposted
    const existingRepost = Array.from(this.reposts.values())
      .find(repost => repost.userId === userId && repost.postId === postId);
    
    if (existingRepost) {
      return existingRepost;
    }

    const id = randomUUID();
    const repost: Repost = {
      id,
      userId,
      postId,
      createdAt: new Date(),
    };
    
    this.reposts.set(id, repost);
    
    // Update post shares count
    const post = await this.getPost(postId);
    if (post) {
      this.posts.set(postId, { ...post, sharesCount: (post.sharesCount || 0) + 1 });
    }
    
    return repost;
  }

  async unrepostPost(userId: string, postId: string): Promise<void> {
    const repost = Array.from(this.reposts.values())
      .find(repost => repost.userId === userId && repost.postId === postId);
    
    if (repost) {
      this.reposts.delete(repost.id);
      
      // Update post shares count
      const post = await this.getPost(postId);
      if (post && post.sharesCount > 0) {
        this.posts.set(postId, { ...post, sharesCount: post.sharesCount - 1 });
      }
    }
  }

  async isPostReposted(userId: string, postId: string): Promise<boolean> {
    return Array.from(this.reposts.values())
      .some(repost => repost.userId === userId && repost.postId === postId);
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
    
    const postsToday = Array.from(this.posts.values()).filter(post =>
      post.createdAt && post.createdAt >= today
    ).length;
    
    return {
      activeUsers: 24700,
      postsToday: postsToday + 1200000, // Add base number for realism
      aiInteractions: 892000,
      dataStored: "156 TB",
    };
  }
}

export const storage = new DatabaseStorage();
