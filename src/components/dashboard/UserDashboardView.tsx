import React, { useState, useEffect } from 'react';
import { getDashboardMetrics, DashboardMetrics } from '../../lib/dashboardService';
import { Lead, Business } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { AIMessagePreviewModal } from '../leads/AIMessagePreviewModal';
import { ImportLeadsModal } from '../leads/ImportLeadsModal';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronRight,
  Loader2,
  Plus,
  FileSpreadsheet
} from 'lucide-react';

interface UserDashboardViewProps {
  userId: string;
  business: Business;
  onNavigateToLeads: () => void;
  onOpenAddLead: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  userId,
  business,
  onNavigateToLeads,
  onOpenAddLead,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<Lead | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    const { data } = await getDashboardMetrics(userId);
    setMetrics(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();

    // Attach Realtime listener for live analytics auto-updates
    const channel = supabase
      .channel(`realtime-dashboard-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${userId}` },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: 'Overdue' | 'Due Today' | 'Upcoming') => {
    switch (status) {
      case 'Overdue':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80 font-bold';
      case 'Due Today':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80 font-bold';
      case 'Upcoming':
        return 'bg-slate-900 text-slate-300 border-slate-700 font-semibold';
    }
  };

  const getStageBadge = (stage: string) => {
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

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading Real-Time Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Quick Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-extrabold text-white">Daily Focus & Live Analytics</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Import Leads</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddLead}
            className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 1. TOP METRICS GRID (4 COMPACT CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Total Leads</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{metrics?.totalLeads || 0}</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">Active Pipeline</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Follow-ups Today</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{metrics?.followupsDueToday || 0}</span>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50">Action Needed</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Overdue Reminders</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold ${(metrics?.overdueFollowups || 0) > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {metrics?.overdueFollowups || 0}
            </span>
            <span className="text-[10px] text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/50">Urgent</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium block">Deals Closed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{metrics?.closedDeals || 0}</span>
            <span className="text-[10px] text-purple-400 font-semibold bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800/50">Closed Won</span>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S ACTION PRIORITIES (HERO FOCUS LIST) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Priority Follow-up Actions</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            {metrics?.priorityItems.length || 0} Tasks Queued
          </span>
        </div>

        {!metrics?.priorityItems.length ? (
          <div className="text-center py-10 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No urgent or scheduled follow-ups remaining for today. Great job staying responsive.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLeads}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>View All Leads Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.priorityItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                    {item.lead.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {item.lead.full_name}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getStageBadge(item.lead.stage)}`}>
                        {item.lead.stage}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono text-slate-300">{item.lead.whatsapp_number}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(item.followupDate)}
                      </span>
                    </div>

                    {item.lead.notes && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        "{item.lead.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadForWhatsApp(item.lead)}
                    className="flex-1 sm:flex-initial py-2 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. UPCOMING SCHEDULE & QUICK WORKSPACE ACCESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Upcoming This Week */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming This Week</span>
            </h3>
            <span className="text-xs text-slate-400">{metrics?.upcomingItems.length || 0} scheduled</span>
          </div>

          {!metrics?.upcomingItems.length ? (
            <p className="text-xs text-slate-400 py-4 text-center">No upcoming follow-ups scheduled for later this week.</p>
          ) : (
            <div className="space-y-2.5">
              {metrics.upcomingItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.lead.full_name}</div>
                    <div className="text-[10px] text-slate-400">{item.lead.stage}</div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 font-mono">
                    {formatDate(item.followupDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Workspace Switcher */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pipeline & Lead Workspace</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filter leads by stage, search contact numbers, import bulk databases, or update notes anytime.
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={onNavigateToLeads}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Open Full Leads Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* AI WHATSAPP MESSAGE PREVIEW MODAL */}
      {selectedLeadForWhatsApp && (
        <AIMessagePreviewModal
          lead={selectedLeadForWhatsApp}
          business={business}
          isOpen={!!selectedLeadForWhatsApp}
          onClose={() => setSelectedLeadForWhatsApp(null)}
        />
      )}

      {/* IMPORT LEADS MODAL */}
      <ImportLeadsModal
        businessId={business.id}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchMetrics}
      />

    </div>
  );
};
