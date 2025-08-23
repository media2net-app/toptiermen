"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const launchDate = new Date('2025-09-10T00:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // Launch date has passed, redirect to normal registration
        router.push('/register-original');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
      <div className="w-full max-w-4xl p-10 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg text-center">
        {/* Countdown Timer */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
            Platform Launch <span className="text-[#8BAE5A]">10 September</span>
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
              <div className="text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.days}</div>
              <div className="text-sm text-[#8BAE5A] uppercase tracking-wide">Dagen</div>
            </div>
            <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
              <div className="text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.hours}</div>
              <div className="text-sm text-[#8BAE5A] uppercase tracking-wide">Uren</div>
            </div>
            <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
              <div className="text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.minutes}</div>
              <div className="text-sm text-[#8BAE5A] uppercase tracking-wide">Minuten</div>
            </div>
            <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
              <div className="text-3xl md:text-4xl font-bold text-[#B6C948]">{timeLeft.seconds}</div>
              <div className="text-sm text-[#8BAE5A] uppercase tracking-wide">Seconden</div>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#B6C948] mb-4">
            🚀 Top Tier Men Platform Launch
          </h2>
          <p className="text-lg md:text-xl text-white mb-6 leading-relaxed">
            Het Top Tier Men platform wordt gelanceerd op <strong>10 september 2025</strong>. 
            Een complete transformatie voor mannen die klaar zijn om het beste uit zichzelf te halen.
            Meld je aan voor de prelaunch en krijg als eerste toegang tot het platform.
          </p>
          
          <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23] mb-6">
            <h3 className="text-xl font-bold text-[#B6C948] mb-3">🏆 Wat biedt het Top Tier Platform:</h3>
            <ul className="text-white space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Complete fitness & kracht training programma's
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Voeding & supplement advies op maat
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Mindset & discipline coaching
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Leiderschap & persoonlijke ontwikkeling
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Exclusieve Brotherhood community
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Live sessies & masterclasses
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Persoonlijke coaching & support
              </li>
              <li className="flex items-center">
                <span className="text-[#B6C948] mr-2">✓</span>
                Progressie tracking & analytics
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/prelaunch"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-bold text-lg shadow-lg hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 border border-[#B6C948] uppercase tracking-wide"
          >
            Meld je aan voor Prelaunch
          </Link>
          
          <div className="pt-4">
            <Link 
              href="/"
              className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors duration-200 underline"
            >
              ← Terug naar Homepage
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-[#3A4D23]">
          <p className="text-sm text-[#8BAE5A]">
            Heb je vragen? Neem contact op via{' '}
            <a href="mailto:info@toptiermen.eu" className="text-[#B6C948] hover:underline">
              info@toptiermen.eu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 