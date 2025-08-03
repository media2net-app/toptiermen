'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { CameraIcon, TrashIcon, PlusIcon, UserGroupIcon, TrophyIcon, FireIcon, BookOpenIcon, ArrowDownTrayIcon, ShieldCheckIcon, BellIcon, PencilIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import CropModal from '../../../components/CropModal';
import { toast } from 'react-hot-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  interests?: string[];
  rank?: string;
  points?: number;
  missions_completed?: number;
  is_public?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

const tabs = [
  { key: 'publiek', label: 'Mijn Publieke Profiel', icon: UserGroupIcon },
  { key: 'voortgang', label: 'Mijn Voortgang', icon: TrophyIcon },
  { key: 'affiliate', label: 'Affiliate Marketing', icon: FireIcon },
  { key: 'instellingen', label: 'Account & Instellingen', icon: ShieldCheckIcon },
  { key: 'privacy', label: 'Privacy & Beveiliging', icon: BellIcon },
];

const interestOptions = [
  'Fitness', 'Voeding', 'Mindset', 'Ondernemerschap', 'Financiën', 
  'Productiviteit', 'Relaties', 'Spiritualiteit', 'Reizen', 'Muziek',
  'Gaming', 'Sport', 'Lezen', 'Schrijven', 'Koken', 'Fotografie'
];

