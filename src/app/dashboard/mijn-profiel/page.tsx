'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import NextDynamic from 'next/dynamic';
import { CameraIcon, TrashIcon, PlusIcon, UserGroupIcon, TrophyIcon, FireIcon, BookOpenIcon, ArrowDownTrayIcon, ShieldCheckIcon, BellIcon, PencilIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
// Lazy-load heavy components to reduce initial bundle and speed up first paint
const CropModal = NextDynamic(() => import('../../../components/CropModal'), { ssr: false });
const BadgeDisplay = NextDynamic(() => import('@/components/BadgeDisplay'), { ssr: false, loading: () => <div className="text-sm text-gray-400">Badges laden…</div> });
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  main_goal?: string;
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
  const { user, logout, logoutAndRedirect } = useAuth();
  const [activeTab, setActiveTab] = useState('publiek');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const [userBadges, setUserBadges] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon_name: string;
    image_url?: string;
    rarity_level: 'common' | 'rare' | 'epic' | 'legendary';
    xp_reward: number;
    unlocked_at?: string;
  }>>([]);
  // Track which secondary tabs have loaded their data
  const [loadedVoortgang, setLoadedVoortgang] = useState(false);
  const [loadedAffiliate, setLoadedAffiliate] = useState(false);
  const [loadedPushState, setLoadedPushState] = useState(false);
  
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
  
  // Base site URL for affiliate link rendering
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toptiermen.eu';
  
  // Push notification states
  const [pushSubscription, setPushSubscription] = useState<any>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  // Debounce timers for field autosave
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Per-field timestamp of last successful save
  const [fieldSavedAt, setFieldSavedAt] = useState<Record<string, number>>({});
  
  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    const labels = ['Zeer zwak', 'Zwak', 'Gemiddeld', 'Sterk', 'Zeer sterk'];
    const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-green-500'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score - 1, 4)],
      color: colors[Math.min(score - 1, 4)]
    };
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      if (typeof document !== 'undefined' && document.hidden) {
        console.log('Tab hidden: defer fetchAllData');
        return;
      }
      setLoading(true);
      setError(null);
      console.time('⏱️ fetchAllData_total');
      console.log('Fetching profile (primary) first...');

      // 1) Fetch critical data FIRST (profile) to render the page ASAP
      await fetchUserProfile();
      setLoading(false); // allow UI to render with profile

      console.timeEnd('⏱️ fetchAllData_total');
    } catch (error) {
      console.error('Error fetching data:', error);
      // Als tab verborgen is, geen error tonen en loading uitzetten
      if (typeof document !== 'undefined' && document.hidden) {
        setLoading(false);
        return;
      }
      setError('Er is een fout opgetreden bij het laden van je profiel');
    } finally {
      // Hard guarantee: never keep spinner forever
      setLoading(false);
    }
  };

  // On-demand loading for secondary tabs to avoid work on initial render
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'voortgang' && !loadedVoortgang) {
      fetchBadgesAndRanks().finally(() => setLoadedVoortgang(true));
    }
    if (activeTab === 'affiliate' && !loadedAffiliate) {
      fetchAffiliateData().finally(() => setLoadedAffiliate(true));
    }
    if (activeTab === 'privacy' && !loadedPushState) {
      fetchPushSubscription().finally(() => setLoadedPushState(true));
    }
  }, [activeTab, user]);

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return;
      const res = await fetch(`/api/profile?userId=${encodeURIComponent(user.id)}`, { cache: 'no-store' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt}`);
      }
      const payload = await res.json();
      const data = payload.profile;
      if (!data) {
        // Create profile if missing
        await createUserProfile();
        return;
      }
      const normalized: UserProfile = {
        id: data.id,
        email: data.email || '',
        full_name: data.full_name || '',
        display_name: data.display_name ?? undefined,
        avatar_url: data.avatar_url ?? undefined,
        cover_url: data.cover_url ?? undefined,
        bio: data.bio ?? undefined,
        location: data.location ?? undefined,
        main_goal: data.main_goal ?? undefined,
        is_public: data.is_public ?? undefined,
        show_email: data.show_email ?? undefined,
        created_at: data.created_at,
      } as UserProfile;
      setProfile(normalized);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // If tab is hidden, don't surface an error; we'll retry on visibility
      if (typeof document !== 'undefined' && document.hidden) {
        console.log('Tab hidden during fetchUserProfile, deferring error handling');
        return;
      }
      throw error; // Re-throw to be caught by fetchAllData
    }
  };

  const fetchBadgesAndRanks = async () => {
    if (!user) return;

    try {
      // Fetch user badges via API
      const badgesResponse = await fetch(`/api/badges/get-user-badges?userId=${user.id}`);
      const badgesData = await badgesResponse.json();
      
      const userBadges = badgesData.success ? badgesData.badges.map((item: any) => ({
        id: item.badges.id,
        title: item.badges.title,
        description: item.badges.description,
        icon_name: item.badges.icon_name,
        image_url: item.badges.image_url,
        rarity_level: item.badges.rarity_level,
        xp_reward: item.badges.xp_reward,
        unlocked_at: item.unlocked_at
      })) : [];

      setUserBadges(userBadges);

      // Get XP/level using the same logic as dashboard for consistency
      try {
        const dsRes = await fetch('/api/dashboard-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        if (dsRes.ok) {
          const ds = await dsRes.json();
          const xpStats = ds?.stats?.xp;
          if (xpStats) {
            setCurrentXP(xpStats.total ?? 0);
            setCurrentRank({ rank_order: xpStats.level ?? 1, name: xpStats.rank ?? 'Beginner' });
          }
        }
      } catch (e) {
        console.warn('Fallback to user_xp due to dashboard-stats error', e);
        // Fallback to user_xp + ranks tables
        const { data: xpData, error: xpError } = await supabase
          .from('user_xp')
          .select('total_xp, current_rank_id')
          .eq('user_id', user.id)
          .single();
        if (!xpError && xpData) {
          setCurrentXP(xpData.total_xp || 0);
          const { data: rankData } = await supabase
            .from('ranks')
            .select('*')
            .eq('id', xpData.current_rank_id)
            .single();
          if (rankData) setCurrentRank(rankData);
        }
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
      // Set fallback data on error
      const affiliateCode = `${profile?.full_name?.toUpperCase().replace(/\s+/g, '') || 'USER'}${user.id.slice(-6)}`;
      setAffiliateData({
        affiliate_code: affiliateCode,
        total_referrals: 0,
        active_referrals: 0,
        total_earned: 0,
        monthly_earnings: 0,
        status: 'inactive'
      });
      setNewAffiliateCode(affiliateCode);
    }
  };

  const fetchPushSubscription = async () => {
    if (!user) return;

    try {
      // Check if service worker and push manager are supported
      if (!(typeof navigator !== 'undefined' && 'serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      // IMPORTANT: Do NOT request permission on page load.
      // Only read current permission to avoid blocking UX.
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      setPushPermission(permission as NotificationPermission);
      if (permission !== 'granted') {
        // Skip silently; user can enable later from settings
        return;
      }

      // Get existing subscription from database
      const { data: subscription, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && subscription) {
        setPushSubscription(subscription);
      }
    } catch (error) {
      console.error('Error fetching push subscription:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!user) return;

    try {
      setIsSubscribing(true);

      // Check if service worker and push manager are supported
      if (!(typeof navigator !== 'undefined' && 'serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notificaties worden niet ondersteund door je browser');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        toast.error('Toestemming voor push notificaties is vereist');
        return;
      }

      // Register service worker
      // const registration = await typeof navigator !== 'undefined' ? navigator.serviceWorker : null.register('/sw.js');
      // await typeof navigator !== 'undefined' ? navigator.serviceWorker : null.ready;

      // Subscribe to push notifications - DISABLED
      // const subscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      // });

      // Save subscription to database - DISABLED
      // const { error } = await supabase
      //   .from('push_subscriptions')
      //   .upsert({
      //     user_id: user.id,
      //     endpoint: subscription.endpoint,
      //     p256dh_key: btoa(String.fromCharCode.apply(null, 
      //       new Uint8Array(subscription.getKey('p256dh')!)
      //     )),
      //     auth_key: btoa(String.fromCharCode.apply(null, 
      //       new Uint8Array(subscription.getKey('auth')!)
      //     ))
      //   }, { onConflict: 'user_id' });

      // if (error) {
      //   console.error('Error saving subscription:', error);
      //   toast.error('Fout bij het opslaan van push notificatie instellingen');
      //   return;
      // }

      // setPushSubscription({
      //   user_id: user.id,
      //   endpoint: subscription.endpoint,
      //   p256dh_key: btoa(String.fromCharCode.apply(null, 
      //     new Uint8Array(subscription.getKey('p256dh')!)
      //   )),
      //   auth_key: btoa(String.fromCharCode.apply(null, 
      //     new Uint8Array(subscription.getKey('auth')!)
      //   ))
      // });

      // toast.success('Push notificaties succesvol geactiveerd!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Fout bij het activeren van push notificaties');
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    if (!user || !pushSubscription) return;

    try {
      setIsUnsubscribing(true);

      // Unsubscribe from push manager - DISABLED
      // const registration = await typeof navigator !== 'undefined' ? navigator.serviceWorker : null.getRegistration();
      // if (registration) {
      //   const subscription = await registration.pushManager.getSubscription();
      //   if (subscription) {
      //     await subscription.unsubscribe();
      //   }
      // }

      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing subscription:', error);
        toast.error('Fout bij het deactiveren van push notificaties');
        return;
      }

      setPushSubscription(null);
      toast.success('Push notificaties succesvol gedeactiveerd!');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Fout bij het deactiveren van push notificaties');
    } finally {
      setIsUnsubscribing(false);
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
      console.log('Creating new profile for user:', user.id);
      const withTimeout = async <T,>(p: PromiseLike<T>, ms = 5000): Promise<T> => {
        const timeout = new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
        });
        return (Promise.race([Promise.resolve(p), timeout]) as Promise<T>);
      };

      const createQuery = supabase
        .from('profiles')
        .insert({
          id: user?.id,
          email: user?.email,
          full_name: (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          display_name: (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      const createRes: any = await withTimeout<any>(createQuery as unknown as Promise<any>);
      const { data, error } = createRes as { data: any; error: any };

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      } else {
        console.log('Profile created successfully:', data);
        const normalized: UserProfile = {
          id: data.id,
          email: data.email || '',
          full_name: data.full_name || '',
          display_name: data.display_name ?? undefined,
          avatar_url: data.avatar_url ?? undefined,
          cover_url: data.cover_url ?? undefined,
          bio: data.bio ?? undefined,
          location: data.location ?? undefined,
          is_public: data.is_public ?? undefined,
          show_email: data.show_email ?? undefined,
          created_at: data.created_at,
        } as UserProfile;
        setProfile(normalized);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  // Watchdog: avoid firing while tab is hidden; be gentle on timeouts
  useEffect(() => {
    if (!loading) return;
    if (typeof document !== 'undefined' && document.hidden) return; // pause while hidden
    const watchdog = setTimeout(() => {
      console.warn('⚠️ Loading watchdog triggered on Mijn Profiel. Showing UI without hard error.');
      setLoading(false);
      // Do not set error here to avoid scary message after tab switch
    }, 15000); // more generous timeout
    return () => clearTimeout(watchdog);
  }, [loading]);

  // Retry gently when returning to the tab if we were loading or had a soft failure
  useEffect(() => {
    const onVisible = () => {
      if (typeof document === 'undefined') return;
      if (!document.hidden && user) {
        if (loading || !profile) {
          console.log('🔄 Visibility change: retrying profile fetch');
          fetchUserProfile().catch(() => {/* swallow */});
          setLoading(false);
          setError(null);
        }
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisible);
      return () => document.removeEventListener('visibilitychange', onVisible);
    }
  }, [loading, user, profile]);

  const updateProfile = async (updates: Partial<UserProfile>, opts: { silent?: boolean } = {}) => {
    if (!profile) return;

    if (!opts.silent) setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        if (!opts.silent) toast.error('Er is een fout opgetreden bij het opslaan');
      } else {
        setProfile(data);
        if (!opts.silent) {
          toast.success('Profiel succesvol bijgewerkt!');
          setEditingField(null);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (!opts.silent) toast.error('Er is een fout opgetreden');
    } finally {
      if (!opts.silent) setSaving(false);
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

  const handleFieldChange = async (field: string, value: string) => {
    if (!profile) return;
    
    const updates: Partial<UserProfile> = {};
    (updates as any)[field] = value;
    
    // Update local state immediately for better UX
    setProfile(prev => prev ? { ...prev, ...updates } : null);

    // Debounce save to database to avoid saving on every keystroke
    if (saveTimers.current[field]) {
      clearTimeout(saveTimers.current[field]);
    }
    saveTimers.current[field] = setTimeout(async () => {
      await updateProfile(updates, { silent: true });
      setFieldSavedAt(prev => ({ ...prev, [field]: Date.now() }));
    }, 700);
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

      // Delete from profiles table
      await supabase
        .from('profiles')
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
        logoutAndRedirect('/');
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

  // Password change functions
  const handleChangePassword = async () => {
    // Reset error state
    setPasswordError(null);

    // Validate inputs
    if (!newPassword) {
      setPasswordError('Nieuw wachtwoord is vereist');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Nieuw wachtwoord moet minimaal 8 karakters lang zijn');
      return;
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setPasswordError('Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten');
      return;
    }

    // Bevestiging is niet meer verplicht

    setIsChangingPassword(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setPasswordError('Geen geldige sessie gevonden');
        return;
      }

      console.log('🔧 Attempting to change password...');

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await response.json();
      console.log('🔧 Password change response:', data);

      if (!response.ok) {
        setPasswordError(data.error || 'Fout bij het wijzigen van wachtwoord');
        return;
      }

      // Success - close modal and show success message
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      
      // Show success message
      toast.success('Wachtwoord succesvol gewijzigd!');
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Fout bij het wijzigen van wachtwoord');
    } finally {
      setIsChangingPassword(false);
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
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-[#8BAE5A] text-xl mb-4">Gebruiker niet gevonden</div>
            <button 
              onClick={() => logoutAndRedirect('/login')} 
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
            >
              Opnieuw inloggen
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <div className="text-[#8BAE5A] text-lg">Profiel laden...</div>
            <div className="text-[#B6C948] text-sm mt-2">Even geduld a.u.b.</div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">Er is een fout opgetreden</div>
            <div className="text-[#8BAE5A] text-sm mb-4">{error}</div>
            <button 
              onClick={fetchAllData} 
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!profile) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-[#8BAE5A] text-xl mb-4">Profiel niet gevonden</div>
            <div className="text-[#B6C948] text-sm mb-4">Je profiel wordt aangemaakt...</div>
            <button 
              onClick={fetchAllData} 
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        {/* Header Section - Fully Responsive */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">Mijn Profiel</h1>
          <p className="text-[#8BAE5A] text-sm sm:text-base md:text-lg leading-relaxed">Beheer je profiel, voortgang en instellingen</p>
        </div>
      
        {/* Tabs - Enhanced Responsive Design */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-2.5 sm:px-3.5 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold transition-all text-[11px] sm:text-sm md:text-base whitespace-nowrap flex items-center gap-1.5 sm:gap-2 md:gap-2 flex-shrink-0 min-w-0 ${activeTab === tab.key ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow-lg' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 flex-shrink-0" />
                  {/* Short label on mobile, full label on md+ */}
                  <span className="inline md:hidden truncate">{tab.label.split(' ')[0]}</span>
                  <span className="hidden md:inline truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      
        {/* Tab Content - Enhanced Responsive */}
        <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl shadow-xl border border-[#3A4D23]/40 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
          {activeTab === 'publiek' && profile && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Coverfoto - Enhanced Responsive */}
              <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-r from-[#8BAE5A]/30 to-[#FFD700]/20 group">
                {profile.cover_url ? (
                  <img 
                    src={profile.cover_url} 
                    alt="Coverfoto" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#8BAE5A]/60 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center px-4">Geen coverfoto</span>
                  </div>
                )}
                
                {/* Coverfoto Edit Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg sm:rounded-xl font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors text-xs sm:text-sm">
                    <CameraIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{profile.cover_url ? 'Coverfoto wijzigen' : 'Coverfoto toevoegen'}</span>
                    <span className="sm:hidden">{profile.cover_url ? 'Wijzigen' : 'Toevoegen'}</span>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={(e) => handleFileSelect(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* Profielfoto - Enhanced Responsive */}
              <div className="relative -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24 xl:-mt-28 px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full border-3 sm:border-4 border-[#FFD700] bg-[#232D1A] flex items-center justify-center overflow-hidden shadow-xl relative group">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profielfoto" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[#8BAE5A]/60 text-lg sm:text-xl md:text-2xl lg:text-3xl">Geen foto</span>
                  )}
                  
                  {/* Profielfoto Edit Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <label className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-[#8BAE5A] text-[#181F17] rounded-md sm:rounded-lg font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors text-xs">
                      <CameraIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">{profile.avatar_url ? 'Wijzigen' : 'Toevoegen'}</span>
                      <span className="sm:hidden">{profile.avatar_url ? 'Wijzig' : 'Toevoeg'}</span>
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
            
              {/* Basis info - Enhanced Responsive */}
              <div className="px-3 sm:px-4 md:px-6 lg:px-8 space-y-3 sm:space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                    {editingField === 'display_name' ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700] text-base sm:text-lg md:text-xl lg:text-2xl w-full sm:w-auto"
                          placeholder="Display naam"
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={saving} className="text-[#8BAE5A] hover:text-[#FFD700] p-1">
                            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button onClick={cancelEdit} className="text-red-400 hover:text-red-300 p-1">
                            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="break-words">{profile.display_name || profile.full_name}</span>
                        <button 
                          onClick={() => startEditing('display_name', profile.display_name || profile.full_name)}
                          className="text-[#8BAE5A] hover:text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity p-1 self-start sm:self-center"
                        >
                          <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    )}
                  </h2>
                  <p className="text-[#8BAE5A] text-sm sm:text-base break-all sm:break-normal">{profile.email}</p>
                </div>
                
                {/* Stats Badges - Enhanced Responsive */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                    {currentRank ? `Level ${currentRank.rank_order} - ${currentRank.name}` : 'Beginner'}
                  </span>
                  <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {currentXP} XP
                  </span>
                  <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {userBadges.length} badges
                  </span>
                </div>
              </div>
            
              {/* Bio - Enhanced Responsive */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-white">Over mij</h3>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  className="w-full bg-[#181F17] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Vertel iets over jezelf..."
                />
              </div>
              
              {/* Mijn doel - Readonly from onboarding step 2 */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-white">Mijn doel</h3>
                <div className="w-full bg-[#181F17] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#3A4D23] text-sm sm:text-base">
                  {(() => {
                    const map: Record<string, string> = {
                      fitness: 'Fitness & Kracht',
                      weight_loss: 'Gewichtsverlies',
                      muscle_gain: 'Spiermassa',
                      endurance: 'Conditie & Uithoudingsvermogen',
                      mental_health: 'Mentale Gezondheid',
                      productivity: 'Productiviteit',
                      business: 'Business & Carrière',
                      relationships: 'Relaties & Sociale Vaardigheden',
                      other: 'Anders'
                    };
                    const key = (profile.main_goal || '').toLowerCase();
                    return map[key] || profile.main_goal || 'Niet ingesteld';
                  })()}
                </div>
              </div>
              
              {/* Location - Enhanced Responsive */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-white">Locatie</h3>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full bg-[#181F17] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] text-sm sm:text-base"
                  placeholder="Stad, Land"
                />
              </div>
              
              {/* Interests - Enhanced Responsive */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Interesses</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {profile.interests?.map((interest, idx) => (
                    <span key={idx} className="px-2.5 sm:px-3 py-1 rounded-full bg-[#8BAE5A]/20 text-[#8BAE5A] text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                      <span className="break-words">{interest}</span>
                      <button 
                        onClick={() => removeInterest(interest)}
                        className="text-red-400 hover:text-red-300 flex-shrink-0"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[#8BAE5A] text-xs sm:text-sm">Voeg interesses toe:</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {interestOptions.filter(option => !profile.interests?.includes(option)).map((interest) => (
                      <button
                        key={interest}
                        onClick={() => addInterest(interest)}
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-[#3A4D23] text-[#8BAE5A] text-xs sm:text-sm font-medium hover:bg-[#8BAE5A] hover:text-[#181F17] transition-colors"
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
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Mijn Voortgang</h2>
              
              {/* Stats Grid - Enhanced Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="bg-[#181F17] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                  <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FFD700] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{currentXP}</h3>
                  <p className="text-[#8BAE5A] text-sm sm:text-base">Totaal XP</p>
                </div>
                
                <div className="bg-[#181F17] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center">
                  <FireIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FFD700] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{userBadges.length}</h3>
                  <p className="text-[#8BAE5A] text-sm sm:text-base">Badges Verdiend</p>
                </div>
                
                <div className="bg-[#181F17] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
                  <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FFD700] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{currentRank ? `Level ${currentRank.rank_order}` : 'Level 1'}</h3>
                  <p className="text-[#8BAE5A] text-sm sm:text-base">{currentRank?.name || 'Recruit'}</p>
                </div>
              </div>
              
              {/* Badges Section - Enhanced Responsive */}
              <div className="bg-[#181F17] rounded-lg sm:rounded-xl p-4 sm:p-6">
                <BadgeDisplay 
                  badges={userBadges} 
                  maxDisplay={12} 
                  showTitle={true} 
                  size="md" 
                />
              </div>
              
              <div className="text-center text-[#8BAE5A]">
                <p className="text-sm sm:text-base">Meer voortgangsdata volgt binnenkort...</p>
              </div>
            </div>
          )}
        
          {activeTab === 'instellingen' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Account & Instellingen</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#181F17] rounded-lg gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">E-mail</h3>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm break-all sm:break-normal">{profile?.email}</p>
                  </div>
                  <button className="px-3 sm:px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors text-sm sm:text-base whitespace-nowrap">
                    Wijzigen
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#181F17] rounded-lg gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Wachtwoord</h3>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">Laatst gewijzigd: onbekend</p>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 sm:px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors text-sm sm:text-base whitespace-nowrap"
                  >
                    Wijzigen
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#181F17] rounded-lg gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Account verwijderen</h3>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">Permanent verwijderen van je account</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base whitespace-nowrap"
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
              
              {/* Push Notifications Section */}
              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BellIcon className="w-6 h-6 text-[#8BAE5A]" />
                  <h3 className="text-lg font-semibold text-white">Push Notificaties</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-4 bg-[#232D1A] rounded-lg">
                    <div>
                      <h4 className="font-semibold text-white">Status</h4>
                      <p className="text-[#8BAE5A] text-sm">
                        {pushSubscription ? 'Actief' : pushPermission === 'denied' ? 'Geweigerd' : 'Niet geactiveerd'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pushSubscription 
                        ? 'bg-green-500/20 text-green-400' 
                        : pushPermission === 'denied' 
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {pushSubscription ? 'Actief' : pushPermission === 'denied' ? 'Geweigerd' : 'Inactief'}
                    </div>
                  </div>

                  {/* Browser Support */}
                  {!(typeof navigator !== 'undefined' && 'serviceWorker' in navigator) || !('PushManager' in window) ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                        <h4 className="font-semibold text-red-400">Niet Ondersteund</h4>
                      </div>
                      <p className="text-[#8BAE5A] text-sm">
                        Je browser ondersteunt geen push notificaties. Probeer een moderne browser zoals Chrome, Firefox of Safari.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Permission Status */}
                      {pushPermission === 'denied' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            <h4 className="font-semibold text-red-400">Toestemming Geweigerd</h4>
                          </div>
                          <p className="text-[#8BAE5A] text-sm mb-3">
                            Je hebt push notificaties geweigerd. Ga naar je browser instellingen om dit te wijzigen.
                          </p>
                          <button
                            onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                            className="text-[#8BAE5A] text-sm underline hover:text-[#FFD700] transition-colors"
                          >
                            Browser instellingen openen
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {!pushSubscription ? (
                          <button
                            onClick={subscribeToPushNotifications}
                            disabled={isSubscribing || pushPermission === 'denied'}
                            className="flex-1 px-4 py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubscribing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Activeren...
                              </>
                            ) : (
                              <>
                                <BellIcon className="w-4 h-4" />
                                Push Notificaties Activeren
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={unsubscribeFromPushNotifications}
                            disabled={isUnsubscribing}
                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isUnsubscribing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deactiveren...
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="w-4 h-4" />
                                Push Notificaties Deactiveren
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 bg-[#232D1A] rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Wat ontvang je?</h4>
                        <ul className="text-[#8BAE5A] text-sm space-y-1">
                          <li>• Nieuwe missies en uitdagingen</li>
                          <li>• Belangrijke aankondigingen</li>
                          <li>• Herinneringen voor je doelen</li>
                          <li>• Nieuwe content en trainingen</li>
                          <li>• Brotherhood updates en events</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

          {activeTab === 'affiliate' && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Affiliate Marketing</h2>
              
              {/* Affiliate Overview - Enhanced Responsive */}
              <div className="bg-gradient-to-r from-[#3A4D23] to-[#4A5D33] rounded-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">Verdien Geld met Brotherhood</h3>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm leading-relaxed">Deel je unieke affiliate link en verdien commissie op elke nieuwe lid</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0 self-start sm:self-center">
                    <FireIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-[#8BAE5A] mb-1">20%</div>
                    <div className="text-white text-xs sm:text-sm">Commissie op aankoopbedrag excl. 21% btw</div>
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-[#8BAE5A] mb-1">10%</div>
                    <div className="text-white text-xs sm:text-sm">Korting voor nieuwe klant</div>
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg md:text-2xl font-bold text-[#8BAE5A] mb-1">Via Link</div>
                    <div className="text-white text-xs sm:text-sm">Automatische toewijzing</div>
                  </div>
                </div>
              </div>

              {/* Affiliate Link Section - Enhanced Responsive */}
              <div className="bg-[#181F17] rounded-lg p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Jouw Affiliate Link</h3>
                  <button
                    onClick={startEditingAffiliateCode}
                    disabled={editingAffiliateCode}
                    className="text-[#8BAE5A] hover:text-[#FFD700] transition-colors p-1"
                    title="Bewerk affiliate code"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              
              <div className="space-y-4">
                {editingAffiliateCode ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={newAffiliateCode}
                        onChange={(e) => setNewAffiliateCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-[#232D1A] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-[#8BAE5A] focus:outline-none focus:border-[#FFD700] text-sm"
                        placeholder="JOUWCODE123"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveAffiliateCode}
                          disabled={savingAffiliateCode || !newAffiliateCode.trim()}
                          className="px-3 py-2 sm:px-4 sm:py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors disabled:opacity-50 flex items-center text-sm"
                          title="Opslaan"
                        >
                          {savingAffiliateCode ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                              <span className="hidden sm:inline">Opslaan...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <CheckIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelEditingAffiliateCode}
                          disabled={savingAffiliateCode}
                          className="px-3 py-2 sm:px-4 sm:py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="Annuleren"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Code wordt automatisch naar hoofdletters geconverteerd</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={affiliateData.affiliate_code || 'Geen code ingesteld'}
                        readOnly
                        className="flex-1 bg-[#232D1A] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A] text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(affiliateData.affiliate_code || '')}
                        className="px-3 py-2 sm:px-4 sm:py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors text-sm"
                        title="Kopieer affiliate code"
                      >
                        Kopiëren
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={`${siteBaseUrl.replace(/\/$/, '')}/ref/${affiliateData.affiliate_code || user?.id || 'your-id'}`}
                        readOnly
                        className="flex-1 bg-[#232D1A] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A] text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(`${siteBaseUrl.replace(/\/$/, '')}/ref/${affiliateData.affiliate_code || user?.id || 'your-id'}`)}
                        className="px-3 py-2 sm:px-4 sm:py-3 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors text-sm"
                        title="Kopieer affiliate link"
                      >
                        Kopiëren
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[#8BAE5A] text-xs sm:text-sm">
                  Deel deze link met je netwerk. Nieuwe klanten krijgen <strong>10% korting</strong> via jouw link. Jij ontvangt <strong>21% commissie</strong> over het aankoopbedrag <strong>excl. 21% btw</strong> (aankoopbedragen zijn incl. btw).
                </p>
              </div>
            </div>

              {/* Affiliate Stats - Enhanced Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#181F17] rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8BAE5A] text-xs sm:text-sm">Totaal Verdiend</span>
                    <span className="text-white font-semibold text-sm sm:text-base">€{affiliateData.total_earned}</span>
                  </div>
                  <div className="w-full bg-[#232D1A] rounded-full h-2">
                    <div 
                      className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((affiliateData.total_earned / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-[#181F17] rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8BAE5A] text-xs sm:text-sm">Aantal Referrals</span>
                    <span className="text-white font-semibold text-sm sm:text-base">{affiliateData.total_referrals}</span>
                  </div>
                  <div className="w-full bg-[#232D1A] rounded-full h-2">
                    <div 
                      className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((affiliateData.total_referrals / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-[#181F17] rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8BAE5A] text-xs sm:text-sm">Actieve Referrals</span>
                    <span className="text-white font-semibold text-sm sm:text-base">{affiliateData.active_referrals}</span>
                  </div>
                  <div className="w-full bg-[#232D1A] rounded-full h-2">
                    <div 
                      className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${affiliateData.total_referrals > 0 ? (affiliateData.active_referrals / affiliateData.total_referrals) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-[#181F17] rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8BAE5A] text-xs sm:text-sm">Maandelijkse Inkomsten</span>
                    <span className="text-white font-semibold text-sm sm:text-base">€{affiliateData.monthly_earnings}</span>
                  </div>
                  <div className="w-full bg-[#232D1A] rounded-full h-2">
                    <div 
                      className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((affiliateData.monthly_earnings / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Marketing Materials - Enhanced Responsive */}
              <div className="bg-[#181F17] rounded-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4">Marketing Materialen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-2 text-xs sm:text-sm md:text-base">Social Media Posts</h4>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm mb-3 leading-relaxed">Kant-en-klare posts voor Instagram, Facebook en LinkedIn</p>
                    <button disabled className="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-xs sm:text-sm">
                      Binnenkort beschikbaar
                    </button>
                  </div>
                  
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-2 text-xs sm:text-sm md:text-base">E-mail Templates</h4>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm mb-3 leading-relaxed">Professionele e-mail templates voor je netwerk</p>
                    <button disabled className="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-xs sm:text-sm">
                      Binnenkort beschikbaar
                    </button>
                  </div>
                  
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-2 text-xs sm:text-sm md:text-base">Banners & Graphics</h4>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm mb-3 leading-relaxed">Visuele materialen voor websites en social media</p>
                    <button disabled className="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-xs sm:text-sm">
                      Binnenkort beschikbaar
                    </button>
                  </div>
                  
                  <div className="bg-[#232D1A] rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-white mb-2 text-xs sm:text-sm md:text-base">Video Content</h4>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm mb-3 leading-relaxed">Korte video's om Brotherhood te promoten</p>
                    <button disabled className="w-full px-3 py-2 bg-gray-600 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-xs sm:text-sm">
                      Binnenkort beschikbaar
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral History - Enhanced Responsive */}
              <div className="bg-[#181F17] rounded-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4">Referral Geschiedenis</h3>
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#232D1A] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#8BAE5A]" />
                  </div>
                  <p className="text-[#8BAE5A] text-xs sm:text-sm">Nog geen referrals. Deel je affiliate link om te beginnen!</p>
                </div>
              </div>

              {/* How It Works - Enhanced Responsive */}
              <div className="bg-[#181F17] rounded-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4">Hoe Werkt Het?</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                      <span className="text-white font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs sm:text-sm md:text-base mb-1">Deel je Affiliate Link</h4>
                      <p className="text-[#8BAE5A] text-xs sm:text-sm leading-relaxed">Kopieer en deel je unieke affiliate link met je netwerk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                      <span className="text-white font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs sm:text-sm md:text-base mb-1">Nieuwe Leden Registreren</h4>
                      <p className="text-[#8BAE5A] text-xs sm:text-sm leading-relaxed">Mensen registreren zich via jouw link en worden actieve leden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                      <span className="text-white font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs sm:text-sm md:text-base mb-1">Verdien Commissie</h4>
                      <p className="text-[#8BAE5A] text-xs sm:text-sm leading-relaxed">Je ontvangt <strong>20% commissie</strong> – <strong>Commissie op aankoopbedrag excl. 21% btw</strong>. De nieuwe klant krijgt <strong>10% korting</strong> via jouw link.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                      <span className="text-white font-bold text-xs sm:text-sm">4</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-xs sm:text-sm md:text-base mb-1">Uitbetaling</h4>
                      <p className="text-[#8BAE5A] text-xs sm:text-sm leading-relaxed">Maandelijkse uitbetaling van je verdiende commissies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
      
        {/* Password Change Modal - Centered with auto-scroll */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordModal(false)} />
            <div className="relative bg-[#232D1A] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-[#3A4D23] max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wachtwoord Wijzigen</h3>
              <p className="text-[#8BAE5A] text-sm mb-4">
                Voer een nieuw wachtwoord in. Je hoeft je huidige wachtwoord niet in te voeren.
              </p>
              <div className="bg-[#181F17] rounded-lg p-3 text-left">
                <p className="text-[#B6C948] text-xs font-semibold mb-2">Wachtwoord vereisten:</p>
                <ul className="text-[#8BAE5A] text-xs space-y-1">
                  <li>• Minimaal 8 karakters</li>
                  <li>• Minimaal 1 hoofdletter (A-Z)</li>
                  <li>• Minimaal 1 kleine letter (a-z)</li>
                  <li>• Minimaal 1 cijfer (0-9)</li>
                  <li>• Optioneel: speciaal karakter (!@#$%^&*)</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{passwordError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-[#B6C948] font-medium mb-2">
                  Nieuw Wachtwoord
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="Minimaal 8 karakters"
                />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const strength = getPasswordStrength(newPassword);
                        const isActive = level <= strength.score;
                        return (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              isActive ? 'bg-green-400' : 'bg-[#3A4D23]'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className={`text-xs ${getPasswordStrength(newPassword).color}`}>
                      {getPasswordStrength(newPassword).label}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError(null);
                }}
                disabled={isChangingPassword}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword || 
                  !newPassword || 
                  newPassword.length < 8 ||
                  !/[A-Z]/.test(newPassword) ||
                  !/[a-z]/.test(newPassword) ||
                  !/\d/.test(newPassword)
                }
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                    Wijzigen...
                  </div>
                ) : (
                  'Wachtwoord Wijzigen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Delete Account Confirmation Modal - Enhanced Responsive */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-[#232D1A] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-red-500/20">
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
      
        {/* Upload progress indicator - Enhanced Responsive */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-[#232D1A] rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#8BAE5A]"></div>
              <p className="text-white font-semibold text-sm sm:text-base text-center">
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