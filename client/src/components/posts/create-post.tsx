import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageIcon, Database, Loader2, Wallet, X, Video } from "lucide-react";
import { ContentGenerationAI } from "@/components/ai-content-generation";

// Helper function for formatting file sizes correctly
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function CreatePost() {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaURL, setUploadedMediaURL] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSigningMetaMask, setIsSigningMetaMask] = useState(false);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Character limit constants
  const CHARACTER_LIMIT = 280;
  const WARNING_THRESHOLD = Math.floor(CHARACTER_LIMIT * 0.9); // 90% = 252 characters

  // Check wallet connection status
  const { data: walletStatus } = useQuery({
    queryKey: ["/api/web3/wallet"],
    queryFn: async () => {
      const response = await fetch("/api/web3/wallet");
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch wallet status");
      }
      return response.json();
    },
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Get user data to check verified status
  const { data: userData } = useQuery({
    queryKey: ["/api/users/me"],
    enabled: walletStatus?.connected,
    queryFn: async () => {
      const response = await fetch("/api/users/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Calculate character count and status
  const characterCount = content.length;
  const isOverLimit = characterCount > CHARACTER_LIMIT;
  const isNearLimit = characterCount > WARNING_THRESHOLD;
  const isUserVerified = userData?.isVerified || false;

  // Handle file selection (only preview, don't upload yet)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[FRONTEND DEBUG] handleFileSelect called");
    const file = event.target.files?.[0];
    console.log("[FRONTEND DEBUG] Selected file:", file);
    if (!file) {
      console.log("[FRONTEND DEBUG] No file selected, returning");
      return;
    }

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
      return Math.round(bytes / (1024 * 1024)) + ' MB';
    };

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size: ${formatFileSize(file.size)}. Maximum allowed: 2MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Store file and create preview (no upload yet)
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "File selected",
      description: "File will be uploaded when you post.",
    });
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadedMediaURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; file?: File }) => {
      // Step 1: Request MetaMask signature
      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask to continue.");
      }

      try {
        // Set signing state to true - progress bar won't start yet
        setIsSigningMetaMask(true);

        // Connect to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get current wallet from session to ensure consistency
        let sessionAccount = walletStatus?.address;
        console.log('[FRONTEND DEBUG] Session wallet address:', sessionAccount);

        // Get current MetaMask accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const currentAccount = accounts[0];
        console.log('[FRONTEND DEBUG] Current MetaMask account:', currentAccount);

        // Check if session account matches current MetaMask account
        if (sessionAccount && currentAccount && sessionAccount.toLowerCase() !== currentAccount.toLowerCase()) {
          throw new Error(`Account mismatch! Please switch MetaMask to account: ${sessionAccount}`);
        }

        // Use the active account (prioritize session account for consistency)
        const account = sessionAccount || currentAccount;
        console.log('[FRONTEND DEBUG] Using account for signature:', account);

        // Create message to sign
        const timestamp = Date.now();
        const fileInfo = data.file ? `\nFile: ${data.file.name} (${data.file.size} bytes)` : '';
        const contentDisplay = data.content || '[Media post without text]';
        const message = `0G Social Post Signature\n\nContent: ${contentDisplay}${fileInfo}\nTimestamp: ${timestamp}\n\nBy signing this message, you authorize posting this content to the 0G Storage network.`;

        console.log('[FRONTEND DEBUG] Signing message with account:', account);
        console.log('[FRONTEND DEBUG] Message to sign:', message);

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        });

        console.log('[FRONTEND DEBUG] Signature received:', signature);

        // MetaMask signature completed - now progress bar can start
        setIsSigningMetaMask(false);
        setUploadStartTime(Date.now()); // Start timing for progress bar

        // Step 2: Prepare form data for backend (includes file if present)
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('signature', signature);
        formData.append('message', message);
        formData.append('timestamp', timestamp.toString());
        formData.append('address', account);

        if (data.file) {
          formData.append('file', data.file);
        }

        // Step 3: Send post + file to backend with 45-second timeout
        console.log('[FRONTEND DEBUG] Sending FormData to backend...');
        console.log('[FRONTEND DEBUG] FormData keys:', Array.from(formData.keys()));

        // Debug the file specifically
        if (data.file) {
          console.log('[FRONTEND DEBUG] File details:');
          console.log('- Name:', data.file.name);
          console.log('- Size:', data.file.size, 'bytes');
          console.log('- Type:', data.file.type);
          console.log('- Last modified:', new Date(data.file.lastModified));
        }

        console.log('[FRONTEND DEBUG] About to call apiRequest with FormData...');

        // Create timeout wrapper for the API request (increased to match backend)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Upload timeout after 65 seconds - 0G network sync delay. Your post may still be created.'));
          }, 65000); // 65 second timeout (5 seconds more than backend)
        });

        const apiRequestPromise = apiRequest('POST', '/api/posts', formData);

        let response: Response;
        try {
          response = await Promise.race([apiRequestPromise, timeoutPromise]);

          console.log('[FRONTEND DEBUG] Response received successfully!');
          console.log('[FRONTEND DEBUG] Response status:', response.status);
          console.log('[FRONTEND DEBUG] Response ok:', response.ok);
        } catch (apiError: any) {
          console.error('[FRONTEND ERROR] apiRequest failed:', apiError);
          console.error('[FRONTEND ERROR] Error type:', typeof apiError);
          console.error('[FRONTEND ERROR] Error message:', apiError.message);
          console.error('[FRONTEND ERROR] Error stack:', apiError.stack);
          throw apiError; // Re-throw to be caught by outer catch
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.log('[FRONTEND DEBUG] Error response:', errorData);
          throw new Error(errorData.message || 'Failed to create post');
        }

        const result = await response.json();
        console.log('[FRONTEND DEBUG] Success response:', result);
        return result;
      } catch (error: any) {
        // Reset signing state if signature fails or is cancelled
        setIsSigningMetaMask(false);
        if (error.code === 4001) {
          throw new Error("Signature cancelled by user");
        }
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setContent("");
      removeSelectedFile();

      // Stop progress bar immediately when post is successful
      setUploadProgress(100);
      setIsSigningMetaMask(false);
      setUploadStartTime(null);

      // Invalidate all posts queries with broad matching to refresh the feed
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/posts');
        }
      });

      // Invalidate user profile to update post count in sidebar
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });

      // Force immediate refetch of the current feed and profile with a slight delay to ensure backend processing
      setTimeout(() => {
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === 'string' && (key === '/api/posts/feed' || key === '/api/users/me');
          }
        });
      }, 100);

      // Show success message with 0G Storage information
      if (data.storageStatus === "pending") {
        toast({
          title: "Post created successfully",
          description: "Your post is visible in your feed. 0G Storage upload will retry when the Galileo testnet is available. You may need tokens from https://faucet.0g.ai",
          variant: "default",
        });
      } else {
        toast({
          title: "Post created successfully",
          description: data.storageHash
            ? `Content stored on 0G Storage: ${data.storageHash.substring(0, 12)}...`
            : "Your post has been published to the decentralized network",
        });
      }
    },
    onError: (error: any) => {
      // Stop progress bar immediately when error occurs
      setUploadProgress(0);
      setIsSigningMetaMask(false);
      setUploadStartTime(null);

      let errorMessage = "Failed to create post";
      let shouldRefresh = false;

      if (error.code === "WALLET_NOT_CONNECTED") {
        errorMessage = "Please connect your wallet to create posts";
      } else if (error.message?.includes("MetaMask")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Signature")) {
        errorMessage = error.message;
      } else if (error.code === 4001) {
        errorMessage = "Signature cancelled by user";
      } else if (error.message?.includes("timeout after 65 seconds")) {
        errorMessage = "Upload took longer than expected due to 0G network sync delay. Your post may have been created successfully. Please refresh to check.";
        shouldRefresh = true;
      } else if (error.message?.includes("Galileo")) {
        errorMessage = "0G Galileo testnet is temporarily unavailable. Your post will still be created.";
      } else {
        errorMessage = error.message || "Failed to create post";
      }

      toast({
        title: shouldRefresh ? "Upload timeout" : "Failed to create post",
        description: errorMessage,
        variant: shouldRefresh ? "default" : "destructive",
      });

      // Auto-refresh feed after timeout to show any posts that might have been created
      if (shouldRefresh) {
        setTimeout(() => {
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0];
              return typeof key === 'string' && (key === '/api/posts/feed' || key === '/api/users/me');
            }
          });
        }, 2000); // Refresh after 2 seconds
      }
    },
  });

  // Progress based on 45-second upload time - starts after MetaMask signature confirmed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const TOTAL_UPLOAD_TIME = 45000; // 45 seconds in milliseconds

    if (createPostMutation.isPending && !isSigningMetaMask && uploadStartTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - uploadStartTime;
        const progressPercentage = Math.min((elapsedTime / TOTAL_UPLOAD_TIME) * 100, 100);

        setUploadProgress(progressPercentage);

        // Stop interval when we reach 100%
        if (progressPercentage >= 100) {
          clearInterval(interval);
        }
      }, 100); // Update every 100ms for smooth progress
    } else if (!createPostMutation.isPending) {
      // Reset progress when not uploading
      setUploadProgress(0);
      setIsSigningMetaMask(false);
      setUploadStartTime(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [createPostMutation.isPending, isSigningMetaMask, uploadStartTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚨🚨🚨 FORM SUBMIT TRIGGERED! 🚨🚨🚨');
    console.log('Current content:', content);
    console.log('Selected file:', selectedFile);
    console.log('Content length:', content.trim().length);
    console.log('Has file:', !!selectedFile);

    // Allow post if there's content OR file (media)
    if (!content.trim() && !selectedFile) {
      console.log('❌ VALIDATION FAILED: No content and no file');
      return;
    }

    console.log('✅ VALIDATION PASSED');
    console.log("[FRONTEND] Starting post creation with MetaMask signature...");

    const postData = {
      content: content.trim() || '', // Allow empty content if there's a file
      file: selectedFile,
    };

    console.log("[FRONTEND] Post data prepared:", {
      content: postData.content,
      hasFile: !!postData.file,
      fileName: postData.file?.name
    });

    console.log('🚀 CALLING MUTATION NOW...');

    // Use mutation to handle post creation with proper error handling
    createPostMutation.mutate({
      content: postData.content,
      file: postData.file || undefined
    });
  };

  const isWalletConnected = walletStatus?.connected === true;
  // Button is enabled if there's content OR file, wallet connected, character limit OK, and not pending
  const hasContentOrFile = content.trim() || selectedFile;
  const isDisabled = !hasContentOrFile || createPostMutation.isPending || !isWalletConnected || (!isUserVerified && isOverLimit);

  // If wallet is not connected, show connect wallet prompt
  if (!isWalletConnected) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Connect Wallet to Post
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You need to connect your wallet to create posts on 0G Social. All posts are stored on the decentralized 0G Storage network.
              </p>
              <Button
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => {
                  // Scroll to Web3 status section or trigger wallet connection
                  toast({
                    title: "Connect your wallet",
                    description: "Look for the Web3 connection section in the sidebar to connect your wallet.",
                  });
                }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* AI Content Generation Component */}
      <ContentGenerationAI
        onContentGenerated={setContent}
        currentContent={content}
        selectedFile={selectedFile}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <div className="w-10 h-10 avatar-gradient-1 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="relative">
                  <Textarea
                    placeholder="What's happening on 0G Chain?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`min-h-[100px] border-0 text-lg resize-none placeholder:text-og-slate-500 focus-visible:ring-0 transition-all ${isOverLimit
                      ? "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300"
                      : isNearLimit
                        ? "bg-orange-50 dark:bg-orange-900/10"
                        : ""
                      }`}
                    disabled={createPostMutation.isPending}
                    data-testid="textarea-post-content"
                  />

                  {/* Character Limit Warning Banner */}
                  {isOverLimit && (
                    <div className="absolute -bottom-2 left-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-b-md flex items-center justify-between animate-pulse">
                      <span>Post exceeds {CHARACTER_LIMIT} character limit</span>
                      <span className="font-bold">{characterCount - CHARACTER_LIMIT} over</span>
                    </div>
                  )}

                  {/* Near Limit Warning */}
                  {isNearLimit && !isOverLimit && (
                    <div className="absolute -bottom-2 left-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-b-md flex items-center justify-between">
                      <span>Approaching character limit</span>
                      <span className="font-bold">{CHARACTER_LIMIT - characterCount} remaining</span>
                    </div>
                  )}
                </div>

                {/* File preview */}
                {filePreview && (
                  <div className="mt-3 relative">
                    <div className="relative inline-block rounded-lg overflow-hidden border border-og-slate-200 dark:border-og-slate-700">
                      {selectedFile?.type.startsWith('image/') ? (
                        <img
                          src={filePreview}
                          alt="File preview"
                          className="max-w-full max-h-48 object-cover"
                        />
                      ) : selectedFile?.type.startsWith('video/') ? (
                        <video
                          src={filePreview}
                          controls
                          className="max-w-full max-h-48"
                        />
                      ) : null}

                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-og-slate-500 mt-1">
                      {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                    </p>
                  </div>
                )}

                {/* Character count and 0G Storage info */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-og-slate-200 dark:border-og-slate-700">
                  <div className="flex items-center space-x-4">
                    {/* File upload button */}
                    <div className="flex items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading || createPostMutation.isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("[FRONTEND DEBUG] Upload button clicked");
                          console.log("[FRONTEND DEBUG] File input ref:", fileInputRef.current);
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploading || createPostMutation.isPending}
                        className="text-og-primary hover:bg-og-primary/10"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : selectedFile?.type.startsWith('video/') ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-og-slate-500">
                      <div className="flex items-center space-x-2">
                        <Database className="w-3 h-3" />
                        <span>Content will be stored on 0G Storage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="w-3 h-3" />
                        <span>Max file size: 2MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Character Counter with Visual Indicators */}
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium transition-colors ${isOverLimit
                        ? "text-red-500"
                        : isNearLimit
                          ? "text-orange-500"
                          : characterCount > 200
                            ? "text-yellow-600"
                            : "text-gray-500"
                        }`}>
                        {characterCount}{isUserVerified ? " ∞" : `/${CHARACTER_LIMIT}`}
                      </span>

                      {/* Visual Progress Ring */}
                      <div className="relative w-5 h-5">
                        <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
                          {/* Background circle */}
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            className={`transition-all duration-200 ${isOverLimit
                              ? "text-red-500"
                              : isNearLimit
                                ? "text-orange-500"
                                : characterCount > 200
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                              }`}
                            strokeDasharray={`${Math.min((characterCount / CHARACTER_LIMIT) * 50.27, 50.27)} 50.27`}
                          />
                        </svg>
                        {/* Warning icon when over limit */}
                        {isOverLimit && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-red-500 text-xs">!</span>
                          </div>
                        )}
                      </div>

                      {isUserVerified && (
                        <span className="text-blue-500 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                          VERIFIED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">


                      <Button
                        type="submit"
                        disabled={isDisabled}
                        title={
                          isOverLimit && !isUserVerified
                            ? `Post exceeds ${CHARACTER_LIMIT} character limit by ${characterCount - CHARACTER_LIMIT} characters`
                            : !hasContentOrFile
                              ? "Enter some content to post"
                              : !isWalletConnected
                                ? "Connect your wallet to post"
                                : "Post to 0G Storage"
                        }
                        className={`bg-og-primary hover:bg-og-primary/90 text-white font-semibold transition-all ${createPostMutation.isPending ? 'px-4 min-w-[200px]' : 'px-6'
                          } ${isOverLimit && !isUserVerified ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {createPostMutation.isPending ? (
                          isSigningMetaMask ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Waiting for signature...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3 w-full">
                              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs">Uploading to 0G...</span>
                                  <span className="text-xs font-mono">{Math.floor(uploadProgress)}%</span>
                                </div>
                                <Progress
                                  value={uploadProgress}
                                  className="h-2 bg-white/20 [&>div]:bg-white/80"
                                />
                              </div>
                            </div>
                          )
                        ) : (
                          "Sign & Post"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}