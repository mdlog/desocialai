import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LazyPostCard } from "@/components/posts/lazy-post-card";
import { useAuth } from "@/hooks/use-auth";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Header } from "@/components/layout/header";
import { ProfileStatsSkeleton } from "@/components/ui/loading-skeletons";

import { Footer } from "@/components/layout/footer";
import { NFTAvatar } from "@/components/profile/nft-avatar";
import { ReputationSystem } from "@/components/profile/reputation-system";
import { SkillBadges } from "@/components/profile/skill-badges";
import { VerifiedLinks } from "@/components/profile/verified-links";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  Settings,
  UserPlus,
  UserMinus,
  Trophy,
  Verified
} from "lucide-react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
}

export function ProfilePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  // Extract username from params
  const username = params.username;
  const isOwnProfile = !username; // If no username in URL, it's own profile

  // Fetch user profile data
  const { data: profileUser, isLoading: profileLoading } = useQuery({
    queryKey: ['users', 'profile', username || 'me'],
    queryFn: async () => {
      if (isOwnProfile) {
        // For own profile, use /api/users/me
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('User not found');
        return response.json();
      } else {
        // For other users, use /api/users/profile/:username
        const response = await fetch(`/api/users/profile/${username}`);
        if (!response.ok) throw new Error('User not found');
        return response.json();
      }
    },
    enabled: isOwnProfile || !!username,
  });

  // Fetch user posts with pagination
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'user', profileUser?.id, currentPage, postsPerPage],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const offset = (currentPage - 1) * postsPerPage;
      const response = await fetch(`/api/posts/user/${profileUser.id}?limit=${postsPerPage}&offset=${offset}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  // Fetch total posts count for pagination
  const { data: totalPostsCount } = useQuery({
    queryKey: ['posts', 'user', 'count', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return 0;
      // Get user stats which includes posts count
      const response = await fetch(`/api/users/${profileUser.id}/stats`);
      if (!response.ok) return 0;
      const stats = await response.json();
      return stats.postsCount || 0;
    },
    enabled: !!profileUser?.id,
  });

  // Fetch liked posts (currently disabled as endpoint returns empty array)
  const { data: likedPosts, isLoading: likedLoading } = useQuery({
    queryKey: ['posts', 'liked', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const response = await fetch(`/api/users/${profileUser.id}/liked`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: false, // Disabled until backend implements liked posts functionality
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['users', 'stats', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return { postsCount: 0, followersCount: 0, followingCount: 0, likesReceived: 0 };
      const response = await fetch(`/api/users/${profileUser.id}/stats`);
      if (!response.ok) return { postsCount: 0, followersCount: 0, followingCount: 0, likesReceived: 0 };
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  // Fetch follow status
  const { data: followStatus } = useQuery({
    queryKey: ['follow', 'status', currentUser?.id, profileUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !profileUser?.id || currentUser.id === profileUser.id) return false;
      const response = await fetch(`/api/follows/check/${profileUser.id}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.isFollowing || false;
    },
    enabled: !!currentUser?.id && !!profileUser?.id && currentUser.id !== profileUser.id,
  });

  // Handler functions
  const handleFollow = async () => {
    if (!profileUser?.id || !currentUser?.id) return;
    try {
      const response = await fetch(`/api/users/${profileUser.id}/follow`, {
        method: followStatus ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setIsFollowing(!followStatus);
        // Refetch follow status
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  // Pagination functions
  const totalPages = Math.ceil((totalPostsCount || 0) / postsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle message button click
  const handleMessage = async () => {
    if (!profileUser?.id || !currentUser?.id) return;

    try {
      // Navigate to messages page with target user parameter
      // The conversation will be created automatically by the backend
      setLocation(`/messages?user=${profileUser.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Loading and error states
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="relative h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative -mt-32 container mx-auto px-4">
          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-3 flex-1">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h1>
            <p className="text-gray-600 dark:text-gray-400">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Hero Section with Cover */}
      <div className="relative h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Main Profile Content */}
      <div className="relative -mt-32 container mx-auto px-4">

        {/* Profile Card */}
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-2xl">
          <CardContent className="p-8">

            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">

              {/* Left Side - Avatar & Basic Info */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <NFTAvatar
                  user={profileUser}
                  size="xl"
                  isOwner={isOwnProfile}
                />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="profile-display-name">
                      {profileUser.displayName || profileUser.username}
                    </h1>
                    <Verified className="w-6 h-6 text-blue-500" />
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      Pro
                    </Badge>
                  </div>

                  <p className="text-lg text-gray-600 dark:text-gray-300" data-testid="profile-username">
                    @{profileUser.username}
                  </p>

                  {profileUser.bio && (
                    <p className="text-gray-700 dark:text-gray-300 max-w-md leading-relaxed" data-testid="profile-bio">
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Profile Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      0G Network
                    </div>
                    {profileUser.email && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" />
                        {profileUser.email}
                      </div>
                    )}
                  </div>

                  {/* Wallet Info */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-mono text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {profileUser.walletAddress ? `${profileUser.walletAddress.slice(0, 6)}...${profileUser.walletAddress.slice(-4)}` : 'No wallet'}
                  </div>

                  {/* Additional Profile Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                    {profileUser.reputationScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Reputation: {profileUser.reputationScore}
                      </div>
                    )}
                    {profileUser.isPremium && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 dark:from-yellow-900 dark:to-orange-900 dark:text-orange-300">
                        <Trophy className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {profileUser.isVerified && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <Button
                    onClick={() => setShowEditDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    data-testid="button-edit-profile"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={followStatus ? "outline" : "default"}
                      onClick={handleFollow}
                      className={followStatus
                        ? "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      }
                      data-testid="button-follow"
                    >
                      {followStatus ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMessage}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-700 dark:hover:text-blue-300"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Stats Section */}
            {!stats ? (
              <ProfileStatsSkeleton />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-posts">
                    {stats?.postsCount || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Posts</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-followers">
                    {stats?.followersCount || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Followers</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="stat-following">
                    {stats?.followingCount || 0}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Following</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400" data-testid="stat-likes">
                    {stats?.likesReceived || 0}
                  </div>
                  <div className="text-sm text-pink-700 dark:text-pink-300 font-medium">Likes</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Profile Features */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReputationSystem user={profileUser} isLoading={profileLoading} />
          <SkillBadges user={profileUser} isOwner={isOwnProfile} isLoading={profileLoading} />
        </div>

        <div className="mt-6">
          <VerifiedLinks user={profileUser} isOwner={isOwnProfile} isLoading={profileLoading} />
        </div>

        {/* Content Tabs */}
        <div className="mt-8">
          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
            <Tabs defaultValue="posts" className="w-full">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="posts"
                    className="px-6 py-4 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Posts ({totalPostsCount || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="liked"
                    className="px-6 py-4 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
                    disabled
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Liked (Coming Soon)
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="px-6 py-4 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Achievements
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="posts" className="p-6">
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : userPosts && userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {/* Posts Grid - 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userPosts.map((post) => (
                        <LazyPostCard key={post.id} post={post} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>

                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={currentPage === page
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                                : ""
                              }
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Page Info */}
                    {totalPages > 1 && (
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages} • Showing {userPosts.length} posts
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {isOwnProfile ? "You haven't posted anything yet" : `${profileUser.displayName || profileUser.username} hasn't posted anything yet`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {isOwnProfile ? "Share your thoughts with the DeSocialAI community!" : "Check back later for new posts."}
                    </p>
                    {isOwnProfile && (
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        Create Your First Post
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="liked" className="p-6">
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Liked Posts Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    We're working on bringing you the ability to see liked posts. This feature will be available soon!
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="media" className="p-6">
                <div className="space-y-6">
                  {/* NFT Profile Section */}
                  {profileUser.nftProfilePicture && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Images className="w-5 h-5" />
                          NFT Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <img
                            src={profileUser.nftProfilePicture}
                            alt="NFT Profile"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">NFT Profile Picture</p>
                            {profileUser.nftProfileContract && (
                              <p className="text-sm text-gray-500 font-mono">
                                Contract: {profileUser.nftProfileContract.slice(0, 6)}...{profileUser.nftProfileContract.slice(-4)}
                              </p>
                            )}
                            {profileUser.nftProfileTokenId && (
                              <p className="text-sm text-gray-500">
                                Token ID: {profileUser.nftProfileTokenId}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Skill Badges */}
                  {profileUser.skillBadges && profileUser.skillBadges.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          Skill Badges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.skillBadges.map((badge, index) => (
                            <Badge key={index} variant="secondary" className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-300">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Verified Links */}
                  {profileUser.verifiedLinks && profileUser.verifiedLinks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Verified className="w-5 h-5" />
                          Verified Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {profileUser.verifiedLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <LinkIcon className="w-4 h-4 text-blue-500" />
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {link.platform || link.url}
                              </a>
                              <Verified className="w-4 h-4 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Default message if no media content */}
                  {(!profileUser.nftProfilePicture && (!profileUser.skillBadges || profileUser.skillBadges.length === 0) && (!profileUser.verifiedLinks || profileUser.verifiedLinks.length === 0)) && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-full flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {isOwnProfile ? "Enhance Your Profile" : "No Media Content"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        {isOwnProfile
                          ? "Add NFT profile pictures, skill badges, and verified links to showcase your achievements."
                          : "This user hasn't added any media content yet."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16">
        <Footer />
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={profileUser}
        trigger={
          isOwnProfile ? (
            <Button className="hidden">
              Hidden Trigger
            </Button>
          ) : null
        }
      />
    </div>
  );
}