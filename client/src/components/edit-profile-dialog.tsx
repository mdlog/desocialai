import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateUserProfileSchema, type UpdateUserProfile, type UserProfile } from "@shared/schema";

interface EditProfileDialogProps {
  user: UserProfile;
  trigger?: React.ReactNode;
}

export function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      username: user.username || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      console.log("Updating profile with data:", data);
      const response = await apiRequest("PUT", "/api/users/me", data);
      return await response.json();
    },
    onSuccess: (result) => {
      console.log("Profile update successful:", result);

      setOpen(false);
      setAvatarPreview(null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully. Refreshing...",
      });

      // Clear cache and reload to ensure all data is fresh
      queryClient.clear();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: `Failed to update profile: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      console.log("[AVATAR UPLOAD] Starting upload process...");

      // Get upload URL
      let response;
      try {
        response = await apiRequest("POST", "/api/objects/upload");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to get upload URL: ${response.status} - ${errorText}`);
        }
      } catch (error: any) {
        console.error("[AVATAR UPLOAD] Failed to get upload URL:", error);
        throw new Error(`Failed to connect to server. Please check your connection.`);
      }

      const uploadData = await response.json();
      console.log("[AVATAR UPLOAD] Got upload URL:", uploadData.uploadURL);

      // Extract objectId from uploadURL
      const objectId = uploadData.uploadURL.split('/').pop();

      // Use relative URL to avoid CORS issues with tunnel
      const relativeUploadURL = `/api/objects/upload-direct/${objectId}`;
      const relativeMultipartURL = `/api/objects/upload-multipart/${objectId}`;

      console.log("[AVATAR UPLOAD] Using relative URL:", relativeUploadURL);

      // Try direct upload first
      let uploadResponse;
      try {
        uploadResponse = await fetch(relativeUploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
          credentials: 'include', // Important for session cookies
        });

        console.log("[AVATAR UPLOAD] Direct upload response:", uploadResponse.status);
      } catch (fetchError: any) {
        console.error("[AVATAR UPLOAD] Direct upload fetch error:", fetchError);
        throw new Error(`Network error during upload. Please check your connection.`);
      }

      // If direct upload fails, try multipart upload as fallback
      if (!uploadResponse.ok) {
        console.log("[AVATAR UPLOAD] Direct upload failed, trying multipart...");
        try {
          const formData = new FormData();
          formData.append('file', file);

          uploadResponse = await fetch(relativeMultipartURL, {
            method: "PUT",
            body: formData,
            credentials: 'include',
          });

          console.log("[AVATAR UPLOAD] Multipart upload response:", uploadResponse.status);
        } catch (fetchError: any) {
          console.error("[AVATAR UPLOAD] Multipart upload fetch error:", fetchError);
          throw new Error(`Network error during upload. Please check your connection.`);
        }
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("[AVATAR UPLOAD] Upload failed:", errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log("[AVATAR UPLOAD] Upload successful, updating user avatar...");
      console.log("[AVATAR UPLOAD] Sending avatarURL to server:", relativeUploadURL);
      console.log("[AVATAR UPLOAD] avatarURL type:", typeof relativeUploadURL);

      // Update avatar on backend - use relative URL
      const avatarResponse = await apiRequest("PUT", "/api/users/me/avatar", {
        avatarURL: relativeUploadURL
      });

      if (!avatarResponse.ok) {
        const errorText = await avatarResponse.text();
        throw new Error(`Failed to update avatar: ${avatarResponse.status} - ${errorText}`);
      }

      const avatarData = await avatarResponse.json();

      console.log("[AVATAR UPLOAD] ✅ Avatar update response:", avatarData);
      console.log("[AVATAR UPLOAD] ✅ New avatar URL:", avatarData.avatar);
      console.log("[AVATAR UPLOAD] ✅ Debug info:", avatarData.debug);

      // Verify avatar was actually saved
      if (!avatarData.avatar) {
        console.error("[AVATAR UPLOAD] ❌ Avatar is null in response!");
        throw new Error("Avatar was not saved properly");
      }

      // Update form value
      form.setValue("avatar", avatarData.avatar);

      // Close dialog
      setOpen(false);

      // Show success message
      toast({
        title: "Avatar uploaded",
        description: "Refreshing to show your new avatar...",
      });

      // Force complete cache refresh
      console.log("[AVATAR UPLOAD] Clearing all caches...");

      // Clear React Query cache completely
      queryClient.clear();

      // Wait a bit for cache to clear
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refetch user data
      console.log("[AVATAR UPLOAD] Refetching user data...");
      await queryClient.refetchQueries({
        queryKey: ["/api/users/me"],
        type: 'active'
      });

      // Wait for refetch to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify data was refetched
      const userData = queryClient.getQueryData(["/api/users/me"]);
      console.log("[AVATAR UPLOAD] User data after refetch:", userData);

      // Force hard reload to clear browser cache
      console.log("[AVATAR UPLOAD] Forcing hard reload...");
      setTimeout(() => {
        // Hard reload with cache clear
        window.location.href = window.location.href.split('?')[0] + '?_t=' + Date.now();
      }, 500);

    } catch (error: any) {
      console.error("Avatar upload error:", error);
      setAvatarPreview(null);
      toast({
        title: "Upload failed",
        description: `Failed to upload avatar: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const onSubmit = (data: UpdateUserProfile) => {
    console.log("Form submission data:", data);
    // Preserve avatar if it was uploaded but not part of the form update
    if (!data.avatar && user.avatar) {
      data.avatar = user.avatar;
    }
    updateProfileMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={avatarPreview || (user.avatar ? `${user.avatar}?t=${Date.now()}` : "")}
                alt={user.displayName}
                className="object-cover"
              />
              <AvatarFallback className="avatar-gradient-1 text-white font-semibold">
                {user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}