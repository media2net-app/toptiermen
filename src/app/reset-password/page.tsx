'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from '@supabase/supabase-js';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Check if we have the necessary URL parameters for password reset
    const accessToken = searchParams?.get('access_token');
    const refreshToken = searchParams?.get('refresh_token');
    const type = searchParams?.get('type');
    
    console.log('🔍 Reset password URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
    
    if (accessToken && refreshToken && type === 'recovery') {
      // We have valid reset tokens, set up the session
      const setupSession = async () => {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Error setting session:', error);
            setError('Ongeldige of verlopen reset link. Vraag een nieuwe aan.');
            setIsValidToken(false);
          } else {
            console.log('✅ Session set successfully');
            setIsValidToken(true);
          }
        } catch (error) {
          console.error('❌ Error in setupSession:', error);
          setError('Er is een fout opgetreden bij het verwerken van de reset link.');
          setIsValidToken(false);
        } finally {
          setIsCheckingToken(false);
        }
      };
      
      setupSession();
    } else {
      // No valid tokens found
      console.log('❌ No valid reset tokens found in URL');
      setError('Ongeldige reset link. Vraag een nieuwe wachtwoord reset aan.');
      setIsValidToken(false);
      setIsCheckingToken(false);
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');

    // Check if we have a valid token
    if (!isValidToken) {
      setError('Ongeldige reset link. Vraag een nieuwe wachtwoord reset aan.');
      return;
    }

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setError('Alle velden zijn verplicht');
      return;
    }

    if (newPassword.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters lang zijn');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        setError('Fout bij het wijzigen van wachtwoord. Probeer het opnieuw.');
        return;
      }

      // Success
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (!mounted || isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Reset link wordt gecontroleerd...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 92.0.1 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ongeldige Reset Link</h3>
            <p className="text-[#8BAE5A] text-sm mb-6">
              {error || 'Deze reset link is ongeldig of verlopen. Vraag een nieuwe wachtwoord reset aan.'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors"
            >
              Terug naar Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wachtwoord Succesvol Gewijzigd!</h3>
            <p className="text-[#8BAE5A] text-sm mb-6">
              Je wachtwoord is succesvol gewijzigd. Je wordt automatisch doorgestuurd naar de login pagina.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-sm">Doorsturen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
      <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
      
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo_white-full.svg" 
            alt="Top Tier Men Logo" 
            className="h-16 sm:h-20 md:h-24 w-auto"
          />
        </div>
        <p className="text-[#B6C948] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Nieuw Wachtwoord Instellen</p>
        
        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="Nieuw wachtwoord"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="Bevestig nieuw wachtwoord"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6C948] hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {error && (
            <div className="text-[#B6C948] text-center text-sm border border-[#B6C948] rounded-lg py-2 px-3 bg-[#181F17] font-figtree">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className={`w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree ${(isLoading || !newPassword || !confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
                <span>Wachtwoord Wijzigen...</span>
              </div>
            ) : (
              "Wachtwoord Wijzigen"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-[#B6C948] text-sm font-figtree">
            <a href="/login" className="text-[#8BAE5A] hover:text-white transition-colors font-semibold">
              Terug naar login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
        <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#B6C948] text-lg">Laden...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
