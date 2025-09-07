'use client';

import { useState, useEffect } from 'react';
import { 
  TicketIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import AdminCard from '@/components/admin/AdminCard';
import AdminButton from '@/components/admin/AdminButton';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_response?: string;
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  user?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      name?: string;
    };
  };
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [adminResponse, setAdminResponse] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets?admin=true');
      const data = await response.json();
      
      // Ensure we always set an array
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else {
        console.error('Invalid tickets data:', data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchTickets();
        setSelectedTicket(null);
        setAdminResponse('');
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (ticketId: string, status: Ticket['status']) => {
    updateTicket(ticketId, { status });
  };

  const handleSubmitResponse = (ticketId: string) => {
    if (adminResponse.trim()) {
      updateTicket(ticketId, { 
        admin_response: adminResponse,
        admin_notes: adminNotes,
        status: 'resolved'
      });
    }
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket => 
    filter === 'all' || ticket.status === filter
  ) : [];

  const getStatusIcon = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return <ClockIcon className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'resolved': return <CheckCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'closed': return <XCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved': return 'bg-blue-500/20 text-blue-400';
      case 'closed': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-500/20 text-gray-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      case 'high': return 'bg-yellow-500/20 text-yellow-400';
      case 'urgent': return 'bg-red-500/20 text-red-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#3A4D23] rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-[#3A4D23] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
            <TicketIcon className="w-6 h-6 text-[#181F17]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
            <p className="text-[#8BAE5A]">Beheer alle support tickets</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AdminCard
          icon={<ClockIcon className="w-6 h-6" />}
          title="Open Tickets"
        >
          <div className="text-3xl font-bold text-green-400">
            {Array.isArray(tickets) ? tickets.filter(t => t.status === 'open').length : 0}
          </div>
        </AdminCard>
        <AdminCard
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          title="In Behandeling"
        >
          <div className="text-3xl font-bold text-yellow-400">
            {Array.isArray(tickets) ? tickets.filter(t => t.status === 'in_progress').length : 0}
          </div>
        </AdminCard>
        <AdminCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          title="Opgelost"
        >
          <div className="text-3xl font-bold text-blue-400">
            {Array.isArray(tickets) ? tickets.filter(t => t.status === 'resolved').length : 0}
          </div>
        </AdminCard>
        <AdminCard
          icon={<TicketIcon className="w-6 h-6" />}
          title="Totaal Tickets"
        >
          <div className="text-3xl font-bold text-purple-400">
            {Array.isArray(tickets) ? tickets.length : 0}
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33]'
            }`}
          >
            {status === 'all' ? 'Alle' :
             status === 'open' ? 'Open' :
             status === 'in_progress' ? 'In Behandeling' :
             status === 'resolved' ? 'Opgelost' : 'Gesloten'}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="cursor-pointer">
            <AdminCard className="hover:border-[#8BAE5A]/50">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-white line-clamp-2">{ticket.subject}</h3>
                {getStatusIcon(ticket.status)}
              </div>
              
              <p className="text-[#8BAE5A] text-sm line-clamp-3">{ticket.message}</p>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'open' ? 'Open' :
                   ticket.status === 'in_progress' ? 'In Behandeling' :
                   ticket.status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority === 'low' ? 'Laag' :
                   ticket.priority === 'medium' ? 'Gemiddeld' :
                   ticket.priority === 'high' ? 'Hoog' : 'Urgent'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-[#8BAE5A]">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  <span>{ticket.user?.raw_user_meta_data?.name || ticket.user?.email || 'Onbekend'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{new Date(ticket.created_at).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>
            </div>
            </AdminCard>
          </div>
        ))}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#232D1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
                  <TicketIcon className="w-6 h-6 text-[#181F17]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                  <p className="text-[#8BAE5A]">Ticket #{selectedTicket.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 bg-[#3A4D23] rounded-lg flex items-center justify-center hover:bg-[#4A5D33] transition-colors"
              >
                <XCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Info */}
                <div className="space-y-6">
                  <div className="bg-[#1A2313] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Ticket Informatie</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#8BAE5A]">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status === 'open' ? 'Open' :
                           selectedTicket.status === 'in_progress' ? 'In Behandeling' :
                           selectedTicket.status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8BAE5A]">Prioriteit:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority === 'low' ? 'Laag' :
                           selectedTicket.priority === 'medium' ? 'Gemiddeld' :
                           selectedTicket.priority === 'high' ? 'Hoog' : 'Urgent'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8BAE5A]">Categorie:</span>
                        <span className="text-white">{selectedTicket.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8BAE5A]">Gebruiker:</span>
                        <span className="text-white">{selectedTicket.user?.raw_user_meta_data?.name || selectedTicket.user?.email || 'Onbekend'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8BAE5A]">Aangemaakt:</span>
                        <span className="text-white">{new Date(selectedTicket.created_at).toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A2313] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Bericht van Gebruiker</h3>
                    <p className="text-[#8BAE5A] leading-relaxed">{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.admin_response && (
                    <div className="bg-[#1A2313] rounded-lg p-4 border-l-4 border-[#8BAE5A]">
                      <h3 className="text-lg font-semibold text-white mb-4">Reactie van Support</h3>
                      <p className="text-[#8BAE5A] leading-relaxed">{selectedTicket.admin_response}</p>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="space-y-6">
                  <div className="bg-[#1A2313] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Wijzigen</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                        <AdminButton
                          key={status}
                          onClick={() => handleStatusChange(selectedTicket.id, status)}
                          variant={selectedTicket.status === status ? 'primary' : 'secondary'}
                          className="text-xs"
                        >
                          {status === 'open' ? 'Open' :
                           status === 'in_progress' ? 'In Behandeling' :
                           status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                        </AdminButton>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1A2313] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Reactie Toevoegen</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Reactie voor Gebruiker
                        </label>
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-[#3A4D23] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] resize-none"
                          placeholder="Schrijf je reactie voor de gebruiker..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                          Interne Notities
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-[#3A4D23] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A] resize-none"
                          placeholder="Interne notities (niet zichtbaar voor gebruiker)..."
                        />
                      </div>
                      
                      <AdminButton
                        onClick={() => handleSubmitResponse(selectedTicket.id)}
                        disabled={!adminResponse.trim() || updating}
                        variant="primary"
                        className="w-full"
                      >
                        {updating ? 'Bezig...' : 'Reactie Versturen'}
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
