import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads a profile image to Firebase Storage and returns the download URL
 */
export async function uploadProfileImage(
  file: File, 
  userId: string, 
  memberId: string
): Promise<string> {
  try {
    const processedFile = file;
    let fileName = `profile_${Date.now()}`;
    
    // Check if file is HEIC and provide clear guidance
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    
    if (isHeic) {
      console.log('❌ HEIC file detected, providing conversion guidance:', file.name);
      
      throw new Error(`HEIC photos need to be converted to JPG format first.

📱 **On iPhone/iPad:**
• Open Photos app → Select your photo
• Tap Share → "Save to Files" → Choose JPEG format
• Or tap "Duplicate" → "Duplicate as JPEG"

💻 **On Mac:**
• Open photo in Preview
• File → Export → Format: JPEG

📸 **Quick tip:**
• Go to Settings → Camera → Formats → "Most Compatible" to save future photos as JPG automatically

🔄 **Alternative:** Take a new photo or choose a different image (JPG, PNG, WebP)`);
    }
    
    // Use original file extension for supported formats
    const fileExtension = file.name.split('.').pop() || 'jpg';
    fileName = `${fileName}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `profile-images/${userId}/${memberId}/${fileName}`);
    
    // Upload processed file
    const snapshot = await uploadBytes(storageRef, processedFile);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}

/**
 * Deletes a profile image from Firebase Storage
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
      // Not a Firebase Storage URL, skip deletion
      return;
    }
    
    // Extract the storage path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting profile image:', error);
    // Don't throw error for deletion failures - just log them
  }
}

/**
 * Validates if a file is a valid image for profile upload
 */
export function validateProfileImage(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file (JPG, PNG, etc.)' };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be smaller than 5MB' };
  }
  
  // Check supported formats (excluding HEIC since we don't convert them)
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!supportedTypes.includes(file.type)) {
    // Check if it's HEIC and provide specific guidance
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    
    if (isHeic) {
      return { 
        isValid: false, 
        error: 'HEIC files need to be converted to JPG first. Use Photos app on iPhone/iPad or Preview on Mac to export as JPEG.' 
      };
    }
    
    return { isValid: false, error: 'Please use JPG, PNG, GIF, or WebP format' };
  }
  
  return { isValid: true };
}