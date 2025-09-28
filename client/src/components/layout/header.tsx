import { useState, useEffect } from "react";
import { Moon, Sun, Search, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { RainbowKitWallet } from "@/components/wallet/rainbowkit-wallet";
import { SimpleNotificationDropdown } from "@/components/notifications/simple-notification-dropdown";
import logoUrl from "@/assets/desocialai-logo.png";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { connected: wsConnected } = useWebSocket();

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  // Search functionality with debounce
  const { data: searchResults } = useQuery({
    queryKey: ["/api/posts/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length < 2) return [];
      const response = await fetch(`/api/posts/search/${encodeURIComponent(searchQuery.trim())}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 5000, // Cache for 5 seconds
  });

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target && !target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchResults]);



  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-xl ring-1 ring-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ borderRadius: "18px" }}>
                <img
                  src={logoUrl}
                  alt="DeSocialAI Logo"
                  className="w-full h-full object-contain p-1 drop-shadow-lg"
                  style={{ borderRadius: "16px" }}
                />
              </div>
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" style={{ borderRadius: "18px" }}></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                DeSocialAI
              </h1>
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                Decentralized Social Network
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8 relative search-container">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search posts, users, hashtags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) {
                    setShowSearchResults(true);
                  }
                }}
                className="modern-input w-full pl-12 pr-4 py-3 h-12 text-sm placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults && searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide border-b border-border">
                      Search Results ({searchResults.length})
                    </div>
                    {searchResults.map((post: any) => (
                      <div
                        key={post.id}
                        className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            {post.author?.displayName?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">
                              {post.author?.displayName || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {post.content.substring(0, 100)}{post.content.length > 100 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No posts found for "{searchQuery}"</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-3">
            {/* RainbowKit Wallet Connection */}
            <RainbowKitWallet />

            {/* Real-time Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-full modern-badge">
              {wsConnected ? (
                <Wifi className="h-3 w-3 text-emerald-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs font-medium">
                {wsConnected ? "Live" : "Offline"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl hover:bg-accent transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications - positioned at the far right */}
            <SimpleNotificationDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
