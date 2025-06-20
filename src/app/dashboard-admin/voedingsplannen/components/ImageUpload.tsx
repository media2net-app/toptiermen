'use client';
import { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onImageChange, className = '' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const generateImageId = () => {
    return `recipe-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const saveImageToLocalStorage = (base64Data: string): string => {
    const imageId = generateImageId();
    try {
      localStorage.setItem(imageId, base64Data);
      return imageId;
    } catch (error) {
      console.error('Error saving image to localStorage:', error);
      // Fallback: return the base64 data directly if localStorage fails
      return base64Data;
    }
  };

  const getImageFromLocalStorage = (imageId: string): string | null => {
    try {
      return localStorage.getItem(imageId);
    } catch (error) {
      console.error('Error getting image from localStorage:', error);
      return null;
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Afbeelding is te groot. Maximum grootte is 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        
        // Save to localStorage and get the ID
        const imageId = saveImageToLocalStorage(result);
        onImageChange(imageId);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Alleen afbeeldingen zijn toegestaan.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDisplayImage = () => {
    if (!currentImage) return null;
    
    // If it's a localStorage ID, get the actual image
    if (currentImage.startsWith('recipe-image-')) {
      return getImageFromLocalStorage(currentImage) || null;
    }
    
    // If it's already a base64 string, return it
    if (currentImage.startsWith('data:image/')) {
      return currentImage;
    }
    
    // If it's a URL, return it
    return currentImage;
  };

  const displayImage = getDisplayImage();

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
        Recept Foto
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
            : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A]/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Recipe preview"
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-[#3A4D23]/40 rounded-lg">
              <span className="text-[#8BAE5A]/60">📷 Foto niet beschikbaar</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <PhotoIcon className="mx-auto h-12 w-12 text-[#8BAE5A]/60" />
            <div className="text-[#8BAE5A]">
              <p className="font-medium">Klik om een foto te uploaden</p>
              <p className="text-sm">of sleep een afbeelding hierheen</p>
            </div>
            <p className="text-xs text-[#8BAE5A]/60">
              PNG, JPG, GIF tot 5MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
} 