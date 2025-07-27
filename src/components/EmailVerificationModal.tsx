'use client';

import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function EmailVerificationModal({ 
  isOpen, 
  email, 
  onVerified, 
  onClose 
}: EmailVerificationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (isOpen) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email_confirmed_at) {
          setIsVerified(true);
          setTimeout(() => {
            onVerified();
          }, 2000);
        }
      }
    };
    
    checkEmailVerification();
  }, [isOpen, onVerified]);

  useEffect(() => {
    if (isOpen && !isVerified) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, isVerified]);

  const handleResendEmail = async () => {
    setIsChecking(true);
    try {
      // Here you would call the resend email API
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(30);
      setCanResend(false);
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      // Check if the email is verified using Supabase auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => {
          onVerified();
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Email Verificatie</h2>
          <button
            onClick={onClose}
            className="text-[#B6C948] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {!isVerified ? (
          <div className="text-center">
            <div className="mb-6">
              <EnvelopeIcon className="w-16 h-16 text-[#B6C948] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Controleer je email
              </h3>
              <p className="text-[#B6C948] mb-4">
                We hebben een verificatie link gestuurd naar:
              </p>
              <p className="text-white font-mono text-sm bg-[#181F17] p-2 rounded-lg border border-[#3A4D23]">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-semibold rounded-xl hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17] mr-2"></div>
                    Controleren...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Email Gecontroleerd
                  </div>
                )}
              </button>

              <div className="text-center">
                <p className="text-[#B6C948] text-sm mb-2">
                  Geen email ontvangen?
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={!canResend || isChecking}
                  className="text-[#B6C948] hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? 'Opnieuw versturen' : `Opnieuw versturen in ${countdown}s`}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-[#B6C948] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-[#B6C948] text-sm font-semibold mb-1">
                    Controleer je spam folder
                  </p>
                  <p className="text-[#8BAE5A] text-xs">
                    Soms belanden verificatie emails in je spam folder. Controleer daar ook even.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-[#B6C948] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Email Geverifieerd!
            </h3>
            <p className="text-[#B6C948] mb-4">
              Je email is succesvol geverifieerd. Je wordt nu doorgestuurd naar je dashboard.
            </p>
            <div className="flex items-center justify-center text-[#8BAE5A]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BAE5A] mr-2"></div>
              Doorsturen...
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 