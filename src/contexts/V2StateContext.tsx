'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';

// V2.0: Centralized State Management Types
interface V2AppState {
  // User state
  user: {
    profile: any | null;
    preferences: any | null;
    isLoaded: boolean;
  };
  
  // UI state
  ui: {
    theme: 'light' | 'dark' | 'auto';
    sidebarCollapsed: boolean;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timestamp: number;
      read: boolean;
    }>;
    modals: {
      [key: string]: boolean;
    };
    loading: {
      [key: string]: boolean;
    };
  };
  
  // Data state
  data: {
    cache: {
      [key: string]: {
        data: any;
        timestamp: number;
        ttl: number;
      };
    };
    lastSync: {
      [key: string]: number;
    };
  };
  
  // Error state
  errors: {
    global: string | null;
    components: {
      [key: string]: string | null;
    };
  };
  
  // Performance state
  performance: {
    pageLoadTimes: {
      [key: string]: number;
    };
    apiCallTimes: {
      [key: string]: number[];
    };
  };
}

// V2.0: Action types
type V2Action =
  // User actions
  | { type: 'SET_USER_PROFILE'; payload: any }
  | { type: 'SET_USER_PREFERENCES'; payload: any }
  | { type: 'CLEAR_USER_DATA' }
  
  // UI actions
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<V2AppState['ui']['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_MODAL_STATE'; payload: { key: string; isOpen: boolean } }
  | { type: 'SET_LOADING_STATE'; payload: { key: string; isLoading: boolean } }
  
  // Data actions
  | { type: 'SET_CACHE_DATA'; payload: { key: string; data: any; ttl?: number } }
  | { type: 'CLEAR_CACHE_DATA'; payload: string }
  | { type: 'CLEAR_ALL_CACHE' }
  | { type: 'SET_LAST_SYNC'; payload: { key: string; timestamp: number } }
  
  // Error actions
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null }
  | { type: 'SET_COMPONENT_ERROR'; payload: { key: string; error: string | null } }
  | { type: 'CLEAR_ALL_ERRORS' }
  
  // Performance actions
  | { type: 'RECORD_PAGE_LOAD_TIME'; payload: { page: string; time: number } }
  | { type: 'RECORD_API_CALL_TIME'; payload: { endpoint: string; time: number } }
  | { type: 'CLEAR_PERFORMANCE_DATA' };

// V2.0: Initial state
const initialState: V2AppState = {
  user: {
    profile: null,
    preferences: null,
    isLoaded: false,
  },
  ui: {
    theme: 'auto',
    sidebarCollapsed: false,
    notifications: [],
    modals: {},
    loading: {},
  },
  data: {
    cache: {},
    lastSync: {},
  },
  errors: {
    global: null,
    components: {},
  },
  performance: {
    pageLoadTimes: {},
    apiCallTimes: {},
  },
};

