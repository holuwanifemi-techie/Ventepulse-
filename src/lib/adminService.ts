import { supabase } from './supabase';
import { AdminPlatformStats } from '../types/database';

export const ADMIN_EMAIL = 'followupassistant13@gmail.com';

/**
 * Verify if the logged in user is the single shared Administrator account.
 */
export async function checkIsAdmin(_userId: string, email?: string): Promise<boolean> {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Permanently delete a registered user and all associated business data & leads.
 */
export async function deleteUserAdmin(targetUserId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return { error: new Error('Unauthorized access. Admin privileges required.') };
    }

    // Delete user from public.profiles (Cascades to businesses, leads, followups)
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUserId);

    if (profileErr) {
      return { error: new Error(profileErr.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete user profile') };
  }
}

/**
 * Fetch platform growth, user registrations, and metrics for Admin Dashboard.
 */
export async function getAdminPlatformStats(): Promise<{ data: AdminPlatformStats | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Strict Admin Authorization Check
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return { data: null, error: new Error('Unauthorized access. Admin privileges required.') };
    }

    // 1. Fetch total users (profiles)
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false });

    if (profilesErr) throw new Error(profilesErr.message);

    // 2. Fetch total businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, user_id, business_name, business_type');

    // 3. Fetch total leads
    const { data: leads } = await supabase
      .from('leads')
      .select('id, user_id');

    const totalUsers = profiles?.length || 0;
    const totalBusinesses = businesses?.length || 0;
    const totalLeads = leads?.length || 0;

    // Calculate Registrations Today
    const todayStr = new Date().toISOString().split('T')[0];
    const registrationsToday = profiles?.filter(p => p.created_at?.startsWith(todayStr)).length || 0;

    // Calculate Business Type Breakdown
    const businessTypeBreakdown: Record<string, number> = {
      'Real Estate': 0,
      'Car Dealership': 0,
      'High-Ticket Closer': 0,
      'Insurance': 0,
      'Financial Services': 0,
      'Other': 0,
    };

    businesses?.forEach(b => {
      if (b.business_type && businessTypeBreakdown[b.business_type] !== undefined) {
        businessTypeBreakdown[b.business_type] += 1;
      } else if (b.business_type) {
        businessTypeBreakdown['Other'] = (businessTypeBreakdown['Other'] || 0) + 1;
      }
    });

    // Map Recent Users with their Business Profile & Lead Counts
    const businessMap = new Map(businesses?.map(b => [b.user_id, b]) || []);
    
    // Count leads per user
    const leadCountMap = new Map<string, number>();
    leads?.forEach(l => {
      leadCountMap.set(l.user_id, (leadCountMap.get(l.user_id) || 0) + 1);
    });

    const recentUsers = (profiles || []).slice(0, 20).map(p => {
      const b = businessMap.get(p.id);
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        business_name: b?.business_name,
        business_type: b?.business_type,
        leads_count: leadCountMap.get(p.id) || 0,
      };
    });

    return {
      data: {
        totalUsers,
        totalBusinesses,
        totalLeads,
        registrationsToday,
        businessTypeBreakdown,
        recentUsers,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch admin stats') };
  }
}
