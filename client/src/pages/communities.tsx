import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommunityCard } from "@/components/communities/community-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import type { CommunityWithDetails } from "@shared/schema";

export function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: communities, isLoading } = useQuery<CommunityWithDetails[]>({
    queryKey: ['/api/communities', { search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch communities');
      return response.json();
    }
  });

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to join community');
      // TODO: Invalidate queries to refresh data
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to leave community');
      // TODO: Invalidate queries to refresh data
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-cyan-400/20 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-cyan-400/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Communities</h1>
            <p className="text-cyan-300/80">
              Discover and join communities on the decentralized social network
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            data-testid="button-create-community"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <Input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-cyan-400/30 text-white placeholder-cyan-300/50"
            data-testid="input-search-communities"
          />
        </div>

        {/* Communities Grid */}
        {communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoinCommunity}
                onLeave={handleLeaveCommunity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Communities Found</h3>
            <p className="text-cyan-300/80 mb-6">
              {searchQuery.trim() 
                ? `No communities found matching "${searchQuery}"`
                : "Be the first to create a community on DeSocialAI"
              }
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            >
              Create First Community
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}