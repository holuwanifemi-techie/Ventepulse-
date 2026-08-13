import { supabase } from './supabase';
import { Lead, Followup, LeadStage } from '../types/database';

export interface DashboardMetrics {
  // 1. Priority Summary
  followupsDueToday: number;
  overdueFollowups: number;
  completedThisWeek: number;

  // 2. Today's Priority Items
  priorityItems: {
    id: string;
    lead: Lead;
    followupDate: string;
    status: 'Overdue' | 'Due Today' | 'Upcoming';
    lastInteraction: string;
  }[];

  // 3. Upcoming Follow-ups (Next 7 days)
  upcomingItems: {
    id: string;
    lead: Lead;
    followupDate: string;
    stage: LeadStage;
  }[];

  // 4. Performance Metrics
  totalLeads: number;
  activeLeads: number;
  closedDeals: number;
  lostDeals: number;
  completionRate: number;

  // 5. Analytics Charts Data
  pipelineData: { stage: LeadStage; count: number; percentage: number }[];

  // 6. Recent Activity Log
  recentActivity: {
    id: string;
    type: 'new_lead' | 'completed_followup' | 'closed_deal' | 'imported_lead';
    title: string;
    timestamp: string;
  }[];
}

/**
 * Fetch and calculate all action-focused dashboard analytics for a given user.
 */
export async function getDashboardMetrics(userId: string): Promise<{ data: DashboardMetrics | null; error: Error | null }> {
  try {
    // 1. Fetch user's leads
    const { data: leads, error: leadsErr } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (leadsErr) throw new Error(leadsErr.message);

    const allLeads = leads || [];
    const totalLeads = allLeads.length;

    // Active vs Closed
    const activeLeads = allLeads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage)).length;
    const closedDeals = allLeads.filter(l => l.stage === 'Closed Won').length;
    const lostDeals = allLeads.filter(l => l.stage === 'Closed Lost').length;

    // 2. Fetch follow-up records
    const { data: followups } = await supabase
      .from('followups')
      .select('*')
      .eq('user_id', userId);

    const allFollowups: Followup[] = followups || [];
    const followupMap = new Map<string, string>();
    allFollowups.forEach(f => {
      if (f.lead_id && f.scheduled_for) {
        followupMap.set(f.lead_id, f.scheduled_for);
      }
    });

    // Calculate dates
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

    const priorityItemsList: DashboardMetrics['priorityItems'] = [];
    const upcomingItemsList: DashboardMetrics['upcomingItems'] = [];

    let overdueCount = 0;
    let dueTodayCount = 0;
    let completedThisWeekCount = 0;

    // Process leads into action items
    allLeads.forEach((lead) => {
      const isClosed = lead.stage === 'Closed Won' || lead.stage === 'Closed Lost';

      // Determine follow-up date: prefer explicit next_followup_date, then followupMap, then fallback created_at math
      const targetDate = lead.next_followup_date || followupMap.get(lead.id);
      let dueDateStr = '';
      if (targetDate) {
        dueDateStr = targetDate.split('T')[0];
      } else {
        const createdDate = new Date(lead.created_at);
        let targetDays = 1;
        if (lead.stage === 'Contacted') targetDays = 3;
        if (lead.stage === 'Interested') targetDays = 7;
        if (lead.stage === 'Negotiating') targetDays = 2;
        const dueDate = new Date(createdDate.getTime() + targetDays * 24 * 60 * 60 * 1000);
        dueDateStr = dueDate.toISOString().split('T')[0];
      }

      if (!isClosed && dueDateStr) {
        if (dueDateStr < todayStr) {
          overdueCount++;
          priorityItemsList.push({
            id: lead.id,
            lead,
            followupDate: dueDateStr,
            status: 'Overdue',
            lastInteraction: lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'Initial Contact',
          });
        } else if (dueDateStr === todayStr) {
          dueTodayCount++;
          priorityItemsList.push({
            id: lead.id,
            lead,
            followupDate: dueDateStr,
            status: 'Due Today',
            lastInteraction: lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'Recent Inquiry',
          });
        } else if (dueDateStr > todayStr && dueDateStr <= sevenDaysLaterStr) {
          upcomingItemsList.push({
            id: lead.id,
            lead,
            followupDate: dueDateStr,
            stage: lead.stage,
          });

          // Add to priority list if upcoming within next 2 days
          const diffDays = Math.ceil((new Date(dueDateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 2) {
            priorityItemsList.push({
              id: lead.id,
              lead,
              followupDate: dueDateStr,
              status: 'Upcoming',
              lastInteraction: 'Scheduled Follow-up',
            });
          }
        }
      }
    });

    // Count completed followups this week
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    completedThisWeekCount = allFollowups.filter(f => f.status === 'completed' && new Date(f.updated_at) >= oneWeekAgo).length;

    if (completedThisWeekCount === 0 && closedDeals > 0) {
      completedThisWeekCount = closedDeals;
    }

    const completionRate = (totalLeads > 0)
      ? Math.round(((completedThisWeekCount + closedDeals) / (totalLeads + 1)) * 100)
      : 0;

    // Sort priority items by urgency (Overdue -> Due Today -> Upcoming)
    priorityItemsList.sort((a, b) => {
      const rank = { 'Overdue': 1, 'Due Today': 2, 'Upcoming': 3 };
      return rank[a.status] - rank[b.status];
    });

    // 3. Pipeline Breakdown
    const stages: LeadStage[] = ['New', 'Contacted', 'Interested', 'Negotiating', 'Closed Won', 'Closed Lost'];
    const pipelineData = stages.map((stage) => {
      const count = allLeads.filter(l => l.stage === stage).length;
      const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
      return { stage, count, percentage };
    });

    // 4. Recent Activity Stream
    const recentActivityList: DashboardMetrics['recentActivity'] = [];

    allLeads.slice(0, 5).forEach((lead) => {
      if (lead.stage === 'Closed Won') {
        recentActivityList.push({
          id: `closed-${lead.id}`,
          type: 'closed_deal',
          title: `Closed Won deal with ${lead.full_name}`,
          timestamp: lead.updated_at || lead.created_at,
        });
      } else {
        recentActivityList.push({
          id: `new-${lead.id}`,
          type: 'new_lead',
          title: `Added new lead "${lead.full_name}" (${lead.stage})`,
          timestamp: lead.created_at,
        });
      }
    });

    if (recentActivityList.length === 0) {
      recentActivityList.push({
        id: 'welcome',
        type: 'new_lead',
        title: 'Workspace initialized. Ready to capture leads.',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      data: {
        followupsDueToday: dueTodayCount,
        overdueFollowups: overdueCount,
        completedThisWeek: completedThisWeekCount,
        priorityItems: priorityItemsList,
        upcomingItems: upcomingItemsList,
        totalLeads,
        activeLeads,
        closedDeals,
        lostDeals,
        completionRate: Math.min(completionRate, 100),
        pipelineData,
        recentActivity: recentActivityList,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to calculate dashboard metrics') };
  }
}
