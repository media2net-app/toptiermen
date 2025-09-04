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
  author?: {
    email: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  views: number;
  replies: number;
  is_pinned: boolean;
}

export default function NieuweLedenForumPage() {
  const { user } = useSupabaseAuth();
  const { isOnboarding, currentStep, completeCurrentStep } = useOnboarding();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [hasPosted, setHasPosted] = useState(false);

  useEffect(() => {
    fetchTopicAndPosts();
    checkIfUserHasPosted();
  }, [user]);

  const fetchTopicAndPosts = async () => {
    try {
      setLoading(true);

      // First, try to find the "Nieuwe Leden" topic
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('title', 'Nieuwe Leden - Stel je voor!')
        .single();

      if (topicsError && topicsError.code !== 'PGRST116') {
        console.error('Error fetching topic:', topicsError);
        return;
      }

      if (topics) {
        setTopic(topics);

        // Fetch posts for this topic
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            author:users!forum_posts_author_id_fkey(
              email,
              profiles(first_name, last_name)
            )
          `)
          .eq('topic_id', topics.id)
          .order('created_at', { ascending: true });

        if (postsError) {
          console.error('Error fetching posts:', postsError);
        } else {
          setPosts(postsData || []);
        }
      }
    } catch (error) {
      console.error('Error in fetchTopicAndPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserHasPosted = async () => {
    if (!user || !topic) return;

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('id')
        .eq('topic_id', topic.id)
        .eq('author_id', user.id)
        .single();

      if (data) {
        setHasPosted(true);
      }
    } catch (error) {
      // User hasn't posted yet
      setHasPosted(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !topic || !newPostContent.trim()) {
      toast.error('Vul een bericht in');
      return;
    }

    try {
      setPosting(true);

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topic.id,
          content: newPostContent.trim(),
          author_id: user.id
        })
        .select(`
          *,
          author:users!forum_posts_author_id_fkey(
            email,
            profiles(first_name, last_name)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Fout bij het plaatsen van bericht');
        return;
      }

      // Add the new post to the list
      setPosts(prev => [...prev, data]);
      setNewPostContent('');
      setHasPosted(true);

      // Update topic reply count
      if (topic) {
        setTopic(prev => prev ? { ...prev, replies: prev.replies + 1 } : null);
      }

      toast.success('Bericht geplaatst! Welkom in de community! 🎉');

      // If this is onboarding step 5, complete it
      if (isOnboarding && currentStep === 5) {
        await completeCurrentStep();
      }

    } catch (error) {
      console.error('Error in handleCreatePost:', error);
      toast.error('Fout bij het plaatsen van bericht');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#0F1419] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#232D1A] rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Topic niet gevonden</h1>
            <p className="text-[#8BAE5A] mb-6">
              Het "Nieuwe Leden" topic bestaat nog niet. Neem contact op met een administrator.
            </p>
            <Link 
              href="/dashboard/brotherhood/forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Terug naar Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/dashboard/brotherhood/forum"
            className="p-2 bg-[#232D1A] rounded-lg hover:bg-[#3A4D23] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{topic.title}</h1>
            <p className="text-[#8BAE5A]">
              {topic.replies} reacties • {topic.views} weergaven
            </p>
          </div>
        </div>

        {/* Onboarding Notice */}
        {isOnboarding && currentStep === 5 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircleIcon className="w-6 h-6 text-[#232D1A]" />
              <h2 className="text-xl font-bold text-[#232D1A]">Onboarding Stap 5/6</h2>
            </div>
            <p className="text-[#232D1A] font-medium">
              Stel je voor aan de community! Maak hieronder je eerste forum post om jezelf te introduceren.
            </p>
          </motion.div>
        )}

        {/* Topic Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#232D1A] rounded-2xl p-6 mb-6"
        >
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: topic.content.replace(/\n/g, '<br>') }}
          />
        </motion.div>

        {/* Posts */}
        <div className="space-y-4 mb-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#232D1A] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-[#232D1A]" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {post.author?.profiles?.first_name && post.author?.profiles?.last_name
                      ? `${post.author.profiles.first_name} ${post.author.profiles.last_name}`
                      : post.author?.email || 'Anonieme gebruiker'
                    }
                  </div>
                  <div className="text-[#8BAE5A] text-sm">
                    {new Date(post.created_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-white whitespace-pre-wrap">{post.content}</div>
            </motion.div>
          ))}
        </div>

        {/* New Post Form */}
        {!hasPosted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#232D1A] rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Stel jezelf voor
            </h3>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Vertel ons over jezelf! Wat zijn je doelen, hobby's, en waarom ben je hier?"
              className="w-full h-32 bg-[#3A4D23] border border-[#8BAE5A] rounded-lg p-4 text-white placeholder-[#8BAE5A] resize-none focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePost}
                disabled={posting || !newPostContent.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#232D1A] border-t-transparent rounded-full animate-spin" />
                    Plaatsen...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Plaats Bericht
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {hasPosted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-2xl p-6 text-center"
          >
            <CheckCircleIcon className="w-12 h-12 text-[#232D1A] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-[#232D1A] mb-2">
              Welkom in de Community! 🎉
            </h3>
            <p className="text-[#232D1A]">
              Je hebt je succesvol voorgesteld aan de community. Andere leden kunnen nu reageren op je bericht.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
