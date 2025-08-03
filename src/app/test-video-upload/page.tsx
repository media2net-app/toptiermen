'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Import VideoUpload component
import VideoUpload from '@/components/VideoUpload';

// Create Supabase client for storage
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export default function TestVideoUpload() {
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [supabaseFiles, setSupabaseFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    // Debug environment variables
    const fetchDebugInfo = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setDebugInfo({
            hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
            hasSupabaseKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
            supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ? 'Configured' : 'Missing',
            supabaseKeyStart: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : 'Missing',
            isConfigured: false
          });
          return;
        }

        // Test connection by trying to list buckets
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        setDebugInfo({
          hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
          hasSupabaseKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
          supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ? 'Configured' : 'Missing',
          supabaseKeyStart: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : 'Missing',
          isConfigured: !error,
          buckets: buckets?.map(b => b.name) || [],
          error: error?.message
        });
      } catch (error) {
        console.error('Failed to fetch debug info:', error);
        setDebugInfo({
          hasSupabaseUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
          hasSupabaseKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
          supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ? 'Configured' : 'Missing',
          supabaseKeyStart: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' : 'Missing',
          isConfigured: false,
          error: 'Connection failed'
        });
      }
    };

    fetchDebugInfo();
    fetchSupabaseFiles();
  }, []);

  const fetchSupabaseFiles = async () => {
    setLoadingFiles(true);
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase client not available');
        return;
      }

      const { data: files, error } = await supabase.storage
        .from('workout-videos')
        .list('exercises', {
          limit: 100,
          offset: 0
        });
      
      if (error) {
        console.error('Failed to fetch Supabase files:', error);
      } else {
        setSupabaseFiles(files || []);
        console.log('📂 Supabase files loaded:', files);
      }
    } catch (error) {
      console.error('Failed to fetch Supabase files:', error);
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
          <p className="text-[#B6C948]">Test de video upload functionaliteit met Supabase Storage</p>
        </div>

        {/* Debug Information */}
        <div className="mb-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">Debug Informatie</h2>
          <div className="space-y-2 text-[#B6C948] text-sm">
            <div>Has Supabase URL: {debugInfo.hasSupabaseUrl ? '✅' : '❌'}</div>
            <div>Has Supabase Key: {debugInfo.hasSupabaseKey ? '✅' : '❌'}</div>
            <div>Supabase URL: {debugInfo.supabaseUrl}</div>
            <div>Supabase Key Start: {debugInfo.supabaseKeyStart}</div>
            <div>Is Configured: {debugInfo.isConfigured ? '✅' : '❌'}</div>
            {debugInfo.buckets && (
              <div>Available Buckets: {debugInfo.buckets.join(', ')}</div>
            )}
            {debugInfo.error && (
              <div className="text-red-400">Error: {debugInfo.error}</div>
            )}
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
              <span>Supabase Storage: workout-videos bucket (exercises folder)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>NEXT_PUBLIC_SUPABASE_URL: Geconfigureerd</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8BAE5A] rounded-full"></div>
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: Geconfigureerd</span>
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

        {/* Supabase Storage Directory View */}
        <div className="mt-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#8BAE5A]">Supabase Storage Directory View</h2>
            <button 
              onClick={fetchSupabaseFiles}
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
          ) : supabaseFiles.length === 0 ? (
            <div className="text-center py-8 text-[#B6C948]">
              <p>Geen bestanden gevonden in Supabase Storage</p>
              <p className="text-sm mt-2">Upload een video om te beginnen</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-[#B6C948] mb-3">
                Totaal: {supabaseFiles.length} bestand(en)
              </div>
              {supabaseFiles.map((file, index) => {
                const supabase = getSupabaseClient();
                const publicUrl = supabase?.storage
                  .from('workout-videos')
                  .getPublicUrl(`exercises/${file.name}`).data.publicUrl;
                
                return (
                  <div key={index} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-[#8BAE5A] font-semibold">{file.name}</h3>
                        <div className="text-sm text-[#B6C948] mt-1 space-y-1">
                          <div>Grootte: {(file.metadata?.size / 1024 / 1024).toFixed(2)} MB</div>
                          <div>Type: {file.metadata?.mimetype}</div>
                          <div>Geüpload: {new Date(file.updated_at).toLocaleString('nl-NL')}</div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <a 
                          href={publicUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors text-sm"
                        >
                          Bekijk
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
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