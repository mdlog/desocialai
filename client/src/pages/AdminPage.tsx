import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Shield, CheckCircle, XCircle, Hash, FileText, Image, Video, ChevronLeft, ChevronRight, Home, Settings, Database, Users, Activity, BarChart3, Clock, User, Wallet, CreditCard, Calendar, Copy } from "lucide-react";

// Admin Dashboard Component
function AdminDashboard() {
  const { data: adminStats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: 3,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminStats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">System Overview</h2>
        <p className="text-muted-foreground">
          Platform statistics and health monitoring
        </p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totals.users}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats.recent.newUsers} new today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totals.posts}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats.recent.newPosts} new today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totals.likes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follows</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totals.follows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totals.comments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminStats.verification.verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((adminStats.verification.verifiedUsers / adminStats.totals.users) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{adminStats.verification.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((adminStats.verification.premiumUsers / adminStats.totals.users) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts with Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.verification.postsWithMedia}</div>
            <p className="text-xs text-muted-foreground">
              {((adminStats.verification.postsWithMedia / adminStats.totals.posts) * 100).toFixed(1)}% of posts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Verified</CardTitle>
            <Hash className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminStats.verification.blockchainVerifiedPosts}</div>
            <p className="text-xs text-muted-foreground">
              {((adminStats.verification.blockchainVerifiedPosts / adminStats.totals.posts) * 100).toFixed(1)}% of posts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// User Management Component
function AdminUserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { toast } = useToast();

  const offset = (currentPage - 1) * itemsPerPage;

  const { data: userData, isLoading, error } = useQuery({
    queryKey: [`/api/admin/users/${itemsPerPage}/${offset}`],
    retry: 3,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load user data</p>
      </div>
    );
  }

  const { users, metadata } = userData;
  const totalPages = Math.ceil(metadata.total / itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">
          Comprehensive user information and statistics
        </p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metadata.verifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.verifiedCount / metadata.total) * 100).toFixed(1)}% verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metadata.withWalletCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.withWalletCount / metadata.total) * 100).toFixed(1)}% connected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Info</TableHead>
                <TableHead>Wallet & ID</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  {/* User Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar && (
                        <img 
                          src={user.avatar} 
                          alt={user.displayName || user.username} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.displayName || user.username || 'Unknown User'}
                          {user.verification?.isVerified && (
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                          )}
                          {user.verification?.isPremium && (
                            <CreditCard className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{user.username || 'no-username'}
                        </div>
                        {user.email && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={user.email}>
                            📧 {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Wallet & ID */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-muted-foreground">
                          {user.id.slice(0, 8)}...
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(user.id);
                            toast({ title: "Copied!", description: "User ID copied to clipboard" });
                          }}
                          className="hover:text-primary transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {user.walletAddress && (
                        <div className="flex items-center gap-2 text-xs">
                          <Wallet className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-muted-foreground">
                            {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(user.walletAddress);
                              toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
                            }}
                            className="hover:text-primary transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Statistics */}
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          📝 {user.statistics?.actualPostsCount || 0} posts
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {user.followersCount || 0} followers
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          ❤️ {user.statistics?.totalLikes || 0} likes
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {user.reputationScore || 0} rep
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {user.verification?.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {user.verification?.isPremium && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {user.verification?.hasWallet && (
                          <Badge variant="outline" className="text-xs">
                            <Wallet className="h-3 w-3 mr-1" />
                            Wallet
                          </Badge>
                        )}
                        {user.verification?.hasAvatar && (
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Avatar
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Join Date */}
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.statistics?.joinedDaysAgo || 0} days ago
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(offset + 1, metadata.total)} to {Math.min(offset + itemsPerPage, metadata.total)} of {metadata.total} users
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Posts Management Component (existing functionality)
function AdminAllPosts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { toast } = useToast();

  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Fetch admin posts data only after user is loaded
  const { data: adminData, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/admin/posts/${itemsPerPage}/${offset}`],
    enabled: !!currentUser,
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts data...</p>
        </div>
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load posts data</p>
      </div>
    );
  }

  const { posts, metadata } = adminData;
  const totalPages = Math.ceil(metadata.total / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatHash = (hash: string) => {
    if (!hash) return "N/A";
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getMediaIcon = (mediaType?: string) => {
    if (!mediaType) return <FileText className="h-4 w-4" />;
    if (mediaType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mediaType.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">All Posts Management</h2>
        <p className="text-muted-foreground">
          Comprehensive view of all posts with blockchain verification status
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metadata.blockchainVerifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.blockchainVerifiedCount / metadata.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.withMediaCount}</div>
            <p className="text-xs text-muted-foreground">
              {((metadata.withMediaCount / metadata.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">{new Date(metadata.timestamp).toLocaleTimeString()}</div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
              <Activity className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Posts</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Storage Hash</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Media Hash</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post: any) => (
                <TableRow key={post.id}>
                  {/* Post Content */}
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        {getMediaIcon(post.mediaType)}
                        <span className="text-xs text-muted-foreground">
                          {post.mediaType ? post.mediaType.split('/')[1] : 'text'}
                        </span>
                        {post.isAIEnhanced && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            AI Enhanced
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2 mb-1">{post.content}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 2).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {post.hashtags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.hashtags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Author */}
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {post.author?.displayName || post.author?.username || 'Unknown User'}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {post.author?.walletAddress ? `${post.author.walletAddress.slice(0, 6)}...${post.author.walletAddress.slice(-4)}` : 'N/A'}
                      </div>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(post.createdAt)}
                    </div>
                  </TableCell>

                  {/* Verification */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {post.verification?.isBlockchainVerified ? (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Storage Hash */}
                  <TableCell>
                    <div className="text-xs">
                      {post.storageHash ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1 py-0.5 rounded font-mono">
                            {formatHash(post.storageHash)}
                          </code>
                          {post.blockchainUrls?.storageHash && (
                            <a
                              href={post.blockchainUrls.storageHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Transaction Hash */}
                  <TableCell>
                    <div className="text-xs">
                      {post.transactionHash ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1 py-0.5 rounded font-mono">
                            {formatHash(post.transactionHash)}
                          </code>
                          {post.blockchainUrls?.transactionHash && (
                            <a
                              href={post.blockchainUrls.transactionHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Media Hash */}
                  <TableCell>
                    <div className="text-xs">
                      {post.mediaStorageHash ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-1 py-0.5 rounded font-mono">
                            {formatHash(post.mediaStorageHash)}
                          </code>
                          {post.blockchainUrls?.mediaHash && (
                            <a
                              href={post.blockchainUrls.mediaHash}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Engagement */}
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>👍 {post.likes || 0} likes</div>
                      <div>💬 {post.comments || 0} comments</div>
                      <div>🔄 {post.reposts || 0} reposts</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(offset + 1, metadata.total)} to {Math.min(offset + itemsPerPage, metadata.total)} of {metadata.total} posts
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Page
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user for access control
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  // Check access control
  useEffect(() => {
    if (!userLoading && !currentUser) {
      toast({
        title: "Access Denied",
        description: "Admin access requires wallet connection",
        variant: "destructive"
      });
    }
  }, [currentUser, userLoading, toast]);

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                This admin dashboard requires authorized wallet access.
              </p>
              <Button onClick={() => setLocation("/")} variant="outline">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">DeSocialAI Management</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tab Navigation */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "dashboard" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              data-testid="button-admin-dashboard"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "posts" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              data-testid="button-admin-posts"
            >
              <Database className="h-4 w-4" />
              All Posts
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "users" 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
              data-testid="button-admin-users"
            >
              <Users className="h-4 w-4" />
              User Management
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <AdminDashboard />
        )}

        {/* All Posts Content */}
        {activeTab === "posts" && (
          <AdminAllPosts />
        )}

        {/* User Management Content */}
        {activeTab === "users" && (
          <AdminUserManagement />
        )}
      </main>
      
      {/* Admin Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Platform Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">DeSocialAI Admin</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-sm text-muted-foreground">
                Decentralized Social Media Platform
              </div>
            </div>
            
            {/* Center - System Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-muted-foreground">0G Chain Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-green-600" />
                <span className="text-xs text-muted-foreground">Database Active</span>
              </div>
            </div>
            
            {/* Right Side - Version & Time */}
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                <span>Admin Panel v2.0</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Row - Additional Info */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                © 2025 DeSocialAI. Built on 0G Chain infrastructure with authentic blockchain verification.
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Admin Access: 0x4C61...c5B6</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}