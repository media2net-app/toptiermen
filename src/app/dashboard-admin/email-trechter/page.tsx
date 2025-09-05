'use client';

import { useState, useEffect } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BulkEmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  status: string;
  created_at: string;
  started_at: string;
  completed_at: string;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  updated_at: string;
}

interface BulkEmailRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  salutation: string;
  status: 'pending' | 'sent' | 'opened' | 'clicked' | 'failed';
  sent_at: string;
  opened_at: string;
  clicked_at: string;
  created_at: string;
}

export default function EmailTrechterPage() {
  const [campaigns, setCampaigns] = useState<BulkEmailCampaign[]>([]);
  const [campaigns2, setCampaigns2] = useState<BulkEmailCampaign[]>([]);
  const [recipients, setRecipients] = useState<BulkEmailRecipient[]>([]);
  const [recipients2, setRecipients2] = useState<BulkEmailRecipient[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingCampaigns2, setLoadingCampaigns2] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadingRecipients2, setLoadingRecipients2] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaign' | 'recipients'>('campaign');
  const [activeTab2, setActiveTab2] = useState<'campaign' | 'recipients'>('campaign');
  const [activeCampaign, setActiveCampaign] = useState<1 | 2>(1);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showOpensModal, setShowOpensModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [currentEmailTemplate, setCurrentEmailTemplate] = useState('');

  // Campaign IDs
  const OFFICIAL_CAMPAIGN_ID = '3c599791-0268-4980-914f-a599be42139b';
  const SNEAK_PREVIEW_CAMPAIGN_ID = ''; // To be set up later

  // Fetch campaigns data
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/admin/bulk-email-campaigns', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to show only the official campaign
        const officialCampaign = data.campaigns.filter((campaign: BulkEmailCampaign) => 
          campaign.id === OFFICIAL_CAMPAIGN_ID
        );
        setCampaigns(officialCampaign);
        
        // Log current stats for debugging
        if (officialCampaign.length > 0) {
          const campaign = officialCampaign[0];
          console.log('📊 Campaign Stats:', {
            name: campaign.name,
            sent: campaign.sent_count,
            opened: campaign.open_count,
            total: campaign.total_recipients,
            openRate: ((campaign.open_count / campaign.sent_count) * 100).toFixed(1) + '%'
          });
        }
      } else {
        console.error('Failed to fetch campaigns');
        toast.error('Failed to load campaign data');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaign data');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Fetch campaigns 2 data (Sneak Preview)
  const fetchCampaigns2 = async () => {
    try {
      setLoadingCampaigns2(true);
      // For now, set empty since campaign 2 is not set up yet
      setCampaigns2([]);
      console.log('📊 Campaign 2 (Sneak Preview) not set up yet');
    } catch (error) {
      console.error('Error fetching campaigns 2:', error);
      toast.error('Error loading campaign 2 data');
    } finally {
      setLoadingCampaigns2(false);
    }
  };

  // Fetch recipients data
  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      const response = await fetch(`/api/admin/bulk-email-recipients?campaignId=${OFFICIAL_CAMPAIGN_ID}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecipients(data.recipients || []);
      } else {
        console.error('Failed to fetch recipients');
        toast.error('Failed to load recipient data');
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Error loading recipient data');
    } finally {
      setLoadingRecipients(false);
    }
  };

  // Fetch recipients 2 data (Sneak Preview)
  const fetchRecipients2 = async () => {
    try {
      setLoadingRecipients2(true);
      // For now, set empty since campaign 2 is not set up yet
      setRecipients2([]);
      console.log('📊 Recipients 2 (Sneak Preview) not set up yet');
    } catch (error) {
      console.error('Error fetching recipients 2:', error);
      toast.error('Error loading recipient 2 data');
    } finally {
      setLoadingRecipients2(false);
    }
  };

  // Show email preview modal
  const showEmailPreview = (campaignType: 'welcome' | 'sneak_preview') => {
    if (campaignType === 'welcome') {
      // Get welcome email template
      setCurrentEmailTemplate(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Welkom bij Top Tier Men</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #181F17; color: white; margin: 0; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Welkom bij Top Tier Men</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0;">Jouw reis naar excellentie begint hier</p>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 18px; color: #8BAE5A; margin: 0 0 24px 0;">Beste [NAAM],</p>
              <p style="line-height: 1.6; margin: 0 0 24px 0;">Welkom bij Top Tier Men! 🚀</p>
              <p style="line-height: 1.6; margin: 0 0 24px 0;">We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="#" style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Je Transformatie</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      // Get sneak preview email template
      setCurrentEmailTemplate(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sneak Preview - Top Tier Men</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #181F17; color: white; margin: 0; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎬 EXCLUSIEVE SNEAK PREVIEW</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0;">Eerste blik op het Top Tier Men Platform</p>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 18px; color: #8BAE5A; margin: 0 0 24px 0;">Beste [NAAM],</p>
              <p style="line-height: 1.6; margin: 0 0 24px 0;">Als onderdeel van onze exclusieve pre-launch community ben je een van de eerste die een kijkje mag nemen achter de schermen.</p>
              <div style="background: rgba(139, 174, 90, 0.1); border: 2px solid #8BAE5A; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
                <h3 style="color: #8BAE5A; margin: 0 0 20px 0;">🎥 PLATFORM SNEAK PREVIEW VIDEO</h3>
                <div style="background: #232D1A; height: 200px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 20px 0;">
                  <div style="color: #8BAE5A;">▶ Video Preview</div>
                </div>
                <a href="#" style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">🎬 BEKIJK SNEAK PREVIEW NU</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    }
    setShowEmailPreviewModal(true);
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    setLastRefresh(new Date());
    await Promise.all([
      fetchCampaigns(), 
      fetchRecipients(),
      fetchCampaigns2(),
      fetchRecipients2()
    ]);
    setRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    fetchCampaigns();
    fetchRecipients();
    fetchCampaigns2();
    fetchRecipients2();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCampaigns();
      fetchRecipients();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Calculate statistics based on active campaign
  const currentCampaigns = activeCampaign === 1 ? campaigns : campaigns2;
  const currentRecipients = activeCampaign === 1 ? recipients : recipients2;
  const currentLoading = activeCampaign === 1 ? loadingCampaigns : loadingCampaigns2;
  const currentActiveTab = activeCampaign === 1 ? activeTab : activeTab2;
  
  const campaign = currentCampaigns[0];
  const totalRecipients = campaign?.total_recipients || 0;
  const sentCount = campaign?.sent_count || 0;
  const openCount = campaign?.open_count || 0;
  const clickCount = campaign?.click_count || 0;
  const bounceCount = campaign?.bounce_count || 0;
  
  // Calculate rates based on sent emails, not total recipients
  const openRate = sentCount > 0 ? ((openCount / sentCount) * 100).toFixed(1) : '0.0';
  const clickRate = sentCount > 0 ? ((clickCount / sentCount) * 100).toFixed(1) : '0.0';
  const deliveryRate = totalRecipients > 0 ? ((sentCount / totalRecipients) * 100).toFixed(1) : '0.0';

  if (currentLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Email Marketing Dashboard</h1>
            
            {/* Campaign Selector */}
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => setActiveCampaign(1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCampaign === 1
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                📧 Campagne 1 - Welkom & Introductie
              </button>
              <button
                onClick={() => setActiveCampaign(2)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCampaign === 2
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                🎬 Campagne 2 - Sneak Preview (Setup)
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-xl text-gray-400">
                {activeCampaign === 1 ? 'Officiële Campagne 1 - Welkom & Introductie' : 'Campagne 2 - Sneak Preview (Setup Required)'}
              </h2>
              <button
                onClick={() => showEmailPreview(activeCampaign === 1 ? 'welcome' : 'sneak_preview')}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                Bekijk E-mail
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              Laatste update: {lastRefresh.toLocaleTimeString()} 
              {autoRefresh && ' • Auto-refresh actief (30s)'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh
            </label>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{sentCount}</div>
                <div className="text-green-100">van {totalRecipients} leads</div>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg cursor-pointer hover:from-green-700 hover:to-green-800 transition-all duration-200" onClick={() => setShowOpensModal(true)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{openCount}</div>
                <div className="text-green-100">{openRate}% opening rate</div>
                <div className="text-green-200 text-sm mt-1">Klik om details te zien</div>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{clickCount}</div>
                <div className="text-green-100">{clickRate}% click rate</div>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{deliveryRate}%</div>
                <div className="text-green-100">{bounceCount} bounces</div>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => {
              if (activeCampaign === 1) {
                setActiveTab('campaign');
              } else {
                setActiveTab2('campaign');
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentActiveTab === 'campaign'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Campaign Details
          </button>
          <button
            onClick={() => {
              if (activeCampaign === 1) {
                setActiveTab('recipients');
              } else {
                setActiveTab2('recipients');
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentActiveTab === 'recipients'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Recipients ({currentRecipients.length})
          </button>
        </div>

        {/* Campaign Details Tab */}
        {currentActiveTab === 'campaign' && (
          activeCampaign === 2 && !campaign ? (
            <AdminCard title="Campaign 2 Setup Required">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-xl font-semibold text-white mb-4">Sneak Preview Campagne Setup</h3>
                <p className="text-gray-400 mb-6">
                  Deze campagne is nog niet opgezet. Configureer eerst de campagne voordat je ontvangers kunt toevoegen.
                </p>
                <div className="bg-gray-800 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="text-white font-medium mb-2">Setup Stappen:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>1. Configureer campagne ID in database</li>
                    <li>2. Upload sneak preview video</li>
                    <li>3. Test email template</li>
                    <li>4. Voeg ontvangers toe</li>
                  </ul>
                </div>
              </div>
            </AdminCard>
          ) : campaign && (
          <AdminCard title="Campaign Details">
            <div className="space-y-6">
              {/* Campaign Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Campaign Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="text-white font-medium">{campaign.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Subject</div>
                    <div className="text-white font-medium">{campaign.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Template</div>
                    <div className="text-white font-medium">{campaign.template}</div>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Timing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="text-white font-medium">
                      {new Date(campaign.created_at).toLocaleDateString('nl-NL')} {new Date(campaign.created_at).toLocaleTimeString('nl-NL')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Started</div>
                    <div className="text-white font-medium">
                      {campaign.started_at ? `${new Date(campaign.started_at).toLocaleDateString('nl-NL')} ${new Date(campaign.started_at).toLocaleTimeString('nl-NL')}` : 'Not started'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="text-white font-medium">
                      {campaign.completed_at ? `${new Date(campaign.completed_at).toLocaleDateString('nl-NL')} ${new Date(campaign.completed_at).toLocaleTimeString('nl-NL')}` : 'In progress'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white">{openRate}%</div>
                    <div className="text-sm text-gray-400">Opening Rate</div>
                    <div className="text-xs text-gray-500">{openCount} of {sentCount} sent</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white">{clickRate}%</div>
                    <div className="text-sm text-gray-400">Click Rate</div>
                    <div className="text-xs text-gray-500">{clickCount} of {sentCount} sent</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white">{deliveryRate}%</div>
                    <div className="text-sm text-gray-400">Delivery Rate</div>
                    <div className="text-xs text-gray-500">{sentCount} of {totalRecipients} total</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white">{bounceCount}</div>
                    <div className="text-sm text-gray-400">Bounces</div>
                    <div className="text-xs text-gray-500">Failed deliveries</div>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
          )
        )}

        {/* Recipients Tab */}
        {currentActiveTab === 'recipients' && (
          activeCampaign === 2 ? (
            <AdminCard title="Campaign 2 Recipients">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-white mb-4">Geen Ontvangers Geconfigureerd</h3>
                <p className="text-gray-400 mb-6">
                  Voor campagne 2 zijn nog geen ontvangers toegevoegd. Setup eerst de campagne.
                </p>
                <div className="bg-gray-800 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="text-white font-medium mb-2">Voor je ontvangers kunt toevoegen:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Campagne moet geconfigureerd zijn</li>
                    <li>• Email template moet getest zijn</li>
                    <li>• Video URL moet beschikbaar zijn</li>
                  </ul>
                </div>
              </div>
            </AdminCard>
          ) : (
          <AdminCard title="Recipients">
            {(activeCampaign === 1 ? loadingRecipients : loadingRecipients2) ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-800 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Sent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Opened</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecipients.map((recipient) => (
                      <tr key={recipient.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{recipient.email}</td>
                        <td className="py-3 px-4 text-white">{recipient.full_name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            recipient.status === 'opened' ? 'bg-green-100 text-green-800' :
                            recipient.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            recipient.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {recipient.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString('nl-NL') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {recipient.opened_at ? new Date(recipient.opened_at).toLocaleString('nl-NL') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
          )
        )}
      </div>

      {/* Email Opens Modal */}
      {showOpensModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Email Open Details</h2>
                <p className="text-gray-400 mt-1">Wie heeft wanneer en hoe vaak emails geopend</p>
              </div>
              <button
                onClick={() => setShowOpensModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(activeCampaign === 1 ? loadingRecipients : loadingRecipients2) ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{openCount}</div>
                      <div className="text-sm text-gray-400">Totaal geopend</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{currentRecipients.filter(r => r.status === 'opened').length}</div>
                      <div className="text-sm text-gray-400">Unieke ontvangers</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {openCount > 0 ? Math.round((openCount / currentRecipients.filter(r => r.status === 'opened').length) * 10) / 10 : 0}
                      </div>
                      <div className="text-sm text-gray-400">Gemiddeld per persoon</div>
                    </div>
                  </div>

                  {/* Detailed Opens Table */}
                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Gedetailleerde Open Informatie</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-700">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Naam</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Verzonden</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Geopend</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Aantal Opens</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {currentRecipients
                            .filter(r => r.status === 'opened')
                            .sort((a, b) => new Date(b.opened_at || 0).getTime() - new Date(a.opened_at || 0).getTime())
                            .map((recipient) => (
                              <tr key={recipient.id} className="hover:bg-gray-700 transition-colors">
                                <td className="py-3 px-4 text-white">{recipient.email}</td>
                                <td className="py-3 px-4 text-white">{recipient.full_name || 'N/A'}</td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    {recipient.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-400">
                                  {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString('nl-NL') : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-gray-400">
                                  {recipient.opened_at ? new Date(recipient.opened_at).toLocaleString('nl-NL') : 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-green-400 font-medium">
                                  1
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Opmerkingen</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Een persoon kan meerdere keren dezelfde email openen</li>
                      <li>• De tracking pixel registreert elke keer dat de email wordt geladen</li>
                      <li>• Dit geeft inzicht in engagement en herhaalde interesse</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Email Preview</h2>
                <p className="text-gray-400 mt-1">
                  {activeCampaign === 1 ? 'Welkom & Introductie Email' : 'Sneak Preview Email'}
                </p>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white rounded-lg overflow-hidden">
                <iframe 
                  srcDoc={currentEmailTemplate}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                />
              </div>
              
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Email Template Info</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Deze preview toont hoe de email eruit ziet voor ontvangers</p>
                  <p>• [NAAM] wordt vervangen door de echte naam van de ontvanger</p>
                  <p>• Links en buttons zijn functioneel in de echte email</p>
                  {activeCampaign === 2 && (
                    <p>• Video URL wordt ingesteld bij het versturen van de campagne</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 