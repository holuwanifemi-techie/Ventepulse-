import { supabase } from './supabase';
import { Business, BusinessType } from '../types/database';

/**
 * Fetch the business profile for a specific user ID.
 */
export async function getBusinessProfile(userId: string): Promise<{ data: Business | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Business | null, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch business profile') };
  }
}

/**
 * Create or save a new business profile in Supabase.
 */
export async function createBusinessProfile(
  userId: string,
  businessName: string,
  businessType: BusinessType
): Promise<{ data: Business | null; error: Error | null }> {
  try {
    // 1. Ensure user profile exists in public.profiles table
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          },
          { onConflict: 'id' }
        );
    }

    // 2. Insert business record into public.businesses
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        user_id: userId,
        business_name: businessName,
        business_type: businessType,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Business, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to create business profile') };
  }
}
