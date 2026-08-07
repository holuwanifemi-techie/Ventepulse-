import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createLead } from '../../lib/leadService';
import { LeadStage } from '../../types/database';
import { X, UserPlus, Phone, Mail, Building, Tag, Layers, FileText, Loader2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';

const STAGE_OPTIONS: LeadStage[] = [
  'New',
  'Contacted',
  'Interested',
  'Negotiating',
  'Closed Won',
  'Closed Lost',
];

const SOURCE_OPTIONS = [
  'Direct Call',
  'WhatsApp',
  'Referral',
  'Website / Form',
  'Social Media',
  'Other',
];

interface AddLeadModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  businessId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [leadSource, setLeadSource] = useState('Direct Call');
  const [stage, setStage] = useState<LeadStage>('New');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const getDraftKey = () => (user ? `ventepulse_lead_draft_${user.id}` : null);

  // Restore draft when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const draftKey = getDraftKey();
      if (draftKey) {
        const savedDraftStr = localStorage.getItem(draftKey);
        if (savedDraftStr) {
          try {
            const draft = JSON.parse(savedDraftStr);
            if (draft.fullName || draft.phone || draft.email || draft.company || draft.notes) {
              setFullName(draft.fullName || '');
              setPhone(draft.phone || '');
              setEmail(draft.email || '');
              setCompany(draft.company || '');
              setLeadSource(draft.leadSource || 'Direct Call');
              setStage(draft.stage || 'New');
              setNotes(draft.notes || '');
              setHasRestoredDraft(true);
            }
          } catch (e) {
            console.error('Failed to parse lead draft:', e);
          }
        }
      }
    }
  }, [isOpen, user]);

  // Auto-save draft on field change if modal is open
  useEffect(() => {
    if (isOpen && user) {
      const draftKey = getDraftKey();
      if (draftKey) {
        if (fullName.trim() || phone.trim() || email.trim() || company.trim() || notes.trim()) {
          const draft = { fullName, phone, email, company, leadSource, stage, notes };
          localStorage.setItem(draftKey, JSON.stringify(draft));
        }
      }
    }
  }, [isOpen, user, fullName, phone, email, company, leadSource, stage, notes]);

  const handleDiscardDraft = () => {
    const draftKey = getDraftKey();
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
    setFullName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setLeadSource('Direct Call');
    setStage('New');
    setNotes('');
    setHasRestoredDraft(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('User session expired.');
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Full Name and Phone Number are required.');
      return;
    }

    setLoading(true);
    const { error } = await createLead({
      user_id: user.id,
      business_id: businessId,
      full_name: fullName.trim(),
      whatsapp_number: phone.trim(),
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      lead_source: leadSource,
      stage: stage,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      // Clear draft on successful database insertion
      const draftKey = getDraftKey();
      if (draftKey) {
        localStorage.removeItem(draftKey);
      }
      setFullName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setLeadSource('Direct Call');
      setStage('New');
      setNotes('');
      setHasRestoredDraft(false);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Lead</h2>
              <p className="text-xs text-slate-400">Capture a new prospect</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Restored Draft Alert Banner */}
        {hasRestoredDraft && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Restored unfinished lead draft</span>
            </div>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Discard Draft
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Full Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Phone Number (Accepts with or without country code) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Phone / WhatsApp Number <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678 or 08012345678"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <p className="text-[10px] text-slate-500">Accepts numbers with (+234...) or without (080...) country code.</p>
          </div>

          {/* Email & Company Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Company (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          {/* Lead Source & Stage Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lead Source */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Lead Source
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Stage */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Initial Stage
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                >
                  {STAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Initial Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Interested in 4-bedroom property in downtown..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 font-semibold text-sm text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Lead...</span>
                </>
              ) : (
                <span>Save Lead</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
