'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  username: string;
  role: 'user' | 'admin';
  label: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

const users = [
  { label: 'Rick', value: 'rick', password: 'demo', role: 'user' as const },
  { label: 'Admin', value: 'admin', password: 'admin123', role: 'admin' as const },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    const userLabel = localStorage.getItem('userLabel');
    
    if (isLoggedIn === 'true' && username && userRole && userLabel) {
      setUser({
        id: username,
        username,
        role: userRole as 'user' | 'admin',
        label: userLabel,
      });
    }
    
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const user = users.find(u => u.value === username && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Set authentication state
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('username', user.value);
      localStorage.setItem('userLabel', user.label);

      setUser({
        id: user.value,
        username: user.value,
        role: user.role,
        label: user.label,
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // TODO: Implement when Supabase is configured
      console.log('Sign up:', email, password, fullName);
      // const { error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: {
      //       full_name: fullName,
      //     },
      //   },
      // });
      // if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear authentication state
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('userLabel');
      
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 