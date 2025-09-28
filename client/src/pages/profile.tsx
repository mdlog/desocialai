import { useParams } from "wouter";
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

interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
}

export function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
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

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'user', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const response = await fetch(`/api/posts/user/${profileUser.id}`);
      return response.json();
    },
    enabled: !!profileUser?.id,
  });

  // Fetch liked posts
  const { data: likedPosts, isLoading: likedLoading } = useQuery({
    queryKey: ['posts', 'liked', profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];
      const response = await fetch(`/api/posts/liked/${profileUser.id}`);
      return response.json();
    },
    enabled: !!profileUser?.id,
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

  // Handler functions
  const handleFollow = async () => {
    if (!profileUser?.id) return;
    try {
      const response = await fetch(`/api/users/${profileUser.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
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
        <div className="relative -mt-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="relative -mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
                      Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      0G Network
                    </div>
                  </div>
                  
                  {/* Wallet Info */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-mono text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {profileUser.walletAddress ? `${profileUser.walletAddress.slice(0, 6)}...${profileUser.walletAddress.slice(-4)}` : 'No wallet'}
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
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollow}
                      className={isFollowing 
                        ? "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950" 
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      }
                      data-testid="button-follow"
                    >
                      {isFollowing ? (
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
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Stats Section */}
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
          </CardContent>
        </Card>

        {/* Advanced Profile Features */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReputationSystem user={profileUser} />
          <SkillBadges user={profileUser} isOwner={isOwnProfile} />
        </div>

        <div className="mt-6">
          <VerifiedLinks user={profileUser} isOwner={isOwnProfile} />
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
                    Posts ({userPosts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="liked" 
                    className="px-6 py-4 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Liked ({likedPosts?.length || 0})
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
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
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
                    {userPosts.map((post) => (
                      <LazyPostCard key={post.id} post={post} />
                    ))}
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
                {likedLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
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
                ) : likedPosts && likedPosts.length > 0 ? (
                  <div className="space-y-6">
                    {likedPosts.map((post) => (
                      <LazyPostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {isOwnProfile ? "You haven't liked any posts yet" : `${profileUser.displayName || profileUser.username} hasn't liked any posts yet`}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {isOwnProfile ? "Like posts to show your appreciation and find them here later." : "Liked posts will appear here."}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="media" className="p-6">
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Achievements Coming Soon
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Track your milestones and achievements on the DeSocialAI platform.
                  </p>
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