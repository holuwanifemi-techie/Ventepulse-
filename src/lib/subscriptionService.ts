import { supabase } from './supabase';
import { checkIsAdmin } from './adminService';
import { UserEffectivePlan, SubscriptionPlan } from '../types/database';

export const BACHS_CHECKOUT_LINKS = {
  pro_100: 'https://checkout.bachs.io/pay/pl_c9fd4cdff83f',
  pro_500: 'https://checkout.bachs.io/pay/pl_781fc6f2fc90',
} as const;

/**
 * Generate official Bachs checkout URL with customer attribution.
 */
export function getBachsCheckoutUrl(
  plan: 'pro_100' | 'pro_500',
  userEmail: string,
  userId: string
): string {
  const baseUrl = BACHS_CHECKOUT_LINKS[plan];
  const params = new URLSearchParams();
  if (userEmail) params.append('email', userEmail.trim());
  if (userId) params.append('client_reference_id', userId);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Fetch the user's active plan, lead limit, and current lead count.
 * Leverages the server-side PostgreSQL function or falls back to direct query.
 */
export async function getUserPlan(userId: string, email?: string): Promise<{ data: UserEffectivePlan; error: Error | null }> {
  try {
    // 1. Check if user is Administrator / Owner
    const isAdmin = await checkIsAdmin(userId, email);
    if (isAdmin) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        data: {
          role: 'admin',
          plan: 'admin',
          plan_name: 'Administrator Access',
          status: 'active',
          lead_limit: 999999,
          current_leads: count || 0,
          is_pro: true,
          is_admin: true,
          expires_at: null,
        },
        error: null,
      };
    }

    // 2. Try calling RPC get_effective_user_plan
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_effective_user_plan', {
      target_user_id: userId,
    });

    if (!rpcErr && rpcData) {
      return { data: rpcData as UserEffectivePlan, error: null };
    }

    // 3. Fallback: Query public.subscriptions and public.leads manually
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { count: currentLeadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const leadCount = currentLeadsCount || 0;
    const now = new Date();

    if (sub) {
      const isExpired = sub.current_period_end ? new Date(sub.current_period_end) <= now : false;

      if (sub.plan === 'pro_500' && sub.status === 'active' && !isExpired) {
        return {
          data: {
            role: 'user',
            plan: 'pro_500',
            plan_name: 'VentePulse Pro 500',
            status: 'active',
            lead_limit: 500,
            current_leads: leadCount,
            is_pro: true,
            is_admin: false,
            expires_at: sub.current_period_end,
          },
          error: null,
        };
      }

      if (sub.plan === 'pro_100' && sub.status === 'active' && !isExpired) {
        return {
          data: {
            role: 'user',
            plan: 'pro_100',
            plan_name: 'VentePulse Pro 100',
            status: 'active',
            lead_limit: 100,
            current_leads: leadCount,
            is_pro: true,
            is_admin: false,
            expires_at: sub.current_period_end,
          },
          error: null,
        };
      }

      if (isExpired) {
        return {
          data: {
            role: 'user',
            plan: 'free',
            plan_name: 'VentePulse Pro Expired',
            status: 'expired',
            lead_limit: 10,
            current_leads: leadCount,
            is_pro: false,
            is_admin: false,
            expires_at: sub.current_period_end,
          },
          error: null,
        };
      }
    }

    // Default Free Tier
    return {
      data: {
        role: 'user',
        plan: 'free',
        plan_name: 'Free',
        status: 'active',
        lead_limit: 10,
        current_leads: leadCount,
        is_pro: false,
        is_admin: false,
        expires_at: null,
      },
      error: null,
    };
  } catch (err: any) {
    return {
      data: {
        role: 'user',
        plan: 'free',
        plan_name: 'Free',
        status: 'active',
        lead_limit: 10,
        current_leads: 0,
        is_pro: false,
        is_admin: false,
        expires_at: null,
      },
      error: new Error(err.message || 'Failed to fetch user subscription plan'),
    };
  }
}

/**
 * Check if the user is allowed to create another lead under their current plan.
 */
export async function checkCanCreateLead(userId: string, email?: string): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
  planName: string;
  plan: SubscriptionPlan;
  isPro: boolean;
}> {
  const { data } = await getUserPlan(userId, email);
  if (data.is_admin) {
    return {
      allowed: true,
      currentCount: data.current_leads,
      limit: 999999,
      planName: data.plan_name,
      plan: data.plan,
      isPro: true,
    };
  }

  const allowed = data.current_leads < data.lead_limit;
  return {
    allowed,
    currentCount: data.current_leads,
    limit: data.lead_limit,
    planName: data.plan_name,
    plan: data.plan,
    isPro: data.is_pro,
  };
}

/**
 * Record a verified payment and upgrade subscription.
 */
export async function activateSubscriptionFromPayment(
  userId: string,
  plan: 'pro_100' | 'pro_500',
  reference: string,
  amount: number,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.rpc('activate_subscription', {
      p_user_id: userId,
      p_plan: plan,
      p_reference: reference,
      p_amount: amount,
      p_metadata: metadata || {},
    });

    if (error) throw new Error(error.message);
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: new Error(err.message || 'Failed to activate subscription') };
  }
}
