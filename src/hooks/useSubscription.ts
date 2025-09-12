import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SubscriptionData {
  subscription_tier: string;
  subscription_status: string;
  billing_period: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  isLifetime: boolean;
  isBasic: boolean;
  isAdmin: boolean;
  hasAccess: (feature: 'nutrition' | 'training') => boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, isAdmin } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Check if we have cached subscription data for this user
    const cacheKey = `subscription_${user.id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        console.log('🚀 Using cached subscription data:', parsed);
        setSubscription(parsed);
        setLoading(false);
        return;
      } catch (e) {
        console.log('⚠️ Invalid cached data, fetching fresh data');
        sessionStorage.removeItem(cacheKey);
      }
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get subscription data directly from profiles table using subscription_tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile subscription:', profileError);
          setError('Failed to fetch subscription data');
          return;
        }

        // Use subscription_tier directly
        const tier = profile.subscription_tier || 'basic';

        console.log('🔍 Subscription data loaded:', {
          subscription_tier: profile.subscription_tier,
          subscription_status: profile.subscription_status,
          tier,
          role: profile.role
        });

        const subscriptionData = {
          subscription_tier: tier,
          subscription_status: 'active', // Default to active for all users
          billing_period: 'monthly',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active' // Default to active
        };

        setSubscription(subscriptionData);
        
        // Cache the subscription data for 5 minutes
        sessionStorage.setItem(cacheKey, JSON.stringify(subscriptionData));
        
      } catch (err) {
        console.error('Subscription fetch error:', err);
        setError('Failed to fetch subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Computed properties
  const isPremium = subscription?.subscription_tier === 'premium' || subscription?.subscription_tier === 'premium-tier';
  const isLifetime = subscription?.subscription_tier === 'lifetime' || subscription?.subscription_tier === 'lifetime-tier';
  const isBasic = subscription?.subscription_tier === 'basic' || subscription?.subscription_tier === 'basic-tier';

  // Access control function
  const hasAccess = (feature: 'nutrition' | 'training'): boolean => {
    // Admins always have access
    if (isAdmin) return true;
    
    // Premium and Lifetime users have access to nutrition and training
    if (isPremium || isLifetime) return true;
    
    // Basic users don't have access to nutrition and training
    if (isBasic) return false;
    
    // Default: no access for unknown tiers
    return false;
  };

  return {
    subscription,
    loading,
    error,
    isPremium,
    isLifetime,
    isBasic,
    isAdmin,
    hasAccess
  };
}
