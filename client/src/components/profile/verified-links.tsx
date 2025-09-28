import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ExternalLink, 
  Plus, 
  Check, 
  X, 
  Github, 
  Twitter, 
  Globe, 
  Linkedin, 
  Instagram,
  Youtube,
  Shield,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerifiedLink {
  id: string;
  platform: string;
  url: string;
  username: string;
  verified: boolean;
  verifiedAt?: string;
  socialProof?: string; // Verification method or proof
}

interface VerifiedLinksProps {
  user: {
    id: string;
    verifiedLinks?: VerifiedLink[];
  };
  isOwner?: boolean;
}

export function VerifiedLinks({ user, isOwner = false }: VerifiedLinksProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLink, setNewLink] = useState({ platform: '', url: '', username: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const links = user.verifiedLinks || [];

  // Platform configurations
  const platformConfig = {
    github: {
      name: 'GitHub',
      icon: Github,
      color: 'from-gray-700 to-gray-900',
      placeholder: 'https://github.com/username',
      verification: 'Create a gist with your wallet address'
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-blue-400 to-blue-600',
      placeholder: 'https://twitter.com/username',
      verification: 'Tweet your wallet address'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-800',
      placeholder: 'https://linkedin.com/in/username',
      verification: 'Add wallet address to bio'
    },
    website: {
      name: 'Website',
      icon: Globe,
      color: 'from-green-400 to-blue-500',
      placeholder: 'https://yourwebsite.com',
      verification: 'Add verification meta tag'
    },
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-400 to-purple-600',
      placeholder: 'https://instagram.com/username',
      verification: 'Add wallet address to bio'
    },
    youtube: {
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-500 to-red-700',
      placeholder: 'https://youtube.com/@username',
      verification: 'Add wallet address to channel description'
    }
  };

  const handleAddLink = async () => {
    if (!newLink.platform || !newLink.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/me/verified-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        toast({
          title: "Link Added!",
          description: "Your link has been added and is pending verification.",
        });
        setShowAddDialog(false);
        setNewLink({ platform: '', url: '', username: '' });
        // Refresh or update state
        window.location.reload();
      } else {
        throw new Error('Failed to add link');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLink = async (linkId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/me/verified-links/${linkId}/verify`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Verification Started!",
          description: "We're checking your verification proof. This may take a few minutes.",
        });
        // Refresh or update state
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Failed to verify link');
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify your link. Please check your verification proof.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const config = platformConfig[platform as keyof typeof platformConfig];
    return config ? config.icon : LinkIcon;
  };

  const getPlatformColor = (platform: string) => {
    const config = platformConfig[platform as keyof typeof platformConfig];
    return config ? config.color : 'from-gray-400 to-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Verified Links
            </CardTitle>
            <CardDescription>
              Social proofs and verified external profiles
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Verified Link</DialogTitle>
                  <DialogDescription>
                    Connect and verify your external profiles and websites
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={newLink.platform} onValueChange={(value) => setNewLink({...newLink, platform: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(platformConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="w-4 h-4" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder={newLink.platform ? platformConfig[newLink.platform as keyof typeof platformConfig]?.placeholder : "https://..."}
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username (optional)</Label>
                    <Input
                      id="username"
                      placeholder="@username"
                      value={newLink.username}
                      onChange={(e) => setNewLink({...newLink, username: e.target.value})}
                    />
                  </div>
                  {newLink.platform && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>To verify:</strong> {platformConfig[newLink.platform as keyof typeof platformConfig]?.verification}
                      </p>
                    </div>
                  )}
                  <Button onClick={handleAddLink} disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add Link"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => {
              const IconComponent = getPlatformIcon(link.platform);
              const platformColor = getPlatformColor(link.platform);
              const platformName = platformConfig[link.platform as keyof typeof platformConfig]?.name || link.platform;
              
              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${platformColor} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {platformName}
                        </span>
                        {link.verified ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {link.username ? `@${link.username}` : new URL(link.url).hostname}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!link.verified && isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyLink(link.id)}
                        disabled={loading}
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
              <LinkIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isOwner ? "No verified links yet" : "No verified links"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {isOwner 
                ? "Add and verify your social profiles and websites to build trust with your audience." 
                : "This user hasn't added any verified links yet."
              }
            </p>
            {isOwner && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    Add Your First Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Verified Link</DialogTitle>
                    <DialogDescription>
                      Connect and verify your external profiles and websites
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select value={newLink.platform} onValueChange={(value) => setNewLink({...newLink, platform: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platformConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="w-4 h-4" />
                                {config.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder={newLink.platform ? platformConfig[newLink.platform as keyof typeof platformConfig]?.placeholder : "https://..."}
                        value={newLink.url}
                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username (optional)</Label>
                      <Input
                        id="username"
                        placeholder="@username"
                        value={newLink.username}
                        onChange={(e) => setNewLink({...newLink, username: e.target.value})}
                      />
                    </div>
                    {newLink.platform && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          <strong>To verify:</strong> {platformConfig[newLink.platform as keyof typeof platformConfig]?.verification}
                        </p>
                      </div>
                    )}
                    <Button onClick={handleAddLink} disabled={loading} className="w-full">
                      {loading ? "Adding..." : "Add Link"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}