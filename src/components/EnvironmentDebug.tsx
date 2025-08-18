'use client';

import { useState } from 'react';

export default function EnvironmentDebug() {
  const [showDebug, setShowDebug] = useState(false);

  const debugInfo = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
    s3Bucket: process.env.S3_BUCKET_NAME ? 'Set' : 'Missing',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Environment Debug</h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>
      
      {showDebug && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Supabase URL:</strong> {debugInfo.supabaseUrl}
            </div>
            <div>
              <strong>Supabase Anon Key:</strong> {debugInfo.supabaseAnonKey}
            </div>
            <div>
              <strong>AWS Access Key:</strong> {debugInfo.awsAccessKey}
            </div>
            <div>
              <strong>AWS Secret Key:</strong> {debugInfo.awsSecretKey}
            </div>
            <div>
              <strong>S3 Bucket:</strong> {debugInfo.s3Bucket}
            </div>
            <div>
              <strong>Node Env:</strong> {debugInfo.nodeEnv}
            </div>
            <div>
              <strong>Vercel Env:</strong> {debugInfo.vercelEnv || 'Not set'}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This shows if environment variables are set, not their actual values for security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 