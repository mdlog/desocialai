import { Home, Shield, MessageSquareText, Images, Wallet, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useMemo, memo, useEffect, useState } from "react";

function LeftSidebarBase() {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [avatarKey, setAvatarKey] = useState(0); // Force re-render key

  const { data: currentUser, isError, refetch, isLoading: isLoadingUser } = useQuery<{
    id: string;
    displayName: string;
    username: string;
    email: string | null;
    bio: string | null;
    avatar: string | null;
    nftProfilePicture: string | null;
    nftProfileContract: string | null;
    nftProfileTokenId: string | null;
    reputationScore: number;
    skillBadges: any[];
    verifiedLinks: any[];
    isPremium: boolean;
    premiumExpiresAt: Date | null;
    walletAddress: string | null;
    isVerified: boolean;
    followingCount: number;
    followersCount: number;
    postsCount: number;
    createdAt: Date | null;
  }>({
    queryKey: ["/api/users/me"],
    retry: false,
    staleTime: 2000, // Reduced to 2 seconds
    gcTime: 300000,
    networkMode: 'online',
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnReconnect: true,
    enabled: true,
    queryFn: async () => {
      console.log("[SIDEBAR] Query function called for key:", ["/api/users/me"]);
      console.log("[SIDEBAR] Current URL:", window.location.href);
      console.log("[SIDEBAR] Fetch options:", {
        credentials: "include",
        url: "/api/users/me"
      });

      try {
        const res = await fetch("/api/users/me", {
          credentials: "include", // CRITICAL: Must include credentials for session cookies
          cache: "no-cache", // Prevent browser caching
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });

        console.log("[SIDEBAR] Response status:", res.status, res.statusText);
        console.log("[SIDEBAR] Response headers:", Object.fromEntries(res.headers.entries()));

        if (res.status === 401) {
          // Return null when wallet not connected instead of throwing error
          const errorData = await res.json().catch(() => ({}));
          console.log("[SIDEBAR] 401 - Wallet not connected:", errorData);
          console.log("[SIDEBAR] This means session walletConnection is not set or not connected");
          return null;
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[SIDEBAR] Error response:", res.status, res.statusText, errorText);
          throw new Error(`${res.status}: ${res.statusText}`);
        }

        const userData = await res.json();
        console.log("[SIDEBAR] ✅ User data received successfully:", {
          id: userData?.id,
          username: userData?.username,
          displayName: userData?.displayName,
          walletAddress: userData?.walletAddress
        });

        // Decode HTML entities in avatar path if present
        if (userData?.avatar && typeof userData.avatar === 'string') {
          const originalAvatar = userData.avatar;
          userData.avatar = userData.avatar
            .replace(/&#x2F;/g, '/')
            .replace(/&#x5C;/g, '\\')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'");

          if (originalAvatar !== userData.avatar) {
            console.log("[SIDEBAR] Decoded HTML entities in avatar:", {
              original: originalAvatar,
              decoded: userData.avatar
            });
          }
        }

        return userData;
      } catch (error) {
        console.error("[SIDEBAR] ❌ Fetch error:", error);
        throw error;
      }
    },
  });

  const { data: chainStatus, isLoading: isLoadingChain } = useQuery<{ network: string; blockHeight: number; gasPrice: string }>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 2000, // Update every 2 seconds for real-time block height
    staleTime: 1000, // Consider data stale after 1 second
  });

  // Query for unread message count
  const { data: unreadMessageCount = 0 } = useQuery<number>({
    queryKey: ['/api/messages/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        return 0;
      }
      const data = await response.json();
      return data.count || 0;
    },
    enabled: !!currentUser,
    refetchInterval: 5000, // Check every 5 seconds
    retry: 1,
  });

  // Memoize expensive calculations
  const baseNavItems = useMemo(() => [
    { icon: Home, label: "Home", href: "/" },
    { icon: MessageSquareText, label: "Messages", href: "/messages", unreadCount: unreadMessageCount },
    { icon: Images, label: "NFT Gallery", href: "/nft-gallery" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
  ], [unreadMessageCount]);

  // Check if current user is admin - memoized
  const isAdmin = useMemo(() =>
    currentUser?.walletAddress?.toLowerCase() === "0x3e4d881819768fab30c5a79f3a9a7e69f0a935a4",
    [currentUser?.walletAddress]
  );

  // Add admin link if user is authorized - memoized
  const navItems = useMemo(() =>
    isAdmin
      ? [...baseNavItems, { icon: Shield, label: "Admin Panel", href: "/admin" }]
      : baseNavItems,
    [isAdmin, baseNavItems]
  );

  // Listen for wallet connection, disconnect, and avatar update events
  useEffect(() => {
    const handleWalletConnect = async () => {
      console.log("[SIDEBAR] 🔗 Wallet connected event received, refetching user data...");

      // Clear cache immediately
      queryClient.removeQueries({ queryKey: ["/api/users/me"] });

      // Small delay to ensure session cookie is set
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal 100ms delay

      // Try to fetch with simple retry (max 3 attempts)
      let retries = 3;
      let success = false;

      while (retries > 0 && !success) {
        try {
          console.log(`[SIDEBAR] 🔄 Fetching user data (attempt ${4 - retries}/3)...`);

          queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
          const result = await refetch();

          if (result.data && result.data.id) {
            console.log("[SIDEBAR] ✅ User data loaded:", result.data.username);
            success = true;

            // Force UI update by invalidating cache
            queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
          } else {
            console.warn(`[SIDEBAR] ⚠️ No data, retrying... (${retries - 1} left)`);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 500)); // 500ms between retries
            }
          }
        } catch (error) {
          console.error(`[SIDEBAR] ❌ Fetch error:`, error);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!success) {
        console.error("[SIDEBAR] ❌ Failed to load profile. Check session cookies in DevTools.");
      }
    };

    const handleWalletDisconnect = () => {
      console.log("[SIDEBAR] Wallet disconnected, clearing user data...");
      // Clear cache immediately
      queryClient.removeQueries({ queryKey: ["/api/users/me"] });
      // Force refetch to show "Connect Wallet" state
      refetch();
    };

    const handleAvatarUpdate = () => {
      console.log("[SIDEBAR] Avatar updated, force refetching user data...");
      // Force re-render by updating key
      setAvatarKey(prev => prev + 1);
      // Remove cache and refetch immediately
      queryClient.removeQueries({ queryKey: ["/api/users/me"] });
      setTimeout(() => {
        refetch();
      }, 100);
    };

    // Listen for custom events
    window.addEventListener('walletConnected', handleWalletConnect);
    window.addEventListener('walletDisconnected', handleWalletDisconnect);
    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    return () => {
      window.removeEventListener('walletConnected', handleWalletConnect);
      window.removeEventListener('walletDisconnected', handleWalletDisconnect);
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, [refetch, queryClient]);

  // Debug logging for current state
  useEffect(() => {
    console.log("[SIDEBAR] Current state:", {
      hasCurrentUser: !!currentUser,
      currentUser: currentUser ? { id: currentUser.id, username: currentUser.username } : null,
      isLoadingUser,
      isError,
      error: isError ? 'Query error' : null
    });
  }, [currentUser, isLoadingUser, isError]);

  // Always show all components, but with different content based on wallet connection

  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        {/* User Profile Card - Always show, with different content based on wallet connection */}
        <Card className="modern-card">
          <CardContent className="p-6">
            <div className="text-center">
              {isLoadingUser ? (
                <LoadingCard showAvatar={true} showContent={true} lines={2} />
              ) : currentUser ? (
                <>
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary ring-opacity-20">
                    <AvatarImage
                      src={currentUser.avatar ? `${currentUser.avatar}?v=${avatarKey}` : ""}
                      alt={currentUser.displayName}
                      className="object-cover"
                      onLoad={() => {
                        console.log("[SIDEBAR] ✅ AvatarImage onLoad triggered");
                        console.log("[SIDEBAR] AvatarImage src:", currentUser.avatar);
                      }}
                      onError={(e) => {
                        console.log("[SIDEBAR] ❌ AvatarImage onError triggered:", e);
                        console.log("[SIDEBAR] AvatarImage failed src:", currentUser.avatar);
                        console.log("[SIDEBAR] AvatarImage error details:", {
                          type: e.type,
                          target: e.target,
                          currentSrc: (e.target as HTMLImageElement)?.currentSrc
                        });
                      }}
                    />
                    <AvatarFallback className="gradient-brand text-white font-semibold text-lg">
                      {currentUser.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-foreground mb-1">{currentUser.displayName}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    @{currentUser.username}
                  </p>

                  {/* Verification Badge */}
                  {currentUser.isVerified && (
                    <div className="flex items-center justify-center space-x-2 mb-5">
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                        <Shield className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-center mb-5">
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-foreground">{currentUser.postsCount || 0}</p>
                      <p className="text-xs text-muted-foreground font-medium">Posts</p>
                    </div>
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-foreground">{currentUser.followingCount || 0}</p>
                      <p className="text-xs text-muted-foreground font-medium">Following</p>
                    </div>
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-foreground">{currentUser.followersCount || 0}</p>
                      <p className="text-xs text-muted-foreground font-medium">Followers</p>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <EditProfileDialog user={currentUser} />
                </>
              ) : (
                <>
                  <div className="w-20 h-20 gradient-brand rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Wallet className="text-white w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Connect Wallet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Connect your wallet to access your profile and unlock all features
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center mb-5">
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-muted-foreground">-</p>
                      <p className="text-xs text-muted-foreground font-medium">Posts</p>
                    </div>
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-muted-foreground">-</p>
                      <p className="text-xs text-muted-foreground font-medium">Following</p>
                    </div>
                    <div className="p-3 modern-card rounded-2xl">
                      <p className="text-lg font-bold text-muted-foreground">-</p>
                      <p className="text-xs text-muted-foreground font-medium">Followers</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={async () => {
                      console.log("[SIDEBAR] Manual refresh button clicked");
                      console.log("[SIDEBAR] Clearing cache and refetching...");
                      queryClient.removeQueries({ queryKey: ["/api/users/me"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
                      await refetch();
                    }}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>

                  {/* Debug: Manual refresh button */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      className="w-full mt-2"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        console.log("[SIDEBAR DEBUG] Manual refresh triggered");
                        console.log("[SIDEBAR DEBUG] Current state:", { currentUser, isLoadingUser });
                        queryClient.removeQueries({ queryKey: ["/api/users/me"] });
                        const result = await refetch();
                        console.log("[SIDEBAR DEBUG] Refetch result:", result);
                      }}
                    >
                      🔄 Debug: Refresh Profile
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Menu */}
        <Card className="modern-card">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 h-12 ${isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5" />
                        {item.unreadCount && item.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                          >
                            {item.unreadCount > 99 ? '99+' : item.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* 0G Chain Status */}
        <Card className="modern-card">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4 flex items-center space-x-2 text-foreground">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Network Status</span>
            </h4>
            {isLoadingChain ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Network:</span>
                  <LoadingSpinner size="sm" />
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Block:</span>
                  <LoadingSpinner size="sm" />
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gas:</span>
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="text-foreground font-mono">{chainStatus?.network || "0G Mainnet"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Block:</span>
                  <span className="text-foreground font-mono">{chainStatus?.blockHeight?.toLocaleString() || "Loading..."}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gas:</span>
                  <span className="text-foreground font-mono">{chainStatus?.gasPrice || "0.1 Gneuron"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

// Export with memoization and custom comparison
export const LeftSidebar = memo(LeftSidebarBase, (prevProps, nextProps) => {
  // LeftSidebar doesn't receive any props, so we can optimize based on dependencies
  // The memo will prevent re-renders when parent components re-render unnecessarily
  return true; // Since there are no props, we can skip re-renders unless internal state changes
});
