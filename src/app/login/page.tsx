'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading, signIn } = useSupabaseAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (!mounted || loading) return;
    
    if (user) {
      console.log('User already authenticated:', user.role);
      
      // Check for redirect parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get('redirect');
      
      let targetPath: string;
      if (redirectPath && redirectPath.startsWith('/dashboard-admin')) {
        // If redirecting to admin page, verify user is admin
        if (user.role?.toLowerCase() === 'admin') {
          targetPath = redirectPath;
        } else {
          targetPath = '/dashboard';
        }
      } else if (redirectPath && redirectPath.startsWith('/dashboard')) {
        // If redirecting to regular dashboard
        targetPath = redirectPath;
      } else {
        // Default redirect based on user role
        targetPath = user.role?.toLowerCase() === 'admin' ? '/dashboard-admin' : '/dashboard';
      }

      console.log('Redirecting to:', targetPath);
      router.replace(targetPath);
    }
  }, [mounted, loading, user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Vul alle velden in");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Ongeldige inloggegevens");
        setIsLoading(false);
        return;
      }

      console.log('Login successful');
      // The redirect will be handled by the useEffect above
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Er is een fout opgetreden bij het inloggen");
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setResetMessage("Vul je e-mailadres in");
      return;
    }
    
    setIsSendingReset(true);
    setResetMessage("");
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetMessage("Wachtwoord reset e-mail verzonden! Controleer je inbox.");
        setForgotPasswordEmail("");
      } else {
        setResetMessage(data.error || "Er is een fout opgetreden");
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setResetMessage("Er is een fout opgetreden bij het verzenden van de reset e-mail");
    } finally {
      setIsSendingReset(false);
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232D1A] to-[#1A2315]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232D1A] to-[#1A2315]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-white text-lg">Bezig met laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232D1A] to-[#1A2315] p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Top Tier Men</h2>
          <p className="text-gray-300">Log in op je account</p>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#1A2315] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                  placeholder="jouw@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#1A2315] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#8BAE5A] hover:text-[#7A9D4A] transition-colors"
              >
                Wachtwoord vergeten?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#232D1A] bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] hover:from-[#7A9D4A] hover:to-[#e0903f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#232D1A] mr-2"></div>
                  Inloggen...
                </div>
              ) : (
                'Inloggen'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#1A2315] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                  placeholder="jouw@email.com"
                />
              </div>
            </div>

            {resetMessage && (
              <div className={`border rounded-lg p-3 ${
                resetMessage.includes('verzonden') 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <p className={`text-sm ${
                  resetMessage.includes('verzonden') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {resetMessage}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-3 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A] transition-all duration-200"
              >
                Terug
              </button>
              <button
                type="submit"
                disabled={isSendingReset}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#232D1A] bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] hover:from-[#7A9D4A] hover:to-[#e0903f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8BAE5A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSendingReset ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#232D1A] mr-2"></div>
                    Verzenden...
                  </div>
                ) : (
                  'Reset Wachtwoord'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 