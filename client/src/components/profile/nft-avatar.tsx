import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, ExternalLink, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NFTAvatarProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    nftProfilePicture?: string;
    nftProfileContract?: string;
    nftProfileTokenId?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  isOwner?: boolean;
}

export function NFTAvatar({ user, size = "xl", isOwner = false }: NFTAvatarProps) {
  const [showNFTDialog, setShowNFTDialog] = useState(false);
  const [nftContract, setNftContract] = useState(user.nftProfileContract || "");
  const [nftTokenId, setNftTokenId] = useState(user.nftProfileTokenId || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  const hasNFTAvatar = user.nftProfilePicture && user.nftProfileContract;

  const handleSetNFTAvatar = async () => {
    if (!nftContract || !nftTokenId) {
      toast({
        title: "Error",
        description: "Please provide both contract address and token ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Here we would verify NFT ownership and get metadata
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/users/me/nft-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: nftContract,
          tokenId: nftTokenId
        })
      });

      if (response.ok) {
        toast({
          title: "NFT Avatar Set!",
          description: "Your NFT profile picture has been updated successfully.",
        });
        setShowNFTDialog(false);
        // Refresh page or update state
        window.location.reload();
      } else {
        throw new Error('Failed to set NFT avatar');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set NFT avatar. Please verify you own this NFT.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-xl ring-4 ${hasNFTAvatar ? 'ring-purple-400 dark:ring-purple-600' : 'ring-purple-100 dark:ring-purple-900'}`}>
        <AvatarImage 
          src={user.nftProfilePicture || user.avatar} 
          className={hasNFTAvatar ? "ring-2 ring-purple-400" : ""}
        />
        <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          {(user.displayName || user.username)?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      {/* NFT Badge */}
      {hasNFTAvatar && (
        <div className="absolute -bottom-2 -right-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1">
            <ImageIcon className="w-3 h-3 mr-1" />
            NFT
          </Badge>
        </div>
      )}

      {/* Set NFT Avatar Button for Owner */}
      {isOwner && (
        <Dialog open={showNFTDialog} onOpenChange={setShowNFTDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -left-2 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600"
            >
              <Zap className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set NFT Profile Picture</DialogTitle>
              <DialogDescription>
                Connect your NFT as your profile picture. You must own the NFT to use it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contract">NFT Contract Address</Label>
                <Input
                  id="contract"
                  placeholder="0x..."
                  value={nftContract}
                  onChange={(e) => setNftContract(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tokenId">Token ID</Label>
                <Input
                  id="tokenId"
                  placeholder="1234"
                  value={nftTokenId}
                  onChange={(e) => setNftTokenId(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSetNFTAvatar}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Verifying..." : "Set NFT Avatar"}
                </Button>
                {hasNFTAvatar && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Remove NFT avatar
                      window.open(`https://opensea.io/assets/ethereum/${user.nftProfileContract}/${user.nftProfileTokenId}`, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}