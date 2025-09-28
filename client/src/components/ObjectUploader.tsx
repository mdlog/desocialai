import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { uploadURL: string; file: File }) => void;
  buttonClassName?: string;
  children: React.ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  acceptedFileTypes = ["image/*"],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const isValidType = acceptedFileTypes.some(type => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -2));
      }
      return file.type === type;
    });

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: `Please select a file of type: ${acceptedFileTypes.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Get upload parameters
      const { method, url } = await onGetUploadParameters();
      
      // Upload file
      const response = await fetch(url, {
        method,
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Call completion callback
      onComplete?.({
        uploadURL: url,
        file,
      });

      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully.",
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(",")}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button 
        onClick={handleFileSelect} 
        disabled={isUploading}
        className={buttonClassName}
      >
        {isUploading ? "Uploading..." : children}
      </Button>
    </>
  );
}