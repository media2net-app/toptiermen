'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface ForumPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  view_count: number;
  like_count: number;
}

const VoorstellenTopicPage = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { completeStep } = useOnboarding();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [hasPosted, setHasPosted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchTopicAndPosts();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (topic && user && !hasPosted) {
      checkIfUserHasPosted();
    }
  }, [topic, user, hasPosted]);

  const fetchTopicAndPosts = async () => {
    if (topic) return; // Don't fetch if topic is already loaded

    try {
      setLoading(true);
      console.log('🔍 Fetching topic and posts...');

      // Find the "Voorstellen - Nieuwe Leden" topic in the "Algemeen" category
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories!inner(name, slug)
        `)
        .eq('title', '👋 Voorstellen - Nieuwe Leden')
        .eq('forum_categories.slug', 'algemeen')
        .single();

      console.log('📝 Topic query result:', { topics, topicsError });

      if (topicsError && topicsError.code !== 'PGRST116') {
        console.error('Error fetching topic:', topicsError);
        return;
      }

      if (topics) {
        setTopic(topics);
        console.log('✅ Topic set:', topics);

        // Fetch posts for this topic using API endpoint
        const postsResponse = await fetch(`/api/forum-posts?topic_id=${topics.id}`);
        const postsResult = await postsResponse.json();

        console.log('💬 Posts API result:', postsResult);

        if (postsResult.success) {
          setPosts(postsResult.posts || []);
        } else {
          console.error('Error fetching posts:', postsResult.error);
        }
      } else {
        console.log('❌ No topic found');
      }
    } catch (error) {
      console.error('Error in fetchTopicAndPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserHasPosted = async () => {
    if (!user || !topic || hasPosted) return;

    try {
      // Check if user has posted by looking at existing posts
      const postsResponse = await fetch(`/api/forum-posts?topic_id=${topic.id}`);
      const postsResult = await postsResponse.json();

      if (postsResult.success) {
        const userHasPosted = postsResult.posts.some((post: any) => post.author_id === user.id);
        setHasPosted(userHasPosted);
        console.log('🔍 User has posted check:', { userHasPosted, userId: user.id });
      } else {
        console.error('Error checking if user has posted:', postsResult.error);
      }
    } catch (error) {
      console.error('Error in checkIfUserHasPosted:', error);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !newPostContent.trim()) {
      console.log('❌ Missing required data:', { user: !!user, topic: !!topic, content: newPostContent.trim() });
      return;
    }

    console.log('📝 Submitting post:', { 
      topicId: topic.id, 
      userId: user.id, 
      content: newPostContent.trim(),
      userEmail: user.email
    });

    setPosting(true);
    try {
      // Use API endpoint to create forum post (bypasses RLS)
      const response = await fetch('/api/forum-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic_id: topic.id,
          author_id: user.id,
          content: newPostContent.trim()
        }),
      });

      const result = await response.json();
      console.log('💬 Post API result:', result);

      if (!result.success) {
        console.error('Error creating post:', result.error);
        toast.error('Er is een fout opgetreden bij het plaatsen van je bericht');
        return;
      }

      console.log('✅ Post created successfully:', result.post);
      console.log('📊 Post details:', {
        postId: result.post.id,
        topicId: result.post.topic_id,
        authorId: result.post.author_id,
        content: result.post.content,
        createdAt: result.post.created_at
      });

      // Update posts state directly instead of refetching
      console.log('🔄 Adding new post to state...');
      setPosts(prevPosts => [...prevPosts, result.post]);
      setNewPostContent('');
      setHasPosted(true);
      
      console.log('🎉 Forum post flow completed successfully!');
      toast.success('Je introductie is geplaatst! Welkom bij de community! 🎉');
      
      // Complete the onboarding step
      if (completeStep) {
        console.log('🎯 Completing onboarding step 6...');
        await completeStep(6);
        console.log('✅ Onboarding step 6 completed');
        
        // Show success modal
        setShowSuccessModal(true);
      }

    } catch (error) {
      console.error('Error in handlePostSubmit:', error);
      toast.error('Er is een fout opgetreden bij het plaatsen van je bericht');
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthorName = (post: ForumPost) => {
    // For now, just show a generic name since we can't access user data due to RLS
    return `Gebruiker ${post.author_id.substring(0, 8)}`;
  };

  // Show loading state while authenticating or fetching data
  if (authLoading || loading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="flex-1">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6"></div>
            <div className="bg-[#232D1A]/90 rounded-2xl p-6 mb-6">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user after auth loading is complete
  if (!user && !authLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="flex-1">
          <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authenticatie vereist</h1>
            <p className="text-[#8BAE5A] mb-6">Je moet ingelogd zijn om deze pagina te bekijken.</p>
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="flex-1">
          <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Topic niet gevonden</h1>
            <p className="text-[#8BAE5A] mb-6">Het "Voorstellen - Nieuwe Leden" topic kon niet worden gevonden.</p>
            <Link 
              href="/dashboard/brotherhood/forum"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Terug naar Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
      {/* Linkerkolom: Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/brotherhood/forum"
            className="inline-flex items-center text-[#8BAE5A] hover:text-[#FFD700] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Terug naar Forum
          </Link>
          
          <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{topic.title}</h1>
                <div className="flex items-center text-sm text-[#8BAE5A] space-x-4">
                  <span className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {topic.reply_count} reacties
                  </span>
                  <span className="flex items-center">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                    {topic.view_count} weergaven
                  </span>
                  <span>{formatDate(topic.created_at)}</span>
                </div>
              </div>
              {topic.is_pinned && (
                <span className="bg-[#FFD700]/20 text-[#FFD700] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#FFD700]/30">
                  📌 Vastgezet
                </span>
              )}
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-[#8BAE5A]">
                {topic.content}
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#3A4D23]/60 rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-[#8BAE5A]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{getAuthorName(post)}</p>
                    <p className="text-sm text-[#8BAE5A]">{formatDate(post.created_at)}</p>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-[#8BAE5A]">
                  {post.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Post Form */}
        {user && !hasPosted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PlusIcon className="w-5 h-5 mr-2 text-[#FFD700]" />
              Stel je voor aan de community
            </h2>
            
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Vertel iets over jezelf: je naam, waar je vandaan komt, je doelen, interesses, etc. Wees welkom in de Top Tier Men community! 🎉"
                className="w-full h-32 p-3 bg-[#3A4D23]/30 border border-[#8BAE5A]/30 rounded-xl text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent resize-none"
                required
              />
              
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={posting || !newPostContent.trim()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {posting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17] mr-2"></div>
                      Plaatsen...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Plaats Introductie
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {user && hasPosted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 text-center"
          >
            <CheckCircleIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Welkom bij de community! 🎉
            </h3>
            <p className="text-[#8BAE5A]">
              Je hebt je succesvol voorgesteld aan de Top Tier Men community. 
              Andere leden kunnen nu reageren op je introductie.
            </p>
          </motion.div>
        )}

        {!user && (
          <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 text-center">
            <p className="text-[#8BAE5A]">
              Je moet ingelogd zijn om een introductie te plaatsen.
            </p>
          </div>
        )}
      </div>

      {/* Rechterkolom: Widgets */}
      <aside className="w-full md:w-[340px] flex flex-col gap-6 mt-10 md:mt-0">
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Recente Introducties</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            {posts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>
                {post.content.substring(0, 50)}... <span className="text-[#FFD700]">{getAuthorName(post)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Community Tips</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Wees authentiek en open</li>
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Deel je doelen en passies</li>
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Reageer op andere introducties</li>
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Maak verbindingen met gelijkgestemden</li>
          </ul>
        </div>
      </aside>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23]/40 p-8 max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircleIcon className="w-8 h-8 text-[#181F17]" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Welkom bij de community! 🎉
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#8BAE5A] mb-6"
            >
              Je hebt je succesvol voorgesteld aan de Top Tier Men community. 
              Andere leden kunnen nu reageren op je introductie.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold rounded-xl hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all transform hover:scale-105"
                onClick={() => setShowSuccessModal(false)}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Bekijk mijn persoonlijke dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VoorstellenTopicPage;
