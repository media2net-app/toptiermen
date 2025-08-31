// V1.2: Simplified Cache Manager using Unified Cache Strategy
import { useEffect } from 'react';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import { unifiedCache } from '@/lib/unified-cache-strategy';

export function CacheManager() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('🔄 CacheManager: Initializing unified cache strategy for user:', user.email);

    // Initialize unified cache with user-specific configuration
    const initializeCache = async () => {
      try {
        // Clear any old cache on login
        await unifiedCache.invalidateByEvent('user-login');
        
        // Set up cache invalidation listeners
        const handleStorageChange = (event: StorageEvent) => {
          if (event.key?.includes('supabase.auth.token')) {
            console.log('🔄 CacheManager: Auth token changed, invalidating cache');
            unifiedCache.invalidateByEvent('user-logout');
          }
        };

        // Listen for storage changes (for multi-tab scenarios)
        window.addEventListener('storage', handleStorageChange);

        // Set up periodic cache health check
        const healthCheckInterval = setInterval(async () => {
          const stats = unifiedCache.getStats();
          const info = unifiedCache.getInfo();
          
          console.log('📊 CacheManager: Health check', {
            entries: stats.totalEntries,
            size: `${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
            hitRate: stats.hitRate,
            missRate: stats.missRate,
            errors: stats.errors
          });

          // Clear cache if too many errors
          if (stats.errors > 10) {
            console.warn('⚠️ CacheManager: Too many errors, clearing cache');
            await unifiedCache.clear();
          }
        }, 5 * 60 * 1000); // Every 5 minutes

        // Cleanup function
        return () => {
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(healthCheckInterval);
        };
      } catch (error) {
        console.error('❌ CacheManager: Initialization failed:', error);
      }
    };

    initializeCache();
  }, [user]);

  // This component doesn't render anything
  return null;
}
