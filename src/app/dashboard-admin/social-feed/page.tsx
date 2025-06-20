'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  MapPinIcon,
  StarIcon,
  MegaphoneIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClockIcon,
  FlagIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ShareIcon,
  BellIcon,
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Types
interface ReportedPost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  reports: Array<{
    reporter: string;
    reason: string;
    timestamp: string;
  }>;
  likes: number;
  comments: number;
  status: 'pending' | 'resolved' | 'removed';
  priority: 'high' | 'medium' | 'low';
}

interface FeedPost {
  id: string;
  content: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isOfficial?: boolean;
  };
  timestamp: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
  likes: number;
  comments: number;
  isPinned?: boolean;
  isPostOfTheWeek?: boolean;
  isHidden?: boolean;
  isAnnouncement?: boolean;
  ctaButton?: {
    text: string;
    link: string;
  };
  engagement: {
    reach: number;
    impressions: number;
    clickRate: number;
  };
}

interface Notification {
  id: string;
  type: 'report' | 'spam' | 'engagement' | 'system';
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Mock data
const reportedPosts: ReportedPost[] = [
  {
    id: '1',
    content: 'Check out this amazing workout routine! 💪 #fitness #motivation',
    author: {
      name: 'Mark van der Berg',
      username: '@fitness_mark',
      avatar: '/api/placeholder/40/40'
    },
    timestamp: '2 uur geleden',
    media: {
      type: 'image',
      url: '/api/placeholder/300/200'
    },
    reports: [
      { reporter: 'Daniel V.', reason: 'Spam', timestamp: '1 uur geleden' },
      { reporter: 'Mike A.', reason: 'Irrelevante content', timestamp: '45 min geleden' },
      { reporter: 'Tom W.', reason: 'Spam', timestamp: '30 min geleden' }
    ],
    likes: 12,
    comments: 3,
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    content: 'Just completed my morning meditation session. Feeling zen! 🧘‍♂️',
    author: {
      name: 'Lucas de Vries',
      username: '@zen_lucas',
      avatar: '/api/placeholder/40/40'
    },
    timestamp: '4 uur geleden',
    reports: [
      { reporter: 'Frank M.', reason: 'Ongepaste content', timestamp: '2 uur geleden' }
    ],
    likes: 8,
    comments: 2,
    status: 'pending',
    priority: 'medium'
  }
];

const liveFeedPosts: FeedPost[] = [
  {
    id: '1',
    content: 'Just hit a new PR on deadlifts! 180kg for 3 reps. Consistency pays off! 💪',
    author: {
      name: 'Daniel Visser',
      username: '@discipline_daniel',
      avatar: '/api/placeholder/40/40'
    },
    timestamp: '1 uur geleden',
    media: {
      type: 'image',
      url: '/api/placeholder/300/200'
    },
    likes: 45,
    comments: 12,
    isPinned: true,
    engagement: {
      reach: 234,
      impressions: 567,
      clickRate: 12.5
    }
  },
  {
    id: '2',
    content: 'New Academy module "Financial Freedom" is now live! 🎓',
    author: {
      name: 'Top Tier Men',
      username: '@toptiermen',
      avatar: '/logo.svg',
      isOfficial: true
    },
    timestamp: '3 uur geleden',
    likes: 89,
    comments: 23,
    isAnnouncement: true,
    ctaButton: {
      text: 'Start Module',
      link: '/dashboard/academy'
    },
    engagement: {
      reach: 456,
      impressions: 789,
      clickRate: 18.2
    }
  },
  {
    id: '3',
    content: 'Morning routine: 5am wake up, cold shower, 30 min meditation, then gym. The grind never stops! 🔥',
    author: {
      name: 'Mike Anderson',
      username: '@alpha_mike',
      avatar: '/api/placeholder/40/40'
    },
    timestamp: '5 uur geleden',
    likes: 67,
    comments: 15,
    isPostOfTheWeek: true,
    engagement: {
      reach: 189,
      impressions: 345,
      clickRate: 8.7
    }
  }
];

const notifications: Notification[] = [
  {
    id: '1',
    type: 'report',
    message: 'Nieuwe rapportage: Spam post van @fitness_mark',
    timestamp: '5 min geleden',
    isRead: false
  },
  {
    id: '2',
    type: 'engagement',
    message: 'Hoge engagement op officiële aankondiging: 89 likes, 23 comments',
    timestamp: '15 min geleden',
    isRead: false
  },
  {
    id: '3',
    type: 'system',
    message: 'Automatische spam detectie: 3 verdachte posts geïdentificeerd',
    timestamp: '1 uur geleden',
    isRead: true
  }
];

export default function SocialFeedManagement() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'live' | 'announcement'>('moderation');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(notifications.filter(n => !n.isRead).length);
  const [announcementData, setAnnouncementData] = useState({
    content: '',
    postAs: 'rick' as 'rick' | 'official',
    useAnnouncementStyle: true,
    ctaButton: {
      text: '',
      link: ''
    },
    scheduledDate: '',
    scheduledTime: ''
  });

