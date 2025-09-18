'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon, 
  StarIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export default function UpgradeRequiredModal({ isOpen, onClose, feature }: UpgradeRequiredModalProps) {
  if (!isOpen) return null;

  const premiumFeatures = [
    'Persoonlijke voedingsplannen',
    'Smart Scaling met AI-optimalisatie',
    'Macro tracking en analyse',
    'Onbeperkte toegang tot alle content',
    'Premium community features',
    'Prioriteit support'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#0A0F0A] border border-[#3A4D23] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#8BAE5A] to-[#6B8E4A] rounded-xl">
              <RocketLaunchIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upgrade naar Premium</h2>
              <p className="text-[#8BAE5A]">Ontgrendel {feature}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1F1A] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Premium Benefits */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <StarIcon className="h-6 w-6 text-[#8BAE5A] mr-2" />
              Premium Voordelen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-[#1A1F1A] rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-[#8BAE5A] flex-shrink-0" />
                  <span className="text-white text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-[#1A1F1A] to-[#2A2F2A] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Premium Tier</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-3xl font-bold text-[#8BAE5A]">€29</span>
              <span className="text-gray-400">/maand</span>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Volledige toegang tot alle premium features en content
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                // Redirect to upgrade page or payment
                window.open('/dashboard/upgrade', '_blank');
              }}
              className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#6B8E4A] text-white font-semibold py-4 px-6 rounded-xl hover:from-[#7A9E4A] hover:to-[#5B7E3A] transition-all duration-200 transform hover:scale-105"
            >
              Upgrade Nu
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#1A1F1A] text-gray-300 font-semibold py-4 px-6 rounded-xl hover:bg-[#2A2F2A] transition-colors"
            >
              Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Al premium? <span className="text-[#8BAE5A] cursor-pointer hover:underline">Log opnieuw in</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
