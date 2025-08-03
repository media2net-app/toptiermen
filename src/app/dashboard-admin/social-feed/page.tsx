'use client';

import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  TrashIcon, 
  FlagIcon, 
  ChatBubbleLeftIcon,
  HeartIcon,
  FireIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';
import { toast } from 'react-hot-toast';

interface SocialPost {
  id: string;
  content: string;
  author_id: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_post_of_the_week: boolean;
  is_hidden: boolean;
  is_announcement: boolean;
  cta_button_text?: string;
  cta_button_link?: string;
  reach_count: number;
  impressions_count: number;
  click_rate: number;
  status: 'active' | 'hidden' | 'removed' | 'pending';
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rank?: string;
  };
}

interface SocialReport {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  moderator_id?: string;
  moderator_notes?: string;
  resolved_at?: string;
  created_at: string;
  post?: SocialPost;
  reporter?: {
    id: string;
    full_name: string;
  };
}

interface SocialStats {
  totalPosts: number;
  activePosts: number;
  hiddenPosts: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalEngagement: number;
  averageEngagement: number;
}

export default function SocialFeedManagement() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reports, setReports] = useState<SocialReport[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [selectedReport, setSelectedReport] = useState<SocialReport | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch data from database
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch posts
      const postsResponse = await fetch('/api/admin/social-feed-posts');
      const postsData = await postsResponse.json();

      // Fetch reports
      const reportsResponse = await fetch('/api/admin/social-feed-reports');
      const reportsData = await reportsResponse.json();

      // Fetch stats
      const statsResponse = await fetch('/api/admin/social-feed-stats');
      const statsData = await statsResponse.json();

      if (postsResponse.ok && reportsResponse.ok && statsResponse.ok) {
        setPosts(postsData.posts || []);
        setReports(reportsData.reports || []);
        setStats(statsData.stats || null);
      } else {
        throw new Error('Failed to fetch social feed data');
      }
    } catch (error) {
      console.error('Error fetching social feed data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to mock data
      setPosts([
        {
          id: '1',
          content: 'Net mijn eerste workout van de week afgerond! 💪 Voel me geweldig!',
          author_id: 'user1',
          likes_count: 15,
          comments_count: 3,
          is_pinned: false,
          is_post_of_the_week: false,
          is_hidden: false,
          is_announcement: false,
          reach_count: 120,
          impressions_count: 85,
          click_rate: 2.5,
          status: 'active',
          created_at: '2024-01-20T10:30:00Z',
          updated_at: '2024-01-20T10:30:00Z',
          author: {
            id: 'user1',
            full_name: 'Jan Jansen',
            rank: 'Bronze'
          }
        },
        {
          id: '2',
          content: 'Brotherhood meetup was geweldig! Nieuwe vriendschappen gemaakt en veel geleerd.',
          author_id: 'user2',
          likes_count: 28,
          comments_count: 7,
          is_pinned: true,
          is_post_of_the_week: true,
          is_hidden: false,
          is_announcement: false,
          reach_count: 250,
          impressions_count: 180,
          click_rate: 4.2,
          status: 'active',
          created_at: '2024-01-19T15:45:00Z',
          updated_at: '2024-01-19T15:45:00Z',
          author: {
            id: 'user2',
            full_name: 'Piet Pietersen',
            rank: 'Silver'
          }
        }
      ]);

      setReports([
        {
          id: '1',
          post_id: '3',
          reporter_id: 'user3',
          reason: 'Spam',
          description: 'Dit lijkt op spam content',
          status: 'pending',
          priority: 'medium',
          created_at: '2024-01-20T09:15:00Z',
          reporter: {
            id: 'user3',
            full_name: 'Klaas Klaassen'
          }
        }
      ]);

      setStats({
        totalPosts: 156,
        activePosts: 142,
        hiddenPosts: 8,
        totalReports: 12,
        pendingReports: 3,
        resolvedReports: 9,
        totalEngagement: 2847,
        averageEngagement: 18.2
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle post actions
  const handlePostAction = async (postId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/social-feed-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        toast.success(`Post ${action} succesvol`);
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      toast.error(`Fout bij ${action} post`);
      console.error('Error updating post:', error);
    }
  };

  // Handle report actions
  const handleReportAction = async (reportId: string, action: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/social-feed-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        toast.success(`Report ${action} succesvol`);
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
      toast.error(`Fout bij ${action} report`);
      console.error('Error updating report:', error);
    }
  };

  // Filter functions
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporter?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden van social feed data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Social Feed Beheer</h1>
        <p className="text-[#B6C948]">Regiekamer van de dagelijkse community conversatie</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Totaal Posts"
            value={stats.totalPosts}
            icon={<ChatBubbleLeftIcon className="w-8 h-8" />}
            color="green"
          />
          <AdminStatsCard
            title="Actieve Posts"
            value={stats.activePosts}
            icon={<CheckCircleIcon className="w-8 h-8" />}
            color="blue"
          />
          <AdminStatsCard
            title="Openstaande Reports"
            value={stats.pendingReports}
            icon={<ExclamationTriangleIcon className="w-8 h-8" />}
            color="orange"
          />
          <AdminStatsCard
            title="Gemiddelde Engagement"
            value={`${stats.averageEngagement}%`}
            icon={<HeartIcon className="w-8 h-8" />}
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#232D1A] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'posts'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-[#8BAE5A] hover:bg-[#3A4D23]'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-[#8BAE5A] hover:bg-[#3A4D23]'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek in posts of reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Statussen</option>
            <option value="active">Actief</option>
            <option value="hidden">Verborgen</option>
            <option value="pending">In behandeling</option>
            <option value="resolved">Opgelost</option>
          </select>
          <AdminButton
            onClick={fetchData}
            variant="secondary"
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Vernieuwen
          </AdminButton>
        </div>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <AdminCard
          title="Posts Beheren"
          subtitle="Beheer alle community posts"
          icon={<ChatBubbleLeftIcon className="w-6 h-6" />}
          gradient
        >
          <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Auteur</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#232D1A]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-white font-medium truncate">
                            {post.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {post.is_pinned && <StarIcon className="w-4 h-4 text-yellow-400" />}
                            {post.is_post_of_the_week && <FireIcon className="w-4 h-4 text-orange-400" />}
                            {post.is_announcement && <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{post.author?.full_name || 'Onbekend'}</div>
                        <div className="text-sm text-gray-400">{post.author?.rank || 'Geen rang'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{post.likes_count} ❤️</div>
                        <div className="text-sm text-gray-400">{post.comments_count} 💬</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'active' ? 'bg-green-100 text-green-800' :
                          post.status === 'hidden' ? 'bg-yellow-100 text-yellow-800' :
                          post.status === 'removed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'active' ? 'Actief' :
                           post.status === 'hidden' ? 'Verborgen' :
                           post.status === 'removed' ? 'Verwijderd' :
                           'In behandeling'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(post.created_at).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePostAction(post.id, post.is_hidden ? 'unhide' : 'hide')}
                            className="p-1 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded"
                            title={post.is_hidden ? 'Zichtbaar maken' : 'Verbergen'}
                          >
                            {post.is_hidden ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handlePostAction(post.id, 'pin')}
                            className={`p-1 rounded ${post.is_pinned ? 'text-yellow-400 bg-yellow-400/20' : 'text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23]'}`}
                            title="Vastpinnen"
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePostAction(post.id, 'remove')}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
                            title="Verwijderen"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <AdminCard
          title="Reports Beheren"
          subtitle="Beheer community reports en moderatie"
          icon={<FlagIcon className="w-6 h-6" />}
          gradient
        >
          <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reden</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prioriteit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#232D1A]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-white font-medium truncate">
                            {report.post?.content?.substring(0, 80) || 'Post niet beschikbaar'}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{report.reporter?.full_name || 'Onbekend'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{report.reason}</div>
                        {report.description && (
                          <div className="text-sm text-gray-400">{report.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.priority === 'high' ? 'bg-red-100 text-red-800' :
                          report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.priority === 'high' ? 'Hoog' :
                           report.priority === 'medium' ? 'Medium' : 'Laag'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'pending' ? 'In behandeling' :
                           report.status === 'resolved' ? 'Opgelost' : 'Afgewezen'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(report.created_at).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReportAction(report.id, 'resolve')}
                                className="p-1 text-green-400 hover:text-green-300 hover:bg-[#3A4D23] rounded"
                                title="Oplossen"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
                                title="Afwijzen"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
} 