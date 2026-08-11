import React, { useState } from 'react';
import { Lead, Business } from '../../types/database';
import { deleteLead } from '../../lib/leadService';
import { AIMessagePreviewModal } from './AIMessagePreviewModal';
import { X, Phone, Mail, Tag, Layers, Calendar, MessageSquare, Edit3, Trash2, Loader2 } from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead | null;
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDeleteSuccess: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  business,
  isOpen,
  onClose,
  onEdit,
  onDeleteSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete lead "${lead.full_name}"?`)) {
      setDeleting(true);
      const { error } = await deleteLead(lead.id);
      setDeleting(false);

      if (!error) {
        onDeleteSuccess();
        onClose();
      } else {
        alert(`Failed to delete lead: ${error.message}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'New':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60';
      case 'Contacted':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'Interested':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60';
      case 'Negotiating':
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60';
      case 'Closed Won':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
      case 'Closed Lost':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                {lead.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{lead.full_name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lead.whatsapp_number}</span>
                </p>
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

          {/* Stage Badge & Open WhatsApp AI Trigger */}
          <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Current Stage
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStageBadgeClass(lead.stage)}`}>
                <Layers className="w-3.5 h-3.5" />
                {lead.stage}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAIPreview(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open WhatsApp</span>
            </button>
          </div>

          {/* Lead Details Grid */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Lead Details
            </h3>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
              <span className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-slate-500" /> Phone / WhatsApp
              </span>
              <span className="font-mono text-slate-200">{lead.whatsapp_number}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
              <span className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" /> Email
              </span>
              <span className="text-slate-200">{lead.email || '—'}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
              <span className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" /> Next Follow-up Date
              </span>
              <span className="text-emerald-400 font-semibold">
                {lead.next_followup_date ? formatDate(lead.next_followup_date) : 'Not scheduled'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
              <span className="flex items-center gap-2 text-slate-400">
                <Tag className="w-4 h-4 text-slate-500" /> Lead Source
              </span>
              <span className="text-slate-200 font-medium">{lead.lead_source || 'Direct'}</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" /> Date Created
              </span>
              <span className="text-slate-300">{formatDate(lead.created_at)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Notes
            </h3>
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-300 min-h-[80px] whitespace-pre-wrap">
              {lead.notes ? lead.notes : <span className="text-slate-600 italic">No notes recorded for this lead.</span>}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Lead</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="py-2.5 px-4 bg-red-950/40 hover:bg-red-900/50 active:bg-red-950/80 text-red-400 text-xs font-semibold rounded-xl border border-red-900/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Lead</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Message Preview Modal before opening WhatsApp */}
      <AIMessagePreviewModal
        lead={lead}
        business={business}
        isOpen={showAIPreview}
        onClose={() => setShowAIPreview(false)}
      />
    </>
  );
};
