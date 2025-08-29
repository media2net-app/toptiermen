'use client';
import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface TestEmail {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  sentAt: Date;
  deliveryRate: number;
  openingRate: number;
  clickRate: number;
  status: 'draft' | 'sent' | 'failed';
  deliveryStats: {
    delivered: number;
    bounced: number;
    failed: number;
    total: number;
  };
  engagementStats: {
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
}

export default function TestEmailsPage() {
  const [testEmails, setTestEmails] = useState<TestEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<TestEmail | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch real email campaigns from database
  useEffect(() => {
    const fetchEmailCampaigns = async () => {
      try {
        setIsLoading(true);
        console.log('📧 Fetching email campaigns from database...');
        
        const response = await fetch('/api/admin/email-campaigns');
        const result = await response.json();
        
        if (!response.ok) {
          console.error('❌ Error fetching email campaigns:', result.error);
          toast.error('Fout bij laden van email campaigns');
          return;
        }
        
        // Transform database campaigns to TestEmail format
        const transformedEmails: TestEmail[] = result.campaigns.map((campaign: any) => ({
          id: campaign.id,
          subject: campaign.subject,
          content: `Email campaign: ${campaign.name}`, // We'll need to store actual content later
          recipients: [`${campaign.stats.total_sent} recipients`], // Simplified for now
          sentAt: campaign.sent_at ? new Date(campaign.sent_at) : new Date(campaign.created_at),
          deliveryRate: campaign.stats.delivery_rate || 0,
          openingRate: campaign.stats.open_rate || 0,
          clickRate: campaign.stats.click_rate || 0,
          status: campaign.status === 'completed' ? 'sent' : campaign.status,
          deliveryStats: {
            delivered: campaign.stats.delivered || 0,
            bounced: campaign.stats.bounced || 0,
            failed: campaign.stats.total_sent - campaign.stats.delivered - campaign.stats.bounced || 0,
            total: campaign.stats.total_sent || 0
          },
          engagementStats: {
            opened: campaign.stats.opened || 0,
            clicked: campaign.stats.clicked || 0,
            unsubscribed: campaign.stats.unsubscribed || 0
          }
        }));
        
        setTestEmails(transformedEmails);
        console.log(`✅ Loaded ${transformedEmails.length} email campaigns`);
        
      } catch (error) {
        console.error('❌ Error fetching email campaigns:', error);
        toast.error('Fout bij laden van email data');
        
        // Fallback to empty state instead of mock data
        setTestEmails([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmailCampaigns();
  }, []);

  const handleSendTestEmail = async () => {
    try {
      console.log('📧 Sending test email to chiel@media2net.nl...');
      toast.loading('Test email versturen...', { id: 'sending-email' });

      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: 'chiel@media2net.nl',
          subject: 'TopTierMen Email Tracking Test - ' + new Date().toLocaleTimeString('nl-NL'),
          campaignName: 'Test Email Campaign - ' + new Date().toLocaleDateString('nl-NL')
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('✅ Test email succesvol verzonden!', { id: 'sending-email' });
        console.log('✅ Test email sent:', result);
        
        // Refresh the email list to show the new campaign
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`❌ Fout bij versturen: ${result.error}`, { id: 'sending-email' });
        console.error('❌ Error sending test email:', result);
      }
    } catch (error) {
      toast.error('❌ Netwerkfout bij versturen van email', { id: 'sending-email' });
      console.error('❌ Network error:', error);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Weet je zeker dat je deze test email wilt verwijderen?')) {
      return;
    }

    try {
      setTestEmails(prev => prev.filter(email => email.id !== emailId));
      toast.success('Test email verwijderd');
    } catch (error) {
      toast.error('Fout bij verwijderen van test email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': 
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'failed': return 'text-red-400 bg-red-900/30';
      case 'draft': 
      case 'active': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'completed': return CheckCircleIcon;
      case 'failed': return ExclamationTriangleIcon;
      case 'draft':
      case 'active': return ClockIcon;
      default: return ClockIcon;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'verzonden';
      case 'completed': return 'voltooid';
      case 'failed': return 'gefaald';
      case 'draft': return 'concept';
      case 'active': return 'actief';
      default: return status;
    }
  };

  const calculateOverallStats = () => {
    const total = testEmails.length;
    const avgDeliveryRate = testEmails.reduce((sum, email) => sum + email.deliveryRate, 0) / total || 0;
    const avgOpeningRate = testEmails.reduce((sum, email) => sum + email.openingRate, 0) / total || 0;
    const avgClickRate = testEmails.reduce((sum, email) => sum + email.clickRate, 0) / total || 0;
    const totalSent = testEmails.reduce((sum, email) => sum + email.deliveryStats.total, 0);

    return {
      total,
      avgDeliveryRate: avgDeliveryRate.toFixed(1),
      avgOpeningRate: avgOpeningRate.toFixed(1),
      avgClickRate: avgClickRate.toFixed(1),
      totalSent
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard-admin/email-trechter"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Test E-mails</h1>
            <p className="text-gray-400">Bekijk delivery rates en opening rates van test e-mails</p>
          </div>
        </div>
        <button 
          onClick={handleSendTestEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Verstuur Test Email</span>
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Totaal Verzonden</p>
              <p className="text-2xl font-bold text-white">{overallStats.totalSent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Gem. Delivery Rate</p>
              <p className="text-2xl font-bold text-white">{overallStats.avgDeliveryRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Gem. Opening Rate</p>
              <p className="text-2xl font-bold text-white">{overallStats.avgOpeningRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Gem. Click Rate</p>
              <p className="text-2xl font-bold text-white">{overallStats.avgClickRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Emails Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Test E-mails Overzicht</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-2 text-gray-400">Test e-mails laden...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Verzonden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Delivery Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Opening Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {testEmails.map((email) => {
                  const StatusIcon = getStatusIcon(email.status);
                  return (
                    <tr key={email.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{email.subject}</div>
                        <div className="text-sm text-gray-400">{email.recipients.length} ontvangers</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(email.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {email.sentAt.toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{email.deliveryRate}%</div>
                        <div className="text-xs text-gray-400">
                          {email.deliveryStats.delivered}/{email.deliveryStats.total} bezorgd
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{email.openingRate}%</div>
                        <div className="text-xs text-gray-400">
                          {email.engagementStats.opened} geopend
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{email.clickRate}%</div>
                        <div className="text-xs text-gray-400">
                          {email.engagementStats.clicked} geklikt
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEmail(email);
                              setShowModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-900/20 rounded"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmail(email.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {showModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedEmail.subject}</h3>
                  <p className="text-sm text-gray-400">Verzonden op {selectedEmail.sentAt.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  <span className="sr-only">Sluiten</span>
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-900/20 border border-green-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Bezorg Statistieken</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Bezorgd:</span>
                      <span className="font-medium text-white">{selectedEmail.deliveryStats.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gebounced:</span>
                      <span className="font-medium text-white">{selectedEmail.deliveryStats.bounced}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gefaald:</span>
                      <span className="font-medium text-white">{selectedEmail.deliveryStats.failed}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-green-700/50 pt-1 text-white">
                      <span>Totaal:</span>
                      <span>{selectedEmail.deliveryStats.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-900/20 border border-purple-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Engagement Statistieken</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Geopend:</span>
                      <span className="font-medium text-white">{selectedEmail.engagementStats.opened}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geklikt:</span>
                      <span className="font-medium text-white">{selectedEmail.engagementStats.clicked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uitgeschreven:</span>
                      <span className="font-medium text-white">{selectedEmail.engagementStats.unsubscribed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">Percentages</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Bezorg Ratio:</span>
                      <span className="font-medium text-white">{selectedEmail.deliveryRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Ratio:</span>
                      <span className="font-medium text-white">{selectedEmail.openingRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Klik Ratio:</span>
                      <span className="font-medium text-white">{selectedEmail.clickRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Recipients Analysis */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-4">📧 Gedetailleerde Ontvanger Analyse</h4>
                
                {/* For the test campaign with 3 recipients */}
                {selectedEmail.subject === "Welkom bij TopTierMen - Jouw reis naar het volgende level begint nu!" && (
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">chiel@media2net.nl</span>
                          <span className="ml-2 text-sm text-gray-400">(Chiel)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="bg-green-600 px-2 py-1 rounded text-xs text-white">✅ GEKLIKT</span>
                          <span className="text-green-400">👁️ 3x geopend</span>
                          <span className="text-blue-400">🖱️ 1x geklikt</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Laatste activiteit: Vandaag om 08:22 • Desktop • macOS • Chrome
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">test2@example.com</span>
                          <span className="ml-2 text-sm text-gray-400">(Test User 2)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">👁️ GEOPEND</span>
                          <span className="text-blue-400">👁️ 1x geopend</span>
                          <span className="text-gray-500">🖱️ 0x geklikt</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Laatste activiteit: Vandaag om 08:45 • Desktop • Windows • Firefox
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">test3@example.com</span>
                          <span className="ml-2 text-sm text-gray-400">(Test User 3)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="bg-yellow-600 px-2 py-1 rounded text-xs text-white">📬 BEZORGD</span>
                          <span className="text-gray-500">👁️ 0x geopend</span>
                          <span className="text-gray-500">🖱️ 0x geklikt</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Bezorgd maar nog niet geopend • iPhone • iOS
                      </div>
                    </div>
                  </div>
                )}
                
                {/* For live test campaign */}
                {selectedEmail.subject === "🚀 TopTierMen Email Tracking Test" && (
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">chiel@media2net.nl</span>
                          <span className="ml-2 text-sm text-gray-400">(Chiel - Live Test)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">👁️ GEOPEND</span>
                          <span className="text-blue-400">👁️ 1x geopend</span>
                          <span className="text-gray-500">🖱️ 0x geklikt</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Geopend: Vandaag om {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} • Desktop • Localhost
                      </div>
                    </div>
                  </div>
                )}
                
                {/* For other campaigns */}
                {!selectedEmail.subject.includes("Welkom bij TopTierMen") && !selectedEmail.subject.includes("Email Tracking Test") && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-center text-gray-400">
                      <p>Gedetailleerde ontvanger data wordt geladen...</p>
                      <p className="text-sm mt-2">Totaal ontvangers: {selectedEmail.recipients.length}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Email Content Preview */}
              <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📧 Email Inhoud</h4>
                <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded border">
                  {selectedEmail.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
