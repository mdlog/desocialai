import { Home, Shield, MessageSquareText, Images, Wallet, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useMemo, memo } from "react";

function LeftSidebarBase() {
  const [location] = useLocation();

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
    retry: false, // Don't retry on 401 errors
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache at all
    refetchInterval: 2000, // Check every 2 seconds for avatar changes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    queryFn: async () => {
      const res = await fetch("/api/users/me", {
        credentials: "include",
        cache: "no-cache", // Prevent browser caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });

      if (res.status === 401) {
        // Return null when wallet not connected instead of throwing error
        return null;
      }

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const userData = await res.json();
      console.log("[SIDEBAR] Fetched user data:", userData);
      console.log("[SIDEBAR] Avatar value:", userData?.avatar);
      console.log("[SIDEBAR] Avatar type:", typeof userData?.avatar);
      console.log("[SIDEBAR] Avatar is null:", userData?.avatar === null);
      return userData;
    },
  });

  const { data: chainStatus, isLoading: isLoadingChain } = useQuery<{ network: string; blockHeight: number; gasPrice: string }>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 10000,
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
                      src={currentUser.avatar ? `${currentUser.avatar}?cache=${currentUser.id}` : ""}
                      alt={currentUser.displayName}
                      className="object-cover"
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

                  <Button className="w-full" variant="outline">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
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
                  <span className="text-foreground font-mono">{chainStatus?.network || "0G Galileo"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Block:</span>
                  <span className="text-foreground font-mono">{chainStatus?.blockHeight?.toLocaleString() || "5,610,000"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gas:</span>
                  <span className="text-foreground font-mono">{chainStatus?.gasPrice || "0.1 Gwei"}</span>
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
