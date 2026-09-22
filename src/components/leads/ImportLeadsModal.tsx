import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserPlan } from '../../lib/subscriptionService';
import { PricingUpgradeModal } from '../subscription/PricingUpgradeModal';
import { LeadStage } from '../../types/database';
import { X, UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface ImportLeadsModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  businessId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLimitExceeded(false);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['.csv', '.xlsx', '.xls', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(ext) && !validTypes.includes(selectedFile.type)) {
        setErrorMessage('Invalid file format. Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).');
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new Error('File does not contain any lead records. Please include header and at least one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    
    // Check for minimum required headers
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('full'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp') || h.includes('mobile'));

    if (nameIdx === -1 || phoneIdx === -1) {
      throw new Error('Invalid file structure. File must include headers for "Full Name" and "Phone Number".');
    }

    const emailIdx = headers.findIndex(h => h.includes('email'));
    const stageIdx = headers.findIndex(h => h.includes('stage') || h.includes('status'));
    const sourceIdx = headers.findIndex(h => h.includes('source'));
    const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('comment'));

    const rows: any[] = [];
    const validStages: LeadStage[] = ['New', 'Contacted', 'Interested', 'Negotiating', 'Closed Won', 'Closed Lost'];

    for (let i = 1; i < lines.length; i++) {
      const col = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const fullName = col[nameIdx] || '';
      const phone = col[phoneIdx] || '';

      if (fullName && phone) {
        let rawStage = (stageIdx !== -1 && col[stageIdx]) ? col[stageIdx] : 'New';
        let matchedStage: LeadStage = 'New';
        const found = validStages.find(s => s.toLowerCase() === rawStage.toLowerCase());
        if (found) matchedStage = found;

        rows.push({
          user_id: user?.id,
          business_id: businessId,
          full_name: fullName,
          whatsapp_number: phone,
          email: emailIdx !== -1 ? col[emailIdx] || null : null,
          lead_source: sourceIdx !== -1 ? col[sourceIdx] || 'Excel Import' : 'Excel Import',
          stage: matchedStage,
          notes: notesIdx !== -1 ? col[notesIdx] || null : null,
        });
      }
    }

    if (rows.length === 0) {
      throw new Error('No valid lead rows found in the uploaded file.');
    }

    return rows;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLimitExceeded(false);

    if (!file || !user) {
      setErrorMessage('Please select a CSV or Excel file to import.');
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const rows = parseCSVText(text);

      // Validate subscription plan headroom before batch insertion
      const { data: userPlan } = await getUserPlan(user.id, user.email);
      const isOwnerOrAdmin = userPlan.is_admin || userPlan.role === 'owner' || userPlan.plan === 'owner' || userPlan.plan === 'admin';
      
      if (!isOwnerOrAdmin) {
        const availableSlots = Math.max(0, userPlan.lead_limit - userPlan.current_leads);
        if (availableSlots <= 0) {
          setIsLimitExceeded(true);
          setErrorMessage(`You have reached your limit of ${userPlan.lead_limit} leads on your ${userPlan.plan_name} plan. Please upgrade to import more leads.`);
          setLoading(false);
          return;
        }
        if (rows.length > availableSlots) {
          setIsLimitExceeded(true);
          setErrorMessage(`Your file contains ${rows.length} leads, but you only have ${availableSlots} slot(s) remaining on your ${userPlan.plan_name} plan (${userPlan.current_leads}/${userPlan.lead_limit} used). Upgrade to import all.`);
          setLoading(false);
          return;
        }
      }

      // Perform batch insert into Supabase leads table
      const { data, error } = await supabase
        .from('leads')
        .insert(rows)
        .select();

      setLoading(false);

      if (error) {
        if (error.message.includes('LEAD_LIMIT_EXCEEDED')) {
          setIsLimitExceeded(true);
        }
        setErrorMessage(`Failed to import leads: ${error.message}`);
      } else {
        const count = data?.length || rows.length;
        setSuccessMessage(`Successfully imported ${count} leads into your workspace!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'An error occurred while parsing the file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Leads</h2>
              <p className="text-xs text-slate-400">Upload CSV or Excel file</p>
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            {isLimitExceeded && (
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade Plan to Import More</span>
              </button>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 text-center space-y-3 bg-slate-950/60 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-white">
                {file ? file.name : 'Click to select CSV or Excel file'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: .csv, .xlsx, .xls
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Expected File Columns:</p>
            <p>Full Name <span className="text-rose-400">*</span>, Phone Number <span className="text-rose-400">*</span>, Email, Stage, Notes</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 font-bold text-xs text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import File</span>
              )}
            </button>
          </div>
        </form>

      </div>

      <PricingUpgradeModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        userId={user?.id || ''}
        userEmail={user?.email || ''}
      />
    </div>
  );
};
