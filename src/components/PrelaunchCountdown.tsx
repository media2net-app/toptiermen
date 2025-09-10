'use client';

import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';

interface PrelaunchCountdownProps {
  endDate?: Date;
  className?: string;
}

export default function PrelaunchCountdown({ 
  endDate = (() => {
    const today = new Date();
    today.setHours(20, 0, 0, 0); // Set to 20:00 today
    return today;
  })(),
  className = ''
}: PrelaunchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className={`inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium ${className}`}>
        <FaClock className="w-4 h-4 mr-2" />
        Platform is live! 🚀
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full text-white text-sm font-medium ${className}`}>
      <FaClock className="w-4 h-4 mr-2 text-red-400" />
      <span className="text-red-400 mr-2">⚡</span>
      <span className="text-white">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours > 0 && `${timeLeft.hours}u `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
        {timeLeft.seconds}s
      </span>
      <span className="text-red-400 ml-2">tot 20:00</span>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactCountdown({ 
  endDate = (() => {
    const today = new Date();
    today.setHours(20, 0, 0, 0); // Set to 20:00 today
    return today;
  })(),
  className = ''
}: PrelaunchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className={`inline-flex items-center px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-xs font-medium ${className}`}>
        <FaClock className="w-3 h-3 mr-1" />
        Live! 🚀
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded text-white text-xs font-medium ${className}`}>
      <FaClock className="w-3 h-3 mr-1 text-red-400" />
      <span className="text-red-400 mr-1">⚡</span>
      <span className="text-white">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours > 0 && `${timeLeft.hours}u `}
        {timeLeft.minutes > 0 && `${timeLeft.minutes}m`}
        {timeLeft.days === 0 && timeLeft.hours === 0 && `${timeLeft.seconds}s`}
      </span>
    </div>
  );
}
