'use client';

import { useState, useRef } from 'react';
import { put, del } from '@vercel/blob';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface VercelBlobUploadProps {
  currentUrl?: string | null;
  onUploadComplete: (url: string | null) => void;
  folder?: string;
  fileType?: 'image' | 'video' | 'document' | 'any';
  maxSize?: number; // in MB
  className?: string;
  access?: 'public' | 'private';
  cacheControlMaxAge?: number;
}

export default function VercelBlobUpload({
  currentUrl,
  onUploadComplete,
  folder = 'uploads',
  fileType = 'any',
  maxSize = 100, // Updated from 10 to 100MB
  className = '',
  access = 'public',
  cacheControlMaxAge = 3600
}: VercelBlobUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if Vercel Blob is configured
  const isBlobConfigured = typeof process !== 'undefined' && process.env.BLOB_READ_WRITE_TOKEN;

  const getFileTypeConfig = () => {
    switch (fileType) {
      case 'image':
        return {
          accept: 'image/*',
          icon: PhotoIcon,
          label: 'Afbeelding',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        };
      case 'video':
        return {
          accept: 'video/*',
          icon: VideoCameraIcon,
          label: 'Video',
          allowedTypes: ['video/mp4', 'video/webm', 'video/avi', 'video/mov']
        };
      case 'document':
        return {
          accept: '.pdf,.doc,.docx,.txt',
          icon: DocumentIcon,
          label: 'Document',
          allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        };
      default:
        return {
          accept: '*/*',
          icon: CloudArrowUpIcon,
          label: 'Bestand',
          allowedTypes: []
        };
    }
  };

  const config = getFileTypeConfig();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if Blob is configured
    if (!isBlobConfigured) {
      setError('Vercel Blob is niet geconfigureerd. Voeg BLOB_READ_WRITE_TOKEN toe aan je environment variables.');
      return;
    }

    // Validate file type
    if (fileType !== 'any' && config.allowedTypes.length > 0) {
      if (!config.allowedTypes.includes(file.type)) {
        setError(`Alleen ${config.label.toLowerCase()} bestanden zijn toegestaan.`);
        return;
      }
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
      // Generate unique filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileExt = file.name.split('.').pop();
      const randomSuffix = Math.random().toString(36).substring(2);
      const filename = `${folder}/${timestamp}-${randomSuffix}.${fileExt}`;

      console.log('🔄 Uploading to Vercel Blob:', filename);

      // Upload using Vercel Blob put function
      const { url } = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false, // We handle this manually
        cacheControlMaxAge,
        contentType: file.type
      });

      console.log('✅ Upload successful:', url);
      
      setUploadProgress(100);
      onUploadComplete(url);

    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Upload mislukt. Probeer opnieuw.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl) return;

    // Check if Blob is configured
    if (!isBlobConfigured) {
      setError('Vercel Blob is niet geconfigureerd. Voeg BLOB_READ_WRITE_TOKEN toe aan je environment variables.');
      return;
    }

    try {
      console.log('🗑️ Deleting from Vercel Blob:', currentUrl);

      // Delete using Vercel Blob del function
      await del(currentUrl);

      console.log('✅ Delete successful');
      onUploadComplete(null);
      setError(null);
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setError('Verwijderen mislukt. Probeer opnieuw.');
    }
  };

  const getFileIcon = () => {
    const IconComponent = config.icon;
    return <IconComponent className="w-8 h-8" />;
  };

  const getFilePreview = () => {
    if (!currentUrl) return null;

    if (fileType === 'image') {
      return (
        <img
          src={currentUrl}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    }

    if (fileType === 'video') {
      return (
        <video
          src={currentUrl}
          controls
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    }

    // For documents or any other type, show a file icon
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <DocumentIcon className="w-16 h-16 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Document Preview</span>
      </div>
    );
  };

  // Show configuration error if Blob is not configured
  if (!isBlobConfigured) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Vercel Blob Niet Geconfigureerd
              </h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                Voeg de <code className="bg-red-100 dark:bg-red-800 px-2 py-1 rounded">BLOB_READ_WRITE_TOKEN</code> toe aan je environment variables.
              </p>
              <div className="mt-4 space-y-2 text-sm text-red-600 dark:text-red-300">
                <p><strong>Stappen om op te lossen:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Ga naar je Vercel Dashboard</li>
                  <li>Selecteer je project</li>
                  <li>Ga naar Settings → Environment Variables</li>
                  <li>Voeg toe: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">BLOB_READ_WRITE_TOKEN</code></li>
                  <li>Herstart je development server</li>
                </ol>
                <p className="mt-3">
                  <strong>Voor lokale ontwikkeling:</strong> Maak een <code className="bg-red-100 dark:bg-red-800 px-1 rounded">.env.local</code> bestand aan met de token.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current File Display */}
      {currentUrl && (
        <div className="relative">
          {getFilePreview()}
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Verwijder bestand"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploading
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              {getFileIcon()}
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {uploading ? 'Uploaden...' : `${config.label} uploaden`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {uploading 
                  ? 'Even geduld, bestand wordt geüpload...'
                  : `Sleep je ${config.label.toLowerCase()} hierheen of klik om te selecteren`
                }
              </p>
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {!uploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Bestand selecteren
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Maximum bestandsgrootte: {maxSize}MB</p>
        <p>• Toegang: {access === 'public' ? 'Publiek' : 'Privé'}</p>
        <p>• Cache: {cacheControlMaxAge} seconden</p>
        <p>• Folder: {folder}</p>
      </div>
    </div>
  );
} 