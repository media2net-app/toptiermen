import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentTextIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface PDFUploadProps {
  currentPDFUrl?: string;
  onPDFUploaded: (url: string | null) => void;
}

export default function PDFUpload({ currentPDFUrl, onPDFUploaded }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Alleen PDF bestanden zijn toegestaan');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Bestand is te groot. Maximum grootte is 10MB');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `workbooks/${fileName}`;
      const { data, error } = await supabase.storage
        .from('academy-werkbladen')
        .upload(filePath, file);
      if (error) throw error;
      if (data) {
        const { data: urlData } = supabase.storage
          .from('academy-werkbladen')
          .getPublicUrl(data.path);
        onPDFUploaded(urlData.publicUrl);
        setUploadProgress(100);
      }
    } catch (error: any) {
      alert(`Upload mislukt: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!currentPDFUrl) return;
    // Extract path from public URL
    const path = currentPDFUrl.split('/academy-werkbladen/')[1];
    if (!path) return;
    await supabase.storage.from('academy-werkbladen').remove([decodeURIComponent(path)]);
    onPDFUploaded(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all cursor-pointer">
        <CloudArrowUpIcon className="w-5 h-5" />
        {uploading ? 'Uploaden...' : 'Werkblad (PDF) toevoegen'}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-[#181F17] rounded-full h-2">
          <div 
            className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {/* Current PDF Display */}
      {currentPDFUrl && (
        <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23] flex items-center gap-3">
          <DocumentTextIcon className="w-6 h-6 text-[#8BAE5A]" />
          <div className="flex-1">
            <p className="text-[#8BAE5A] font-semibold">Werkblad geüpload</p>
            <a
              href={currentPDFUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              Bekijk PDF
            </a>
          </div>
          <button onClick={handleRemove} className="p-2 rounded hover:bg-[#232D1A] transition" title="Verwijder werkblad">
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
} 