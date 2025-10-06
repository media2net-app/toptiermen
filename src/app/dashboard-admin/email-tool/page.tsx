"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

// Admin Email Tool page
// - Lists templates supported by EmailService.getTemplate
// - Previews template via /api/admin/email-template-preview
// - Sends test email to fixed address via /api/email/send-test

type TemplateId =
  | "platform_relaunch"
  | "platform-update"
  | "welcome"
  | "password-reset-minimal"
  | "sneak_preview"
  | "platform_relaunch_oct10";

const TEMPLATES: Array<{
  id: TemplateId;
  title: string;
  description: string;
}> = [
  {
    id: "platform_relaunch",
    title: "Platform Her-lancering",
    description: "Aankondiging her-lancering met vaste layout.",
  },
  {
    id: "platform_relaunch_oct10",
    title: "Relaunch 10 oktober 20:00",
    description: "Nieuwe aankondiging: platform 100%, live op 10 oktober 20:00.",
  },
  {
    id: "platform-update",
    title: "Platform Update",
    description: "Update e-mail over platformstatus en vervolgstappen.",
  },
  {
    id: "welcome",
    title: "Welkom (Broederschap)",
    description: "Welkom e-mail voor leden met pre-launch context.",
  },
  {
    id: "password-reset-minimal",
    title: "Wachtwoord Reset (simpel)",
    description: "Minimalistische e-mail met tijdelijk wachtwoord.",
  },
  {
    id: "sneak_preview",
    title: "Sneak Preview",
    description: "Pre-launch preview met video en uitleg.",
  },
];

const DEFAULT_SAMPLE: Record<string, string> = {
  name: "John Doe",
  email: "john.doe@example.com",
  tempPassword: "TempPass123!",
  daysUntilLaunch: "4",
};

