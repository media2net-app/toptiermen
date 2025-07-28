'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  EyeIcon, 
  MicrophoneIcon, 
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface AIAnalysisResult {
  success: boolean;
  data: any;
  analysisType: string;
  timestamp: string;
}

interface ModelStatus {
  models: Record<string, any>;
  cacheStatus: string;
  lastUpdated: string;
  performance: {
    nlpAccuracy: number;
    imageRecognitionAccuracy: number;
    voiceAnalysisAccuracy: number;
    predictionAccuracy: number;
  };
}

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('nlp');

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: CpuChipIcon },
    { id: 'nlp', name: 'Content Analysis', icon: EyeIcon },
    { id: 'image', name: 'Visual Recognition', icon: ChartBarIcon },
    { id: 'voice', name: 'Voice Analysis', icon: MicrophoneIcon },
    { id: 'behavior', name: 'Behavioral Patterns', icon: UserGroupIcon },
    { id: 'prediction', name: 'Predictive Models', icon: LightBulbIcon },
    { id: 'models', name: 'Model Status', icon: CogIcon }
  ];

  useEffect(() => {
    fetchModelStatus();
    runSampleAnalysis();
  }, []);

  const fetchModelStatus = async () => {
    try {
      const response = await fetch('/api/marketing/ai-analysis/model-status');
      if (response.ok) {
        const data = await response.json();
        setModelStatus(data);
      }
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const runSampleAnalysis = async () => {
    setLoading(true);
    try {
      const mockAdData = {
        id: 'sample-ad-1',
        title: 'Revolutionary Product - Limited Time Offer!',
        description: 'Discover the incredible benefits of our breakthrough solution. Transform your business today.',
        imageUrl: 'https://example.com/sample-ad.jpg',
        videoUrl: 'https://example.com/sample-video.mp4',
        duration: 30
      };

      const analysisTypes = ['nlp', 'image', 'voice'];
      const results: AIAnalysisResult[] = [];

      for (const type of analysisTypes) {
        const response = await fetch('/api/marketing/ai-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysisType: type,
            adData: mockAdData,
            platform: 'facebook'
          })
        });

        if (response.ok) {
          const result = await response.json();
          results.push(result);
        }
      }

      setAnalysisResults(results);
    } catch (error) {
      console.error('Error running sample analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">NLP Accuracy</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
            <CpuChipIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#059669] to-[#10B981] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Image Recognition</p>
              <p className="text-2xl font-bold">92%</p>
            </div>
            <EyeIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Voice Analysis</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
            <MicrophoneIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Predictions</p>
              <p className="text-2xl font-bold">78%</p>
            </div>
            <LightBulbIcon className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
          <h3 className="text-lg font-semibold mb-4 text-white">AI Capabilities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Natural Language Processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Image Recognition & Analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Voice & Audio Analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Behavioral Pattern Recognition</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-gray-300">Predictive Competitive Modeling</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-white">Content Sentiment Analysis</p>
                <p className="text-sm text-gray-400">Positive sentiment detected in 73% of competitor ads</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-white">Visual Quality Alert</p>
                <p className="text-sm text-gray-400">Low image quality detected in 15% of ads</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <LightBulbIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-white">Opportunity Identified</p>
                <p className="text-sm text-gray-400">Voice ads show 40% higher engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisResults = () => {
    const result = analysisResults.find(r => r.analysisType === selectedAnalysis);
    
    if (!result) {
      return (
        <div className="text-center py-12">
          <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No analysis results available</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            {selectedAnalysis.toUpperCase()} Analysis Results
          </h3>
          <pre className="bg-[#374151] p-4 rounded text-sm overflow-auto text-gray-300 border border-[#4B5563]">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const renderModelStatus = () => (
    <div className="space-y-6">
      <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
        <h3 className="text-lg font-semibold mb-4 text-white">Model Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-white">Accuracy Metrics</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">NLP Analysis</span>
                  <span className="text-sm font-medium text-white">87%</span>
                </div>
                <div className="w-full bg-[#374151] rounded-full h-2">
                  <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">Image Recognition</span>
                  <span className="text-sm font-medium text-white">92%</span>
                </div>
                <div className="w-full bg-[#374151] rounded-full h-2">
                  <div className="bg-[#10B981] h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">Voice Analysis</span>
                  <span className="text-sm font-medium text-white">85%</span>
                </div>
                <div className="w-full bg-[#374151] rounded-full h-2">
                  <div className="bg-[#8B5CF6] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-300">Predictive Models</span>
                  <span className="text-sm font-medium text-white">78%</span>
                </div>
                <div className="w-full bg-[#374151] rounded-full h-2">
                  <div className="bg-[#EF4444] h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-white">Active Models</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">BERT-Sentiment v1.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">ResNet-50 v2.1</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">Wav2Vec2 v1.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">LSTM-Pattern v1.2</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">XGBoost-Competitive v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">AI & Machine Learning Insights</h1>
          <p className="mt-2 text-gray-400">
            Advanced AI-powered competitive intelligence and predictive analytics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#374151] mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-[#3B82F6] text-[#3B82F6]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Analysis Type Selector */}
        {activeTab === 'nlp' || activeTab === 'image' || activeTab === 'voice' ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Analysis Type
            </label>
            <select
              value={selectedAnalysis}
              onChange={(e) => setSelectedAnalysis(e.target.value)}
              className="block w-full max-w-xs rounded-md border-[#374151] bg-[#1F2937] text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] sm:text-sm"
            >
              <option value="nlp">Natural Language Processing</option>
              <option value="image">Image Recognition</option>
              <option value="voice">Voice Analysis</option>
            </select>
          </div>
        ) : null}

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {(activeTab === 'nlp' || activeTab === 'image' || activeTab === 'voice') && renderAnalysisResults()}
          {activeTab === 'behavior' && (
            <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
              <h3 className="text-lg font-semibold mb-4 text-white">Behavioral Pattern Recognition</h3>
              <p className="text-gray-400">Advanced user behavior analysis and segmentation capabilities.</p>
            </div>
          )}
          {activeTab === 'prediction' && (
            <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]">
              <h3 className="text-lg font-semibold mb-4 text-white">Predictive Competitive Modeling</h3>
              <p className="text-gray-400">AI-powered predictions for competitor strategies and market trends.</p>
            </div>
          )}
          {activeTab === 'models' && renderModelStatus()}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F2937] rounded-lg p-6 flex items-center space-x-3 border border-[#374151]">
              <CogIcon className="h-6 w-6 animate-spin text-[#3B82F6]" />
              <span className="text-white">Running AI Analysis...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 