'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

// Import VideoUpload component
import VideoUpload from '@/components/VideoUpload';

export default function TestVideoUpload() {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [blobFiles, setBlobFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    // Debug environment variables via API
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/blob-config');
        const data = await response.json();
        
        setDebugInfo({
          hasProcess: typeof process !== 'undefined',
          hasEnv: typeof process !== 'undefined' && !!process.env,
          hasBlobToken: data.hasToken,
          blobTokenLength: data.tokenLength,
          blobTokenStart: data.tokenLength > 0 ? 'vercel_blob...' : 'N/A',
          isConfigured: data.isConfigured,
          storeName: data.storeName
        });
      } catch (error) {
        console.error('Failed to fetch debug info:', error);
        setDebugInfo({
          hasProcess: typeof process !== 'undefined',
          hasEnv: typeof process !== 'undefined' && !!process.env,
          hasBlobToken: false,
          blobTokenLength: 0,
          blobTokenStart: 'N/A',
          isConfigured: false,
          storeName: 'Unknown'
        });
      }
    };

    fetchDebugInfo();
    fetchBlobFiles();
  }, []);

  const fetchBlobFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/blob-files');
      const data = await response.json();
      
      if (data.success) {
        setBlobFiles(data.files);
        console.log('📂 Blob files loaded:', data.files);
      } else {
        console.error('Failed to fetch blob files:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch blob files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleVideoUploaded = (url: string) => {
    setUploadedVideoUrl(url);
    toast.success('Video succesvol geüpload!');
    console.log('Video URL:', url);
  };

  return (
    <div className="p-6 bg-[#0A0F0A] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Video Upload Test</h1>
          <p className="text-[#B6C948]">Test de video upload functionaliteit met Vercel Blob</p>
        </div>

        {/* Debug Information */}
        <div className="mb-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">Debug Informatie</h2>
          <div className="space-y-2 text-[#B6C948] text-sm">
            <div>Has Process: {debugInfo.hasProcess ? '✅' : '❌'}</div>
            <div>Has Env: {debugInfo.hasEnv ? '✅' : '❌'}</div>
            <div>Has Blob Token: {debugInfo.hasBlobToken ? '✅' : '❌'}</div>
            <div>Token Length: {debugInfo.blobTokenLength}</div>
            <div>Token Start: {debugInfo.blobTokenStart}</div>
            <div>Is Configured: {debugInfo.isConfigured ? '✅' : '❌'}</div>
            <div>Store Name: {debugInfo.storeName}</div>
          </div>
        </div>

        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">Upload Video</h2>
          
          <VideoUpload
            currentVideoUrl={uploadedVideoUrl || ''}
            onVideoUploaded={handleVideoUploaded}
            className="mb-6"
          />

          {uploadedVideoUrl && uploadedVideoUrl.trim() && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Geüploade Video:</h3>
              <div className="bg-[#181F17] rounded-lg p-4">
                <video 
                  controls 
                  className="w-full max-w-2xl mx-auto rounded-lg"
                  src={uploadedVideoUrl}
                >
                  Je browser ondersteunt geen video afspelen.
                </video>
                <div className="mt-3">
                  <p className="text-[#B6C948] text-sm">Video URL:</p>
                  <code className="text-[#8BAE5A] text-xs break-all bg-[#181F17] p-2 rounded block mt-1">
                    {uploadedVideoUrl}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">Status Informatie</h2>
          <div className="space-y-3 text-[#B6C948]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>Vercel Blob Store: {debugInfo.storeName || 'toptiermen-final-blob'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>BLOB_READ_WRITE_TOKEN: Geconfigureerd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>Video Upload: Beschikbaar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>Maximum grootte: 500MB</span>
            </div>
          </div>
        </div>

        {/* Blob Directory View */}
        <div className="mt-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#8BAE5A]">Blob Directory View</h2>
            <button 
              onClick={fetchBlobFiles}
              disabled={loadingFiles}
              className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50"
            >
              {loadingFiles ? 'Laden...' : 'Ververs'}
            </button>
          </div>
          
          {loadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#3A4D23] border-t-[#8BAE5A] rounded-full animate-spin"></div>
              <span className="ml-3 text-[#B6C948]">Bestanden laden...</span>
            </div>
          ) : blobFiles.length === 0 ? (
            <div className="text-center py-8 text-[#B6C948]">
              <p>Geen bestanden gevonden in de blob store</p>
              <p className="text-sm mt-2">Upload een video om te beginnen</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-[#B6C948] mb-3">
                Totaal: {blobFiles.length} bestand(en)
              </div>
              {blobFiles.map((file, index) => (
                <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-[#8BAE5A] font-semibold">{file.pathname}</h3>
                      <div className="text-sm text-[#B6C948] mt-1 space-y-1">
                        <div>Grootte: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        <div>Type: {file.contentType}</div>
                        <div>Geüpload: {new Date(file.uploadedAt).toLocaleString('nl-NL')}</div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors text-sm"
                      >
                        Bekijk
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#232D1A',
            color: '#B6C948',
            border: '1px solid #3A4D23',
          },
          success: {
            style: {
              background: '#0A0F0A',
              color: '#8BAE5A',
              border: '1px solid #8BAE5A',
            },
          },
          error: {
            style: {
              background: '#0A0F0A',
              color: '#ef4444',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </div>
  );
} 