export default function AdminEmailToolPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    "platform-update"
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [varsText, setVarsText] = useState<string>(
    JSON.stringify(DEFAULT_SAMPLE, null, 2)
  );
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );
  // Members state
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [members, setMembers] = useState<Array<{ id: string; email: string; name: string; payment_status?: string; package_type?: string; subscription_tier?: string }>>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [sendingMembers, setSendingMembers] = useState<boolean>(false);
  const [membersDebug, setMembersDebug] = useState<any | null>(null);
  const [showMembersDebug, setShowMembersDebug] = useState<boolean>(false);
  const [paidOnly, setPaidOnly] = useState<boolean>(true);

  // Edit mode state
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<string>("");
  const [editHtml, setEditHtml] = useState<string>("");
  const [editText, setEditText] = useState<string>("");
  const [visualMode, setVisualMode] = useState<boolean>(false);
  // Persisted draft per template (localStorage)
  const draftKey = useMemo(() => `emailToolDraft_${selectedTemplate || 'template'}`,[selectedTemplate]);
  const [autoSaveTick, setAutoSaveTick] = useState<number>(0);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const hasEdits = useMemo(() => (editSubject?.trim()?.length || 0) > 0 || (editHtml?.trim()?.length || 0) > 0 || (editText?.trim()?.length || 0) > 0, [editSubject, editHtml, editText]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showSavedChip, setShowSavedChip] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);
  // Test recipients multi-select
  const TEST_OPTIONS = [
    { email: 'chielvanderzee@gmail.com', label: 'Chiel' },
    { email: 'rick@toptiermen.eu', label: 'Rick' },
  ];
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set([TEST_OPTIONS[0].email]));
  const toggleTestSelect = (email: string) => {
    setSelectedTests(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  const variables = useMemo(() => {
    try {
      return JSON.parse(varsText || "{}");
    } catch {
      return DEFAULT_SAMPLE;
    }
  }, [varsText]);

  const loadPreview = async () => {
    setLoadingPreview(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/email-template-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          templateId: editMode ? "custom_html" : selectedTemplate,
          variables: editMode 
            ? { subject: editSubject || subject || "Custom Email", html: editHtml, text: editText }
            : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Kon preview niet laden");
      }
      setPreviewHtml(data.html || "");
      setSubject(data.subject || "");
    } catch (e: any) {
      console.error(e);
      setToast({ type: "error", msg: e?.message || "Preview laden mislukt" });
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelectedMembers = useMemo(() => {
    const sel = new Set(selectedMemberIds);
    return members.filter((m) => sel.has(m.id));
  }, [members, selectedMemberIds]);

  const openConfirmModal = () => {
    if (selectedMemberIds.size === 0) {
      setToast({ type: "error", msg: "Selecteer eerst één of meer leden" });
      return;
    }
    setShowConfirmModal(true);
  };

  // Two-step send: dryRun -> confirm -> actual send
  const confirmSendToMembers = async () => {
    try {
      setSendingMembers(true);
      // 1) Dry-run
      const resDry = await fetch('/api/admin/email-send-safe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: allSelectedMembers,
          template: editMode ? 'custom_html' : selectedTemplate,
          variables: editMode 
            ? { ...variables, subject: editSubject || subject || 'Custom Email', html: editHtml, text: editText }
            : variables,
          dryRun: true,
        }),
      });
      const dryData = await resDry.json();
      if (!resDry.ok || dryData?.error) {
        throw new Error(dryData?.error || 'Dry-run mislukt');
      }

      // 2) Ask for final confirmation with summary
      const proceed = window.confirm(
        `Dry-run OK. Totaal: ${dryData.total}. Template: ${selectedTemplate}.\n\nWil je deze e-mails nu daadwerkelijk versturen?`
      );
      if (!proceed) {
        setToast({ type: 'success', msg: `Dry-run afgerond. Geen e-mails verzonden.` });
        setShowConfirmModal(false);
        return;
      }

      // 3) Actual send
      const resSend = await fetch('/api/admin/email-send-safe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: allSelectedMembers,
          template: editMode ? 'custom_html' : selectedTemplate,
          variables: editMode 
            ? { ...variables, subject: editSubject || subject || 'Custom Email', html: editHtml, text: editText }
            : variables,
          dryRun: false,
          emailDelayMs: 150,
          max: 500,
        }),
      });
      const sendData = await resSend.json();
      if (!resSend.ok || sendData?.error) {
        throw new Error(sendData?.error || 'Verzenden mislukt');
      }

      setToast({
        type: 'success',
        msg: `Verzonden: ${sendData.sent} / ${sendData.attempted}. Fouten: ${sendData.failed}.`,
      });
      setShowConfirmModal(false);
    } catch (e: any) {
      console.error(e);
      setToast({ type: 'error', msg: e?.message || 'Verzenden mislukt' });
    } finally {
      setSendingMembers(false);
    }
  };

  useEffect(() => {
    loadPreview();
    // When switching templates, exit edit mode to prevent custom_html from overriding other templates
    setEditMode(false);
    setEditSubject("");
    setEditHtml("");
    setEditText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  // Detect draft presence and optionally load when entering edit mode or switching template
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      setHasDraft(!!raw);
      if (raw && editMode) {
        const draft = JSON.parse(raw);
        if (typeof draft?.subject === 'string') setEditSubject(draft.subject);
        if (typeof draft?.html === 'string') setEditHtml(draft.html);
        if (typeof draft?.text === 'string') setEditText(draft.text);
        setToast({ type: 'success', msg: 'Concept geladen voor dit sjabloon' });
      }
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (typeof d?.ts === 'number') setSavedAt(d.ts);
        } catch {}
      } else {
        setSavedAt(null);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, editMode]);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!editMode) return;
    const t = setTimeout(() => {
      try {
        const payload = JSON.stringify({ subject: editSubject, html: editHtml, text: editText, ts: Date.now() });
        localStorage.setItem(draftKey, payload);
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [editMode, editSubject, editHtml, editText, draftKey, autoSaveTick]);

  const saveDraft = () => {
    try {
      const payload = JSON.stringify({ subject: editSubject, html: editHtml, text: editText, ts: Date.now() });
      localStorage.setItem(draftKey, payload);
      const now = Date.now();
      setSavedAt(now);
      setShowSavedChip(true);
      // Also show a toast but indicator is near the button for better UX
      setToast({ type: 'success', msg: 'Concept opgeslagen' });
      setTimeout(() => setShowSavedChip(false), 2500);
      setDirty(false);
    } catch (e:any) {
      setToast({ type: 'error', msg: e?.message || 'Opslaan mislukt' });
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      setToast({ type: 'success', msg: 'Concept gewist' });
    } catch {}
  };

  const resetToOriginal = () => {
    // Clear local edits and localStorage for this template, reload preview
    clearDraft();
    setEditSubject('');
    setEditHtml('');
    setEditText('');
    setEditMode(false);
    setDirty(false);
    loadPreview();
  };

  const handleSelectTemplate = (id: TemplateId) => {
    if (editMode && dirty) {
      const proceed = window.confirm('Je hebt niet-opgeslagen wijzigingen. Wil je toch van sjabloon wisselen?');
      if (!proceed) return;
    }
    setSelectedTemplate(id);
  };

  // Compute dirty state by comparing current edits with saved draft in localStorage
  useEffect(() => {
    if (!editMode) { setDirty(false); return; }
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) {
        // No draft saved; if any fields filled, mark dirty
        setDirty(hasEdits);
      } else {
        const d = JSON.parse(raw);
        const same = (d?.subject || '') === (editSubject || '') && (d?.html || '') === (editHtml || '') && (d?.text || '') === (editText || '');
        setDirty(!same);
      }
    } catch {
      setDirty(true);
    }
  }, [editMode, editSubject, editHtml, editText, draftKey, hasEdits]);

  // Load only active paid members
  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`/api/admin/list-members`);
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Kon leden niet laden");
      const list = (data.members || []) as Array<any>;
      const filtered = paidOnly
        ? list.filter((m) => (m.payment_status || '').toLowerCase() === 'paid' ||
            (String(m.package_type||'').toLowerCase().includes('premium') || String(m.subscription_tier||'').toLowerCase().includes('premium') ||
             String(m.package_type||'').toLowerCase().includes('lifetime') || String(m.subscription_tier||'').toLowerCase().includes('lifetime')))
        : list;
      setMembers(filtered.map((m) => ({ id: m.id, email: m.email, name: m.full_name || m.email?.split('@')[0] || 'Onbekend', payment_status: m.payment_status, package_type: m.package_type, subscription_tier: m.subscription_tier })));
    } catch (e: any) {
      console.error(e);
      setToast({ type: "error", msg: e?.message || "Leden laden mislukt" });
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadMembersDebug = async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`/api/admin/active-paid-members?debug=1`);
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Kon debug-info niet laden");
      setMembers(data.members || []);
      setMembersDebug(data.debug || null);
      setShowMembersDebug(true);
    } catch (e: any) {
      console.error(e);
      setToast({ type: 'error', msg: e?.message || 'Debug laden mislukt' });
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const onSendTest = async () => {
    setSendingTest(true);
    setToast(null);
    try {
      const emails = Array.from(selectedTests);
      if (emails.length === 0) {
        throw new Error('Selecteer minimaal één test ontvanger');
      }
      const confirmMsg = `Weet je zeker dat je een test wilt versturen naar:\n\n- ${emails.join('\n- ')}\n\nTemplate: ${editMode ? 'custom_html' : selectedTemplate}`;
      const proceed = window.confirm(confirmMsg);
      if (!proceed) {
        setSendingTest(false);
        return;
      }

      let sent = 0; let failed = 0;
      for (const to of emails) {
        const res = await fetch("/api/email/send-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to,
            name: variables?.name || "Test User",
            template: editMode ? "custom_html" : selectedTemplate,
            variables: editMode 
              ? { ...variables, subject: editSubject || subject || "Custom Email", html: editHtml, text: editText }
              : variables,
          }),
        });
        const data = await res.json();
        if (res.ok && !data?.error) sent++; else failed++;
        await new Promise(r => setTimeout(r, 150));
      }
      setToast({ type: failed === 0 ? 'success' : 'error', msg: `Test verstuurd: ${sent} succesvol, ${failed} mislukt` });
    } catch (e: any) {
      console.error(e);
      setToast({ type: "error", msg: e?.message || "Versturen mislukt" });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold">E-mail Tool (Admin)</h1>
        <p className="text-sm text-gray-400 mt-1">
          Selecteer een sjabloon, bekijk een preview en verstuur een test.
        </p>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Templates + Variables */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#141A15] rounded-xl border border-[#2A3A1A] p-4">
              <h2 className="font-semibold mb-3">Sjablonen</h2>
              <div className="space-y-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg border",
                      selectedTemplate === tpl.id
                        ? "bg-[#1F2D17] border-[#8BAE5A]"
                        : "bg-[#0F1419] border-[#2A3A1A] hover:bg-[#162013]"
                    )}
                  >
                    <div className="font-medium">{tpl.title}</div>
                    <div className="text-xs text-gray-400">{tpl.id}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      {tpl.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#141A15] rounded-xl border border-[#2A3A1A] p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Variabelen (JSON)</h2>
                <button
                  className="text-xs text-[#8BAE5A] hover:underline"
                  onClick={() => setVarsText(JSON.stringify(DEFAULT_SAMPLE, null, 2))}
                >
                  Reset
                </button>
              </div>
              <textarea
                className="w-full h-56 bg-[#0F1419] border border-[#2A3A1A] rounded-lg p-3 text-sm font-mono"
                value={varsText}
                onChange={(e) => setVarsText(e.target.value)}
                spellCheck={false}
              />
              <p className="text-xs text-gray-400 mt-2">
                Voorbeelden: <code>name</code>, <code>tempPassword</code>, <code>daysUntilLaunch</code>
              </p>
            </div>

            <div className="bg-[#141A15] rounded-xl border border-[#2A3A1A] p-4">
              <h2 className="font-semibold mb-3">Test verzenden</h2>
              <p className="text-sm text-gray-300 mb-2">Selecteer test ontvangers:</p>
              <div className="flex flex-col gap-2 mb-3">
                {TEST_OPTIONS.map(opt => (
                  <label key={opt.email} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedTests.has(opt.email)}
                      onChange={() => toggleTestSelect(opt.email)}
                    />
                    <span className="text-gray-300">{opt.label} <span className="text-gray-400">({opt.email})</span></span>
                  </label>
                ))}
              </div>
              <button
                onClick={onSendTest}
                disabled={sendingTest}
                className={clsx(
                  "inline-flex items-center px-4 py-2 rounded-lg font-medium",
                  sendingTest
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-[#8BAE5A] text-black hover:bg-[#B6C948]"
                )}
              >
                {sendingTest ? "Versturen..." : "Verstuur test"}
              </button>
              {toast && (
                <div
                  className={clsx(
                    "mt-3 text-sm px-3 py-2 rounded-md",
                    toast.type === "success"
                      ? "bg-green-900/40 text-green-300 border border-green-800"
                      : "bg-red-900/40 text-red-300 border border-red-800"
                  )}
                >
                  {toast.msg}
                </div>
              )}
            </div>

            <div className="bg-[#141A15] rounded-xl border border-[#2A3A1A] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold">Ledenlijst</h2>
                  <div className="text-xs text-gray-400">Totaal: {members.length}</div>
                  <label className="flex items-center gap-1 text-xs text-gray-300">
                    <input type="checkbox" className="h-3 w-3" checked={paidOnly} onChange={(e)=>{ setPaidOnly(e.target.checked); setTimeout(loadMembers, 0); }} />
                    Alleen betaald
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadMembers}
                    disabled={loadingMembers}
                    className={clsx(
                      "text-xs px-2 py-1 rounded-md border",
                      loadingMembers
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-[#23311B] hover:bg-[#2C3E21] border-[#2A3A1A]"
                    )}
                  >
                    {loadingMembers ? "Laden..." : "Vernieuw"}
                  </button>
                  <button
                    onClick={loadMembersDebug}
                    className="text-xs px-2 py-1 rounded-md border bg-[#332b11] hover:bg-[#3d3415] border-[#4b3b12]"
                    title="Toon debug-overzicht (matching stats)"
                  >
                    Debug
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-auto border border-[#2A3A1A] rounded-lg">
                {members.length === 0 ? (
                  <div className="p-3 text-sm text-gray-400">Geen leden gevonden.</div>
                ) : (
                  <ul className="divide-y divide-[#2A3A1A]">
                    {members.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 p-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedMemberIds.has(m.id)}
                          onChange={() => toggleSelectMember(m.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{m.name}</div>
                          <div className="text-xs text-gray-400 truncate">{m.email} {m.payment_status ? (<span className={clsx('ml-2', (m.payment_status||'').toLowerCase()==='paid' ? 'text-green-400' : 'text-gray-500')}>[{m.payment_status}]</span>) : null}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {showMembersDebug && membersDebug && (
                <div className="mt-3 text-xs text-gray-300 bg-[#0F1419] border border-[#2A3A1A] rounded-lg p-3">
                  <div className="font-semibold text-[#8BAE5A] mb-1">Debug-overzicht</div>
                  <div>Profiles totaal: {membersDebug.profiles_total}</div>
                  <div>Betaalde payments (prelaunch_packages): {membersDebug.payments_total}</div>
                  <div>Unieke betaalde e-mails gematcht: {membersDebug.paid_emails_matched}</div>
                  <div>Gematcht op Premium/Lifetime tier: {membersDebug.matched_by_tier}</div>
                  <div>Actief & betaald resultaat: {membersDebug.matched_active_paid}</div>
                  {membersDebug.sample_first5?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-gray-400 mb-1">Voorbeeld (eerste 5):</div>
                      <ul className="list-disc list-inside">
                        {membersDebug.sample_first5.map((u: any) => (
                          <li key={u.id}>{u.name} — {u.email}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => setShowMembersDebug(false)}
                    className="mt-2 text-xs px-2 py-1 rounded-md border bg-[#23311B] hover:bg-[#2C3E21] border-[#2A3A1A]"
                  >
                    Verberg debug
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 text-sm text-gray-300">
                <span>Geselecteerd: {selectedMemberIds.size}</span>
                <button
                  onClick={openConfirmModal}
                  className="px-3 py-2 rounded-md bg-[#8BAE5A] text-black hover:bg-[#B6C948]"
                >
                  Verstuur naar leden
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#141A15] rounded-xl border border-[#2A3A1A] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold flex items-center gap-2">Preview {editMode && (
                    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-300 border border-yellow-700">Bewerken actief</span>
                  )}</h2>
                  <p className="text-xs text-gray-400">Onderwerp: {subject || "( onbekend )"}</p>
                  {savedAt && (
                    <p className="text-[11px] text-gray-500 mt-0.5">Laatst opgeslagen: {new Date(savedAt).toLocaleTimeString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // toggle edit mode and seed editors from draft if present
                      const next = !editMode;
                      setEditMode(next);
                      if (!next) return;
                      try {
                        const raw = localStorage.getItem(draftKey);
                        if (raw) {
                          const d = JSON.parse(raw);
                          setEditSubject(typeof d?.subject === 'string' ? d.subject : (subject || 'Custom Email'));
                          setEditHtml(typeof d?.html === 'string' ? d.html : (previewHtml || '<div><h2>Aangepaste e-mail</h2><p>Vervang deze content.</p></div>'));
                          setEditText(typeof d?.text === 'string' ? d.text : (editText || 'Aangepaste tekstversie'));
                        } else {
                          setEditSubject(subject || editSubject || "Custom Email");
                          setEditHtml(previewHtml || editHtml || '<div><h2>Aangepaste e-mail</h2><p>Vervang deze content.</p></div>');
                          setEditText(editText || 'Aangepaste tekstversie');
                        }
                      } catch {
                        setEditSubject(subject || editSubject || "Custom Email");
                        setEditHtml(previewHtml || editHtml || '<div><h2>Aangepaste e-mail</h2><p>Vervang deze content.</p></div>');
                        setEditText(editText || 'Aangepaste tekstversie');
                      }
                    }}
                    className="text-sm px-3 py-2 rounded-md bg-[#23311B] hover:bg-[#2C3E21] border border-[#2A3A1A]"
                  >
                    {editMode ? 'Bewerken uit' : 'Bewerken'}
                  </button>
                  {!editMode && hasDraft && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-sm px-3 py-2 rounded-md bg-[#3a452c] hover:bg-[#2C3E21] border border-[#2A3A1A]"
                      title="Er is een lokaal concept beschikbaar. Klik om te bewerken en te laden."
                    >
                      Laad concept
                    </button>
                  )}
                  {editMode && (
                    <>
                      <button
                        onClick={saveDraft}
                        className="text-sm px-3 py-2 rounded-md bg-[#8BAE5A] text-black hover:bg-[#B6C948]"
                        title="Concept opslaan (lokaal)"
                      >
                        Opslaan
                      </button>
                      {showSavedChip && (
                        <span className="text-xs px-2 py-1 rounded bg-green-900/40 text-green-300 border border-green-800">Opgeslagen</span>
                      )}
                      <button
                        onClick={clearDraft}
                        className="text-sm px-3 py-2 rounded-md bg-[#3a452c] hover:bg-[#2C3E21] border border-[#2A3A1A]"
                        title="Verwijder opgeslagen concept"
                      >
                        Wis concept
                      </button>
                      <button
                        onClick={resetToOriginal}
                        className="text-sm px-3 py-2 rounded-md bg-[#412222] hover:bg-[#5a2b2b] border border-red-900 text-red-200"
                        title="Herstel naar originele template en schakel bewerken uit"
                      >
                        Reset naar origineel
                      </button>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      // If there is a saved draft but edit mode is off, offer to apply it
                      if (!editMode && hasDraft) {
                        const proceed = window.confirm('Er is een lokaal concept voor dit sjabloon. Wil je dit toepassen op de preview?');
                        if (!proceed) {
                          await loadPreview();
                          return;
                        }
                        setEditMode(true);
                        // wait a tick for state to update, then load with custom_html
                        setTimeout(() => {
                          loadPreview();
                        }, 0);
                        return;
                      }
                      await loadPreview();
                    }}
                    disabled={loadingPreview}
                    className={clsx(
                      "text-sm px-3 py-2 rounded-md",
                      loadingPreview
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-[#23311B] hover:bg-[#2C3E21] border border-[#2A3A1A]"
                    )}
                  >
                    {loadingPreview ? "Vernieuwen..." : (editMode ? 'Toepassen op preview' : 'Vernieuw preview')}
                  </button>
                </div>
              </div>
              <div className="mt-4 bg-[#0F1419] border border-[#2A3A1A] rounded-lg overflow-hidden">
                {previewHtml ? (
                  <iframe
                    title="email-preview"
                    className="w-full h-[70vh] bg-white"
                    srcDoc={previewHtml}
                  />
                ) : (
                  <div className="p-6 text-sm text-gray-400">Geen preview beschikbaar.</div>
                )}
              </div>
              {editMode && (
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Onderwerp</label>
                    <input
                      className="w-full bg-[#0F1419] border border-[#2A3A1A] rounded-lg p-2 text-sm"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Custom Email"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm text-gray-300">Inhoud</label>
                      <button
                        type="button"
                        onClick={() => setVisualMode(v => !v)}
                        className="text-xs px-2 py-1 rounded-md bg-[#23311B] hover:bg-[#2C3E21] border border-[#2A3A1A]"
                        title={visualMode ? 'Schakel naar HTML' : 'Schakel naar Visueel'}
                      >
                        {visualMode ? 'HTML' : 'Visueel'}
                      </button>
                    </div>
                    {visualMode ? (
                      <VisualEditor value={editHtml} onChange={setEditHtml} />
                    ) : (
                      <textarea
                        className="w-full h-56 bg-[#0F1419] border border-[#2A3A1A] rounded-lg p-3 text-sm font-mono"
                        value={editHtml}
                        onChange={(e) => setEditHtml(e.target.value)}
                        spellCheck={false}
                        placeholder="<div>...</div>"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Tekst (plain)</label>
                    <textarea
                      className="w-full h-32 bg-[#0F1419] border border-[#2A3A1A] rounded-lg p-3 text-sm font-mono"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      spellCheck={false}
                      placeholder="Aangepaste tekstversie"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Tip: Voeg afbeeldingen toe door volledige URL's in de HTML te gebruiken (bijv. https://...).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirmModal(false)} />
          <div className="relative z-10 w-full max-w-xl bg-[#141A15] border border-[#2A3A1A] rounded-xl p-5">
            <h3 className="text-lg font-semibold">Bevestigen</h3>
            <p className="text-sm text-gray-300 mt-1">
              Weet je zeker dat je wilt versturen naar de volgende geselecteerde leden?
            </p>
            <div className="mt-3 max-h-56 overflow-auto border border-[#2A3A1A] rounded-lg">
              <ul className="divide-y divide-[#2A3A1A] text-sm">
                {allSelectedMembers.map((m) => (
                  <li key={m.id} className="p-2">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.email}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-2 rounded-md border border-[#2A3A1A] bg-[#0F1419] hover:bg-[#162013]"
              >
                Annuleren
              </button>
              <button
                onClick={confirmSendToMembers}
                className="px-3 py-2 rounded-md bg-[#8BAE5A] text-black hover:bg-[#B6C948]"
              >
                Bevestig
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Lightweight WYSIWYG editor component (admin-only usage)
function VisualEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const editorId = 'visual-editor-' + Math.random().toString(36).slice(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply HTML on mount and whenever value changes externally
  useEffect(() => {
    const el = document.getElementById(editorId);
    if (el && mounted) {
      // Only overwrite if content differs (avoid cursor jumps on typing)
      if (el.innerHTML !== (value || '')) {
        el.innerHTML = value || '<div><p>Voer hier je inhoud in...</p></div>';
      }
    }
  }, [mounted, value, editorId]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const handleInput = () => {
    const el = document.getElementById(editorId);
    if (el) onChange(el.innerHTML);
  };

  const insertImage = () => {
    const url = prompt('Afbeelding URL (https://...)');
    if (url) exec('insertImage', url);
  };

  const makeLink = () => {
    const url = prompt('Link URL (https://...)');
    if (url) exec('createLink', url);
  };

  return (
    <div className="border border-[#2A3A1A] rounded-lg overflow-hidden bg-[#0F1419]">
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#2A3A1A] bg-[#11160f]">
        <button onClick={() => exec('bold')} className="px-2 py-1 text-xs rounded bg-[#23311B]">B</button>
        <button onClick={() => exec('italic')} className="px-2 py-1 text-xs rounded bg-[#23311B] italic">I</button>
        <button onClick={() => exec('underline')} className="px-2 py-1 text-xs rounded bg-[#23311B]">U</button>
        <button onClick={() => exec('formatBlock', '<h1>')} className="px-2 py-1 text-xs rounded bg-[#23311B]">H1</button>
        <button onClick={() => exec('formatBlock', '<h2>')} className="px-2 py-1 text-xs rounded bg-[#23311B]">H2</button>
        <button onClick={() => exec('formatBlock', '<p>')} className="px-2 py-1 text-xs rounded bg-[#23311B]">P</button>
        <button onClick={() => exec('insertUnorderedList')} className="px-2 py-1 text-xs rounded bg-[#23311B]">• List</button>
        <button onClick={() => exec('insertOrderedList')} className="px-2 py-1 text-xs rounded bg-[#23311B]">1. List</button>
        <button onClick={makeLink} className="px-2 py-1 text-xs rounded bg-[#23311B]">Link</button>
        <button onClick={() => exec('unlink')} className="px-2 py-1 text-xs rounded bg-[#23311B]">Unlink</button>
        <button onClick={insertImage} className="px-2 py-1 text-xs rounded bg-[#23311B]">📷</button>
        <button onClick={() => exec('justifyLeft')} className="px-2 py-1 text-xs rounded bg-[#23311B]">Left</button>
        <button onClick={() => exec('justifyCenter')} className="px-2 py-1 text-xs rounded bg-[#23311B]">Center</button>
        <button onClick={() => exec('justifyRight')} className="px-2 py-1 text-xs rounded bg-[#23311B]">Right</button>
      </div>
      <div
        id={editorId}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[320px] p-3 text-sm bg-white text-black overflow-auto"
        style={{ lineHeight: '1.5' }}
      />
    </div>
  );
}
