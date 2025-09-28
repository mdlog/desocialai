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
      // Invalidate all user-related queries to update display names everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      // Force refresh all comment data that might contain user info
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] && typeof query.queryKey[0] === 'string' &&
            query.queryKey[0].includes('/comments');
        }
      });

      setOpen(false);
      setAvatarPreview(null);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
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

      // Get upload URL
      const response = await apiRequest("POST", "/api/objects/upload");
      const uploadData = await response.json();

      // Try direct upload first
      let uploadResponse = await fetch(uploadData.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // If direct upload fails, try multipart upload as fallback
      if (!uploadResponse.ok) {
        console.log("[AVATAR UPLOAD] Direct upload failed, trying multipart...");
        const formData = new FormData();
        formData.append('file', file);

        // Use the multipart endpoint instead
        const multipartURL = uploadData.uploadURL.replace('/upload-direct/', '/upload-multipart/');
        uploadResponse = await fetch(multipartURL, {
          method: "PUT",
          body: formData,
        });
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log("[AVATAR UPLOAD] Updating avatar with URL:", uploadData.uploadURL);

      // Update avatar on backend
      const avatarResponse = await apiRequest("PUT", "/api/users/me/avatar", {
        avatarURL: uploadData.uploadURL
      });
      const avatarData = await avatarResponse.json();

      console.log("[AVATAR UPLOAD] Avatar update response:", avatarData);

      // Update form value
      form.setValue("avatar", avatarData.avatar);

      // Force complete cache refresh to ensure avatar shows immediately
      await queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      await queryClient.refetchQueries({ queryKey: ["/api/users/me"] });

      // Additional cache invalidation for all user-related queries
      await queryClient.invalidateQueries({ queryKey: ["/api/users"] });

      // Close dialog after successful upload
      setTimeout(() => {
        setOpen(false);
      }, 1000);

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });

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