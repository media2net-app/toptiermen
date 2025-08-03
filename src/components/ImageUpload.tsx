'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string | null) => void;
  bucketName?: string;
  folder?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  bucketName = 'module-covers',
  folder = 'covers',
  maxSize = 50, // Updated from 5 to 50MB
  className = ''
}: ImageUploadProps) {
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
      
      // Generate unique filename
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      setUploadProgress(100);
      onImageUploaded(publicUrl);

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
      // Extract filename from URL
      const urlParts = currentImageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([`${folder}/${fileName}`]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        setError('Verwijderen mislukt. Probeer opnieuw.');
        return;
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
            alt="Module cover"
            className="w-full h-48 object-cover rounded-xl border border-[#3A4D23]"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Verwijder afbeelding"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {!currentImageUrl && (
        <div className="border-2 border-dashed border-[#3A4D23] rounded-xl p-6 text-center hover:border-[#8BAE5A] transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-2 w-full"
          >
            <PhotoIcon className="w-12 h-12 text-[#8BAE5A]" />
            <span className="text-[#8BAE5A] font-semibold">
              {uploading ? 'Uploaden...' : 'Cover afbeelding uploaden'}
            </span>
            <span className="text-[#B6C948] text-sm">
              JPEG, PNG, WebP, GIF of HEIC (max {maxSize}MB)
            </span>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-[#3A4D23] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Replace Button (when image exists) */}
      {currentImageUrl && !uploading && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] font-semibold rounded-lg transition-colors"
        >
          Vervang afbeelding
        </button>
      )}
    </div>
  );
} 