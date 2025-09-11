'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { Camera, X, Upload, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadProfileImage, deleteProfileImage, validateProfileImage } from '@/lib/uploadProfileImage';

interface ProfileImageUploaderProps {
  name: string;
  color: string;
  profileImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
  size?: number;
  // Required for Firebase Storage upload
  userId: string;
  memberId: string;
}

/**
 * Enhanced ProfileImageUploader with drag & drop and better UX:
 * 1. Click or drag & drop to upload photos
 * 2. Better visual feedback during all states
 * 3. Smooth animations and transitions
 * 4. Clear success/error messaging
 */
export function ProfileImageUploader({
  name,
  color,
  profileImageUrl,
  onImageChange,
  className,
  disabled = false,
  size = 120,
  userId,
  memberId
}: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate file using utility function
    const validation = validateProfileImage(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Create preview URL for immediate feedback
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Firebase Storage (now enabled!)
      const downloadURL = await uploadProfileImage(file, userId, memberId);
      
      // Debug logging
      console.log('📤 ProfileImageUploader: Image uploaded successfully!', {
        fileName: file.name,
        fileSize: file.size,
        downloadURL,
        userId,
        memberId
      });
      
      // Update the parent component with the permanent URL
      onImageChange(downloadURL);
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Clear preview URL after successful upload
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      setIsUploading(false);
      
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [onImageChange, userId, memberId, previewUrl]);

  const handleFileSelect = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      await processFile(file);
    }
  }, [disabled, isUploading, processFile]);

  const handleRemoveImage = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (disabled || isUploading) return;
    
    // Delete from Firebase Storage if it's a Firebase URL
    if (profileImageUrl && profileImageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        await deleteProfileImage(profileImageUrl);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        // Continue with local removal even if cloud deletion fails
      }
    }
    
    // Update the form state to remove the image
    onImageChange(null);
    setUploadError(null);
    setUploadSuccess(false);
  };

  // Clear error after 5 seconds
  React.useEffect(() => {
    if (uploadError) {
      const timeout = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [uploadError]);

  const displayUrl = previewUrl || profileImageUrl;

  return (
    <div 
      className={cn("flex flex-col items-center space-y-6", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Main Upload Area */}
      <div 
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          e.stopPropagation();
          handleFileSelect(e);
        }}
      >
        {/* Profile Image with Enhanced Styling */}
        <div className={cn(
          "relative transition-all duration-300",
          isDragging && "scale-105 ring-4 ring-blue-500/30",
          isUploading && "animate-pulse",
          !disabled && !isUploading && "hover:scale-105"
        )}>
          <ProfileImage
            name={name}
            profileImageUrl={displayUrl}
            color={color}
            size={size}
            showBorder={true}
            borderColor={isDragging ? "rgba(59, 130, 246, 0.5)" : "rgba(0,0,0,0.1)"}
            className={cn(
              "shadow-lg transition-all duration-300",
              !disabled && "hover:shadow-xl",
              isDragging && "shadow-2xl"
            )}
            fontWeight="bold"
          />

          {/* Upload Overlay */}
          {!isUploading && (
            <div className={cn(
              "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 transition-all duration-300",
              !disabled && "group-hover:opacity-100",
              isDragging && "opacity-100"
            )}>
              <div className="text-center text-white">
                <Camera className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">
                  {isDragging ? 'Drop here' : 'Upload'}
                </span>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                <span className="text-xs font-medium">Uploading...</span>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {uploadSuccess && (
            <div className="absolute inset-0 bg-green-600/80 rounded-full flex items-center justify-center animate-in fade-in-0 duration-300">
              <div className="text-center text-white">
                <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">Success!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="text-center space-y-2">
        <div className={cn(
          "text-sm font-medium transition-colors",
          isDragging ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
        )}>
          {isDragging ? (
            <span className="flex items-center gap-2 justify-center">
              <ImageIcon className="w-4 h-4" />
              Drop your photo here
            </span>
          ) : (
            <span>Click or drag photo to upload</span>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          JPG, PNG, GIF, WebP up to 5MB • {profileImageUrl ? 'Or remove to show initials' : 'Or keep initials'}
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            📱 iPhone users: Convert HEIC photos to JPG in Photos app first (Share → Save to Files → JPEG)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleFileSelect(e);
          }}
          disabled={disabled || isUploading}
          size="sm"
          className={cn(
            "transition-all duration-200",
            uploadSuccess && "bg-green-600 hover:bg-green-700"
          )}
        >
          {uploadSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Uploaded!
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {profileImageUrl ? 'Change Photo' : 'Choose Photo'}
            </>
          )}
        </Button>

        {profileImageUrl && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage(e);
            }}
            disabled={disabled || isUploading}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Status Messages */}
      {uploadError && (
        <div className="max-w-md text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="whitespace-pre-line text-left leading-relaxed">
              {uploadError}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}