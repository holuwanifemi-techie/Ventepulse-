import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getLeads } from '../../lib/leadService';
import { checkIsAdmin } from '../../lib/adminService';
import { supabase } from '../../lib/supabase';
import { Lead, LeadStage, Business } from '../../types/database';
import { AddLeadModal } from './AddLeadModal';
import { EditLeadModal } from './EditLeadModal';
import { LeadDetailsModal } from './LeadDetailsModal';
import { ImportLeadsModal } from './ImportLeadsModal';
import { UserDashboardView } from '../dashboard/UserDashboardView';
import { Search, Plus, Phone, Calendar, Layers, Loader2, UserX, LogOut, ShieldCheck, LayoutDashboard, ListFilter, FileSpreadsheet } from 'lucide-react';

const STAGE_FILTERS: (LeadStage | 'All')[] = [
  'All',
  'New',
  'Contacted',
  'Interested',
  'Negotiating',
  'Closed Won',
  'Closed Lost',
];

interface LeadListProps {
  business: Business;
  onOpenAdmin?: () => void;
}

export const LeadList: React.FC<LeadListProps> = ({ business, onOpenAdmin }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState<LeadStage | 'All'>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await getLeads(user.id, searchQuery, activeStageFilter);
    setLeads(data);
    setLoading(false);
  }, [user, searchQuery, activeStageFilter]);

  useEffect(() => {
    fetchLeads();

    if (user) {
      checkIsAdmin(user.id, user.email).then(setIsAdmin);

      // Attach Real-Time Postgres listener for instant no-refresh lead updates
      const channel = supabase
        .channel(`realtime-leadlist-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` },
          () => {
            fetchLeads();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchLeads, user]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            {business.business_name}
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight">Ventepulse</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Portal Button */}
          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="py-1.5 px-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="Import Leads from Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          </button>

          <button
            type="button"
            onClick={signOut}
            title="Sign Out"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6">
        
        {/* Workspace View Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Priorities</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Leads Workspace ({leads.length})</span>
          </button>
        </div>

        {/* Tab 1: Action-Focused Dashboard & Analytics View */}
        {activeTab === 'dashboard' ? (
          <UserDashboardView
            userId={user?.id || ''}
            business={business}
            onNavigateToLeads={() => setActiveTab('leads')}
            onOpenAddLead={() => setIsAddModalOpen(true)}
          />
        ) : (
          /* Tab 2: Lead List View */
          <div className="space-y-4">
            
            {/* Search Bar & Add Lead Trigger */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads by name, phone, email..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </button>
            </div>

            {/* Stage Filter Scrollbar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STAGE_FILTERS.map((stage) => {
                const isActive = activeStageFilter === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setActiveStageFilter(stage)}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>

            {/* Lead Count Badge */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span>Showing <strong className="text-slate-200">{leads.length}</strong> leads</span>
              <span className="text-[11px] text-slate-500">Sorted by Recently Added</span>
            </div>

            {/* Lead List Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400">Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 text-center space-y-4 my-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <UserX className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Leads Found</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {searchQuery || activeStageFilter !== 'All'
                      ? 'No leads match your search query or stage filter.'
                      : 'Start capturing prospects by adding your first lead.'}
                  </p>
                </div>
                {!(searchQuery || activeStageFilter !== 'All') && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Your First Lead</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(true)}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-xl border border-teal-500/30 inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                      <span>Import Leads</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadForDetails(lead)}
                    className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-emerald-500/30 rounded-2xl p-4 transition-all cursor-pointer shadow-sm space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {lead.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {lead.full_name}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{lead.whatsapp_number}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lead.next_followup_date && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                            <Calendar className="w-3 h-3" />
                            {formatDate(lead.next_followup_date)}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStageBadgeClass(lead.stage)}`}>
                          <Layers className="w-3 h-3" />
                          {lead.stage}
                        </span>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddLeadModal
        businessId={business.id}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <ImportLeadsModal
        businessId={business.id}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchLeads}
      />

      <EditLeadModal
        lead={selectedLeadForEdit}
        isOpen={!!selectedLeadForEdit}
        onClose={() => setSelectedLeadForEdit(null)}
        onSuccess={fetchLeads}
      />

      <LeadDetailsModal
        lead={selectedLeadForDetails}
        business={business}
        isOpen={!!selectedLeadForDetails}
        onClose={() => setSelectedLeadForDetails(null)}
        onEdit={(leadToEdit) => setSelectedLeadForEdit(leadToEdit)}
        onDeleteSuccess={fetchLeads}
      />
    </div>
  );
};