// V2.0: State reducer
function v2StateReducer(state: V2AppState, action: V2Action): V2AppState {
  switch (action.type) {
    // User actions
    case 'SET_USER_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          profile: action.payload,
          isLoaded: true,
        },
      };
      
    case 'SET_USER_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: action.payload,
        },
      };
      
    case 'CLEAR_USER_DATA':
      return {
        ...state,
        user: {
          profile: null,
          preferences: null,
          isLoaded: false,
        },
      };
      
    // UI actions
    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };
      
    case 'ADD_NOTIFICATION':
      const newNotification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        read: false,
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [newNotification, ...state.ui.notifications].slice(0, 10), // Keep max 10
        },
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          ),
        },
      };
      
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [],
        },
      };
      
    case 'SET_MODAL_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.payload.key]: action.payload.isOpen,
          },
        },
      };
      
    case 'SET_LOADING_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            [action.payload.key]: action.payload.isLoading,
          },
        },
      };
      
    // Data actions
    case 'SET_CACHE_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          cache: {
            ...state.data.cache,
            [action.payload.key]: {
              data: action.payload.data,
              timestamp: Date.now(),
              ttl: action.payload.ttl || 5 * 60 * 1000, // 5 minutes default
            },
          },
        },
      };
      
    case 'CLEAR_CACHE_DATA':
      const { [action.payload]: removed, ...remainingCache } = state.data.cache;
      return {
        ...state,
        data: {
          ...state.data,
          cache: remainingCache,
        },
      };
      
    case 'CLEAR_ALL_CACHE':
      return {
        ...state,
        data: {
          ...state.data,
          cache: {},
        },
      };
      
    case 'SET_LAST_SYNC':
      return {
        ...state,
        data: {
          ...state.data,
          lastSync: {
            ...state.data.lastSync,
            [action.payload.key]: action.payload.timestamp,
          },
        },
      };
      
    // Error actions
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          global: action.payload,
        },
      };
      
    case 'SET_COMPONENT_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          components: {
            ...state.errors.components,
            [action.payload.key]: action.payload.error,
          },
        },
      };
      
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {
          global: null,
          components: {},
        },
      };
      
    // Performance actions
    case 'RECORD_PAGE_LOAD_TIME':
      return {
        ...state,
        performance: {
          ...state.performance,
          pageLoadTimes: {
            ...state.performance.pageLoadTimes,
            [action.payload.page]: action.payload.time,
          },
        },
      };
      
    case 'RECORD_API_CALL_TIME':
      const existingTimes = state.performance.apiCallTimes[action.payload.endpoint] || [];
      return {
        ...state,
        performance: {
          ...state.performance,
          apiCallTimes: {
            ...state.performance.apiCallTimes,
            [action.payload.endpoint]: [...existingTimes, action.payload.time].slice(-10), // Keep last 10
          },
        },
      };
      
    case 'CLEAR_PERFORMANCE_DATA':
      return {
        ...state,
        performance: {
          pageLoadTimes: {},
          apiCallTimes: {},
        },
      };
      
    default:
      return state;
  }
}

// V2.0: Context interface
interface V2StateContextType {
  state: V2AppState;
  dispatch: React.Dispatch<V2Action>;
  
  // User actions
  setUserProfile: (profile: any) => void;
  setUserPreferences: (preferences: any) => void;
  clearUserData: () => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<V2AppState['ui']['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  setModalState: (key: string, isOpen: boolean) => void;
  setLoadingState: (key: string, isLoading: boolean) => void;
  
  // Data actions
  setCacheData: (key: string, data: any, ttl?: number) => void;
  getCacheData: (key: string) => any | null;
  clearCacheData: (key: string) => void;
  clearAllCache: () => void;
  setLastSync: (key: string) => void;
  needsSync: (key: string, maxAge?: number) => boolean;
  
  // Error actions
  setGlobalError: (error: string | null) => void;
  setComponentError: (key: string, error: string | null) => void;
  clearAllErrors: () => void;
  
  // Performance actions
  recordPageLoadTime: (page: string, time: number) => void;
  recordApiCallTime: (endpoint: string, time: number) => void;
  clearPerformanceData: () => void;
  
  // Utility actions
  isLoading: (key: string) => boolean;
  hasError: (key?: string) => boolean;
  getError: (key?: string) => string | null;
}

// V2.0: Create context
const V2StateContext = createContext<V2StateContextType | undefined>(undefined);

// V2.0: Provider component
interface V2StateProviderProps {
  children: ReactNode;
}

export function V2StateProvider({ children }: V2StateProviderProps) {
  const [state, dispatch] = useReducer(v2StateReducer, initialState);
  
  // V2.0: Load persisted state on mount
  useEffect(() => {
    try {
      const persisted = localStorage.getItem('v2-app-state');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        // Only restore safe state (not user data)
        if (parsed.ui?.theme) {
          dispatch({ type: 'SET_THEME', payload: parsed.ui.theme });
        }
        if (parsed.ui?.sidebarCollapsed !== undefined) {
          if (parsed.ui.sidebarCollapsed) {
            dispatch({ type: 'TOGGLE_SIDEBAR' });
          }
        }
      }
    } catch (error) {
      console.error('V2.0: Error loading persisted state:', error);
    }
  }, []);
  
  // V2.0: Persist state changes
  useEffect(() => {
    try {
      const toPersist = {
        ui: {
          theme: state.ui.theme,
          sidebarCollapsed: state.ui.sidebarCollapsed,
        },
      };
      localStorage.setItem('v2-app-state', JSON.stringify(toPersist));
    } catch (error) {
      console.error('V2.0: Error persisting state:', error);
    }
  }, [state.ui.theme, state.ui.sidebarCollapsed]);
  
