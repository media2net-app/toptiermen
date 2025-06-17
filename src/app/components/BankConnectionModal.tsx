'use client';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const banks = [
  {
    id: 'rabobank',
    name: 'Rabobank',
    logo: '/images/banks/rabobank.svg',
    color: '#D52B1E',
    features: ['Directe transacties', 'Automatische categorisatie', 'Realtime updates'],
    api: 'Rabobank API',
  },
  {
    id: 'ing',
    name: 'ING',
    logo: '/images/banks/ing.svg',
    color: '#FF6200',
    features: ['Directe transacties', 'Automatische categorisatie', 'Realtime updates'],
    api: 'ING Connect API',
  },
  {
    id: 'abnamro',
    name: 'ABN AMRO',
    logo: '/images/banks/abnamro.svg',
    color: '#EC0016',
    features: ['Directe transacties', 'Automatische categorisatie', 'Realtime updates'],
    api: 'ABN AMRO API',
  },
  {
    id: 'sns',
    name: 'SNS Bank',
    logo: '/images/banks/sns.svg',
    color: '#00A6D6',
    features: ['Directe transacties', 'Automatische categorisatie', 'Realtime updates'],
    api: 'SNS API',
  },
  {
    id: 'bunq',
    name: 'Bunq',
    logo: '/images/banks/bunq.svg',
    color: '#39B54A',
    features: ['Directe transacties', 'Automatische categorisatie', 'Realtime updates'],
    api: 'Bunq API',
  },
];

interface BankConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBank: (bankId: string) => void;
}

export default function BankConnectionModal({ isOpen, onClose, onSelectBank }: BankConnectionModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-[#232D1A] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-[#3A4D23]">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-[#8BAE5A] hover:text-white focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Sluiten</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white mb-2">
                      Kies je bank
                    </Dialog.Title>
                    <p className="text-[#8BAE5A] text-sm mb-6">
                      Selecteer je bank om automatisch je transacties te synchroniseren
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => onSelectBank(bank.id)}
                          className="flex flex-col p-4 rounded-xl bg-[#1B2214] hover:bg-[#2A341F] transition-all border border-[#3A4D23] hover:border-[#8BAE5A] group"
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${bank.color}20` }}
                            >
                              <div className="relative w-8 h-8">
                                <Image
                                  src={bank.logo}
                                  alt={`${bank.name} logo`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-lg font-semibold text-white group-hover:text-[#8BAE5A] transition-colors">
                                {bank.name}
                              </span>
                              <p className="text-sm text-[#8BAE5A]/70">{bank.api}</p>
                            </div>
                            <CheckCircleIcon className="h-6 w-6 text-[#8BAE5A] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {bank.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#3A4D23]/30 text-[#8BAE5A]"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 