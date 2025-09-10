'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  PhotoIcon, 
  MapPinIcon, 
  PaperAirplaneIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  FireIcon,
  HandThumbUpIcon,
  StarIcon,
  XMarkIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rank?: string;
  };
}

interface Post {
  id: string;
  content: string;
  post_type: 'text' | 'checkin' | 'achievement' | 'question' | 'motivation';
  location?: string;
  image_url?: string;
  video_url?: string;
  tags?: string[];
  created_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rank?: string;
  };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  user_like_type?: string;
}

const SocialFeedPage = () => {
  const { user, profile } = useSupabaseAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('voor-jou');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);

  // Popular emojis for quick access
  const popularEmojis = [
    '👍', '❤️', '🔥', '👊', '💪', '🎯', '🏆', '💯', '🚀', '✨',
    '😎', '🤝', '🙏', '💪', '🎉', '👏', '💎', '⚡', '🌟', '💪'
  ];

  // Function to add emoji to comment
  const addEmojiToComment = (emoji: string) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Function to add emoji to post
  const addEmojiToPost = (emoji: string) => {
    setNewPost(prev => prev + emoji);
    setShowPostEmojiPicker(false);
  };

  // Fetch posts from database
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Get posts with user info, likes count, and comments count
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get user data for all posts
      const userIds = Array.from(new Set(postsData.map(post => post.user_id)));
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, rank')
        .in('id', userIds);

      // Create a map for quick user lookup
      const usersMap = new Map();
      usersData?.forEach(user => {
        usersMap.set(user.id, user);
      });

      // Get likes count and user's like status for each post
      const postsWithStats = await Promise.all(
        postsData.map(async (post) => {
          // Get likes count
          const { count: likesCount } = await supabase
            .from('social_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Get comments count
          const { count: commentsCount } = await supabase
            .from('social_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if current user liked this post
          const { data: userLike } = await supabase
            .from('social_likes')
            .select('like_type')
            .eq('post_id', post.id)
            .eq('user_id', user?.id)
            .single();

          return {
            ...post,
            user: usersMap.get(post.user_id) || { 
              id: post.user_id, 
              full_name: 'Unknown User', 
              avatar_url: null, 
              rank: 'Member' 
            },
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            user_liked: !!userLike,
            user_like_type: userLike?.like_type
          };
        })
      );

      setPosts(postsWithStats);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Fout bij het laden van posts');
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      setPosting(true);
      
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: newPost.trim(),
          post_type: 'text'
        });

      if (error) throw error;

      setNewPost('');
      toast.success('Post succesvol geplaatst!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Fout bij het plaatsen van post');
    } finally {
      setPosting(false);
    }
  };

  // Open comment modal
  const openCommentModal = async (post: Post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
    setNewComment('');
    await fetchComments(post.id);
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      
      const { data: commentsData, error: commentsError } = await supabase
        .from('social_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Get user data for comments
      const userIds = Array.from(new Set(commentsData.map(comment => comment.user_id)));
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, rank')
        .in('id', userIds);

      const usersMap = new Map();
      usersData?.forEach(user => {
        usersMap.set(user.id, user);
      });

      const commentsWithUsers = commentsData.map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id) || {
          id: comment.user_id,
          full_name: 'Unknown User',
          avatar_url: null,
          rank: 'Member'
        }
      }));

      setComments(commentsWithUsers);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Fout bij het laden van reacties');
    } finally {
      setLoadingComments(false);
    }
  };

  // Add comment
  const addComment = async () => {
    if (!newComment.trim() || !user || !selectedPost) return;

    try {
      setCommenting(true);
      
      const { error } = await supabase
        .from('social_comments')
        .insert({
          post_id: selectedPost.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast.success('Reactie succesvol geplaatst!');
      
      // Refresh comments and update post comment count
      await fetchComments(selectedPost.id);
      
      // Update post comment count in the main feed
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Fout bij het plaatsen van reactie');
    } finally {
      setCommenting(false);
    }
  };

  // Like/unlike post
  const toggleLike = async (postId: string, likeType: string = 'boks') => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, user_liked: false, likes_count: p.likes_count - 1, user_like_type: undefined }
            : p
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('social_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            like_type: likeType
          });

        if (error) throw error;

        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, user_liked: true, likes_count: p.likes_count + 1, user_like_type: likeType }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Fout bij het liken van post');
    }
  };

  // Get post type icon
  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'checkin': return '✅';
      case 'achievement': return '🏆';
      case 'question': return '❓';
      case 'motivation': return '💪';
      default: return '📝';
    }
  };

  // Get like type icon
  const getLikeTypeIcon = (likeType: string) => {
    switch (likeType) {
      case 'fire': return '🔥';
      case 'respect': return '🙏';
      case 'love': return '❤️';
      default: return '👊';
    }
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'zojuist';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m geleden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}u geleden`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Create Post Composer */}
      <section className="mb-4 sm:mb-6">
        <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-3 sm:p-4 md:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* User avatar */}
            <div className="flex-shrink-0">
              <Image 
                src="/profielfoto.png" 
                alt={profile?.full_name || "User"} 
                width={48} 
                height={48} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8BAE5A] object-cover" 
              />
            </div>
            
            {/* Post input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full border-none focus:ring-0 resize-none bg-[#181F17] text-white rounded-xl p-3 sm:p-4 pr-10 sm:pr-12 placeholder:text-[#8BAE5A] text-sm sm:text-base"
                  rows={3}
                  placeholder={`Deel een overwinning, stel een vraag of zet je intentie voor vandaag, ${profile?.full_name?.split(' ')[0] || 'Brother'}...`}
                  maxLength={500}
                />
                <button
                  onClick={() => setShowPostEmojiPicker(!showPostEmojiPicker)}
                  className="absolute right-3 sm:right-4 top-3 sm:top-4 p-1 text-[#8BAE5A] hover:text-[#FFD700] transition-colors"
                >
                  <FaceSmileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Post Emoji Picker */}
              {showPostEmojiPicker && (
                <div className="mt-3 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmojiToPost(emoji)}
                        className="w-6 h-6 sm:w-8 sm:h-8 text-sm sm:text-lg hover:bg-[#3A4D23] rounded-lg transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <button className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#3A4D23] transition-colors">
                  <PhotoIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Foto/Video</span>
                  <span className="sm:hidden">Foto</span>
                </button>
                <button className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl bg-[#232D1A] text-[#FFD700] border border-[#3A4D23] hover:bg-[#3A4D23] transition-colors">
                  <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Check-in</span>
                  <span className="sm:hidden">Locatie</span>
                </button>
                <button 
                  onClick={createPost}
                  disabled={!newPost.trim() || posting}
                  className="ml-auto px-4 sm:px-6 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  {posting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Posten...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Post</span>
                      <span className="sm:hidden">Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feed Filters */}
      <section className="mb-4 sm:mb-6">
        <div className="flex overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 min-w-full">
            {[
              { id: 'voor-jou', label: 'Voor Jou' },
              { id: 'connecties', label: 'Connecties' },
              { id: 'mijn-groepen', label: 'Mijn Groepen' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-3 rounded-t-xl font-semibold transition-colors whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-[#232D1A] text-[#FFD700] border-b-2 border-[#FFD700]'
                    : 'bg-[#232D1A]/60 text-[#8BAE5A] hover:text-white border-b-2 border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed List */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A]">Posts laden...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-full bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <p className="text-[#8BAE5A] text-lg mb-2">Nog geen posts</p>
            <p className="text-[#8BAE5A]/70 text-sm">Wees de eerste om iets te delen met de Brotherhood!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-6">
              {/* Post header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Image 
                  src={post.user.avatar_url || "/profielfoto.png"} 
                  alt={post.user.full_name} 
                  width={40} 
                  height={40} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#8BAE5A] object-cover flex-shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                    <span className="font-semibold text-white text-sm sm:text-base truncate">
                      {post.user.full_name}
                    </span>
                    <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-1 sm:px-2 py-0.5 sm:py-1 rounded inline-flex items-center">
                      <span className="mr-1">👑</span>
                      <span className="hidden sm:inline">{post.user.rank || 'Member'}</span>
                      <span className="sm:hidden">{post.user.rank || 'M'}</span>
                    </span>
                    <span className="text-xs text-[#8BAE5A]">
                      {getPostTypeIcon(post.post_type)}
                    </span>
                  </div>
                  <span className="block text-xs text-[#8BAE5A] mt-1">
                    {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Post content */}
              <div className="mb-3 sm:mb-4 text-[#E1CBB3] text-sm sm:text-base whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Post tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-3 sm:mb-4 flex flex-wrap gap-1 sm:gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-[#3A4D23] text-[#8BAE5A] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post location */}
              {post.location && (
                <div className="mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm text-[#8BAE5A]">
                  <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{post.location}</span>
                </div>
              )}

              {/* Post actions */}
              <div className="flex items-center gap-3 sm:gap-6 text-[#8BAE5A]">
                <button 
                  onClick={() => toggleLike(post.id, 'boks')}
                  className={`flex items-center gap-1 sm:gap-2 hover:text-[#FFD700] active:text-[#FFD700] transition-colors py-1 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 rounded-lg ${
                    post.user_liked && post.user_like_type === 'boks' ? 'text-[#FFD700]' : ''
                  }`}
                >
                  <span className="text-lg sm:text-xl">👊</span>
                  <span className="text-xs sm:text-sm">{post.likes_count} Boks</span>
                </button>
                
                <button 
                  onClick={() => openCommentModal(post)}
                  className="flex items-center gap-1 sm:gap-2 hover:text-[#FFD700] active:text-[#FFD700] transition-colors py-1 sm:py-2 px-2 sm:px-3 rounded-lg"
                >
                  <span className="text-lg sm:text-xl">💬</span>
                  <span className="text-xs sm:text-sm">{post.comments_count} Reacties</span>
                </button>

                {/* Additional like types */}
                <div className="flex gap-1 sm:gap-2">
                  <button 
                    onClick={() => toggleLike(post.id, 'fire')}
                    className={`p-1 sm:p-2 rounded-lg hover:bg-[#3A4D23] transition-colors ${
                      post.user_liked && post.user_like_type === 'fire' ? 'text-[#FFD700]' : ''
                    }`}
                  >
                    🔥
                  </button>
                  <button 
                    onClick={() => toggleLike(post.id, 'respect')}
                    className={`p-1 sm:p-2 rounded-lg hover:bg-[#3A4D23] transition-colors ${
                      post.user_liked && post.user_like_type === 'respect' ? 'text-[#FFD700]' : ''
                    }`}
                  >
                    🙏
                  </button>
                  <button 
                    onClick={() => toggleLike(post.id, 'love')}
                    className={`p-1 sm:p-2 rounded-lg hover:bg-[#3A4D23] transition-colors ${
                      post.user_liked && post.user_like_type === 'love' ? 'text-[#FFD700]' : ''
                    }`}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Comment Modal */}
      {commentModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23] max-w-2xl w-full max-h-[90vh] flex flex-col transition-all duration-300 transform scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <h2 className="text-xl font-bold text-white">Reacties</h2>
              <button
                onClick={() => setCommentModalOpen(false)}
                className="p-2 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Original Post */}
            <div className="p-6 border-b border-[#3A4D23] bg-[#181F17]">
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src={selectedPost.user.avatar_url || "/profielfoto.png"} 
                  alt={selectedPost.user.full_name} 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{selectedPost.user.full_name}</span>
                    <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-1 rounded">
                      {selectedPost.user.rank || 'Member'}
                    </span>
                  </div>
                  <span className="text-xs text-[#8BAE5A] mt-1 block">{timeAgo(selectedPost.created_at)}</span>
                </div>
              </div>
              <p className="text-[#E1CBB3] text-base">{selectedPost.content}</p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                  <p className="text-[#8BAE5A]">Reacties laden...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#8BAE5A] text-lg mb-2">Nog geen reacties</p>
                  <p className="text-[#8BAE5A]/70 text-sm">Wees de eerste om te reageren!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Image 
                      src={comment.user.avatar_url || "/profielfoto.png"} 
                      alt={comment.user.full_name} 
                      width={32} 
                      height={32} 
                      className="w-8 h-8 rounded-full border border-[#8BAE5A] object-cover flex-shrink-0" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">{comment.user.full_name}</span>
                        <span className="text-xs text-[#8BAE5A]">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="p-6 border-t border-[#3A4D23] bg-[#181F17]">
              <div className="flex gap-3">
                <Image 
                  src="/profielfoto.png" 
                  alt={profile?.full_name || "User"} 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 rounded-full border border-[#8BAE5A] object-cover flex-shrink-0" 
                />
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Schrijf een reactie..."
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-xl p-3 pr-12 text-white placeholder-[#8BAE5A] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      rows={2}
                      maxLength={500}
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-3 p-1 text-[#8BAE5A] hover:text-[#FFD700] transition-colors"
                    >
                      <FaceSmileIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mt-2 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-3">
                      <div className="grid grid-cols-10 gap-2">
                        {popularEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmojiToComment(emoji)}
                            className="w-8 h-8 text-lg hover:bg-[#3A4D23] rounded-lg transition-colors flex items-center justify-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-[#8BAE5A]">{newComment.length}/500</span>
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim() || commenting}
                      className="px-5 py-2 bg-[#8BAE5A] text-[#181F17] font-semibold rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {commenting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                          Plaatsen...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-4 h-4" />
                          Plaatsen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SocialFeedPage; 