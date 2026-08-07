import React, { useState, useEffect } from 'react';
import { Lead, Business } from '../../types/database';
import { generateFollowUpMessage } from '../../lib/aiService';
import { X, Sparkles, Copy, Check, Send, MessageSquare } from 'lucide-react';

interface AIMessagePreviewModalProps {
  lead: Lead | null;
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIMessagePreviewModal: React.FC<AIMessagePreviewModalProps> = ({
  lead,
  business,
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      const generated = generateFollowUpMessage(lead, business);
      setMessage(generated);
      setCopied(false);
    }
  }, [lead, business]);

  if (!isOpen || !lead) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = lead.whatsapp_number.trim().replace(/[^0-9+]/g, '');

    // If starting with leading 0 (e.g. 08012345678), convert to international format (234...) if 11 digits
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = '234' + cleanPhone.substring(1);
    } else {
      cleanPhone = cleanPhone.replace(/[^0-9]/g, '');
    }

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Message Preview</h2>
              <p className="text-xs text-slate-400">Review & edit message before opening WhatsApp</p>
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

        {/* Lead Summary Info */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-medium">Recipient: </span>
            <span className="text-white font-bold">{lead.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Phone: </span>
            <span className="text-emerald-400 font-mono font-semibold">{lead.whatsapp_number}</span>
          </div>
        </div>

        {/* Message Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Generated Follow-up Message
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            className="w-full p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed font-sans"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-2/3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Confirm & Open WhatsApp</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
