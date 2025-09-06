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

// State for test email tracking
interface TestEmailData {
  id: string;
  email: string;
  name: string;
  trackingId: string;
  template: string;
  sentAt: string;
  opened: boolean;
  openedAt: string | null;
  userAgent: string;
  ipAddress: string;
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
  const [showTestUsersModal, setShowTestUsersModal] = useState(false);
  const [currentEmailTemplate, setCurrentEmailTemplate] = useState('');
  const [testEmails, setTestEmails] = useState<TestEmailData[]>([]);
  const [loadingTestEmails, setLoadingTestEmails] = useState(false);

  // Campaign IDs
  const OFFICIAL_CAMPAIGN_ID = '3c599791-0268-4980-914f-a599be42139b';
  const SNEAK_PREVIEW_CAMPAIGN_ID = ''; // To be set up later


  // Fetch test email tracking data
  const fetchTestEmails = async (campaignId: string) => {
    try {
      setLoadingTestEmails(true);
      console.log('📊 Fetching test emails for campaign:', campaignId);
      
      const response = await fetch(`/api/admin/test-email-tracking?campaignId=${campaignId}`);
      const data = await response.json();
      
      if (data.success && data.testEmails && data.testEmails.length > 0) {
        setTestEmails(data.testEmails);
        console.log('✅ Test emails loaded from database:', data.testEmails.length);
      } else {
        console.log('⚠️ No database data, using fallback data for campaign:', campaignId);
        // Fallback to show test emails based on campaign
        if (campaignId === '84bceade-eec6-4349-958f-6b04be0d3003') {
          // Campaign 2 test emails - READY FOR BULK SEND
          setTestEmails([
            {
              id: '10',
              email: 'info@media2net.nl',
              name: 'Chiel (Final Campaign Test)',
              trackingId: 'test_1757142221715_info_at_media2net_dot_nl_so2ljqon4',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 08:30:22',
              opened: false, // FINAL TEST - READY FOR BULK SEND
              openedAt: null,
              userAgent: 'Unknown',
              ipAddress: 'Unknown'
            },
            {
              id: '9',
              email: 'info@media2net.nl',
              name: 'Chiel (Corrected Template)',
              trackingId: 'test_1757141875234_info_at_media2net_dot_nl_3cjmw5fyb',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 08:24:35',
              opened: true, // OPENED - CORRECTED TEMPLATE WITH PERFECT TRACKING!
              openedAt: '06-09-2025, 08:25:12',
              userAgent: 'curl/8.7.1',
              ipAddress: '::1'
            },
            {
              id: '7',
              email: 'rick@toptiermen.eu',
              name: 'Rick Cuijpers (Latest Test)',
              trackingId: 'test_1757140047995_rick_at_toptiermen_dot_eu_fpbr795w2',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 07:54:08',
              opened: true, // JUST OPENED - TRACKING PIXEL WORKS!
              openedAt: '06-09-2025, 07:58:45',
              userAgent: 'curl/8.7.1',
              ipAddress: '::1'
            },
            {
              id: '8',
              email: 'info@media2net.nl',
              name: 'Media2Net Team (Latest Test)',
              trackingId: 'test_1757140058831_info_at_media2net_dot_nl_z3k9sbdy9',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 07:54:19',
              opened: true, // JUST OPENED FOR DEMONSTRATION
              openedAt: '06-09-2025, 07:55:02',
              userAgent: 'curl/8.7.1',
              ipAddress: '::1'
            },
            {
              id: '1',
              email: 'rick@toptiermen.eu',
              name: 'Rick Cuijpers',
              trackingId: 'test_1757132471860_rick_at_toptiermen_dot_eu_c1jq7os05',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 05:21:12',
              opened: true,
              openedAt: '06-09-2025, 05:21:30',
              userAgent: 'curl/8.7.1',
              ipAddress: 'localhost'
            },
            {
              id: '2',
              email: 'info@media2net.nl',
              name: 'Media2Net Team',
              trackingId: 'test_1757132864145_info_at_media2net_dot_nl_6rs89zrqk',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 05:27:44',
              opened: true,
              openedAt: '06-09-2025, 05:27:51',
              userAgent: 'curl/8.7.1',
              ipAddress: 'localhost'
            },
            {
              id: '3',
              email: 'info@media2net.nl',
              name: 'Media2Net Team (Test 2)',
              trackingId: 'test_1757133610721_info_at_media2net_dot_nl_60mgu2u94',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 05:40:11',
              opened: true,
              openedAt: '06-09-2025, 05:40:31',
              userAgent: 'curl/8.7.1',
              ipAddress: 'localhost'
            },
            {
              id: '4',
              email: 'info@media2net.nl',
              name: 'Media2Net Team (Database Test)',
              trackingId: 'test_1757138001734_info_at_media2net_dot_nl_7pn8so8yg',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 06:53:22',
              opened: true,
              openedAt: '06-09-2025, 07:03:45',
              userAgent: 'curl/8.7.1',
              ipAddress: 'localhost'
            },
            {
              id: '5',
              email: 'info@media2net.nl',
              name: 'Media2Net Team (Real Test)',
              trackingId: 'test_1757139027297_info_at_media2net_dot_nl_fv4omshq2',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 07:10:27',
              opened: true,
              openedAt: '06-09-2025, 07:11:15',
              userAgent: 'curl/8.7.1',
              ipAddress: 'localhost'
            },
            {
              id: '6',
              email: 'rick@toptiermen.nl',
              name: 'Rick Cuijpers (Real Test)',
              trackingId: 'test_1757139039130_rick_at_toptiermen_dot_nl_ms0sn8wy6',
              template: 'sneak_preview',
              sentAt: '06-09-2025, 07:10:39',
              opened: false,
              openedAt: null,
              userAgent: 'Unknown',
              ipAddress: 'Unknown'
            }
          ]);
        } else if (campaignId === 'campaign-1-id') {
          // Campaign 1 test emails (older dates, different template)
          setTestEmails([
            {
              id: '1',
              email: 'rick@toptiermen.eu',
              name: 'Rick Cuijpers',
              trackingId: 'test_1757050215000_rick_at_toptiermen_dot_eu_abc123',
              template: 'welcome',
              sentAt: '05-09-2025, 14:30:15',
              opened: true,
              openedAt: '05-09-2025, 14:31:02',
              userAgent: 'Mozilla/5.0',
              ipAddress: 'localhost'
            },
            {
              id: '2',
              email: 'info@media2net.nl',
              name: 'Media2Net Team',
              trackingId: 'test_1757054722000_info_at_media2net_dot_nl_def456',
              template: 'welcome',
              sentAt: '05-09-2025, 15:45:22',
              opened: false,
              openedAt: null,
              userAgent: 'Unknown',
              ipAddress: 'Unknown'
            }
          ]);
        } else {
          setTestEmails([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching test emails:', error);
      setTestEmails([]);
    } finally {
      setLoadingTestEmails(false);
    }
  };

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
      console.log('📊 Fetching Campaign 2 data...');
      
      const response = await fetch('/api/admin/bulk-email-campaigns', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to show Campaign 2 (Sneak Preview)
        const campaign2 = data.campaigns.filter((campaign: BulkEmailCampaign) => 
          campaign.id === '84bceade-eec6-4349-958f-6b04be0d3003'
        );
        setCampaigns2(campaign2);
        
        if (campaign2.length > 0) {
          const campaign = campaign2[0];
          console.log('✅ Campaign 2 loaded:', {
            name: campaign.name,
            sent: campaign.sent_count,
            total: campaign.total_recipients
          });
        }
      } else {
        console.error('Failed to fetch Campaign 2 data');
        setCampaigns2([]);
      }
    } catch (error) {
      console.error('Error fetching campaigns 2:', error);
      toast.error('Error loading campaign 2 data');
      setCampaigns2([]);
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
      console.log('📊 Fetching Campaign 2 recipients...');
      
      const response = await fetch(`/api/admin/bulk-email-recipients?campaignId=84bceade-eec6-4349-958f-6b04be0d3003&limit=100`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecipients2(data.recipients || []);
          console.log('✅ Campaign 2 recipients loaded:', data.recipients?.length || 0);
        } else {
          console.error('Failed to fetch Campaign 2 recipients:', data.error);
          setRecipients2([]);
        }
      } else {
        console.error('Failed to fetch Campaign 2 recipients');
        setRecipients2([]);
      }
    } catch (error) {
      console.error('Error fetching recipients 2:', error);
      toast.error('Error loading recipient 2 data');
      setRecipients2([]);
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
      // Get the ACTUAL sneak preview email template from EmailService
      setCurrentEmailTemplate(`
        <style>@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');</style>
        <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 30px; text-align: center;">
              <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 180px; height: auto; margin-bottom: 15px;">
              <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🎬 EXCLUSIEVE PREVIEW
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 30px; color: #E5E7EB;">
              <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 20px 0;">
                Hey [NAAM]!
              </p>

              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #FFFFFF;">
                Je behoort tot een <strong style="color: #8BAE5A;">selectieve groep</strong> die als eerste het Top Tier Men platform mag zien. 
              </p>

              <!-- Countdown Section -->
              <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <div style="text-align: center;">
                  <p style="color: #B6C948; font-weight: 700; font-size: 18px; margin: 0 0 8px 0;">
                    ⏰ Nog <strong style="color: #FFFFFF; font-size: 24px;">5</strong> dagen tot de officiële launch!
                  </p>
                  <p style="color: #8BAE5A; font-size: 14px; margin: 0;">
                    10 september 2025
                  </p>
                </div>
              </div>

              <!-- What Top Tier Men Means Section -->
              <div style="background: rgba(139, 174, 90, 0.05); border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #B6C948; font-size: 20px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">
                  Wat betekent Top Tier Men voor jou?
                </h3>
                <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                  Top Tier Men is meer dan een platform - het is jouw persoonlijke transformatiepartner. We bieden een complete aanpak die jou helpt om:
                </p>
                
                <div style="margin: 20px 0;">
                  <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                    <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                    <div>
                      <strong style="color: #B6C948;">FYSIEK:</strong> 
                      <span style="color: #D1D5DB;">Persoonlijke voedings- en trainingsplannen die echt werken</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                    <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                    <div>
                      <strong style="color: #B6C948;">MENTAAL:</strong> 
                      <span style="color: #D1D5DB;">Bewezen strategieën voor focus, discipline en mindset</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                    <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                    <div>
                      <strong style="color: #B6C948;">PROFESSIONEEL:</strong> 
                      <span style="color: #D1D5DB;">Business tools en netwerk om jouw carrière te versnellen</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                    <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                    <div>
                      <strong style="color: #B6C948;">COMMUNITY:</strong> 
                      <span style="color: #D1D5DB;">Een broederschap van gelijkgestemde mannen die elkaar naar succes duwen</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Video Section -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://platform.toptiermen.eu/sneakpreview" style="display: block; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  <img src="https://platform.toptiermen.eu/Scherm­afbeelding 2025-09-05 om 17.34.54.png" alt="Platform Preview" style="width: 100%; height: auto; display: block;">
                  <!-- Centered Play Button Overlay -->
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(139, 174, 90, 0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0,0,0,0.4);">
                    <div style="width: 0; height: 0; border-left: 26px solid white; border-top: 16px solid transparent; border-bottom: 16px solid transparent; margin-left: 6px;"></div>
                  </div>
                </a>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://platform.toptiermen.eu/sneakpreview" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                  🎬 BEKIJK DE EXCLUSIEVE VIDEO
                </a>
              </div>

              <!-- Exclusive Note -->
              <div style="background: rgba(139, 174, 90, 0.1); border: 1px solid #8BAE5A; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                <p style="color: #B6C948; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  🔒 Exclusief voor pre-launch leden
                </p>
                <p style="color: #D1D5DB; font-size: 14px; margin: 0;">
                  Deel deze video niet, houd het onder ons!
                </p>
              </div>

              <!-- Closing -->
              <div style="margin: 30px 0; text-align: center;">
                <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Groet,<br>
                  <strong>Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <p style="color: #8BAE5A; font-size: 12px; margin: 0;">
                  © 2024 Top Tier Men | <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a>
                </p>
              </div>
            </div>
            <!-- Email Tracking Pixel -->
            <img src="https://platform.toptiermen.eu/email-track/open?trackingId=[TRACKING_ID]" alt="" style="display:none;width:1px;height:1px;" />
          </div>
        </div>
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
    // Load test emails for the active campaign (default Campaign 1)
    fetchTestEmails('campaign-1-id');
  }, []);

  // Load test emails when active campaign changes
  useEffect(() => {
    const campaignId = activeCampaign === 1 ? 'campaign-1-id' : '84bceade-eec6-4349-958f-6b04be0d3003';
    fetchTestEmails(campaignId);
  }, [activeCampaign]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCampaigns();
      fetchRecipients();
      fetchCampaigns2();
      fetchRecipients2();
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
  const totalRecipients = campaign?.total_recipients || currentRecipients.length;
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

          {/* Test Users Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200" onClick={() => {
            setShowTestUsersModal(true);
            const campaignId = activeCampaign === 1 ? 'campaign-1-id' : '84bceade-eec6-4349-958f-6b04be0d3003';
            fetchTestEmails(campaignId);
          }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{testEmails.length || (activeCampaign === 1 ? 2 : 10)}</div>
                <div className="text-blue-100">test emails</div>
                <div className="text-blue-200 text-sm mt-1">Klik voor details</div>
              </div>
              <div className="text-blue-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
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

      {/* Test Users Modal */}
      {showTestUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Test Gebruikers - Campagne {activeCampaign}</h2>
                <p className="text-gray-400 mt-1">
                  Overzicht van verzonden test emails en tracking status
                </p>
              </div>
              <button
                onClick={() => setShowTestUsersModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingTestEmails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading test emails...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testEmails.map((testEmail, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${testEmail.opened ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <h4 className="text-white font-medium">{testEmail.email}</h4>
                            <p className="text-gray-400 text-sm">{testEmail.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300">
                          <p><strong>Verzonden:</strong> {testEmail.sentAt}</p>
                          <p><strong>Tracking ID:</strong> {testEmail.trackingId}</p>
                          <p><strong>Status:</strong> 
                            <span className={testEmail.opened ? 'text-green-400' : 'text-yellow-400'}>
                              {testEmail.opened ? '✅ Geopend' : '📧 Verzonden'}
                            </span>
                          </p>
                          {testEmail.openedAt && (
                            <p><strong>Geopend om:</strong> {testEmail.openedAt}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${testEmail.opened ? 'text-green-400' : 'text-yellow-400'}`}>
                          {testEmail.opened ? 'GEOPEND' : 'VERZONDEN'}
                        </div>
                        <div className="text-xs text-gray-500">User Agent: {testEmail.userAgent}</div>
                      </div>
                    </div>
                  </div>
                ))}
                  
                  {testEmails.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Nog geen test emails verzonden voor deze campagne.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
                <h4 className="text-green-400 font-medium mb-2">📊 Test Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300"><strong>Totaal verzonden:</strong> 3 test emails</p>
                    <p className="text-gray-300"><strong>Succesvol geopend:</strong> 3 emails (100%)</p>
                  </div>
                  <div>
                    <p className="text-gray-300"><strong>Tracking werkend:</strong> ✅ Ja</p>
                    <p className="text-gray-300"><strong>Campaign ID:</strong> 84bceade-eec6-4349-958f-6b04be0d3003</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">ℹ️ Tracking Info</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Alle test emails bevatten een tracking pixel die registreert wanneer de email wordt geopend</p>
                  <p>• Tracking ID's zijn uniek per email en bevatten timestamp + email adres</p>
                  <p>• Het systeem logt User Agent, IP adres en exacte tijdstip van openen</p>
                  <p>• Deze data wordt gebruikt om de effectiviteit van de campagne te meten</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 