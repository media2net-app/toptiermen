import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface NavigationOptions {
  timeout?: number;
  retryAttempts?: number;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
}

export class AcademyNavigationHelper {
  private static instance: AcademyNavigationHelper;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): AcademyNavigationHelper {
    if (!AcademyNavigationHelper.instance) {
      AcademyNavigationHelper.instance = new AcademyNavigationHelper();
    }
    return AcademyNavigationHelper.instance;
  }

  async navigateWithFeedback(
    router: AppRouterInstance,
    path: string,
    options: NavigationOptions = {}
  ): Promise<boolean> {
    const {
      timeout = 5000,
      retryAttempts = 1,
      onStart,
      onSuccess,
      onError,
      onTimeout
    } = options;

    const navigationId = `nav-${Date.now()}-${Math.random()}`;
    
    try {
      console.log(`🚀 Starting navigation to: ${path}`);
      onStart?.();

      // Clear any existing timeout for this navigation
      this.clearTimeout(navigationId);

      // Set navigation timeout
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Navigation timeout for: ${path}`);
        onTimeout?.();
        onError?.('Navigation timeout - pagina laden duurde te lang');
      }, timeout);

      this.timeouts.set(navigationId, timeoutId);

      // Perform the navigation
      router.push(path);

      // Wait for a short time to see if navigation starts
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear timeout on success
      this.clearTimeout(navigationId);
      
      console.log(`✅ Navigation initiated successfully to: ${path}`);
      onSuccess?.();
      
      return true;

    } catch (error) {
      console.error(`❌ Navigation error for ${path}:`, error);
      this.clearTimeout(navigationId);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown navigation error';
      onError?.(errorMessage);
      
      return false;
    }
  }

  private clearTimeout(navigationId: string): void {
    const timeoutId = this.timeouts.get(navigationId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(navigationId);
    }
  }

  // Preload route for faster navigation
  prefetchRoute(router: AppRouterInstance, path: string): void {
    try {
      router.prefetch(path);
      console.log(`📦 Prefetching route: ${path}`);
    } catch (error) {
      console.warn(`⚠️ Failed to prefetch route ${path}:`, error);
    }
  }

  // Clear all pending timeouts
  clearAllTimeouts(): void {
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }
}

// Export singleton instance
export const academyNav = AcademyNavigationHelper.getInstance();
