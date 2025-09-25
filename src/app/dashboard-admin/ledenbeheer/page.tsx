'use client';
import { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  KeyIcon,
  StarIcon,
  NoSymbolIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UserPlusIcon,
  TrophyIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useDebug } from '@/contexts/DebugContext';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '@/components/admin';
import { supabase } from '@/lib/supabase';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';

const ranks = ['Rookie', 'Warrior', 'Elite', 'Legend'];
const statuses = ['active', 'inactive', 'suspended'];
const userTypes = ['Gebruiker', 'Admin', 'Test'];
const packages = ['Basic Tier', 'Premium Tier', 'Lifetime Tier'];

// Helper function to determine user type (moved outside component to prevent re-renders)
const getUserType = (user: any) => {
  // Check if user is admin
  if (user.role === 'admin' || user.is_admin === true) {
    return { type: 'Admin', color: 'text-red-400', icon: '👑' };
  }
  // Check if user is test user
  if (user.email?.includes('test') || user.full_name?.toLowerCase().includes('test')) {
    return { type: 'Test', color: 'text-yellow-400', icon: '🧪' };
  }
  // Default to regular user
  return { type: 'Gebruiker', color: 'text-green-400', icon: '👤' };
};


export default function Ledenbeheer() {
  const { startImpersonation, endImpersonation, isImpersonating, targetUser, loading: impersonationLoading } = useAdminImpersonation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('Alle Rangen');
  const [selectedStatus, setSelectedStatus] = useState('Alle Statussen');
  const [selectedUserType, setSelectedUserType] = useState('Alle Types');
  const [selectedPackage, setSelectedPackage] = useState('Alle Pakketten');
  const [selectedMember, setSelectedMember] = useState<number | string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'activity'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    mainGoal: '',
    rank: '',
    status: '',
    packageType: '',
    adminNotes: ''
  });
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [showResetLogs, setShowResetLogs] = useState(false);
  const [resetLogs, setResetLogs] = useState<Array<{message: string, timestamp: string, type: 'info' | 'success' | 'error'}>>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    full_name: '',
    username: '',
    rank: 'Rookie',
    status: 'active',
    package_type: 'Basic Tier',
    password: '',
    confirmPassword: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingUser, setDeletingUser] = useState(false);

  // Handle login as user function
  const handleLoginAsUser = async (member: any) => {
    if (!member.id) {
      toast.error('Gebruiker ID niet gevonden');
      return;
    }

    const confirmed = window.confirm(
      `Weet je zeker dat je wilt inloggen als ${member.email}?\n\n` +
      'Dit geeft je toegang tot hun account voor debugging doeleinden.\n' +
      'Je kunt altijd terugkeren naar je admin account.'
    );

    if (confirmed) {
      const success = await startImpersonation(member.id);
      if (success) {
        // Optionally redirect to dashboard or refresh the page
        window.location.href = '/dashboard';
      }
    }
  };

  // Handle password reset function
  const handlePasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        `Weet je zeker dat je een wachtwoord reset link wilt versturen naar ${email}?\n\n` +
        'Dit zal een email versturen met een link om het wachtwoord te resetten.'
      );
      
      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      console.log('🔐 Sending password reset to:', email);
      
      const response = await fetch('/api/admin/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          testMode: false // Allow all users to receive password reset
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Wachtwoord reset link verstuurd naar ${email}`, {
          position: "top-right",
          duration: 5000,
        });
        
        // Log details for debugging
        console.log('🔐 Password reset result:', result);
      } else {
        toast.error(`Fout bij versturen: ${result.error}`, {
          position: "top-right",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Error sending password reset:', error);
      toast.error('Er is een fout opgetreden bij het versturen van de reset link', {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create users with passwords function (Supabase-based)
  const createUsersWithPasswords = async () => {
    try {
      setIsLoading(true);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Weet je zeker dat je accounts wilt aanmaken met wachtwoorden voor alle leden?\n\n' +
        'Dit zal:\n' +
        '- Nieuwe Supabase auth accounts aanmaken\n' +
        '- Wachtwoorden genereren en instellen\n' +
        '- Accountgegevens emails versturen\n\n' +
        'Alle gebruikers in de database worden verwerkt.'
      );
      
      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      console.log('🔐 Creating users with passwords...');
      
      const response = await fetch('/api/admin/create-users-with-passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: false // Allow all users to be processed
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Accounts verwerkt: ${result.results.created} aangemaakt, ${result.results.updated} bijgewerkt, ${result.results.emailsSent} emails verstuurd`, 
          {
            position: "top-right",
            duration: 7000,
          }
        );
        
        // Log details for debugging
        console.log('🔐 User creation results:', result.results);
      } else {
        toast.error(`Fout bij verwerken: ${result.error}`, {
          position: "top-right",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Error creating users with passwords:', error);
      toast.error('Er is een fout opgetreden bij het aanmaken van accounts', {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send account credentials function
  const sendAccountCredentials = async () => {
    try {
      setIsLoading(true);
      
      // Show confirmation dialog
      const confirmed = window.confirm(
        'Weet je zeker dat je accountgegevens wilt versturen naar alle actieve leden?\n\n' +
        'Dit zal een email versturen met login gegevens naar alle gebruikers.\n' +
        'Alle gebruikers in de database ontvangen een email.'
      );
      
      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      console.log('📧 Sending account credentials...');
      
      const response = await fetch('/api/admin/send-account-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: false // Allow all users to receive account credentials
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Accountgegevens verstuurd naar ${result.results.sent} gebruikers`, {
          position: "top-right",
          duration: 5000,
        });
        
        // Log details for debugging
        console.log('📧 Email results:', result.results);
      } else {
        toast.error(`Fout bij versturen: ${result.error}`, {
          position: "top-right",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Error sending account credentials:', error);
      toast.error('Er is een fout opgetreden bij het versturen van emails', {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch members function
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      console.log('🔄 Fetching members from database...');
      
      // Fetch users, profiles, and payment data
      const [usersResult, profilesResult, paymentsResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('prelaunch_packages').select('*').eq('payment_status', 'paid')
      ]);
      
      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error);
        toast.error('Fout bij het laden van leden', {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
      
      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
        // Continue with just users data
      }
      
      const users = usersResult.data || [];
      const profiles = profilesResult.data || [];
      const payments = paymentsResult.data || [];
      
      console.log('📊 Fetched users:', users.length, 'profiles:', profiles.length, 'payments:', payments.length);
      
      // Create a map of profiles by user ID for quick lookup
      const profilesMap = new Map();
      profiles.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Create a map of payments by email for quick lookup
      const paymentsMap = new Map();
      payments.forEach(payment => {
        paymentsMap.set(payment.email, payment);
      });
      
      // Combine user, profile, and payment data
      const combinedData = users.map(user => {
        const profile = profilesMap.get(user.id);
        const payment = paymentsMap.get(user.email);
        const combined = {
          ...user,
          ...(profile || {}),
          // Use profile data as primary, fallback to user data
          full_name: profile?.full_name || user.full_name,
          username: profile?.display_name || user.username, // Use display_name from profile as username
          rank: profile?.rank || user.rank || 'Rookie',
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          main_goal: profile?.main_goal,
          points: profile?.points || 0,
          missions_completed: profile?.missions_completed || 0,
          posts: profile?.posts || 0,
          badges: profile?.badges || 0,
          // Payment data
          payment_status: payment ? 'paid' : 'unpaid',
          payment_data: payment ? {
            amount: payment.discounted_price,
            package_name: payment.package_name,
            payment_period: payment.payment_period,
            payment_date: payment.created_at,
            mollie_payment_id: payment.mollie_payment_id
          } : null
        };
        
        // Debug log for specific users
        if (user.email === 'henk@media2net.nl' || user.email === 'jeroen@media2net.nl') {
          console.log(`🔍 ${user.email} data in fetchMembers:`, {
            user: { full_name: user.full_name, username: user.username },
            profile: { full_name: profile?.full_name, display_name: profile?.display_name },
            combined: { full_name: combined.full_name, username: combined.username }
          });
        }
        
        return combined;
      });
      
      console.log('Combined member details:', combinedData.map(m => ({
        id: m.id,
        email: m.email,
        full_name: m.full_name,
        username: m.username,
        rank: m.rank,
        status: m.status,
        created_at: m.created_at,
        avatar_url: m.avatar_url
      })));
      
      console.log('📊 Setting allMembers with', combinedData.length, 'members');
      
      setAllMembers(combinedData);
    } catch (err) {
      console.error('Exception fetching members:', err);
      toast.error('Fout bij het laden van leden', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Haal leden op uit Supabase
  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      const matchesSearch = (member.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesRank = selectedRank === 'Alle Rangen' || member.rank === selectedRank;
      const matchesStatus = selectedStatus === 'Alle Statussen' || member.status === selectedStatus;
      const userType = getUserType(member);
      const matchesUserType = selectedUserType === 'Alle Types' || userType.type === selectedUserType;
      const matchesPackage = selectedPackage === 'Alle Pakketten' || member.package_type === selectedPackage;
      return matchesSearch && matchesRank && matchesStatus && matchesUserType && matchesPackage;
    });
  }, [allMembers, searchTerm, selectedRank, selectedStatus, selectedUserType, selectedPackage]);

  // Calculate statistics
  const totalMembers = allMembers.length;
  const activeMembers = allMembers.filter(m => m.status === 'active').length;
  const newMembersThisMonth = allMembers.filter(m => {
    const createdAt = new Date(m.created_at);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;
  const eliteMembers = allMembers.filter(m => m.rank === 'Elite' || m.rank === 'Legend').length;
  const membersWithBadges = allMembers.filter(m => (m.badges || 0) > 5).length;

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRank, selectedStatus, selectedUserType, selectedPackage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'inactive': return 'Inactief';
      case 'suspended': return 'Geschorst';
      default: return status;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return 'text-[#C49C48]';
      case 'Legend': return 'text-purple-400';
      case 'Warrior': return 'text-[#8BAE5A]';
      case 'Rookie': return 'text-[#B6C948]';
      default: return 'text-[#B6C948]';
    }
  };



  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.full_name || '',
      username: member.username || '',
      bio: member.bio || '',
      mainGoal: member.main_goal || '',
      rank: member.rank || '',
      status: member.status || '',
      packageType: member.package_type || '',
      adminNotes: member.admin_notes || ''
    });
    setShowEditModal(true);
    setSelectedMember(null); // Close dropdown
  };

  const handleSave = async () => {
    console.log('🔍 handleSave called with:', { editingMember, formData });
    setIsLoading(true);
    try {
      console.log('🔄 Saving member updates...', { editingMember, formData });
      // Map package_type to subscription_tier for consistency
      let subscriptionTier = 'basic';
      if (formData.packageType === 'Premium Tier') {
        subscriptionTier = 'premium';
      } else if (formData.packageType === 'Lifetime Tier') {
        subscriptionTier = 'lifetime';
      }

      // Update profiles table
      const userUpdates: any = {
        full_name: formData.name,
        username: formData.username,
        status: formData.status,
        package_type: formData.packageType,
        subscription_tier: subscriptionTier, // Add subscription_tier for onboarding consistency
        admin_notes: formData.adminNotes
      };
      
      // Update profiles table
      const profileUpdates: any = {
        full_name: formData.name,
        display_name: formData.username,
        bio: formData.bio,
        main_goal: formData.mainGoal,
        rank: formData.rank,
        package_type: formData.packageType,
        subscription_tier: subscriptionTier // Add subscription_tier for onboarding consistency
      };
      
      // Update both tables
      const [userResult, profileResult] = await Promise.all([
        supabase.from('profiles').update(userUpdates).eq('id', editingMember.id),
        supabase.from('profiles').update(profileUpdates).eq('id', editingMember.id)
      ]);
      
      if (userResult.error) {
        console.error('❌ Error updating users table:', userResult.error);
        throw userResult.error;
      }
      if (profileResult.error) {
        console.error('❌ Error updating profiles table:', profileResult.error);
        throw profileResult.error;
      }
      
      console.log('✅ Database updates successful:', { userResult, profileResult });
      
      // Update the local state immediately
      setAllMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === editingMember.id 
            ? {
                ...member,
                full_name: formData.name,
                username: formData.username,
                display_name: formData.username, // Also update display_name for consistency
                status: formData.status,
                package_type: formData.packageType,
                subscription_tier: subscriptionTier, // Update subscription_tier in local state
                admin_notes: formData.adminNotes,
                bio: formData.bio,
                main_goal: formData.mainGoal,
                rank: formData.rank
              }
            : member
        )
      );
      
      toast.success(`Profiel van ${formData.name} succesvol bijgewerkt`, {
        position: "top-right",
        duration: 3000,
      });
      setShowEditModal(false);
      setEditingMember(null);
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het opslaan', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddNewUser = async () => {
    // Validate form data
    if (!newUserData.email || !newUserData.full_name) {
      toast.error('E-mail en volledige naam zijn verplicht', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    // Only validate password if provided
    if (newUserData.password) {
      if (newUserData.password !== newUserData.confirmPassword) {
        toast.error('Wachtwoorden komen niet overeen', {
          position: "top-right",
          duration: 3000,
        });
        return;
      }

      if (newUserData.password.length < 6) {
        toast.error('Wachtwoord moet minimaal 6 karakters bevatten', {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
    }

    setAddingUser(true);
    
    try {
      // Call the API route to create user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserData.email,
          full_name: newUserData.full_name,
          username: newUserData.username,
          rank: newUserData.rank,
          status: newUserData.status,
          package_type: newUserData.package_type,
          password: newUserData.password || undefined // Only send password if provided
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Gebruiker ${newUserData.full_name} succesvol aangemaakt!`, {
          position: "top-right",
          duration: 3000,
        });

        // Reset form and close modal
        setNewUserData({
          email: '',
          full_name: '',
          username: '',
          rank: 'Rookie',
          status: 'active',
          package_type: 'Basic Tier',
          password: '',
          confirmPassword: ''
        });
        setShowAddUserModal(false);

        // Refresh members list
        fetchMembers();
      } else {
        throw new Error(data.error || 'Er is een fout opgetreden bij het aanmaken van de gebruiker');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Er is een fout opgetreden bij het aanmaken van de gebruiker', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setAddingUser(false);
    }
  };

  const handleOnboardingReset = async () => {
    if (!editingMember?.id) return;

    if (!confirm(`⚠️ VOLLEDIGE RESET: Weet je zeker dat je gebruiker ${editingMember.name || editingMember.email} volledig wilt resetten?\n\nDit zal ALLE data wissen:\n• Onboarding voortgang (stap 0)\n• Missies (database + bestanden)\n• Training schemas & voortgang\n• Voedingsplannen & voortgang\n• Challenges & streaks\n• XP punten & achievements\n• Forum posts\n• Voorkeuren\n• Badges & rangen\n• Dagelijkse/weekelijkse voortgang\n• Doelen & gewoontes\n• Workout sessies\n• Gebruikersstatistieken\n\nDe gebruiker start weer vanaf stap 0 en kan de volledige onboarding opnieuw doorlopen.`)) {
      return;
    }

    // Show live logs popup
    console.log('🔄 Setting popup state to true');
    setShowResetLogs(true);
    setResetLogs([]);
    setIsResetting(true);

    try {
      const response = await fetch('/api/admin/reset-onboarding-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingMember.id,
          email: editingMember.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start reset process');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.completed) {
                setResetLogs(prev => [...prev, { message: data.message, timestamp: data.timestamp, type: 'success' }]);
                setIsResetting(false);
                
                // Show success toast
                toast.success('✅ Gebruiker volledig gereset! Alle data gewist. Gebruiker kan nu vanaf stap 0 beginnen.', {
                  position: "top-right",
                  duration: 5000,
                });
                
                // Refresh members list
                fetchMembers();
                setShowEditModal(false);
                
                // Close logs popup after 3 seconds
                setTimeout(() => {
                  setShowResetLogs(false);
                }, 3000);
                
                return;
              } else if (data.error) {
                setResetLogs(prev => [...prev, { message: data.message, timestamp: data.timestamp, type: 'error' }]);
                setIsResetting(false);
                
                toast.error(`❌ Reset failed: ${data.message}`, {
                  position: "top-right",
                  duration: 5000,
                });
                
                return;
              } else if (data.message) {
                setResetLogs(prev => [...prev, { message: data.message, timestamp: data.timestamp, type: 'info' }]);
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      setResetLogs(prev => [...prev, { 
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        timestamp: new Date().toISOString(), 
        type: 'error' 
      }]);
      setIsResetting(false);
      
      toast.error('Er is een fout opgetreden bij het resetten', {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  // Handle delete user function
  const handleDeleteUser = async () => {
    if (!userToDelete?.id) return;
    
    // Check if confirmation text is correct
    if (deleteConfirmation !== 'VERWIJDER') {
      toast.error('Je moet "VERWIJDER" typen om de gebruiker te verwijderen', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    try {
      setDeletingUser(true);
      
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userToDelete.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ Gebruiker ${userToDelete.full_name || userToDelete.email} is permanent verwijderd uit het systeem`, {
          position: "top-right",
          duration: 5000,
        });
        
        // Refresh members list
        fetchMembers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        setDeleteConfirmation('');
      } else {
        toast.error(data.error || 'Er is een fout opgetreden bij het verwijderen', {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setDeletingUser(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (member: any) => {
    setUserToDelete(member);
    setDeleteConfirmation('');
    setShowDeleteModal(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return ClockIcon;
      case 'post': return ChatBubbleLeftRightIcon;
      case 'badge': return StarIcon;
      case 'training': return UserIcon;
      case 'goal': return CheckIcon;
      case 'suspension': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  // Helper function to get package display
  const getPackageDisplay = (member: any) => {
    // Check if package_type exists in the member data
    if (member.package_type) {
      const packageColors = {
        'Basic Tier': 'text-green-400',
        'Premium Tier': 'text-blue-400', 
        'Lifetime Tier': 'text-purple-400'
      };
      const packageIcons = {
        'Basic Tier': '🥉',
        'Premium Tier': '🥈',
        'Lifetime Tier': '🥇'
      };
      return {
        text: member.package_type,
        color: packageColors[member.package_type as keyof typeof packageColors] || 'text-gray-400',
        icon: packageIcons[member.package_type as keyof typeof packageIcons] || '📦'
      };
    }
    
    // Fallback for users without package info
    return {
      text: 'Geen pakket',
      color: 'text-gray-500',
      icon: '❓'
    };
  };

  // Helper function to get payment status display
  const getPaymentStatusDisplay = (member: any) => {
    if (member.payment_status === 'paid' && member.payment_data) {
      const paymentDate = new Date(member.payment_data.payment_date);
      const formattedDate = paymentDate.toLocaleDateString('nl-NL');
      const formattedTime = paymentDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      
      return {
        text: 'Betaald',
        color: 'text-green-400',
        icon: '✅',
        tooltip: `Betaald op ${formattedDate} om ${formattedTime}\\nPakket: ${member.payment_data.package_name}\\nBedrag: €${member.payment_data.amount}\\nPeriode: ${member.payment_data.payment_period}`
      };
    }
    
    return {
      text: 'Niet betaald',
      color: 'text-gray-500',
      icon: '❌',
      tooltip: 'Geen betaling ontvangen'
    };
  };

  // Prepare table data for AdminTable
  const tableData = useMemo(() => {
    return currentMembers.map(member => {
      const userType = getUserType(member);
      const packageInfo = getPackageDisplay(member);
      const paymentInfo = getPaymentStatusDisplay(member);
      return [
        member.full_name || 'Onbekend',
        member.email || 'Geen e-mail',
        `${userType.icon} ${userType.type}`,
        member.rank || 'Rookie',
        getStatusText(member.status),
        member.points || 0,
        member.missions_completed || 0,
        `${packageInfo.icon} ${packageInfo.text}`,
        // Payment status with tooltip
        <span 
          className={`${paymentInfo.color} cursor-help`}
          title={paymentInfo.tooltip}
        >
          {paymentInfo.icon} {paymentInfo.text}
        </span>,
        new Date(member.created_at).toLocaleDateString('nl-NL'),
        member.last_login ? new Date(member.last_login).toLocaleDateString('nl-NL') : 'Niet beschikbaar'
      ];
    });
  }, [currentMembers]);

  const tableHeaders = ['Lid', 'Email', 'Type', 'Rang', 'Status', 'Punten', 'Missies', 'Pakket', 'Betalingsstatus', 'Lid sinds', 'Laatste activiteit'];

  const renderActions = (item: any) => {
    // Find member by email (item[1] is the email)
    const member = currentMembers.find(m => m.email === item[1]);
    if (!member) return null;

    return (
      <div className="flex gap-2">
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEditMember(member)}
          icon={<EyeIcon className="w-4 h-4" />}
        >
          Bekijken
        </AdminButton>
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEditMember(member)}
          icon={<PencilIcon className="w-4 h-4" />}
        >
          Bewerken
        </AdminButton>
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handlePasswordReset(member.email)}
          icon={<KeyIcon className="w-4 h-4" />}
        >
          🔐 Reset
        </AdminButton>
        <AdminButton
          variant="primary"
          size="sm"
          onClick={() => handleLoginAsUser(member)}
          icon={<UserIcon className="w-4 h-4" />}
          loading={impersonationLoading}
        >
          🔑 Login als
        </AdminButton>
        <AdminButton
          variant="danger"
          size="sm"
          onClick={async () => {
            if (confirm(`⚠️ VOLLEDIGE RESET: Weet je zeker dat je gebruiker ${member.full_name || member.email} volledig wilt resetten?`)) {
              try {
                const response = await fetch('/api/admin/reset-onboarding', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: member.id }),
                });
                if (response.ok) {
                  toast.success('✅ Gebruiker volledig gereset!');
                  fetchMembers();
                } else {
                  toast.error('Fout bij resetten');
                }
              } catch (error) {
                toast.error('Fout bij resetten');
              }
            }
          }}
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
        >
          Reset
        </AdminButton>
        <AdminButton
          variant="danger"
          size="sm"
          onClick={() => openDeleteModal(member)}
          icon={<NoSymbolIcon className="w-4 h-4" />}
        >
          Verwijder
        </AdminButton>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A]">Ledenbeheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle leden van het Top Tier Men platform</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className="text-[#8BAE5A] font-semibold text-sm sm:text-base">
            {filteredMembers.length} van {allMembers.length} leden
          </span>
          {loadingMembers && (
            <span className="text-[#B6C948] text-sm">Laden...</span>
          )}
          <div className="flex gap-2 sm:gap-4">
            <AdminButton 
              variant="secondary" 
              icon={<ArrowPathIcon className="w-4 h-5 sm:w-5 sm:h-5" />}
              onClick={fetchMembers}
              loading={loadingMembers}
            >
              Verversen
            </AdminButton>
            <AdminButton 
              variant="secondary" 
              icon={<EnvelopeIcon className="w-4 h-5 sm:w-5 sm:h-5" />}
              onClick={sendAccountCredentials}
            >
              <span className="hidden sm:inline">📧 Verstuur Accountgegevens</span>
              <span className="sm:hidden">📧 Email</span>
            </AdminButton>
            <AdminButton 
              variant="success" 
              icon={<KeyIcon className="w-4 h-5 sm:w-5 sm:h-5" />}
              onClick={createUsersWithPasswords}
            >
              <span className="hidden sm:inline">🔐 Maak Accounts + Wachtwoorden</span>
              <span className="sm:hidden">🔐 Accounts</span>
            </AdminButton>
            <AdminButton 
              variant="primary" 
              icon={<UserPlusIcon className="w-4 h-5 sm:w-5 sm:h-5" />}
              onClick={() => setShowAddUserModal(true)}
            >
              <span className="hidden sm:inline">Nieuwe Gebruiker Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Impersonation Banner */}
      {isImpersonating && targetUser && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg border border-orange-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🔑</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Admin Impersonation Actief</h3>
                <p className="text-sm opacity-90">
                  Je bent ingelogd als: <span className="font-semibold">{targetUser.email}</span>
                </p>
              </div>
            </div>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={endImpersonation}
              loading={impersonationLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Terug naar Admin
            </AdminButton>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard
          title="Totaal aantal leden"
          value={totalMembers}
          icon={<UserGroupIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Nieuwe leden deze maand"
          value={newMembersThisMonth}
          icon={<UserPlusIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="Actieve leden"
          value={activeMembers}
          icon={<ShieldCheckIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Elite leden"
          value={eliteMembers}
          icon={<TrophyIcon className="w-8 h-8" />}
          color="purple"
        />
        <AdminStatsCard
          title="Leden met badges"
          value={membersWithBadges}
          icon={<StarIcon className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Search and Filters */}
      <AdminCard title="Filters & Zoeken" icon={<FunnelIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
            />
          </div>

          {/* Rank Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Rangen', ...ranks].map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Statussen', ...statuses].map(status => (
                <option key={status} value={status}>
                  {status === 'Alle Statussen' ? 'Alle Statussen' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>

          {/* User Type Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Types', ...userTypes].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Package Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Pakketten', ...packages].map(pkg => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <AdminButton variant="primary" icon={<DocumentTextIcon className="w-5 h-5" />}>
            Export CSV
          </AdminButton>
        </div>
      </AdminCard>

      {/* Members Table */}
      <AdminCard title="Leden Overzicht" icon={<UserGroupIcon className="w-6 h-6" />}>
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          loading={loadingMembers}
          emptyMessage="Geen leden gevonden"
          actions={renderActions}
        />
      </AdminCard>

      {/* Pagination */}
      {allMembers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-[#B6C948] text-sm">
            Toon {filteredMembers.length} van {allMembers.length} leden
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Vorige
            </AdminButton>
            <span className="px-4 py-2 text-[#8BAE5A] font-semibold">
              {currentPage} van {totalPages}
            </span>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Volgende
            </AdminButton>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">
                  Bewerk Profiel: {editingMember.full_name}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Profielgegevens
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'account'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Account & Rechten
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Activiteit & Notities
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Tab 1: Profielgegevens */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Photo Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profielfoto
                    </label>
                    <div className="flex items-center gap-4">
                      {editingMember.avatar_url ? (
                        <img 
                          src={editingMember.avatar_url} 
                          alt={editingMember.full_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#8BAE5A]/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center ${editingMember.avatar_url ? 'hidden' : ''}`}>
                        <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#B6C948] text-sm">
                          {editingMember.avatar_url ? 'Profielfoto geüpload' : 'Geen profielfoto'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {editingMember.avatar_url ? 'Foto wordt automatisch geladen van het profiel' : 'Gebruiker heeft nog geen profielfoto geüpload'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Volledige Naam
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio / Motto
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Admin Actie: Hier kun je ongepaste taal corrigeren of de opmaak verbeteren."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      #1 Hoofddoel
                    </label>
                    <input
                      type="text"
                      value={formData.mainGoal}
                      onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Account & Rechten */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      value={editingMember.email}
                      disabled
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dit veld is read-only om problemen te voorkomen.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rang
                    </label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      {ranks.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Hier kun je een gebruiker handmatig promoveren als beloning voor uitzonderlijke bijdragen.</p>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pakket Type
                    </label>
                    <select
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="">Geen pakket</option>
                      <option value="Basic Tier">Basic Tier</option>
                      <option value="Premium Tier">Premium Tier</option>
                      <option value="Lifetime Tier">Lifetime Tier</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Wijzig het pakket type om toegang tot features te beheren. Basic Tier heeft geen toegang tot trainingsschemas en voedingsplannen.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {getStatusText(status)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Deactiveer een account volledig als dat nodig is.</p>
                  </div>

                  <div className="pt-4 border-t border-[#3A4D23] space-y-3">
                    <AdminButton
                      variant="secondary"
                      onClick={() => handlePasswordReset(editingMember?.email)}
                      icon={<KeyIcon className="w-4 h-4" />}
                    >
                      Verstuur Wachtwoord Reset E-mail
                    </AdminButton>

                    <AdminButton
                      variant="primary"
                      onClick={() => handleLoginAsUser(editingMember)}
                      icon={<UserIcon className="w-4 h-4" />}
                      loading={impersonationLoading}
                    >
                      🔑 Login als deze gebruiker
                    </AdminButton>
                    
                    <AdminButton
                      variant="danger"
                      onClick={handleOnboardingReset}
                      disabled={isLoading}
                      loading={isLoading}
                      icon={<ExclamationTriangleIcon className="w-4 h-4" />}
                    >
                      VOLLEDIGE RESET
                    </AdminButton>
                    <p className="text-xs text-red-400">
                      ⚠️ Dit wist ALLE data: missies, training, voeding, challenges, XP, badges, voortgang, etc. Gebruiker start vanaf stap 0.
                    </p>
                    
                    <AdminButton
                      variant="danger"
                      onClick={() => {
                        setShowEditModal(false);
                        openDeleteModal(editingMember);
                      }}
                      disabled={isLoading}
                      icon={<NoSymbolIcon className="w-4 h-4" />}
                    >
                      PERMANENT VERWIJDEREN
                    </AdminButton>
                    <p className="text-xs text-red-400">
                      ⚠️ Dit verwijdert de gebruiker PERMANENT uit het systeem. Deze actie kan NIET ongedaan worden gemaakt.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Activiteit & Notities */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Recente Activiteit</h3>
                    <div className="space-y-3">
                      {editingMember.recent_activity && editingMember.recent_activity.length > 0 ? (
                        editingMember.recent_activity.map((activity: any, index: number) => {
                          const ActivityIcon = getActivityIcon(activity.type);
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                              <ActivityIcon className="w-5 h-5 text-[#8BAE5A]" />
                              <div className="flex-1">
                                <p className="text-white text-sm">{activity.description}</p>
                                <p className="text-[#B6C948] text-xs">
                                  {new Date(activity.created_at).toLocaleString('nl-NL')}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-[#181F17] rounded-lg text-center">
                          <ClockIcon className="w-8 h-8 text-[#8BAE5A]/50 mx-auto mb-2" />
                          <p className="text-[#B6C948] text-sm">Geen recente activiteit</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Notities
                    </label>
                    <textarea
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      rows={4}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Cruciale Functie: Hier kunnen admins interne notities over een gebruiker achterlaten die alleen voor andere admins zichtbaar zijn."
                    />
                    <p className="text-xs text-gray-500 mt-1">Voorbeeld: "Heeft op 15-06-2025 een waarschuwing ontvangen voor spam op het forum." of "Zeer waardevol lid, kandidaat voor 'Lid van de Maand'."</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
                loading={isLoading}
                icon={<CheckIcon className="w-4 h-4" />}
              >
                Opslaan
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-red-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-red-500">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <NoSymbolIcon className="w-6 h-6" />
                  Gebruiker Permanent Verwijderen
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                    setDeleteConfirmation('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Warning Box */}
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-2">⚠️ WAARSCHUWING: Onomkeerbare Actie</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Je staat op het punt om <strong>{userToDelete.full_name || userToDelete.email}</strong> permanent te verwijderen uit het Top Tier Men platform.
                    </p>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p><strong>Dit zal alle volgende data PERMANENT verwijderen:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Gebruikersaccount en authenticatie</li>
                        <li>Alle profielgegevens</li>
                        <li>Training schemas en voortgang</li>
                        <li>Voedingsplannen en voortgang</li>
                        <li>Missies en achievements</li>
                        <li>Forum posts en reacties</li>
                        <li>XP punten en badges</li>
                        <li>Onboarding voortgang</li>
                        <li>Alle gebruikersstatistieken</li>
                        <li>Betaling gegevens en abonnementen</li>
                        <li>Alle gerelateerde database records</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bevestiging Vereist
                </label>
                <p className="text-gray-400 text-sm mb-3">
                  Type <strong className="text-red-400">VERWIJDER</strong> in het onderstaande veld om deze actie te bevestigen:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full bg-[#181F17] border border-red-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Type VERWIJDER om te bevestigen"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dit veld is hoofdlettergevoelig en moet exact "VERWIJDER" bevatten.
                </p>
              </div>

              {/* User Info */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-[#8BAE5A] font-medium mb-2">Gebruiker Informatie</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Naam:</span>
                    <span className="text-white ml-2">{userToDelete.full_name || 'Onbekend'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{userToDelete.email || 'Onbekend'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rang:</span>
                    <span className="text-white ml-2">{userToDelete.rank || 'Onbekend'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2">{getStatusText(userToDelete.status) || 'Onbekend'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-red-500 flex justify-between">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setDeleteConfirmation('');
                }}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={handleDeleteUser}
                disabled={deletingUser || deleteConfirmation !== 'VERWIJDER'}
                loading={deletingUser}
                icon={<NoSymbolIcon className="w-4 h-4" />}
              >
                {deleteConfirmation === 'VERWIJDER' ? 'PERMANENT VERWIJDEREN' : 'Type VERWIJDER om te bevestigen'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">
                  Nieuwe Gebruiker Toevoegen
                </h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mailadres *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="gebruiker@voorbeeld.nl"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Volledige Naam *
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Jan Jansen"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="@jan_jansen"
                />
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rang
                </label>
                <select
                  value={newUserData.rank}
                  onChange={(e) => setNewUserData({ ...newUserData, rank: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newUserData.status}
                  onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pakket Type
                </label>
                <select
                  value={newUserData.package_type}
                  onChange={(e) => setNewUserData({ ...newUserData, package_type: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {packages.map(packageType => (
                    <option key={packageType} value={packageType}>
                      {packageType}
                    </option>
                  ))}
                </select>
              </div>


              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wachtwoord (optioneel)
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Laat leeg voor automatisch wachtwoord"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Als je dit veld leeg laat, wordt automatisch een veilig tijdelijk wachtwoord gegenereerd en verzonden via email.
                </p>
              </div>

              {/* Confirm Password - only show if password is provided */}
              {newUserData.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bevestig Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={newUserData.confirmPassword}
                    onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                    className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    placeholder="Herhaal wachtwoord"
                  />
                </div>
              )}

              {/* Info Box */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-[#8BAE5A] mt-0.5">
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[#8BAE5A] font-medium mb-2">Wat gebeurt er na aanmaken?</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Gebruiker ontvangt automatisch een email met accountgegevens</li>
                      <li>• Tijdelijk wachtwoord wordt gegenereerd (als niet opgegeven)</li>
                      <li>• Account wordt automatisch geactiveerd</li>
                      <li>• Gebruiker start met onboarding stap 0</li>
                      <li>• Alle basis profielgegevens worden ingesteld</li>
                      <li>• Gebruiker kan direct inloggen met de ontvangen gegevens</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleAddNewUser}
                disabled={addingUser}
                loading={addingUser}
                icon={<UserPlusIcon className="w-4 h-4" />}
              >
                Gebruiker Aanmaken
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Reset Logs Popup */}
      {console.log('🔍 Popup render check - showResetLogs:', showResetLogs)}
      {showResetLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  🔄 Onboarding Reset - Live Logs
                </h3>
                <button
                  onClick={() => setShowResetLogs(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isResetting}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Resetting onboarding for: {editingMember?.email}
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {resetLogs.length === 0 ? (
                  <div className="text-gray-500 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#8BAE5A] border-t-transparent rounded-full"></div>
                    Starting reset process...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {resetLogs.map((log, index) => (
                      <div key={index} className={`flex items-start gap-2 ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-gray-300'
                      }`}>
                        <span className="text-gray-500 text-xs mt-0.5 min-w-[60px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                    {isResetting && (
                      <div className="text-gray-500 flex items-center gap-2 mt-2">
                        <div className="animate-spin w-4 h-4 border-2 border-[#8BAE5A] border-t-transparent rounded-full"></div>
                        Processing...
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowResetLogs(false)}
                  className="px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors"
                  disabled={isResetting}
                >
                  {isResetting ? 'Processing...' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 