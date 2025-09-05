"use client";

import { useState } from 'react';
import { getSneakPreviewEmailTemplate } from '@/lib/email-templates';

export default function SneakPreviewEmailPreview() {
  const [name, setName] = useState('John Doe');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const emailTemplate = getSneakPreviewEmailTemplate(name, videoUrl);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎬 Sneak Preview Email Campaign - Preview
          </h1>
          <p className="text-gray-600 mb-6">
            Preview van de tweede email campagne met platform sneak preview video.
          </p>
          
          {/* Controls */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naam van ontvanger
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bijv. John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtu.be/..."
              />
            </div>
          </div>
          
          {/* Email Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Email Details:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Onderwerp:</strong><br />
                {emailTemplate.subject}
              </div>
              <div>
                <strong>Template:</strong><br />
                sneak_preview
              </div>
              <div>
                <strong>Campagne:</strong><br />
                sneak-preview-campaign
              </div>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Email Preview</h2>
            <p className="text-sm text-gray-600">
              Zo ziet de email eruit voor de ontvanger
            </p>
          </div>
          
          <div className="p-6">
            <div 
              className="border rounded-lg overflow-hidden bg-gray-50"
              style={{ maxWidth: '600px', margin: '0 auto' }}
            >
              <div dangerouslySetInnerHTML={{ __html: emailTemplate.html }} />
            </div>
          </div>
        </div>

        {/* Text Version */}
        <div className="bg-white rounded-lg shadow-md mt-8">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Text Versie</h2>
            <p className="text-sm text-gray-600">
              Fallback voor email clients die geen HTML ondersteunen
            </p>
          </div>
          
          <div className="p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md font-mono">
              {emailTemplate.text}
            </pre>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-md mt-8">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Gebruik Instructies</h2>
          </div>
          
          <div className="p-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">🚀 Hoe te gebruiken:</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">1. Via API Route (Individueel)</h4>
                <pre className="text-sm bg-blue-100 p-3 rounded text-blue-800 overflow-x-auto">
{`POST /api/admin/send-sneak-preview-email
{
  "email": "gebruiker@example.com",
  "name": "John Doe",
  "videoUrl": "https://youtu.be/jouw-preview-video"
}`}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-900 mb-2">2. Via Email Service (Bulk)</h4>
                <pre className="text-sm bg-green-100 p-3 rounded text-green-800 overflow-x-auto">
{`await emailService.sendEmail({
  to: "gebruiker@example.com",
  template: "sneak_preview",
  variables: {
    name: "John Doe",
    videoUrl: "https://youtu.be/jouw-preview-video"
  }
}, {
  campaign_id: "sneak-preview-campaign",
  template_type: "sneak_preview"
});`}
                </pre>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">🎯 Campaign Strategie</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li><strong>Week 1:</strong> Platform Preview Video (deze email)</li>
                  <li><strong>Week 2:</strong> Academy Content Sneak Peek</li>
                  <li><strong>Week 3:</strong> Beta Toegang Uitnodiging</li>
                  <li><strong>Week 4:</strong> Volledige Platform Launch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
