import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Wallet,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  Download,
  Trash2
} from "lucide-react";
import { VerificationPaymentModal } from "@/components/verification/verification-payment-modal";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: "",
    username: "",
    bio: "",
    email: ""
  });

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    onSuccess: (data) => {
      setProfileData({
        displayName: data.displayName || "",
        username: data.username || "",
        bio: data.bio || "",
        email: data.email || ""
      });
    }
  });

  const { data: walletInfo } = useQuery({
    queryKey: ['/api/web3/wallet'],
  });

  const { data: storageStats } = useQuery({
    queryKey: ['/api/users/storage-stats'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries(['/api/users/me']);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-gray-500/20 to-blue-500/20 border border-gray-500/30">
              <Settings className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-blue-400 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="blockchain" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Blockchain
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          className="bg-gray-800/50 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          className="bg-gray-800/50 border-gray-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="bg-gray-800/50 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="bg-gray-800/50 border-gray-700"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleProfileUpdate}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-400">Make your profile visible to other users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Show Activity Status</Label>
                        <p className="text-sm text-gray-400">Let others see when you're online</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Allow Direct Messages</Label>
                        <p className="text-sm text-gray-400">Receive messages from other users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Data Analytics</Label>
                        <p className="text-sm text-gray-400">Help improve the platform with usage data</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>New Followers</Label>
                        <p className="text-sm text-gray-400">When someone follows you</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Post Interactions</Label>
                        <p className="text-sm text-gray-400">Likes, comments, and shares on your posts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>AI Recommendations</Label>
                        <p className="text-sm text-gray-400">New content recommendations from AI</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Community Updates</Label>
                        <p className="text-sm text-gray-400">Updates from communities you joined</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>System Announcements</Label>
                        <p className="text-sm text-gray-400">Important platform updates and announcements</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Theme & Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Theme</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          onClick={() => setTheme("light")}
                          className="flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          Light
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          onClick={() => setTheme("dark")}
                          className="flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          Dark
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          onClick={() => setTheme("system")}
                          className="flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4" />
                          System
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-gray-400">Show more content in less space</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Animations</Label>
                        <p className="text-sm text-gray-400">Enable UI animations and transitions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blockchain" className="space-y-6 mt-6">
                <Card className="futuristic-card dark:futuristic-card-dark">
                  <CardHeader>
                    <CardTitle>Blockchain & Wallet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Connected Wallet</Label>
                      {walletInfo?.address ? (
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-mono text-sm">{walletInfo.address}</p>
                              <p className="text-xs text-gray-400">Connected</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm">No wallet connected</p>
                              <p className="text-xs text-gray-400">Connect MetaMask to get started</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label>Data Storage</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-sm text-gray-400">Posts on Chain</div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {storageStats?.postsOnChain || 0}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-sm text-gray-400">Storage Used</div>
                          <div className="text-2xl font-bold text-green-400">
                            {storageStats?.storageUsed || '0 MB'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-backup to 0G Storage</Label>
                        <p className="text-sm text-gray-400">Automatically store content on 0G Storage</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Verification Badges</Label>
                        <p className="text-sm text-gray-400">Show blockchain verification status</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Verification</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    {user?.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Member Since</span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                    {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Posts</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    {user?.postsCount || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!user?.isVerified && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={() => setVerificationModalOpen(true)}
                    data-testid="button-get-verified"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Get Verified
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                  <Eye className="w-4 h-4 mr-2" />
                  Privacy Report
                </Button>
                <Button variant="outline" className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Verification Payment Modal */}
      <VerificationPaymentModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onVerificationComplete={() => {
          setVerificationModalOpen(false);
          toast({
            title: "✅ Verification Complete!",
            description: "You now have unlimited character posting privileges.",
          });
        }}
      />
    </div>
  );
}