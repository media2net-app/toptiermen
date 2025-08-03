import { put, del, list, PutBlobResult, ListBlobResult } from '@vercel/blob';

export interface BlobUploadOptions {
  access?: 'public' | 'private';
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
  contentType?: string;
}

export interface BlobDeleteOptions {
  token?: string;
}

/**
 * Upload a file to Vercel Blob
 * @param path - The path where the file should be stored
 * @param data - The file data (string, Buffer, Blob, or File)
 * @param options - Upload options
 * @returns Promise with the uploaded blob URL
 */
export async function uploadToBlob(
  path: string,
  data: string | Buffer | Blob | File,
  options: BlobUploadOptions = {}
): Promise<PutBlobResult> {
  try {
    const {
      access = 'public',
      addRandomSuffix = true,
      cacheControlMaxAge = 3600,
      contentType
    } = options;

    // Add random suffix if requested
    const finalPath = addRandomSuffix 
      ? `${path.replace(/\.[^/.]+$/, '')}-${Date.now()}-${Math.random().toString(36).substring(2)}${path.match(/\.[^/.]+$/)?.[0] || ''}`
      : path;

    const result = await put(finalPath, data, {
      access: 'public',
      addRandomSuffix: false, // We handle this manually
      cacheControlMaxAge,
      contentType
    });

    return result;
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Vercel Blob
 * @param url - The URL of the file to delete
 * @param options - Delete options
 * @returns Promise indicating success
 */
export async function deleteFromBlob(
  url: string,
  options: BlobDeleteOptions = {}
): Promise<void> {
  try {
    await del(url, options);
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in a Vercel Blob store
 * @param options - List options
 * @returns Promise with list of blobs
 */
export async function listBlobs(options: {
  cursor?: string;
  limit?: number;
  prefix?: string;
} = {}): Promise<ListBlobResult> {
  try {
    const result = await list(options);
    return result;
  } catch (error) {
    console.error('Error listing Vercel Blob files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload an image file with automatic processing
 * @param file - The image file to upload
 * @param folder - The folder path (e.g., 'images/avatars')
 * @param options - Upload options
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(
  file: File | Blob,
  folder: string = 'images',
  options: BlobUploadOptions = {}
): Promise<string> {
  try {
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const result = await uploadToBlob(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 86400, // 24 hours for images
      contentType: file instanceof File ? file.type : 'image/jpeg',
      ...options
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload a video file
 * @param file - The video file to upload
 * @param folder - The folder path (e.g., 'videos/training')
 * @param options - Upload options
 * @returns Promise with the uploaded video URL
 */
export async function uploadVideo(
  file: File | Blob,
  folder: string = 'videos',
  options: BlobUploadOptions = {}
): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'mp4';
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const result = await uploadToBlob(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 3600, // 1 hour for videos
      contentType: file instanceof File ? file.type : 'video/mp4',
      ...options
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

/**
 * Upload a document file
 * @param file - The document file to upload
 * @param folder - The folder path (e.g., 'documents/books')
 * @param options - Upload options
 * @returns Promise with the uploaded document URL
 */
export async function uploadDocument(
  file: File | Blob,
  folder: string = 'documents',
  options: BlobUploadOptions = {}
): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'pdf';
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const result = await uploadToBlob(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 7200, // 2 hours for documents
      contentType: file instanceof File ? file.type : 'application/pdf',
      ...options
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Example usage for the Toptiermen project
 */
export const blobExamples = {
  // Upload affiliate banner image
  uploadAffiliateBanner: async (file: File) => {
    return await uploadImage(file, 'affiliates/banners', {
      cacheControlMaxAge: 86400 // 24 hours
    });
  },

  // Upload training video
  uploadTrainingVideo: async (file: File) => {
    return await uploadVideo(file, 'training/videos', {
      cacheControlMaxAge: 3600 // 1 hour
    });
  },

  // Upload book PDF
  uploadBookPDF: async (file: File) => {
    return await uploadDocument(file, 'books/pdfs', {
      cacheControlMaxAge: 7200 // 2 hours
    });
  },

  // Upload user avatar
  uploadUserAvatar: async (file: File, userId: string) => {
    return await uploadImage(file, `users/${userId}/avatars`, {
      addRandomSuffix: false,
      cacheControlMaxAge: 86400
    });
  },

  // Upload Malaga video content
  uploadMalagaVideo: async (file: File, videoId: string) => {
    return await uploadVideo(file, `malaga/videos/${videoId}`, {
      cacheControlMaxAge: 3600
    });
  }
}; 