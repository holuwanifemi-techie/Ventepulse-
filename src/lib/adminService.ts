import { supabase } from './supabase';
import { AdminPlatformStats } from '../types/database';

export const ADMIN_EMAIL = 'ventepulse@gmail.com';

/**
 * Verify if the logged in user is the single shared Administrator account or marked as admin.
 */
export async function checkIsAdmin(userId: string, email?: string): Promise<boolean> {
  if (!userId) return false;
  
  if (email && email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      if (data.is_admin || data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return true;
      }
    }
  } catch (e) {
    // Ignore error
  }

  return false;
}

/**
 * Permanently delete a registered user and all associated business data & leads.
 */
export async function deleteUserAdmin(targetUserId: string): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: new Error('Unauthorized access. Admin privileges required.') };
    }

    const isAdmin = await checkIsAdmin(user.id, user.email);
    if (!isAdmin) {
      return { error: new Error('Unauthorized access. Admin privileges required.') };
    }

    // 1. Delete associated followups for target user
    await supabase.from('followups').delete().eq('user_id', targetUserId);

    // 2. Delete associated leads for target user
    await supabase.from('leads').delete().eq('user_id', targetUserId);

    // 3. Delete associated business profile for target user
    await supabase.from('businesses').delete().eq('user_id', targetUserId);

    // 4. Delete profile from public.profiles
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

    if (!user) {
      return { data: null, error: new Error('Unauthorized access. Admin privileges required.') };
    }

    const isAdmin = await checkIsAdmin(user.id, user.email);
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized access. Admin privileges required.') };
    }

    // 1. Fetch total users from public.profiles
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, is_admin')
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

    // Map Recent Users with their Business Profile & Lead Counts
    const businessMap = new Map(businesses?.map(b => [b.user_id, b]) || []);
    
    // Count leads per user
    const leadCountMap = new Map<string, number>();
    leads?.forEach(l => {
      leadCountMap.set(l.user_id, (leadCountMap.get(l.user_id) || 0) + 1);
    });

    const recentUsers = (profiles || []).map(p => {
      const b = businessMap.get(p.id);
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name || p.email?.split('@')[0] || 'User',
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
        recentUsers,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch admin stats') };
  }
}
