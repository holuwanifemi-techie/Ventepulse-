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
  Layers,
  Activity,
  ChevronRight,
  Loader2,
  RefreshCw,
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
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            {business.business_name}
          </span>
          <h2 className="text-lg font-extrabold text-white">Daily Focus & Live Analytics</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchMetrics}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

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

      {/* ---------------- 1. PRIORITY SUMMARY CARDS (3 CARDS) ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Overdue Follow-ups */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-rose-900/50 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Overdue</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
            {metrics?.overdueFollowups || 0}
          </div>
        </div>

        {/* Follow-ups Due Today */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-amber-900/50 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Due Today</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
            {metrics?.followupsDueToday || 0}
          </div>
        </div>

        {/* Completed This Week */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border border-emerald-900/50 rounded-2xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed This Week</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {metrics?.completedThisWeek || 0}
          </div>
        </div>

      </div>

      {/* ---------------- 2. TODAY'S PRIORITY (ACTION-FOCUSED LIST) ---------------- */}
      <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> Today's Priority
            </h3>
            <p className="text-xs text-slate-400">Sorted by urgency (Overdue → Due Today → Upcoming)</p>
          </div>

          <button
            type="button"
            onClick={onNavigateToLeads}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Leads</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {metrics?.priorityItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">All Caught Up!</div>
            <p className="text-xs text-slate-400">No overdue or pending follow-ups required right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics?.priorityItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/30 rounded-2xl transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Lead Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.lead.full_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStageBadge(item.lead.stage)}`}>
                        {item.lead.stage}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Phone: <strong className="text-slate-200 font-mono">{item.lead.whatsapp_number}</strong></span>
                      <span>Follow-up: <strong className="text-slate-200">{formatDate(item.followupDate)}</strong></span>
                      <span>Last Interaction: <strong className="text-slate-300">{item.lastInteraction}</strong></span>
                    </div>
                  </div>

                  {/* Open WhatsApp Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedLeadForWhatsApp(item.lead)}
                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open WhatsApp</span>
                  </button>
                </div>

                {item.lead.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    "{item.lead.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- 3. UPCOMING FOLLOW-UPS (7 DAYS) ---------------- */}
      <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" /> Upcoming Follow-ups (7 Days)
        </h3>

        {metrics?.upcomingItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No upcoming follow-ups scheduled for the next 7 days.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {metrics?.upcomingItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{item.lead.full_name}</div>
                  <div className="text-[10px] text-slate-400">Scheduled: {formatDate(item.followupDate)}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStageBadge(item.stage)}`}>
                  {item.stage}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- 4. ANALYTICS CHARTS (REMAINING ANALYTICS) ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Live Follow-up Activity */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Live Follow-up Activity
          </h3>
          <p className="text-xs text-slate-400">Completed follow-ups over the last 7 days</p>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
            {metrics?.activityData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-emerald-500/20 rounded-t-lg relative flex items-end justify-center" style={{ height: `${Math.max((d.total / (metrics.totalLeads || 5)) * 100, 15)}%` }}>
                  <div
                    className="w-full bg-emerald-500 rounded-t-lg transition-all"
                    style={{ height: `${(d.completed / (d.total || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Live Lead Pipeline Distribution */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Live Lead Pipeline
          </h3>
          <p className="text-xs text-slate-400">Leads grouped by current stage</p>

          <div className="space-y-3 pt-1">
            {metrics?.pipelineData.map((p) => (
              <div key={p.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{p.stage}</span>
                  <span className="text-slate-400 font-mono">{p.count} leads ({p.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.max(p.percentage, p.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Message Preview Modal Trigger */}
      <AIMessagePreviewModal
        lead={selectedLeadForWhatsApp}
        business={business}
        isOpen={!!selectedLeadForWhatsApp}
        onClose={() => setSelectedLeadForWhatsApp(null)}
      />

      {/* Import Leads Modal Trigger */}
      <ImportLeadsModal
        businessId={business.id}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchMetrics}
      />

    </div>
  );
};