  // Real-time notification simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.8) {
        setUnreadNotifications(prev => prev + 1);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleModerationAction = (postId: string, action: 'approve' | 'remove' | 'warn' | 'block') => {
    console.log(`Action ${action} on post ${postId}`);
    // TODO: Implement moderation actions
  };

  const handleFeedAction = (postId: string, action: 'pin' | 'feature' | 'hide') => {
    console.log(`Action ${action} on post ${postId}`);
    // TODO: Implement feed actions
  };

  const handleAnnouncementSubmit = () => {
    console.log('Announcement data:', announcementData);
    // TODO: Implement announcement submission
  };

  const markNotificationAsRead = (notificationId: string) => {
    setUnreadNotifications(prev => Math.max(0, prev - 1));
    // TODO: Update notification status in backend
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report': return <FlagIcon className="w-4 h-4 text-red-400" />;
      case 'spam': return <ShieldExclamationIcon className="w-4 h-4 text-yellow-400" />;
      case 'engagement': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
      case 'system': return <Cog6ToothIcon className="w-4 h-4 text-blue-400" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Social Feed Beheer</h1>
          <p className="text-[#B6C948]">Regiekamer van de dagelijkse community conversatie</p>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23] hover:bg-[#181F17] transition-colors"
          >
            <BellIcon className="w-6 h-6 text-[#8BAE5A]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-[#232D1A] border border-[#3A4D23] rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-[#3A4D23]">
                <h3 className="text-[#8BAE5A] font-semibold">Notificaties</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-[#3A4D23] hover:bg-[#181F17] transition-colors ${
                      !notification.isRead ? 'bg-[#181F17]/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-white text-sm">{notification.message}</p>
                        <p className="text-[#B6C948] text-xs mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-[#8BAE5A] hover:text-white transition-colors"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/20 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-[#B6C948] text-sm">Wachtend op Moderatie</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">
                {reportedPosts.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/20 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-[#B6C948] text-sm">Gemiddelde Engagement</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">12.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <FireIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[#B6C948] text-sm">Actieve Posts</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{liveFeedPosts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/20 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-[#B6C948] text-sm">Posts van de Week</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">
                {liveFeedPosts.filter(p => p.isPostOfTheWeek).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <ExclamationTriangleIcon className="w-5 h-5" />
          Moderatie Wachtrij
          {reportedPosts.filter(p => p.status === 'pending').length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {reportedPosts.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'live'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <EyeIcon className="w-5 h-5" />
          Live Feed Beheer
        </button>
        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'announcement'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <MegaphoneIcon className="w-5 h-5" />
          Maak een Aankondiging
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Gerapporteerde Posts
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#B6C948]">
                  {reportedPosts.filter(p => p.status === 'pending').length} wachtend op moderatie
                </div>
                <select className="bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-1 text-[#B6C948] text-sm">
                  <option>Alle prioriteiten</option>
                  <option>Hoge prioriteit</option>
                  <option>Gemiddelde prioriteit</option>
                  <option>Lage prioriteit</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {reportedPosts.map((post) => (
                <div key={post.id} className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(post.priority)}`}>
                      {post.priority === 'high' ? 'Hoge Prioriteit' : 
                       post.priority === 'medium' ? 'Gemiddelde Prioriteit' : 'Lage Prioriteit'}
                    </span>
                    <span className="text-[#B6C948] text-sm">{post.timestamp}</span>
                  </div>

                  {/* Post Content Preview */}
                  <div className="flex gap-4 mb-4">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-[#8BAE5A]">{post.author.name}</span>
                        <span className="text-[#B6C948] text-sm">{post.author.username}</span>
                      </div>
                      <p className="text-white mb-3">{post.content}</p>
                      {post.media && (
                        <div className="mb-3">
                          <img 
                            src={post.media.url} 
                            alt="Post media"
                            className="rounded-lg max-w-xs"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[#B6C948]">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reports Section */}
                  <div className="bg-[#232D1A] rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FlagIcon className="w-5 h-5 text-red-400" />
                      <span className="font-semibold text-red-400">
                        Gerapporteerd door {post.reports.length} gebruiker(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {post.reports.map((report, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-[#B6C948]">{report.reporter}</span>
                          <span className="text-red-400">{report.reason}</span>
                          <span className="text-[#B6C948] text-xs">{report.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerationAction(post.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Veilig
                    </button>
                    <button
                      onClick={() => handleModerationAction(post.id, 'remove')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Verwijder Post
                    </button>
                    <button
                      onClick={() => handleModerationAction(post.id, 'warn')}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <ShieldExclamationIcon className="w-4 h-4" />
                      Waarschuw Gebruiker
                    </button>
                    <button
                      onClick={() => handleModerationAction(post.id, 'block')}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Blokkeer Gebruiker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                <EyeIcon className="w-6 h-6" />
                Live Feed Overzicht
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-[#B6C948]">
                  {liveFeedPosts.length} posts in feed
                </div>
                <select className="bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-1 text-[#B6C948] text-sm">
                  <option>Alle posts</option>
                  <option>Gepinde posts</option>
                  <option>Posts van de week</option>
                  <option>Aankondigingen</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {liveFeedPosts.map((post) => (
                <div key={post.id} className={`bg-[#181F17] rounded-lg p-6 border ${
                  post.isPinned ? 'border-[#8BAE5A]' : 
                  post.isPostOfTheWeek ? 'border-yellow-500' :
                  post.isAnnouncement ? 'border-blue-500' :
                  'border-[#3A4D23]'
                }`}>
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#8BAE5A]">{post.author.name}</span>
                          {post.author.isOfficial && (
                            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Officieel</span>
                          )}
                          {post.isPinned && (
                            <span className="bg-[#8BAE5A] text-black px-2 py-1 rounded text-xs flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              Gepind
                            </span>
                          )}
                          {post.isPostOfTheWeek && (
                            <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <StarIcon className="w-3 h-3" />
                              Post van de Week
                            </span>
                          )}
                        </div>
                        <span className="text-[#B6C948] text-sm">{post.author.username} • {post.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-white mb-3">{post.content}</p>
                    {post.media && (
                      <div className="mb-3">
                        <img 
                          src={post.media.url} 
                          alt="Post media"
                          className="rounded-lg max-w-xs"
                        />
                      </div>
                    )}
                    {post.ctaButton && (
                      <button className="bg-[#8BAE5A] text-black px-4 py-2 rounded-lg hover:bg-[#B6C948] transition-colors">
                        {post.ctaButton.text}
                      </button>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="bg-[#232D1A] rounded-lg p-4 mb-4">
                    <h4 className="text-[#8BAE5A] font-semibold mb-2">Engagement Analytics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[#B6C948]">Reach:</span>
                        <span className="text-white ml-2">{post.engagement.reach}</span>
                      </div>
                      <div>
                        <span className="text-[#B6C948]">Impressions:</span>
                        <span className="text-white ml-2">{post.engagement.impressions}</span>
                      </div>
                      <div>
                        <span className="text-[#B6C948]">Click Rate:</span>
                        <span className="text-white ml-2">{post.engagement.clickRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-[#B6C948]">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedAction(post.id, 'pin')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.isPinned 
                          ? 'bg-[#8BAE5A] text-black' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <MapPinIcon className="w-4 h-4" />
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => handleFeedAction(post.id, 'feature')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.isPostOfTheWeek 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <StarIcon className="w-4 h-4" />
                      {post.isPostOfTheWeek ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => handleFeedAction(post.id, 'hide')}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <EyeSlashIcon className="w-4 h-4" />
                      Verberg
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                      Verwijder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2 mb-6">
              <MegaphoneIcon className="w-6 h-6" />
              Maak een Aankondiging
            </h2>

            <div className="space-y-6">
              {/* Post As Selection */}
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">Post als:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="postAs"
                      value="rick"
                      checked={announcementData.postAs === 'rick'}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, postAs: e.target.value as 'rick' | 'official' }))}
                      className="text-[#8BAE5A]"
                    />
                    <UserIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span className="text-white">Rick (Persoonlijk)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="postAs"
                      value="official"
                      checked={announcementData.postAs === 'official'}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, postAs: e.target.value as 'rick' | 'official' }))}
                      className="text-[#8BAE5A]"
                    />
                    <BuildingOfficeIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span className="text-white">Top Tier Men (Officieel)</span>
                  </label>
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">Bericht:</label>
                <textarea
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Schrijf je aankondiging hier..."
                  className="w-full h-32 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 text-white placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">Media toevoegen:</label>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
                    <PhotoIcon className="w-4 h-4" />
                    Foto
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
                    <VideoCameraIcon className="w-4 h-4" />
                    Video
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
                    <DocumentTextIcon className="w-4 h-4" />
                    Document
                  </button>
                </div>
              </div>

              {/* Announcement Style */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementData.useAnnouncementStyle}
                    onChange={(e) => setAnnouncementData(prev => ({ ...prev, useAnnouncementStyle: e.target.checked }))}
                    className="text-[#8BAE5A]"
                  />
                  <span className="text-[#B6C948]">Gebruik speciale 'Aankondiging' opmaak</span>
                </label>
              </div>

              {/* Call-to-Action Button */}
              <div className="space-y-3">
                <label className="block text-[#B6C948] font-medium">Call-to-Action Knop (optioneel):</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Knoptekst:</label>
                    <input
                      type="text"
                      value={announcementData.ctaButton.text}
                      onChange={(e) => setAnnouncementData(prev => ({ 
                        ...prev, 
                        ctaButton: { ...prev.ctaButton, text: e.target.value }
                      }))}
                      placeholder="Bijv: Meld je aan voor de Workshop"
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Link:</label>
                    <input
                      type="text"
                      value={announcementData.ctaButton.link}
                      onChange={(e) => setAnnouncementData(prev => ({ 
                        ...prev, 
                        ctaButton: { ...prev.ctaButton, link: e.target.value }
                      }))}
                      placeholder="Bijv: /dashboard/academy"
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-3">
                <label className="block text-[#B6C948] font-medium">Inplannen (optioneel):</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Datum:</label>
                    <input
                      type="date"
                      value={announcementData.scheduledDate}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Tijd:</label>
                    <input
                      type="time"
                      value={announcementData.scheduledTime}
                      onChange={(e) => setAnnouncementData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  onClick={handleAnnouncementSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
                >
                  <MegaphoneIcon className="w-5 h-5" />
                  {announcementData.scheduledDate ? 'Inplannen' : 'Direct Posten'}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#181F17] border border-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#232D1A] transition-colors">
                  <ClockIcon className="w-5 h-5" />
                  Concept Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 