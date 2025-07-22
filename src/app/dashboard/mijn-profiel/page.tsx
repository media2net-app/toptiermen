'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { CameraIcon, TrashIcon, PlusIcon, UserGroupIcon, TrophyIcon, FireIcon, BookOpenIcon, ArrowDownTrayIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/solid';
import CropModal from '../../../components/CropModal';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { convertHeicToJpeg, isHeicFile } from '@/lib/heic-converter';

const tabs = [
  { key: 'publiek', label: 'Mijn Publieke Profiel' },
  { key: 'voortgang', label: 'Mijn Voortgang' },
  { key: 'instellingen', label: 'Account & Instellingen' },
  { key: 'notificaties', label: 'Notificaties' },
];

export default function MijnProfiel() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('publiek');
  
  // Upload states
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [cropAspect, setCropAspect] = useState(1); // 1 for avatar, 3 for cover
  const [uploadingType, setUploadingType] = useState<'avatar' | 'cover' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <div className="text-white">Gebruiker niet gevonden.</div>;
  }

  // Interesses als array tonen
  let interests: string[] = [];
  if (Array.isArray(user.interests)) {
    interests = user.interests as string[];
  } else if (typeof user.interests === 'string') {
    try {
      const parsed = JSON.parse(user.interests);
      if (Array.isArray(parsed)) interests = parsed;
    } catch {}
  }

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  };

  // Upload to Supabase Storage
  const uploadToSupabase = async (file: Blob, fileName: string, bucket: string): Promise<string> => {
    try {
      // First, try to upload to the bucket
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        
        // If bucket doesn't exist, create a fallback solution
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          throw new Error(`Bucket '${bucket}' bestaat niet. Maak eerst de bucket aan in Supabase Storage.`);
        }
        
        // If RLS policy issue, provide specific error
        if (error.message.includes('Unauthorized') || error.message.includes('row-level security')) {
          throw new Error('Geen toestemming om te uploaden. Controleer de RLS policies in Supabase.');
        }
        
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !isHeicFile(file)) {
      toast.error('Alleen afbeeldingen zijn toegestaan');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding is te groot. Maximum grootte is 5MB.');
      return;
    }

    try {
      // Convert HEIC to JPEG if needed
      const processedFile = await convertHeicToJpeg(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setCropAspect(type === 'avatar' ? 1 : 3);
        setUploadingType(type);
        setShowCropModal(true);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Er is een fout opgetreden bij het verwerken van de afbeelding');
    }
  };

  // Handle crop completion
  const handleCropComplete = async (croppedImage: string) => {
    setShowCropModal(false);
    setIsUploading(true);

    try {
      const blob = base64ToBlob(croppedImage);
      const fileName = `${uploadingType}-${user.id}-${Date.now()}.jpg`;
      const bucket = uploadingType === 'avatar' ? 'avatars' : 'covers';
      
      const publicUrl = await uploadToSupabase(blob, fileName, bucket);
      
      // Update user profile
      const updateData = uploadingType === 'avatar' 
        ? { avatar_url: publicUrl }
        : { cover_url: publicUrl };
      
      await updateUser(updateData);
      
      toast.success(`${uploadingType === 'avatar' ? 'Profielfoto' : 'Coverfoto'} succesvol bijgewerkt!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Er is een fout opgetreden bij het uploaden van de afbeelding');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
      setSelectedImage('');
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage('');
    setUploadingType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Profiel</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Beheer je profiel, voortgang en instellingen</p>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <button
          key="publiek"
          onClick={() => setActiveTab('publiek')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${activeTab === 'publiek' ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
        >
          Mijn Publieke Profiel
        </button>
        <button
          key="voortgang"
          onClick={() => setActiveTab('voortgang')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${activeTab === 'voortgang' ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
        >
          Mijn Voortgang
        </button>
        <button
          key="instellingen"
          onClick={() => setActiveTab('instellingen')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${activeTab === 'instellingen' ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
        >
          Account & Instellingen
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 md:p-10">
        {activeTab === 'publiek' && (
          <div className="flex flex-col items-center gap-6">
            {/* Coverfoto */}
            <div className="w-full h-40 md:h-56 rounded-2xl bg-gradient-to-r from-[#8BAE5A]/30 to-[#FFD700]/20 flex items-end justify-center overflow-hidden relative mb-8 group">
              {user.cover_url ? (
                <img src={user.cover_url} alt="Coverfoto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#8BAE5A]/60 text-2xl md:text-3xl font-bold p-4">Geen coverfoto</span>
              )}
              
              {/* Coverfoto upload button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-xl font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors">
                  <CameraIcon className="w-5 h-5" />
                  {user.cover_url ? 'Coverfoto wijzigen' : 'Coverfoto toevoegen'}
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileSelect(e, 'cover')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {/* Profielfoto */}
            <div className="w-28 h-28 rounded-full border-4 border-[#FFD700] bg-[#232D1A] flex items-center justify-center overflow-hidden shadow-lg relative -mt-20 mb-4 group">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profielfoto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#8BAE5A]/60 text-3xl">Geen foto</span>
              )}
              
              {/* Profielfoto upload button */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold cursor-pointer hover:bg-[#A6C97B] transition-colors text-sm">
                  <CameraIcon className="w-4 h-4" />
                  {user.avatar_url ? 'Wijzigen' : 'Toevoegen'}
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleFileSelect(e, 'avatar')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-white block mb-2">{user.full_name}</span>
              <span className="text-[#8BAE5A] text-sm block mb-2">{user.email}</span>
              {user.bio && <span className="text-[#8BAE5A] italic block mb-2">{user.bio}</span>}
              {user.location && <span className="text-[#8BAE5A] block mb-2">{user.location}</span>}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-[#8BAE5A]/20 text-[#8BAE5A] text-sm font-medium">{interest}</span>
                  ))}
                </div>
              )}
              <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white px-4 py-1 rounded-full text-sm font-semibold shadow mb-2">
                Rang: {user.rank || 'Beginner'}
              </span>
              {/* Data punten en missies voltooid verborgen - worden later op dashboard getoond */}
              {/* <div className="flex flex-col items-center gap-1 mt-2">
                <span className="text-[#8BAE5A]">Punten: {user.points ?? 0}</span>
                <span className="text-[#8BAE5A]">Missies voltooid: {user.missions_completed ?? 0}</span>
              </div> */}
            </div>
            
            {/* Upload progress indicator */}
            {isUploading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#232D1A] rounded-2xl p-6 flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
                  <p className="text-white font-semibold">
                    {uploadingType === 'avatar' ? 'Profielfoto' : 'Coverfoto'} wordt geüpload...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'voortgang' && (
          <div className="text-white">Voortgangsdata volgt...</div>
        )}
        
        {activeTab === 'instellingen' && (
          <div className="text-white">Instellingen volgen...</div>
        )}
      </div>
      
      {/* Crop Modal */}
      {showCropModal && selectedImage && (
        <CropModal
          image={selectedImage}
          aspect={cropAspect}
          onClose={handleCropCancel}
          onCrop={handleCropComplete}
        />
      )}
      
      {/* Hidden file input for ref */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </ClientLayout>
  );
} 