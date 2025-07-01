'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { signIn, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/dashboard-admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await signIn(email, password);
      // The redirect will be handled by the useEffect above
    } catch (error: any) {
      setError(error.message || "Ongeldige inloggegevens");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
      <img src="/pattern.png" alt="pattern" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" />
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-center">
          <span className="text-white">TOP TIER </span>
          <span className="text-[#8BAE5A]">MEN</span>
        </h1>
        <p className="text-[#8BAE5A] text-center mb-6 sm:mb-8 text-base sm:text-lg font-figtree">Log in op je dashboard</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="E-mailadres"
              autoComplete="email"
              required
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-[#B6C948] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#B6C948] placeholder-[#B6C948] focus:outline-none focus:ring-2 focus:ring-[#B6C948] transition shadow-inner border border-[#3A4D23] font-figtree"
              placeholder="Wachtwoord"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="text-[#B6C948] text-center text-sm -mt-4 border border-[#B6C948] rounded-lg py-1 bg-[#181F17] font-figtree">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#3A4D23] text-[#181F17] font-semibold text-base sm:text-lg shadow-lg hover:from-[#B6C948] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] font-figtree disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Inloggen...' : 'Inloggen'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="w-full mt-2 py-3 sm:py-4 rounded-xl border border-[#B6C948] text-[#B6C948] font-semibold text-base sm:text-lg hover:bg-[#B6C948] hover:text-[#181F17] transition-all duration-200 font-figtree"
          >
            Nog geen account? Registreren
          </button>
        </form>
      </div>
    </div>
  );
} 