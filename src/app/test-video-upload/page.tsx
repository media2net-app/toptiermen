'use client';

import { useState } from 'react';
import VideoUpload from '@/components/VideoUpload';
import { toast } from 'react-hot-toast';

export default function TestVideoUpload() {
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUploaded = (url: string) => {
    console.log('🎯 Video uploaded successfully:', url);
    setUploadedUrl(url);
    setIsUploading(false);
    toast.success('Video succesvol geüpload!');
  };

  const handleVideoUploadStart = () => {
    console.log('🚀 Video upload started');
    setIsUploading(true);
  };

  const handleVideoUploadError = (error: string) => {
    console.error('❌ Video upload error:', error);
    setIsUploading(false);
    toast.error(`Video upload mislukt: ${error}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-4">
            Video Upload Test
          </h1>
          <p className="text-[#B6C948]">
            Test pagina voor het diagnosticeren van video upload problemen in het trainingscentrum.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Upload Component */}
          <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">
              Video Upload Test
            </h2>
            <VideoUpload
              currentVideoUrl={uploadedUrl}
              onVideoUploaded={handleVideoUploaded}
              onVideoUploadStart={handleVideoUploadStart}
              onVideoUploadError={handleVideoUploadError}
            />
          </div>

          {/* Debug Information */}
          <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">
              Debug Informatie
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-[#B6C948] font-semibold mb-2">Upload Status</h3>
                <div className="bg-[#232D1A] rounded-lg p-3">
                  <p className="text-sm text-white">
                    Status: {isUploading ? 'Uploading...' : 'Ready'}
                  </p>
                  {uploadedUrl && (
                    <p className="text-sm text-[#8BAE5A] mt-2">
                      URL: {uploadedUrl}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-[#B6C948] font-semibold mb-2">Environment Variables</h3>
                <div className="bg-[#232D1A] rounded-lg p-3">
                  <p className="text-sm text-white">
                    Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}
                  </p>
                  <p className="text-sm text-white">
                    Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-[#B6C948] font-semibold mb-2">Test Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      fetch('/api/test-supabase')
                        .then(res => res.json())
                        .then(data => {
                          console.log('Supabase test result:', data);
                          toast.success('Supabase test completed - check console');
                        })
                        .catch(err => {
                          console.error('Supabase test failed:', err);
                          toast.error('Supabase test failed');
                        });
                    }}
                    className="w-full bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Test Supabase Connection
                  </button>
                  
                  <button
                    onClick={() => {
                      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
                      console.log('Test file created:', testFile);
                      toast.success('Test file created - check console');
                    }}
                    className="w-full bg-[#FFD700] hover:bg-[#FFA500] text-[#0A0F0A] font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Test File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
          <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">
            Test Instructies
          </h2>
          <div className="space-y-2 text-[#B6C948]">
            <p>1. Open de browser console (F12) om debug informatie te zien</p>
            <p>2. Probeer een video bestand te uploaden</p>
            <p>3. Controleer de console voor foutmeldingen</p>
            <p>4. Test de Supabase verbinding met de knop hierboven</p>
            <p>5. Ondersteunde formaten: MP4, MOV, AVI, WEBM, MKV, QuickTime</p>
            <p>6. Maximum bestandsgrootte: 500MB</p>
          </div>
        </div>
      </div>
    </div>
  );
} 