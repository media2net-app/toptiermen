'use client';

import { useState } from 'react';
import { trackEvent, trackEmailSignup, trackLead, trackConversion } from '@/lib/facebook-pixel';

export default function TestPixelPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (event: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${event}`]);
  };

  const testPageView = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
      addTestResult('PageView event sent');
    }
  };

  const testEmailSignup = () => {
    trackEmailSignup();
    addTestResult('EmailSignup event sent');
  };

  const testLead = () => {
    trackLead(5.00, 'EUR');
    addTestResult('Lead event sent (€5.00)');
  };

  const testConversion = () => {
    trackConversion(25.00, 'EUR');
    addTestResult('Conversion event sent (€25.00)');
  };

  const testCustomEvent = () => {
    trackEvent('TestEvent', { test_param: 'test_value' });
    addTestResult('Custom event sent');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Meta Pixel Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Events</h2>
            <div className="space-y-4">
              <button
                onClick={testPageView}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Test PageView
              </button>
              
              <button
                onClick={testEmailSignup}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Test Email Signup
              </button>
              
              <button
                onClick={testLead}
                className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
              >
                Test Lead (€5.00)
              </button>
              
              <button
                onClick={testConversion}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Test Conversion (€25.00)
              </button>
              
              <button
                onClick={testCustomEvent}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                Test Custom Event
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-900 p-4 rounded h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400">No events sent yet. Click the buttons to test.</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm text-green-400">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-gray-300">
            <p>1. Open Facebook Events Manager to see if events are received</p>
            <p>2. Use Facebook Pixel Helper browser extension to debug</p>
            <p>3. Check browser console for any errors</p>
            <p>4. Events should appear in Facebook Ads Manager within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
