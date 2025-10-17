'use client';
import React, { useState, useEffect, useRef } from 'react';
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
  FaceSmileIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_comment_id?: string | null;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rank?: string;
  };
  likes_count?: number;
  user_liked?: boolean;
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
  const { user, profile, isAdmin } = useSupabaseAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);
  // Foto upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Auto-focus/scroll for comment modal
  const commentModalRef = useRef<HTMLDivElement | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Reply to comment state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);

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

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Afbeelding is te groot (max 10MB)');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch posts from database
  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching social posts...');
      
      // Get posts with user info, likes count, and comments count
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('✅ Posts fetched:', postsData?.length || 0);

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
            .maybeSingle(); // Use maybeSingle() to avoid 406 error when no like exists

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
      console.log('✅ Posts processed and set:', postsWithStats.length);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      toast.error('Fout bij het laden van posts');
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      setPosting(true);
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true);
        
        // Generate unique filename
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `social-feed/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('social-media')
          .upload(fileName, selectedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Foto upload mislukt');
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('social-media')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        setUploadingImage(false);
      }
      
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: newPost.trim(),
          post_type: 'text',
          image_url: imageUrl
        });

      if (error) throw error;

      setNewPost('');
      removeImage();
      toast.success('Post succesvol geplaatst!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Fout bij het plaatsen van post');
    } finally {
      setPosting(false);
      setUploadingImage(false);
    }
  };

  // Open comment modal
  const openCommentModal = async (post: Post) => {
    setSelectedPost(post);
    setCommentModalOpen(true);
    setNewComment('');
    await fetchComments(post.id);
  };

  // Auto-scroll and focus when comment modal opens (mobile-friendly)
  useEffect(() => {
    if (commentModalOpen) {
      const id = window.setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { commentModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
        try { commentTextareaRef.current?.focus(); } catch {}
      }, 120);
      return () => window.clearTimeout(id);
    }
  }, [commentModalOpen]);

  // Auto-scroll and focus when delete modal opens (mobile-friendly)
  useEffect(() => {
    if (deleteConfirmOpen) {
      const id = window.setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { deleteModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      }, 120);
      return () => window.clearTimeout(id);
    }
  }, [deleteConfirmOpen]);

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

      // Fetch likes for these comments in one go
      const commentIds = commentsData.map((c: any) => c.id);
      let likesMap = new Map<string, { count: number; likedByMe: boolean }>();
      if (commentIds.length > 0) {
        const { data: likesData, error: likesError } = await supabase
          .from('social_comment_likes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds);
        if (!likesError && Array.isArray(likesData)) {
          likesData.forEach((row: any) => {
            const key = row.comment_id as string;
            const prev = likesMap.get(key) || { count: 0, likedByMe: false };
            likesMap.set(key, { count: prev.count + 1, likedByMe: prev.likedByMe || row.user_id === user?.id });
          });
        }
      }

      const commentsWithUsers = commentsData.map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id) || {
          id: comment.user_id,
          full_name: 'Unknown User',
          avatar_url: null,
          rank: 'Member'
        },
        likes_count: likesMap.get(comment.id)?.count || 0,
        user_liked: likesMap.get(comment.id)?.likedByMe || false
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

  // Add reply to a specific parent comment
  const addReply = async (parentId: string) => {
    if (!replyText?.trim() || !user || !selectedPost) return;
    try {
      setReplying(true);
      const { error } = await supabase
        .from('social_comments')
        .insert({
          post_id: selectedPost.id,
          user_id: user.id,
          parent_comment_id: parentId,
          content: replyText.trim()
        });
      if (error) throw error;
      setReplyText('');
      setReplyingToId(null);
      await fetchComments(selectedPost.id);
      setPosts((prev) => prev.map((p) => p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Fout bij het plaatsen van antwoord');
    } finally {
      setReplying(false);
    }
  };

  // Toggle like (boks) on a comment (one per user)
  const toggleCommentLike = async (commentId: string) => {
    if (!user || !selectedPost) return;
    try {
      const target = comments.find((c) => c.id === commentId);
      if (!target) return;

      if (target.user_liked) {
        const { error } = await supabase
          .from('social_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, user_liked: false, likes_count: Math.max((c.likes_count || 1) - 1, 0) }
              : c
          )
        );
      } else {
        const { error } = await supabase
          .from('social_comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, user_liked: true, likes_count: (c.likes_count || 0) + 1 }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('Kon boks niet verwerken');
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

  // Delete post (Admin only)
  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) {
      toast.error('Alleen admins kunnen posts verwijderen');
      return;
    }

    try {
      // Delete the post (this will cascade delete likes and comments due to foreign key constraints)
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Remove post from state
      setPosts(posts.filter(p => p.id !== postId));
      
      toast.success('Post succesvol verwijderd');
      setDeleteConfirmOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Fout bij het verwijderen van post');
    }
  };

  // Open delete confirmation
  const openDeleteConfirm = (postId: string) => {
    setPostToDelete(postId);
    setDeleteConfirmOpen(true);
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

  // Add test post function for debugging
  const addTestPost = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: 'Dit is een test post voor de Brotherhood! 🔥',
          post_type: 'text'
        });

      if (error) throw error;
      
      toast.success('Test post toegevoegd!');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error adding test post:', error);
      toast.error('Fout bij het toevoegen van test post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8">
      {/* Create Post Composer */}
      <section className="mb-4 sm:mb-6">
        <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-3 sm:p-4 md:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* User avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt={profile?.full_name || "User"} 
                  width={48} 
                  height={48} 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8BAE5A] object-cover" 
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center">
                  <span className="text-[#232D1A] font-bold text-sm sm:text-base">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
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

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <div className="text-white text-sm">Uploaden...</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#3A4D23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PhotoIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Foto</span>
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


      {/* Feed List */}
      <section className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A]">Posts laden...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8 text-center">
            <div className="text-6xl mb-4">🔥</div>
            <p className="text-[#8BAE5A] text-lg mb-2">Nog geen posts</p>
            <p className="text-[#8BAE5A]/70 text-sm">Wees de eerste om iets te delen met de Brotherhood!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => setNewPost('Hallo Brotherhood! 👋')}
                className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
              >
                Eerste post plaatsen
              </button>
              {profile?.role === 'admin' && (
                <button 
                  onClick={addTestPost}
                  className="px-6 py-2 bg-[#FFD700] text-[#181F17] rounded-lg hover:bg-[#FFE55C] transition-colors font-semibold"
                >
                  Test Post (Admin)
                </button>
              )}
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-6">
              {/* Post header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                {post.user.avatar_url ? (
                  <Image 
                    src={post.user.avatar_url} 
                    alt={post.user.full_name} 
                    width={40} 
                    height={40} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#8BAE5A] object-cover flex-shrink-0" 
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#232D1A] font-bold text-xs sm:text-sm">
                      {post.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
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
                {/* Admin delete button */}
                {isAdmin && (
                  <button
                    onClick={() => openDeleteConfirm(post.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    title="Post verwijderen (Admin)"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Post content */}
              <div className="mb-3 sm:mb-4 text-[#E1CBB3] text-sm sm:text-base whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Post image */}
              {post.image_url && (
                <div className="mb-3 sm:mb-4">
                  <img 
                    src={post.image_url} 
                    alt="Post" 
                    className="w-full h-auto max-h-96 object-cover rounded-xl"
                  />
                </div>
              )}

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
              </div>
            </div>
          ))
        )}
      </section>

      {/* Comment Modal */}
      {commentModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div
            ref={commentModalRef}
            tabIndex={-1}
            className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23] max-w-2xl w-full max-h-[90vh] flex flex-col transition-all duration-300 transform scale-100 outline-none"
          >
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
                {selectedPost.user.avatar_url ? (
                  <Image 
                    src={selectedPost.user.avatar_url} 
                    alt={selectedPost.user.full_name} 
                    width={40} 
                    height={40} 
                    className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center">
                    <span className="text-[#232D1A] font-bold text-sm">
                      {selectedPost.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
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
              <p className="text-[#E1CBB3] text-base mb-4">{selectedPost.content}</p>
              
              {/* Post image in modal */}
              {selectedPost.image_url && (
                <img 
                  src={selectedPost.image_url} 
                  alt="Post" 
                  className="w-full h-auto max-h-64 object-cover rounded-xl"
                />
              )}
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
                // Render nested: parents first, then their children indented
                comments
                  .filter((c) => !c.parent_comment_id)
                  .map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.user.avatar_url ? (
                      <Image 
                        src={comment.user.avatar_url} 
                        alt={comment.user.full_name} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full border border-[#8BAE5A] object-cover flex-shrink-0" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#232D1A] font-bold text-xs">
                          {comment.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">{comment.user.full_name}</span>
                        <span className="text-xs text-[#8BAE5A]">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">{comment.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-[#8BAE5A]">
                        <button
                          onClick={() => toggleCommentLike(comment.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:text-[#FFD700] transition-colors ${comment.user_liked ? 'text-[#FFD700]' : ''}`}
                          title="Geef een boks"
                        >
                          <span className="text-base">👊</span>
                          <span className="text-xs">{comment.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => {
                            setReplyingToId(comment.id);
                            setReplyText('');
                          }}
                          className="text-xs px-2 py-1 rounded-lg hover:text-[#FFD700] transition-colors"
                        >
                          Beantwoorden
                        </button>
                      </div>

                      {/* Reply editor for this comment */}
                      {replyingToId === comment.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Schrijf een antwoord..."
                            className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-xl p-2 text-white placeholder-[#8BAE5A] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                            rows={2}
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-[#8BAE5A]">{replyText.length}/500</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-xs"
                              >Annuleren</button>
                              <button
                                onClick={() => addReply(comment.id)}
                                disabled={!replyText.trim() || replying}
                                className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                              >{replying ? 'Plaatst...' : 'Plaatsen'}</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Children replies */}
                      {comments.filter((c) => c.parent_comment_id === comment.id).map((child) => (
                        <div key={child.id} className="mt-4 ml-10 flex gap-3">
                          {child.user.avatar_url ? (
                            <Image 
                              src={child.user.avatar_url} 
                              alt={child.user.full_name} 
                              width={24} 
                              height={24} 
                              className="w-6 h-6 rounded-full border border-[#8BAE5A] object-cover flex-shrink-0" 
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center flex-shrink-0">
                              <span className="text-[#232D1A] font-bold text-[10px]">
                                {child.user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white text-sm">{child.user.full_name}</span>
                              <span className="text-xs text-[#8BAE5A]">{timeAgo(child.created_at)}</span>
                            </div>
                            <p className="text-[#E1CBB3] text-sm">{child.content}</p>
                            <div className="mt-2 flex items-center gap-3 text-[#8BAE5A]">
                              <button
                                onClick={() => toggleCommentLike(child.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:text-[#FFD700] transition-colors ${child.user_liked ? 'text-[#FFD700]' : ''}`}
                                title="Geef een boks"
                              >
                                <span className="text-base">👊</span>
                                <span className="text-xs">{child.likes_count || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="p-6 border-t border-[#3A4D23] bg-[#181F17]">
              <div className="flex gap-3">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt={profile?.full_name || "User"} 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 rounded-full border border-[#8BAE5A] object-cover flex-shrink-0" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-[#8BAE5A] bg-[#8BAE5A] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#232D1A] font-bold text-xs">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={commentTextareaRef}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && postToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={deleteModalRef} className="bg-[#232D1A] rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <TrashIcon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Post verwijderen</h3>
                <p className="text-sm text-gray-400">Admin actie</p>
              </div>
            </div>
            
            <p className="text-[#E1CBB3] mb-6">
              Weet je zeker dat je deze post wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setPostToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => postToDelete && handleDeletePost(postToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Verwijderen
              </button>
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