export default function MijnProfiel() {
  const { user, updateUser, signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('publiek');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Upload states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [cropAspect, setCropAspect] = useState(1);
  const [uploadingType, setUploadingType] = useState<'avatar' | 'cover' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Badges & Ranks states
  const [currentRank, setCurrentRank] = useState<any>(null);
  const [currentXP, setCurrentXP] = useState(0);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  
  // Affiliate states
  const [affiliateData, setAffiliateData] = useState({
    affiliate_code: '',
    total_referrals: 0,
    active_referrals: 0,
    total_earned: 0,
    monthly_earnings: 0,
    status: 'inactive' as 'active' | 'inactive' | 'suspended'
  });
  const [editingAffiliateCode, setEditingAffiliateCode] = useState(false);
  const [newAffiliateCode, setNewAffiliateCode] = useState('');
  const [savingAffiliateCode, setSavingAffiliateCode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchBadgesAndRanks();
      fetchAffiliateData();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Create profile if it doesn't exist
        if (error.code === 'PGRST116') {
          await createUserProfile();
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadgesAndRanks = async () => {
    try {
      // Get user XP and current rank
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_rank_id')
        .eq('user_id', user?.id)
        .single();

      if (!xpError && xpData) {
        setCurrentXP(xpData.total_xp || 0);

        // Get rank details
        const { data: rankData, error: rankError } = await supabase
          .from('ranks')
          .select('*')
          .eq('id', xpData.current_rank_id)
          .single();

        if (!rankError && rankData) {
          setCurrentRank(rankData);
        }
      }

      // Get user badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          awarded_at,
          badges (
            title,
            description,
            icon_name,
            category_id
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'unlocked');

      if (!badgesError && badgesData) {
        setUserBadges(badgesData);
      }
    } catch (error) {
      console.error('Error fetching badges and ranks:', error);
    }
  };

  const fetchAffiliateData = async () => {
    if (!user) return;

    try {
      console.log('Fetching affiliate data for user:', user.id);
      
      // Fetch affiliate data from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          affiliate_code,
          affiliate_status,
          total_referrals,
          active_referrals,
          total_earned,
          monthly_earnings,
          last_referral
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching affiliate data:', error);
        // Fallback to generated data if profile doesn't exist
        const affiliateCode = `${profile?.full_name?.toUpperCase().replace(/\s+/g, '') || 'USER'}${user.id.slice(-6)}`;
        console.log('Using fallback affiliate code:', affiliateCode);
        setAffiliateData({
          affiliate_code: affiliateCode,
          total_referrals: 0,
          active_referrals: 0,
          total_earned: 0,
          monthly_earnings: 0,
          status: 'inactive'
        });
        setNewAffiliateCode(affiliateCode);
        return;
      }

      console.log('Fetched affiliate data:', profileData);

      // Use real data from database
      const affiliateCode = profileData.affiliate_code || `${profile?.full_name?.toUpperCase().replace(/\s+/g, '') || 'USER'}${user.id.slice(-6)}`;
      setAffiliateData({
        affiliate_code: affiliateCode,
        total_referrals: profileData.total_referrals || 0,
        active_referrals: profileData.active_referrals || 0,
        total_earned: profileData.total_earned || 0,
        monthly_earnings: profileData.monthly_earnings || 0,
        status: profileData.affiliate_status || 'inactive'
      });

      setNewAffiliateCode(affiliateCode);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    }
  };

  const startEditingAffiliateCode = () => {
    setEditingAffiliateCode(true);
    setNewAffiliateCode(affiliateData.affiliate_code);
  };

  const saveAffiliateCode = async () => {
    if (!newAffiliateCode.trim()) {
      toast.error('Affiliate code mag niet leeg zijn');
      return;
    }

    if (!user?.id) {
      toast.error('Gebruiker niet gevonden');
      return;
    }

    setSavingAffiliateCode(true);
    try {
      console.log('Saving affiliate code:', newAffiliateCode.toUpperCase(), 'for user:', user.id);
      
      // Update affiliate code in database
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          affiliate_code: newAffiliateCode.toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating affiliate code in database:', updateError);
        toast.error(`Fout bij het opslaan in database: ${updateError.message}`);
        return;
      }

      console.log('Successfully updated affiliate code:', data);

      // Update affiliate data in local state
      setAffiliateData(prev => ({
        ...prev,
        affiliate_code: newAffiliateCode.toUpperCase()
      }));

      // Refresh affiliate data to ensure consistency
      await fetchAffiliateData();

      toast.success('Affiliate code succesvol bijgewerkt!');
      setEditingAffiliateCode(false);
    } catch (error) {
      console.error('Error saving affiliate code:', error);
      toast.error('Fout bij het opslaan van affiliate code');
    } finally {
      setSavingAffiliateCode(false);
    }
  };

  const cancelEditingAffiliateCode = () => {
    setEditingAffiliateCode(false);
    setNewAffiliateCode(affiliateData.affiliate_code);
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user?.id,
          email: user?.email,
          full_name: (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          display_name: (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Er is een fout opgetreden bij het opslaan');
      } else {
        setProfile(data);
        toast.success('Profiel succesvol bijgewerkt!');
        setEditingField(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Er is een fout opgetreden');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (!editingField || !editValue.trim()) return;

    const updates: Partial<UserProfile> = {};
    (updates as any)[editingField] = editValue.trim();
    
    await updateProfile(updates);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const addInterest = async (interest: string) => {
    if (!profile) return;
    
    const currentInterests = profile.interests || [];
    if (currentInterests.includes(interest)) {
      toast('Deze interesse heb je al toegevoegd');
      return;
    }

    await updateProfile({
      interests: [...currentInterests, interest]
    });
  };

  const removeInterest = async (interest: string) => {
    if (!profile) return;
    
    const currentInterests = profile.interests || [];
    await updateProfile({
      interests: currentInterests.filter(i => i !== interest)
    });
  };

  // Account deletion functions
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation !== 'VERWIJDER') {
      toast.error('Type "VERWIJDER" om je account te verwijderen');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user data from all tables
      const userId = user?.id;
      
      // Delete from profiles table
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      // Delete from users table
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      // Delete forum posts
      await supabase
        .from('forum_posts')
        .delete()
        .eq('author_id', userId);

      // Delete forum topics
      await supabase
        .from('forum_topics')
        .delete()
        .eq('author_id', userId);

      // Delete forum likes
      await supabase
        .from('forum_likes')
        .delete()
        .eq('user_id', userId);

      // Delete forum views
      await supabase
        .from('forum_views')
        .delete()
        .eq('user_id', userId);

      // Delete user progress
      await supabase
        .from('user_lesson_progress')
        .delete()
        .eq('user_id', userId);

      // Delete user training schemas
      await supabase
        .from('user_training_schemas')
        .delete()
        .eq('user_id', userId);

      // Delete user nutrition plans
      await supabase
        .from('user_nutrition_plans')
        .delete()
        .eq('user_id', userId);

      // Finally, delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId!);

      if (authError) {
        console.error('Error deleting auth user:', authError);
        toast.error('Er is een fout opgetreden bij het verwijderen van je account');
        return;
      }

      toast.success('Account succesvol verwijderd');
      
      // Sign out and redirect to home
      setTimeout(() => {
        signOut();
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van je account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  };

  // Upload to Supabase Storage
  const uploadToSupabase = async (file: Blob, fileName: string, bucket: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !isHeicFile(file)) {
      toast.error('Alleen afbeeldingen zijn toegestaan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding is te groot. Maximum grootte is 5MB.');
      return;
    }

    try {
      const processedFile = await convertHeicToJpeg(file);
      
      if (isHeicFile(file)) {
        toast('HEIC bestand gedetecteerd. Probeer de foto eerst naar JPEG te converteren op je telefoon voor betere kwaliteit.');
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (!result || result.length === 0) {
          toast.error('Kon de afbeelding niet lezen');
          return;
        }
        
        setSelectedImage(result);
        setCropAspect(type === 'avatar' ? 1 : 3);
        setUploadingType(type);
        setShowCropModal(true);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Er is een fout opgetreden bij het lezen van de afbeelding');
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Er is een fout opgetreden bij het verwerken van de afbeelding');
    }
  };

  // Handle crop completion
  const handleCropComplete = async (croppedImage: string) => {
    setShowCropModal(false);
    setIsUploading(true);

    try {
      const blob = base64ToBlob(croppedImage);
      const fileName = `${uploadingType}-${user?.id}-${Date.now()}.jpg`;
      const bucket = uploadingType === 'avatar' ? 'avatars' : 'covers';
      
      const publicUrl = await uploadToSupabase(blob, fileName, bucket);
      
      const updateData = uploadingType === 'avatar' 
        ? { avatar_url: publicUrl }
        : { cover_url: publicUrl };
      
      await updateProfile(updateData);
      
      toast.success(`${uploadingType === 'avatar' ? 'Profielfoto' : 'Coverfoto'} succesvol bijgewerkt!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Er is een fout opgetreden bij het uploaden van de afbeelding');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
      setSelectedImage('');
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage('');
    setUploadingType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return <div className="text-white">Gebruiker niet gevonden.</div>;
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">Mijn Profiel</h1>
        <p className="text-[#8BAE5A] text-base sm:text-lg mb-6 sm:mb-8">Beheer je profiel, voortgang en instellingen</p>
      
      {/* Tabs - Mobile Optimized */}
      <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2 sm:px-3 md:px-4 py-2 rounded-xl font-semibold transition-all text-xs sm:text-sm md:text-base whitespace-nowrap flex items-center gap-1 sm:gap-2 ${activeTab === tab.key ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-6 md:p-10">
        {activeTab === 'publiek' && profile && (
          <div className="space-y-8">
            {/* Coverfoto - Facebook Style */}
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden bg-gradient-to-r from-[#8BAE5A]/30 to-[#FFD700]/20 group">
              {profile.cover_url ? (
                <img 
                  src={profile.cover_url} 
                  alt="Coverfoto" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[#8BAE5A]/60 text-xl sm:text-2xl md:text-3xl font-bold">Geen coverfoto</span>
                </div>
              )}
              
              {/* Coverfoto Edit Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-[#181F17] rounded-xl font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors text-sm">
                  <CameraIcon className="w-4 h-4" />
                  {profile.cover_url ? 'Coverfoto wijzigen' : 'Coverfoto toevoegen'}
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileSelect(e, 'cover')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {/* Profielfoto - Overlapping Coverfoto */}
            <div className="relative -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28 px-4 sm:px-6 md:px-8">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full border-4 border-[#FFD700] bg-[#232D1A] flex items-center justify-center overflow-hidden shadow-xl relative group">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profielfoto" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-[#8BAE5A]/60 text-2xl sm:text-3xl">Geen foto</span>
                )}
                
                {/* Profielfoto Edit Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <label className="flex items-center gap-1 px-2 py-1 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors text-xs">
                    <CameraIcon className="w-3 h-3" />
                    {profile.avatar_url ? 'Wijzigen' : 'Toevoegen'}
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={(e) => handleFileSelect(e, 'avatar')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Basis info - Below Profile Picture */}
            <div className="px-4 sm:px-6 md:px-8 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  {editingField === 'display_name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-[#181F17] text-white px-3 py-1 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700] text-lg sm:text-xl md:text-2xl"
                        placeholder="Display naam"
                      />
                      <button onClick={saveEdit} disabled={saving} className="text-[#8BAE5A] hover:text-[#FFD700]">
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {profile.display_name || profile.full_name}
                      <button 
                        onClick={() => startEditing('display_name', profile.display_name || profile.full_name)}
                        className="text-[#8BAE5A] hover:text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </h2>
                <p className="text-[#8BAE5A] text-sm sm:text-base">{profile.email}</p>
              </div>
              
              {/* Stats Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                  {currentRank ? `Level ${currentRank.rank_order} - ${currentRank.name}` : 'Beginner'}
                </span>
                <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {currentXP} XP
                </span>
                <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {userBadges.length} badges
                </span>
              </div>
            </div>
            
            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Over mij</h3>
                <button 
                  onClick={() => startEditing('bio', profile.bio || '')}
                  className="text-[#8BAE5A] hover:text-[#FFD700]"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              {editingField === 'bio' ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700] resize-none"
                    rows={3}
                    placeholder="Vertel iets over jezelf..."
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-lg text-sm font-semibold hover:bg-[#A6C97B] transition-colors">
                      Opslaan
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#8BAE5A] italic">
                  {profile.bio || 'Nog geen bio toegevoegd. Klik op het potlood om er een toe te voegen!'}
                </p>
              )}
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Locatie</h3>
                <button 
                  onClick={() => startEditing('location', profile.location || '')}
                  className="text-[#8BAE5A] hover:text-[#FFD700]"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              {editingField === 'location' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700]"
                    placeholder="Je locatie"
                  />
                  <button onClick={saveEdit} disabled={saving} className="px-3 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors">
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-[#8BAE5A]">
                  {profile.location || 'Locatie niet ingesteld'}
                </p>
              )}
            </div>
            
            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-[#8BAE5A]/20 text-[#8BAE5A] text-sm font-medium flex items-center gap-2">
                    {interest}
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-[#8BAE5A] text-sm">Voeg interesses toe:</p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.filter(option => !profile.interests?.includes(option)).map((interest) => (
                    <button
                      key={interest}
                      onClick={() => addInterest(interest)}
                      className="px-3 py-1 rounded-full bg-[#3A4D23] text-[#8BAE5A] text-sm font-medium hover:bg-[#8BAE5A] hover:text-[#181F17] transition-colors"
                    >
                      + {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'voortgang' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mijn Voortgang</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#181F17] rounded-xl p-6 text-center">
                <TrophyIcon className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{currentXP}</h3>
                <p className="text-[#8BAE5A]">Totaal XP</p>
              </div>
              
              <div className="bg-[#181F17] rounded-xl p-6 text-center">
                <FireIcon className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{userBadges.length}</h3>
                <p className="text-[#8BAE5A]">Badges Verdiend</p>
              </div>
              
              <div className="bg-[#181F17] rounded-xl p-6 text-center">
                <BookOpenIcon className="w-12 h-12 text-[#FFD700] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{currentRank ? `Level ${currentRank.rank_order}` : 'Level 1'}</h3>
                <p className="text-[#8BAE5A]">{currentRank?.name || 'Recruit'}</p>
              </div>
            </div>
            
            <div className="text-center text-[#8BAE5A]">
              <p>Meer voortgangsdata volgt binnenkort...</p>
            </div>
          </div>
        )}
        
        {activeTab === 'instellingen' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Account & Instellingen</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">E-mail</h3>
                  <p className="text-[#8BAE5A] text-sm">{profile?.email}</p>
                </div>
                <button className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors">
                  Wijzigen
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Wachtwoord</h3>
                  <p className="text-[#8BAE5A] text-sm">Laatst gewijzigd: onbekend</p>
                </div>
                <button className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors">
                  Wijzigen
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Account verwijderen</h3>
                  <p className="text-[#8BAE5A] text-sm">Permanent verwijderen van je account</p>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Privacy & Beveiliging</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Publiek profiel</h3>
                  <p className="text-[#8BAE5A] text-sm">Andere gebruikers kunnen je profiel bekijken</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={profile?.is_public || false}
                    onChange={(e) => updateProfile({ is_public: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">E-mail zichtbaar</h3>
                  <p className="text-[#8BAE5A] text-sm">Toon e-mail op publiek profiel</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={profile?.show_email || false}
                    onChange={(e) => updateProfile({ show_email: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'affiliate' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Affiliate Marketing</h2>
            
            {/* Affiliate Overview */}
            <div className="bg-gradient-to-r from-[#3A4D23] to-[#4A5D33] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Verdien Geld met Brotherhood</h3>
                  <p className="text-[#8BAE5A] text-sm">Deel je unieke affiliate link en verdien commissie op elke nieuwe lid</p>
                </div>
                <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A] mb-1">€25</div>
                  <div className="text-white text-sm">Per Nieuwe Lid</div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A] mb-1">€5</div>
                  <div className="text-white text-sm">Maandelijkse Commissie</div>
                </div>
                <div className="bg-[#232D1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A] mb-1">10%</div>
                  <div className="text-white text-sm">Extra Korting</div>
                </div>
              </div>
            </div>

            {/* Affiliate Link Section */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Jouw Affiliate Link</h3>
                <button
                  onClick={startEditingAffiliateCode}
                  disabled={editingAffiliateCode}
                  className="text-[#8BAE5A] hover:text-[#FFD700] transition-colors"
                  title="Bewerk affiliate code"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {editingAffiliateCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newAffiliateCode}
                        onChange={(e) => setNewAffiliateCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-[#232D1A] text-white px-4 py-3 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700]"
                        placeholder="JOUWCODE123"
                        autoFocus
                      />
                      <button
                        onClick={saveAffiliateCode}
                        disabled={savingAffiliateCode || !newAffiliateCode.trim()}
                        className="px-4 py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors disabled:opacity-50 flex items-center"
                        title="Opslaan"
                      >
                        {savingAffiliateCode ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Opslaan...
                          </>
                        ) : (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={cancelEditingAffiliateCode}
                        disabled={savingAffiliateCode}
                        className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Annuleren"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Code wordt automatisch naar hoofdletters geconverteerd</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={affiliateData.affiliate_code || 'Geen code ingesteld'}
                        readOnly
                        className="flex-1 bg-[#232D1A] text-white px-4 py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(affiliateData.affiliate_code || '')}
                        className="px-4 py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
                        title="Kopieer affiliate code"
                      >
                        Kopiëren
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={`https://toptiermen.com/ref/${affiliateData.affiliate_code || user?.id || 'your-id'}`}
                        readOnly
                        className="flex-1 bg-[#232D1A] text-white px-4 py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(`https://toptiermen.com/ref/${affiliateData.affiliate_code || user?.id || 'your-id'}`)}
                        className="px-4 py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
                        title="Kopieer affiliate link"
                      >
                        Kopiëren
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[#8BAE5A] text-sm">
                  Deel deze link met vrienden, familie en je netwerk. Voor elke nieuwe lid die zich registreert via jouw link, verdien je €25 direct en €5 per maand.
                </p>
              </div>
            </div>

            {/* Affiliate Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A] text-sm">Totaal Verdiend</span>
                  <span className="text-white font-semibold">€{affiliateData.total_earned}</span>
                </div>
                <div className="w-full bg-[#232D1A] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((affiliateData.total_earned / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A] text-sm">Aantal Referrals</span>
                  <span className="text-white font-semibold">{affiliateData.total_referrals}</span>
                </div>
                <div className="w-full bg-[#232D1A] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((affiliateData.total_referrals / 10) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A] text-sm">Actieve Referrals</span>
                  <span className="text-white font-semibold">{affiliateData.active_referrals}</span>
                </div>
                <div className="w-full bg-[#232D1A] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${affiliateData.total_referrals > 0 ? (affiliateData.active_referrals / affiliateData.total_referrals) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A] text-sm">Maandelijkse Inkomsten</span>
                  <span className="text-white font-semibold">€{affiliateData.monthly_earnings}</span>
                </div>
                <div className="w-full bg-[#232D1A] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((affiliateData.monthly_earnings / 50) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Marketing Materials */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Marketing Materialen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Social Media Posts</h4>
                  <p className="text-[#8BAE5A] text-sm mb-3">Kant-en-klare posts voor Instagram, Facebook en LinkedIn</p>
                  <button className="w-full px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors">
                    Download Posts
                  </button>
                </div>
                
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">E-mail Templates</h4>
                  <p className="text-[#8BAE5A] text-sm mb-3">Professionele e-mail templates voor je netwerk</p>
                  <button className="w-full px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors">
                    Download Templates
                  </button>
                </div>
                
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Banners & Graphics</h4>
                  <p className="text-[#8BAE5A] text-sm mb-3">Visuele materialen voor websites en social media</p>
                  <button className="w-full px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors">
                    Download Graphics
                  </button>
                </div>
                
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Video Content</h4>
                  <p className="text-[#8BAE5A] text-sm mb-3">Korte video's om Brotherhood te promoten</p>
                  <button className="w-full px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors">
                    Download Videos
                  </button>
                </div>
              </div>
            </div>

            {/* Referral History */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Referral Geschiedenis</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#232D1A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
                </div>
                <p className="text-[#8BAE5A] text-sm">Nog geen referrals. Deel je affiliate link om te beginnen!</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Hoe Werkt Het?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Deel je Affiliate Link</h4>
                    <p className="text-[#8BAE5A] text-sm">Kopieer en deel je unieke affiliate link met je netwerk</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Nieuwe Leden Registreren</h4>
                    <p className="text-[#8BAE5A] text-sm">Mensen registreren zich via jouw link en worden actieve leden</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Verdien Commissie</h4>
                    <p className="text-[#8BAE5A] text-sm">Je ontvangt €25 direct en €5 per maand voor elke actieve referral</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Uitbetaling</h4>
                    <p className="text-[#8BAE5A] text-sm">Maandelijkse uitbetaling van je verdiende commissies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Account Verwijderen</h3>
              <p className="text-[#8BAE5A] text-sm">
                Deze actie is <strong>permanent en onomkeerbaar</strong>. Alle je data, voortgang en content zal worden verwijderd.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">Wat wordt er verwijderd:</h4>
                <ul className="text-[#8BAE5A] text-sm space-y-1">
                  <li>• Je profiel en alle persoonlijke data</li>
                  <li>• Alle forum posts en topics</li>
                  <li>• Je voortgang en missies</li>
                  <li>• Training schemas en voedingsplannen</li>
                  <li>• Alle opgeslagen content</li>
                </ul>
              </div>
              
              <div className="bg-[#181F17] rounded-lg p-4">
                <p className="text-[#8BAE5A] text-sm mb-3">
                  Type <strong>"VERWIJDER"</strong> om te bevestigen dat je je account wilt verwijderen:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type VERWIJDER"
                  className="w-full bg-[#232D1A] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'VERWIJDER'}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verwijderen...
                  </div>
                ) : (
                  'Account Verwijderen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Crop Modal */}
      {showCropModal && selectedImage && (
        <CropModal
          image={selectedImage}
          aspect={cropAspect}
          onClose={handleCropCancel}
          onCrop={handleCropComplete}
        />
      )}
      
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
            <p className="text-white font-semibold">
              {uploadingType === 'avatar' ? 'Profielfoto' : 'Coverfoto'} wordt geüpload...
            </p>
          </div>
        </div>
      )}
      
      {/* Hidden file input for ref */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
      </div>
    </ClientLayout>
  );
} 