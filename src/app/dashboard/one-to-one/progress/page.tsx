'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';

export default function OneToOneProgressPage() {
  const { user, profile } = useSupabaseAuth();
  const [weekStart, setWeekStart] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [history, setHistory] = useState<{ progress: any[]; photos: any[] }>({ progress: [], photos: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  const Preview = ({ file }: { file: File | null }) => {
    if (!file) return (
      <div className="w-full aspect-[3/4] rounded-xl bg-[#181F17] border border-dashed border-[#3A4D23] flex items-center justify-center text-gray-500 text-xs">
        Geen foto gekozen
      </div>
    );
    const url = URL.createObjectURL(file);
    return (
      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-[#3A4D23]">
        <img src={url} alt="preview" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
      </div>
    );
  };

  const FilePickerCard = ({
    label,
    id,
    file,
    onChange,
    disabled
  }: {
    label: string;
    id: string;
    file: File | null;
    onChange: (f: File | null) => void;
    disabled?: boolean;
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm text-gray-300 mb-1">{label}</label>
        <Preview file={file} />
        <div className="flex items-center gap-2">
          <label
            htmlFor={id}
            className={`inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#8BAE5A] text-black text-sm font-semibold hover:bg-[#A6C97B] cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {file ? 'Vervang foto' : 'Kies bestand'}
          </label>
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-2 rounded-lg bg-[#232D1A] border border-[#3A4D23] text-gray-200 text-sm hover:bg-[#2B3820]"
            >
              Verwijder
            </button>
          )}
        </div>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          disabled={disabled}
        />
        {file && (
          <p className="text-xs text-gray-400 truncate">{file.name}</p>
        )}
      </div>
    );
  };

  // Default to Monday of current week
  useEffect(() => {
    if (!weekStart) {
      const d = new Date();
      const day = d.getDay(); // 0=Sun..6=Sat
      const diffToMonday = (day === 0 ? -6 : 1) - day; // move to Monday
      d.setDate(d.getDate() + diffToMonday);
      const iso = d.toISOString().slice(0, 10);
      setWeekStart(iso);
    }
  }, [weekStart]);

  const hasAnyPhoto = !!frontFile || !!sideFile || !!backFile;
  const disabled = !weekStart || saving || !hasAnyPhoto;

  const [showModal, setShowModal] = useState(false);
  const [modalLogs, setModalLogs] = useState<string[]>([]);
  const [modalDone, setModalDone] = useState(false);

  const appendLog = (msg: string) => setModalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      setShowModal(true);
      setModalLogs([]);
      setModalDone(false);
      appendLog('Start opslaan van progressie...');

      if (!hasAnyPhoto) {
        appendLog('Selecteer minimaal één foto (front/side/back).');
        throw new Error('Minimaal één foto is vereist');
      }

      // 1) Upsert metrics
      const upsertRes = await fetch('/api/one-to-one/progress/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          coach_id: (profile as any)?.coach_id || undefined,
          week_start: weekStart,
          weight_kg: weight ? Number(weight) : undefined,
          body_fat_percent: bodyFat ? Number(bodyFat) : undefined,
          notes: notes || undefined,
        })
      });
      const upsertJson = await upsertRes.json();
      if (!upsertRes.ok || !upsertJson?.success) throw new Error(upsertJson?.error || 'Upsert mislukt');
      appendLog('Voortgangsgegevens opgeslagen.');

      // 2) Upload selected photos
      const queue: Array<{position: 'front'|'side'|'back', file: File|null}> = [
        { position: 'front', file: frontFile },
        { position: 'side', file: sideFile },
        { position: 'back', file: backFile },
      ];

      for (const item of queue) {
        if (!item.file) continue;
        appendLog(`Upload ${item.position} gestart...`);
        const form = new FormData();
        form.append('user_id', user.id);
        if ((profile as any)?.coach_id) form.append('coach_id', String((profile as any).coach_id));
        form.append('week_start', weekStart);
        form.append('position', item.position);
        form.append('file', item.file);

        const upRes = await fetch('/api/one-to-one/progress/upload', { method: 'POST', body: form });
        const upJson = await upRes.json();
        if (!upRes.ok || !upJson?.success) throw new Error(upJson?.error || `Upload ${item.position} mislukt`);
        appendLog(`Upload ${item.position} voltooid.`);
      }

      appendLog('Klaar! Alle acties succesvol afgerond.');
      setModalDone(true);
      // Refresh history after successful save
      await loadHistory();
    } catch (e) {
      console.error(e);
      appendLog(`Fout: ${e instanceof Error ? e.message : 'Onbekende fout'}`);
    } finally {
      setSaving(false);
    }
  };

  // Load history (all weeks for user)
  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/one-to-one/progress?user_id=${user.id}`);
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Kon progressie niet laden');
      setHistory({ progress: json.progress || [], photos: json.photos || [] });
    } catch (e) {
      console.error('History load error:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { loadHistory(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  // Helper: get signed URL for photo
  const getSignedUrl = async (path: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/one-to-one/progress/sign-url?path=${encodeURIComponent(path)}&expires=600`);
      const json = await res.json();
      if (!res.ok || !json?.success) return null;
      return json.url || null;
    } catch { return null; }
  };

  const SignedImage = ({ path, alt }: { path: string; alt: string }) => {
    const [src, setSrc] = useState<string | null>(null);
    useEffect(() => {
      let mounted = true;
      (async () => {
        const url = await getSignedUrl(path);
        if (mounted) setSrc(url);
      })();
      return () => { mounted = false; };
    }, [path]);
    if (!src) return (
      <div className="w-full aspect-[3/4] rounded-lg bg-[#181F17] border border-[#3A4D23]" />
    );
    return <img src={src} alt={alt} className="w-full h-full object-cover rounded-lg border border-[#3A4D23]" />;
  };

  // Group photos by week
  const weeks = useMemo(() => {
    const groups: Record<string, { progress?: any; photos: any[] }> = {};
    for (const p of history.progress) {
      const k = p.week_start; if (!groups[k]) groups[k] = { photos: [] }; groups[k].progress = p;
    }
    for (const ph of history.photos) {
      const k = ph.week_start; if (!groups[k]) groups[k] = { photos: [] }; groups[k].photos.push(ph);
    }
    const entries = Object.entries(groups).sort((a,b) => (a[0] < b[0] ? 1 : -1));
    return entries.map(([week, data]) => ({ week, ...data }));
  }, [history]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Progressie</h1>
        <p className="text-gray-300">Voer je wekelijkse voortgang in en upload je foto's (front, side, back).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Week (startdatum - maandag)</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gewicht (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="80.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Vet% (optioneel)</label>
              <input
                type="number"
                step="0.1"
                placeholder="18.5"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Notities</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              placeholder="Voel je je beter? Wat ging goed/kan beter?"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-[#232D1A] border border-[#3A4D23] text-gray-200 hover:bg-[#2B3820] disabled:opacity-50"
              disabled={saving}
              onClick={() => {
                setFrontFile(null); setSideFile(null); setBackFile(null);
                setNotes('');
              }}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-[#8BAE5A] text-black font-semibold hover:bg-[#A6C97B] disabled:opacity-50"
              disabled={disabled}
              onClick={handleSave}
            >
              Upload & Opslaan
            </button>
          </div>
        </div>

        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6 space-y-4">
          <p className="text-sm text-gray-300">Upload je foto's (JPG/PNG). We maken drie categorieën: front, side, back.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            <FilePickerCard label="Front" id="progress-front" file={frontFile} onChange={setFrontFile} disabled={saving} />
            <FilePickerCard label="Side" id="progress-side" file={sideFile} onChange={setSideFile} disabled={saving} />
            <FilePickerCard label="Back" id="progress-back" file={backFile} onChange={setBackFile} disabled={saving} />
          </div>
          <div className="text-xs text-gray-500">Na jouw akkoord integreren we uploads via signed URLs met Supabase Storage.</div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Upload voortgang</h3>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#2B3820]"
                disabled={!modalDone}
              >
                Sluiten
              </button>
            </div>
            <div className="h-56 overflow-auto bg-[#181F17] rounded-lg p-3 text-xs text-gray-200 space-y-1">
              {modalLogs.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <div className="mt-3 text-right">
              {!modalDone ? (
                <span className="text-sm text-gray-400">Bezig...</span>
              ) : (
                <span className="text-sm text-[#8BAE5A] font-semibold">Succesvol afgerond</span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* History */}
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">History</h2>
          {loadingHistory && <span className="text-xs text-gray-400">Laden...</span>}
        </div>
        {weeks.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen progressie geregistreerd.</p>
        ) : (
          <div className="space-y-6">
            {weeks.map(({ week, progress, photos }) => {
              const front = photos.find((p:any) => p.position === 'front');
              const side = photos.find((p:any) => p.position === 'side');
              const back = photos.find((p:any) => p.position === 'back');
              return (
                <div key={week} className="border border-[#3A4D23] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold">Week: {new Date(week).toLocaleDateString('nl-NL')}</div>
                    <div className="text-sm text-gray-300">
                      {progress?.weight_kg ? `Gewicht: ${Number(progress.weight_kg).toFixed(1)} kg` : ''}
                      {progress?.body_fat_percent ? ` • Vet%: ${Number(progress.body_fat_percent).toFixed(1)}` : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {front && (
                      <div>
                        <SignedImage path={front.file_path} alt={`Front ${week}`} />
                        <p className="text-xs text-gray-400 mt-1">Front</p>
                      </div>
                    )}
                    {side && (
                      <div>
                        <SignedImage path={side.file_path} alt={`Side ${week}`} />
                        <p className="text-xs text-gray-400 mt-1">Side</p>
                      </div>
                    )}
                    {back && (
                      <div>
                        <SignedImage path={back.file_path} alt={`Back ${week}`} />
                        <p className="text-xs text-gray-400 mt-1">Back</p>
                      </div>
                    )}
                  </div>
                  {progress?.notes && (
                    <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">{progress.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
