import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  PenTool, 
  Hash, 
  Globe, 
  ImageIcon, 
  Loader2, 
  Copy, 
  Plus,
  Sparkles,
  Bot,
  Zap
} from "lucide-react";

interface ContentGenerationAIProps {
  onContentGenerated: (content: string) => void;
  currentContent: string;
  selectedFile?: File | null;
}

export function ContentGenerationAI({ onContentGenerated, currentContent, selectedFile }: ContentGenerationAIProps) {
  const [activeTab, setActiveTab] = useState("post");
  const { toast } = useToast();

  // Post Generation State
  const [postPrompt, setPostPrompt] = useState("");
  const [postTone, setPostTone] = useState("professional");
  const [postPlatform, setPostPlatform] = useState("0g-chain");

  // Hashtag Generation State
  const [hashtagContent, setHashtagContent] = useState("");
  const [hashtagPlatform, setHashtagPlatform] = useState("0g-chain");
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);

  // Translation State
  const [translateText, setTranslateText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Image Description State
  const [imageUrl, setImageUrl] = useState("");
  const [imageContext, setImageContext] = useState("");

  // AI Post Generation
  const generatePostMutation = useMutation({
    mutationFn: async (data: { content: string; tone: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/ai/content/generate-post', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.content) {
        onContentGenerated(data.content);
        toast({
          title: "Post generated successfully!",
          description: `AI-powered content created via ${data.source}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate post",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Hashtag Generation
  const generateHashtagsMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/ai/content/hashtags', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.hashtags && Array.isArray(data.hashtags)) {
        setGeneratedHashtags(data.hashtags);
        toast({
          title: "Hashtags generated!",
          description: `${data.hashtags.length} hashtags created via ${data.source}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate hashtags",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Translation
  const translateMutation = useMutation({
    mutationFn: async (data: { content: string; targetLanguage: string }) => {
      const response = await apiRequest('POST', '/api/ai/content/translate', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.translatedContent) {
        onContentGenerated(data.translatedContent);
        toast({
          title: "Translation completed!",
          description: `Content translated via ${data.source}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Translation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Image Description
  const describeImageMutation = useMutation({
    mutationFn: async (data: { imageUrl: string; content?: string }) => {
      const response = await apiRequest('POST', '/api/ai/content/describe-image', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.description) {
        onContentGenerated(data.description);
        toast({
          title: "Image described!",
          description: `Accessibility description created via ${data.source}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Image description failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePost = () => {
    if (!postPrompt.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content or ideas for the post",
        variant: "destructive",
      });
      return;
    }

    generatePostMutation.mutate({
      content: postPrompt,
      tone: postTone,
      platform: postPlatform
    });
  };

  const handleGenerateHashtags = () => {
    const content = hashtagContent.trim() || currentContent.trim();
    if (!content) {
      toast({
        title: "Content required",
        description: "Please enter content to generate hashtags for",
        variant: "destructive",
      });
      return;
    }

    generateHashtagsMutation.mutate({
      content,
      platform: hashtagPlatform
    });
  };

  const handleTranslate = () => {
    const content = translateText.trim() || currentContent.trim();
    if (!content) {
      toast({
        title: "Content required",
        description: "Please enter content to translate",
        variant: "destructive",
      });
      return;
    }

    translateMutation.mutate({
      content,
      targetLanguage
    });
  };

  const handleDescribeImage = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Image URL required",
        description: "Please enter an image URL to describe",
        variant: "destructive",
      });
      return;
    }

    describeImageMutation.mutate({
      imageUrl,
      content: imageContext.trim() || undefined
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const addHashtagToContent = (hashtag: string) => {
    const newContent = currentContent + " " + hashtag;
    onContentGenerated(newContent.trim());
  };

  return (
    <Card className="mb-4 border-og-primary/20 bg-gradient-to-r from-og-primary/5 to-purple-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-og-primary">
          <Bot className="w-5 h-5" />
          <span>AI Content Generation</span>
          <Sparkles className="w-4 h-4 text-purple-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="post" className="flex items-center space-x-1" data-testid="tab-post-generation">
              <PenTool className="w-3 h-3" />
              <span className="hidden sm:inline">Post</span>
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center space-x-1" data-testid="tab-hashtag-generation">
              <Hash className="w-3 h-3" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="translate" className="flex items-center space-x-1" data-testid="tab-translation">
              <Globe className="w-3 h-3" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
            <TabsTrigger value="describe" className="flex items-center space-x-1" data-testid="tab-image-description">
              <ImageIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Describe</span>
            </TabsTrigger>
          </TabsList>

          {/* ✍️ AI-assisted post writing */}
          <TabsContent value="post" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Content ideas or topic</label>
                <Textarea
                  placeholder="Enter your ideas, topic, or key points for the post..."
                  value={postPrompt}
                  onChange={(e) => setPostPrompt(e.target.value)}
                  className="mt-1"
                  rows={3}
                  data-testid="input-post-prompt"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={postTone} onValueChange={setPostTone}>
                    <SelectTrigger className="mt-1" data-testid="select-post-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select value={postPlatform} onValueChange={setPostPlatform}>
                    <SelectTrigger className="mt-1" data-testid="select-post-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0g-chain">0G Chain</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                onClick={handleGeneratePost}
                disabled={generatePostMutation.isPending || !postPrompt.trim()}
                className="w-full bg-og-primary hover:bg-og-primary/90"
                data-testid="button-generate-post"
              >
                {generatePostMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating post...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Post
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* #️⃣ Automated hashtag suggestions */}
          <TabsContent value="hashtags" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Content for hashtags</label>
                <Textarea
                  placeholder={currentContent ? "Using current post content..." : "Enter content to generate hashtags for..."}
                  value={hashtagContent}
                  onChange={(e) => setHashtagContent(e.target.value)}
                  className="mt-1"
                  rows={3}
                  data-testid="input-hashtag-content"
                />
                {currentContent && !hashtagContent && (
                  <p className="text-xs text-og-slate-500 mt-1">
                    Will use your current post content if this field is empty
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Platform</label>
                <Select value={hashtagPlatform} onValueChange={setHashtagPlatform}>
                  <SelectTrigger className="mt-1" data-testid="select-hashtag-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0g-chain">0G Chain</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleGenerateHashtags}
                disabled={generateHashtagsMutation.isPending || (!hashtagContent.trim() && !currentContent.trim())}
                className="w-full bg-og-primary hover:bg-og-primary/90"
                data-testid="button-generate-hashtags"
              >
                {generateHashtagsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating hashtags...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4 mr-2" />
                    Generate Hashtags
                  </>
                )}
              </Button>
              
              {/* Display generated hashtags */}
              {generatedHashtags.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <label className="text-sm font-medium">Generated hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedHashtags.map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-og-primary/10 transition-colors group"
                        onClick={() => addHashtagToContent(hashtag)}
                        data-testid={`hashtag-${index}`}
                      >
                        <span>{hashtag}</span>
                        <Plus className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-og-slate-500">
                    Click a hashtag to add it to your post
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 🌍 Content translation services */}
          <TabsContent value="translate" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Content to translate</label>
                <Textarea
                  placeholder={currentContent ? "Using current post content..." : "Enter content to translate..."}
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  className="mt-1"
                  rows={3}
                  data-testid="input-translate-content"
                />
                {currentContent && !translateText && (
                  <p className="text-xs text-og-slate-500 mt-1">
                    Will use your current post content if this field is empty
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Target language</label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="mt-1" data-testid="select-target-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleTranslate}
                disabled={translateMutation.isPending || (!translateText.trim() && !currentContent.trim())}
                className="w-full bg-og-primary hover:bg-og-primary/90"
                data-testid="button-translate"
              >
                {translateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Translate Content
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* 🖼️ Image description and accessibility */}
          <TabsContent value="describe" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1"
                  data-testid="input-image-url"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional context (optional)</label>
                <Textarea
                  placeholder="Any additional context about the image..."
                  value={imageContext}
                  onChange={(e) => setImageContext(e.target.value)}
                  className="mt-1"
                  rows={2}
                  data-testid="input-image-context"
                />
              </div>
              
              <Button
                onClick={handleDescribeImage}
                disabled={describeImageMutation.isPending || !imageUrl.trim()}
                className="w-full bg-og-primary hover:bg-og-primary/90"
                data-testid="button-describe-image"
              >
                {describeImageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating description...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Describe Image
                  </>
                )}
              </Button>
              
              <div className="text-xs text-og-slate-500 bg-og-slate-50 dark:bg-og-slate-800 p-3 rounded-lg">
                <strong>Accessibility feature:</strong> This generates descriptive text for images to help users with visual impairments understand your content.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}