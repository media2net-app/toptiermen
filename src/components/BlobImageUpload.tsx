'use client';

import { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

interface BlobImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string | null) => void;
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function BlobImageUpload({
  currentImageUrl,
  onImageUploaded,
  folder = 'images',
  maxSize = 50, // Updated from 5 to 50MB
  className = ''
}: BlobImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type) && !isHeicFile(file)) {
      setError('Alleen JPEG, PNG, WebP, GIF en HEIC bestanden zijn toegestaan.');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Bestand is te groot. Maximum grootte is ${maxSize}MB.`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Convert HEIC to JPEG if needed
      const processedFile = await convertHeicToJpeg(file);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('folder', folder);

      // Upload to Vercel Blob via API
      const response = await fetch('/api/upload/blob', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload mislukt');
      }

      const { url } = await response.json();
      
      setUploadProgress(100);
      onImageUploaded(url);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload mislukt. Probeer opnieuw.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    try {
      // Delete from Vercel Blob via API
      const response = await fetch('/api/upload/blob', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentImageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verwijderen mislukt');
      }

      onImageUploaded(null);
      setError(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Verwijderen mislukt. Probeer opnieuw.');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Current"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentImageUrl && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploaden... {uploadProgress}%</p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <PhotoIcon className="w-12 h-12" />
              <span className="text-sm">Klik om afbeelding te uploaden</span>
              <span className="text-xs">Max {maxSize}MB</span>
            </button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 