  // V2.0: Clean up expired cache entries
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(state.data.cache).forEach(([key, entry]) => {
        if (now - entry.timestamp > entry.ttl) {
          dispatch({ type: 'CLEAR_CACHE_DATA', payload: key });
        }
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [state.data.cache]);
  
  // V2.0: Action creators
  const setUserProfile = useCallback((profile: any) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  }, []);
  
  const setUserPreferences = useCallback((preferences: any) => {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: preferences });
  }, []);
  
  const clearUserData = useCallback(() => {
    dispatch({ type: 'CLEAR_USER_DATA' });
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);
  
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  
  const addNotification = useCallback((notification: Omit<V2AppState['ui']['notifications'][0], 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);
  
  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);
  
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);
  
  const setModalState = useCallback((key: string, isOpen: boolean) => {
    dispatch({ type: 'SET_MODAL_STATE', payload: { key, isOpen } });
  }, []);
  
  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING_STATE', payload: { key, isLoading } });
  }, []);
  
  const setCacheData = useCallback((key: string, data: any, ttl?: number) => {
    dispatch({ type: 'SET_CACHE_DATA', payload: { key, data, ttl } });
  }, []);
  
  const getCacheData = useCallback((key: string) => {
    const entry = state.data.cache[key];
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      dispatch({ type: 'CLEAR_CACHE_DATA', payload: key });
      return null;
    }
    
    return entry.data;
  }, []); // Remove dependency to prevent infinite loops
  
  const clearCacheData = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_CACHE_DATA', payload: key });
  }, []);
  
  const clearAllCache = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_CACHE' });
  }, []);
  
  const setLastSync = useCallback((key: string) => {
    dispatch({ type: 'SET_LAST_SYNC', payload: { key, timestamp: Date.now() } });
  }, []);
  
  const needsSync = useCallback((key: string, maxAge: number = 5 * 60 * 1000) => {
    const lastSync = state.data.lastSync[key];
    if (!lastSync) return true;
    return Date.now() - lastSync > maxAge;
  }, []); // Remove dependency to prevent infinite loops
  
  const setGlobalError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);
  
  const setComponentError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_COMPONENT_ERROR', payload: { key, error } });
  }, []);
  
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);
  
  const recordPageLoadTime = useCallback((page: string, time: number) => {
    dispatch({ type: 'RECORD_PAGE_LOAD_TIME', payload: { page, time } });
  }, []);
  
  const recordApiCallTime = useCallback((endpoint: string, time: number) => {
    dispatch({ type: 'RECORD_API_CALL_TIME', payload: { endpoint, time } });
  }, []);
  
  const clearPerformanceData = useCallback(() => {
    dispatch({ type: 'CLEAR_PERFORMANCE_DATA' });
  }, []);
  
  // V2.0: Utility functions
  const isLoading = useCallback((key: string) => {
    return state.ui.loading[key] || false;
  }, []); // Remove dependency to prevent infinite loops
  
  const hasError = useCallback((key?: string) => {
    if (key) {
      return !!state.errors.components[key];
    }
    return !!state.errors.global;
  }, []); // Remove dependency to prevent infinite loops
  
  const getError = useCallback((key?: string) => {
    if (key) {
      return state.errors.components[key] || null;
    }
    return state.errors.global;
  }, []); // Remove dependency to prevent infinite loops
  
  const value: V2StateContextType = {
    state,
    dispatch,
    setUserProfile,
    setUserPreferences,
    clearUserData,
    setTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    markNotificationRead,
    clearAllNotifications,
    setModalState,
    setLoadingState,
    setCacheData,
    getCacheData,
    clearCacheData,
    clearAllCache,
    setLastSync,
    needsSync,
    setGlobalError,
    setComponentError,
    clearAllErrors,
    recordPageLoadTime,
    recordApiCallTime,
    clearPerformanceData,
    isLoading,
    hasError,
    getError,
  };
  
  return (
    <V2StateContext.Provider value={value}>
      {children}
    </V2StateContext.Provider>
  );
}

// V2.0: Hook to use the context
export function useV2State() {
  const context = useContext(V2StateContext);
  if (context === undefined) {
    throw new Error('useV2State must be used within a V2StateProvider');
  }
  return context;
}
