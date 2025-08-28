'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';

interface LaunchTask {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending' | 'critical';
  category: 'email' | 'technical' | 'marketing' | 'content';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  notes?: string;
}

interface EmailCampaign {
  id: string;
  subject: string;
  content: string;
  sendDate: string;
  targetAudience: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  openRate?: number;
  clickRate?: number;
}

export default function PlanningLanceringPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('timeline');

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-[#B6C948] text-xl">Laden...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const launchTasks: LaunchTask[] = [
    {
      id: '1',
      title: 'E-mail Server Configuratie',
      description: 'SMTP server setup en e-mail templates voorbereiden',
      date: '2024-08-28',
      status: 'completed',
      category: 'technical',
      priority: 'high',
      assignee: 'Development Team',
      notes: '✅ Voltooid - E-mail tracking systeem actief'
    },
    {
      id: '2',
      title: 'Eerste E-mail Campagne',
      description: 'Welkomst e-mail naar bestaande leads met platform informatie',
      date: '2024-08-29',
      status: 'in-progress',
      category: 'email',
      priority: 'high',
      assignee: 'Marketing Team',
      notes: '📧 Template klaar, klaar voor verzending'
    },
    {
      id: '3',
      title: 'Informatieve E-mail #1',
      description: 'Platform features en functionaliteiten uitleg',
      date: '2024-09-02',
      status: 'pending',
      category: 'email',
      priority: 'high',
      assignee: 'Marketing Team',
      notes: 'Content in ontwikkeling'
    },
    {
      id: '4',
      title: 'Informatieve E-mail #2',
      description: 'Rick\'s achtergrond en visie voor Top Tier Men',
      date: '2024-09-05',
      status: 'pending',
      category: 'email',
      priority: 'high',
      assignee: 'Content Team',
      notes: 'Rick interview en content creatie'
    },
    {
      id: '5',
      title: 'Prelaunch Pakket Aanbod',
      description: '50% early access korting aanbieding',
      date: '2024-09-09',
      status: 'pending',
      category: 'marketing',
      priority: 'critical',
      assignee: 'Marketing Team',
      notes: 'Pricing strategie en aanbieding details'
    },
    {
      id: '6',
      title: 'Platform Launch',
      description: 'Live gaan met Top Tier Men platform',
      date: '2024-09-10',
      status: 'pending',
      category: 'technical',
      priority: 'critical',
      assignee: 'Development Team',
      notes: 'Final testing en deployment'
    }
  ];

  const emailCampaigns: EmailCampaign[] = [
    {
      id: '1',
      subject: 'Welkom bij Top Tier Men - Jouw reis naar het volgende niveau begint hier',
      content: 'Welkomst e-mail met platform introductie en wat te verwachten',
      sendDate: '2024-08-29',
      targetAudience: 'Alle bestaande leads',
      status: 'scheduled',
      openRate: 0,
      clickRate: 0
    },
    {
      id: '2',
      subject: 'Ontdek de kracht van het Top Tier Men platform',
      content: 'Uitgebreide uitleg van platform features en voordelen',
      sendDate: '2024-09-02',
      targetAudience: 'Actieve leads',
      status: 'draft',
      openRate: 0,
      clickRate: 0
    },
    {
      id: '3',
      subject: 'Ontmoet Rick - De visie achter Top Tier Men',
      content: 'Rick\'s achtergrond, ervaring en visie voor de community',
      sendDate: '2024-09-05',
      targetAudience: 'Engaged leads',
      status: 'draft',
      openRate: 0,
      clickRate: 0
    },
    {
      id: '4',
      subject: '🚀 EXCLUSIEF: 50% Early Access Korting - Beperkte tijd beschikbaar',
      content: 'Prelaunch aanbieding met 50% korting voor early access',
      sendDate: '2024-09-09',
      targetAudience: 'Alle leads',
      status: 'draft',
      openRate: 0,
      clickRate: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-blue-600';
      case 'pending': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return '📧';
      case 'technical': return '⚙️';
      case 'marketing': return '📢';
      case 'content': return '📝';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-[#181F17] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#B6C948] mb-2">
                🚀 Planning Lancering
              </h1>
              <p className="text-[#8BAE5A] text-lg">
                Countdown naar 10 september - Top Tier Men gaat live!
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#B6C948]">
                {Math.ceil((new Date('2024-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagen
              </div>
              <div className="text-[#8BAE5A] text-sm">tot lancering</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#232D1A] rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#B6C948] font-semibold">Lancering Progress</span>
              <span className="text-[#8BAE5A] text-sm">
                {launchTasks.filter(t => t.status === 'completed').length} / {launchTasks.length} voltooid
              </span>
            </div>
            <div className="w-full bg-[#181F17] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#B6C948] to-[#3A4D23] h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(launchTasks.filter(t => t.status === 'completed').length / launchTasks.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#232D1A] rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            📅 Timeline
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'emails'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            📧 E-mail Campagnes
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            ✅ Taken Overzicht
          </button>
        </div>

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Lancering Timeline</h2>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#3A4D23]"></div>
                
                {launchTasks.map((task, index) => (
                  <div key={task.id} className="relative flex items-start mb-8">
                    {/* Timeline Dot */}
                    <div className={`absolute left-4 w-4 h-4 rounded-full ${getStatusColor(task.status)} border-4 border-[#181F17] z-10`}></div>
                    
                    {/* Content */}
                    <div className="ml-12 flex-1">
                      <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                            <div>
                              <h3 className="text-xl font-semibold text-[#B6C948]">{task.title}</h3>
                              <p className="text-[#8BAE5A] text-sm">{task.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <div className={`text-sm font-semibold mt-1 ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-[#8BAE5A] mb-3">{task.description}</p>
                        
                        {task.assignee && (
                          <div className="text-sm text-[#8BAE5A] mb-2">
                            <strong>Toegewezen aan:</strong> {task.assignee}
                          </div>
                        )}
                        
                        {task.notes && (
                          <div className="bg-[#232D1A] rounded-lg p-3">
                            <p className="text-sm text-[#8BAE5A]">{task.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Email Campaigns Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">E-mail Funnel Planning</h2>
              
              <div className="grid gap-6">
                {emailCampaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948] mb-2">{campaign.subject}</h3>
                        <p className="text-[#8BAE5A] mb-2">{campaign.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-[#8BAE5A]">
                          <span>📅 {campaign.sendDate}</span>
                          <span>👥 {campaign.targetAudience}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'sent' ? 'bg-green-600' :
                          campaign.status === 'scheduled' ? 'bg-blue-600' :
                          campaign.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {campaign.status === 'sent' && (
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#3A4D23]">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#B6C948]">{campaign.openRate}%</div>
                          <div className="text-[#8BAE5A] text-sm">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#B6C948]">{campaign.clickRate}%</div>
                          <div className="text-[#8BAE5A] text-sm">Click Rate</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Overview Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Taken Overzicht</h2>
              
              <div className="grid gap-4">
                {launchTasks.map((task) => (
                  <div key={task.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getCategoryIcon(task.category)}</span>
                        <div>
                          <h3 className="font-semibold text-[#B6C948]">{task.title}</h3>
                          <p className="text-sm text-[#8BAE5A]">{task.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#232D1A] rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-[#B6C948] mb-4">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              📧 E-mail Template Bewerken
            </button>
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              📊 Analytics Bekijken
            </button>
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              ✅ Taak Status Updaten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
