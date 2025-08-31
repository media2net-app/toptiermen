'use client';

import { useState } from 'react';
import { trackEmailSignup, trackLead } from '@/lib/facebook-pixel';

export default function TestPixelConversion() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setResult('');

    try {
      // Simulate the same flow as the prelaunch page
      const response = await fetch('/api/prelaunch-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          utm_source: 'test',
          utm_medium: 'test',
          utm_campaign: 'test',
          utm_content: 'test',
          utm_term: 'test'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Track the same events as the prelaunch page
        console.log('🎯 Tracking Facebook Pixel events...');
        
        // Track CompleteRegistration event
        trackEmailSignup();
        console.log('✅ CompleteRegistration event tracked');
        
        // Track Lead event
        trackLead(1.00, 'EUR');
        console.log('✅ Lead event tracked');
        
        // Additional tracking for better conversion optimization
        if (typeof window !== 'undefined' && window.fbq) {
          // Track the registration event with more details
          window.fbq('track', 'CompleteRegistration', {
            content_name: 'Test Prelaunch Email Signup',
            content_category: 'Lead Generation',
            value: 1.00,
            currency: 'EUR',
            content_type: 'form',
            status: 'success'
          });
          console.log('✅ Detailed CompleteRegistration event tracked');
          
          // Also track as a lead event
          window.fbq('track', 'Lead', {
            content_name: 'Test Prelaunch Waitlist',
            value: 1.00,
            currency: 'EUR'
          });
          console.log('✅ Detailed Lead event tracked');
        }

        setResult('✅ Success! Facebook Pixel events have been tracked. Check the browser console and Facebook Events Manager.');
      } else {
        setResult(`❌ Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Facebook Pixel Conversion Tracking</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Open Facebook Events Manager</li>
            <li>Go to Test Events</li>
            <li>Submit the form below</li>
            <li>Check if events appear in Test Events</li>
            <li>Check browser console for tracking logs</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="test@example.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium"
          >
            {isSubmitting ? 'Testing...' : 'Test Conversion Tracking'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.includes('✅') ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
          }`}>
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Expected Facebook Pixel Events:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>CompleteRegistration</strong> - Standard registration event</li>
            <li>• <strong>Lead</strong> - Lead generation event</li>
            <li>• <strong>CompleteRegistration</strong> (detailed) - With custom parameters</li>
            <li>• <strong>Lead</strong> (detailed) - With custom parameters</li>
          </ul>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Debug Information:</h3>
          <div className="text-sm text-gray-300">
            <p><strong>Pixel ID:</strong> 1333919368069015</p>
            <p><strong>Test URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown') : 'Loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
