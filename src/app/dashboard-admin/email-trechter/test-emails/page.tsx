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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockData: TestEmail[] = [
      {
        id: '1',
        subject: 'Welkom bij TopTierMen - Test Email #1',
        content: 'Dit is een test email om de delivery rate te meten...',
        recipients: ['test1@example.com', 'test2@example.com', 'test3@example.com'],
        sentAt: new Date('2024-01-15T10:00:00'),
        deliveryRate: 95.5,
        openingRate: 68.2,
        clickRate: 12.4,
        status: 'sent',
        deliveryStats: {
          delivered: 191,
          bounced: 5,
          failed: 4,
          total: 200
        },
        engagementStats: {
          opened: 130,
          clicked: 25,
          unsubscribed: 2
        }
      },
      {
        id: '2',
        subject: 'Carnivoor Dieet Guide - Test Email #2',
        content: 'Test email voor het carnivoor dieet programma...',
        recipients: ['test4@example.com', 'test5@example.com'],
        sentAt: new Date('2024-01-14T14:30:00'),
        deliveryRate: 88.7,
        openingRate: 72.1,
        clickRate: 15.8,
        status: 'sent',
        deliveryStats: {
          delivered: 177,
          bounced: 12,
          failed: 11,
          total: 200
        },
        engagementStats: {
          opened: 128,
          clicked: 28,
          unsubscribed: 1
        }
      },
      {
        id: '3',
        subject: 'Nieuwe Training Schema - Test Email #3',
        content: 'Test email voor nieuwe training programma\'s...',
        recipients: ['test6@example.com'],
        sentAt: new Date('2024-01-13T09:15:00'),
        deliveryRate: 92.3,
        openingRate: 58.9,
        clickRate: 8.7,
        status: 'sent',
        deliveryStats: {
          delivered: 185,
          bounced: 8,
          failed: 7,
          total: 200
        },
        engagementStats: {
          opened: 109,
          clicked: 16,
          unsubscribed: 3
        }
      }
    ];
    
    setTimeout(() => {
      setTestEmails(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

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
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return CheckCircleIcon;
      case 'failed': return ExclamationTriangleIcon;
      case 'draft': return ClockIcon;
      default: return ClockIcon;
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
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test E-mails</h1>
            <p className="text-gray-600">Bekijk delivery rates en opening rates van test e-mails</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span>Nieuwe Test Email</span>
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totaal Verzonden</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.totalSent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gem. Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.avgDeliveryRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gem. Opening Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.avgOpeningRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gem. Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallStats.avgClickRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Emails Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Test E-mails Overzicht</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Test e-mails laden...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verzonden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opening Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testEmails.map((email) => {
                  const StatusIcon = getStatusIcon(email.status);
                  return (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                        <div className="text-sm text-gray-500">{email.recipients.length} ontvangers</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {email.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {email.sentAt.toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.deliveryRate}%</div>
                        <div className="text-xs text-gray-500">
                          {email.deliveryStats.delivered}/{email.deliveryStats.total} bezorgd
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.openingRate}%</div>
                        <div className="text-xs text-gray-500">
                          {email.engagementStats.opened} geopend
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{email.clickRate}%</div>
                        <div className="text-xs text-gray-500">
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
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmail(email.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEmail.subject}</h3>
                  <p className="text-sm text-gray-600">Verzonden op {selectedEmail.sentAt.toLocaleDateString('nl-NL')}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Sluiten</span>
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Delivery Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Bezorgd:</span>
                      <span className="font-medium">{selectedEmail.deliveryStats.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bounced:</span>
                      <span className="font-medium">{selectedEmail.deliveryStats.bounced}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gefaald:</span>
                      <span className="font-medium">{selectedEmail.deliveryStats.failed}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Totaal:</span>
                      <span>{selectedEmail.deliveryStats.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Engagement Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Geopend:</span>
                      <span className="font-medium">{selectedEmail.engagementStats.opened}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geklikt:</span>
                      <span className="font-medium">{selectedEmail.engagementStats.clicked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uitgeschreven:</span>
                      <span className="font-medium">{selectedEmail.engagementStats.unsubscribed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Percentages</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Delivery Rate:</span>
                      <span className="font-medium">{selectedEmail.deliveryRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opening Rate:</span>
                      <span className="font-medium">{selectedEmail.openingRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Click Rate:</span>
                      <span className="font-medium">{selectedEmail.clickRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Email Content Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Email Inhoud</h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedEmail.content}
                </div>
              </div>
              
              {/* Recipients */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Ontvangers ({selectedEmail.recipients.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmail.recipients.map((recipient, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
