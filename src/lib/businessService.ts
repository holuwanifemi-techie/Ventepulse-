import { supabase } from './supabase';
import { Business, BusinessType } from '../types/database';

const PREDEFINED_TYPES: BusinessType[] = [
  'Real Estate',
  'Car Dealership',
  'High-Ticket Closer',
  'Insurance',
  'Financial Services',
  'Other',
];

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

    if (!data) {
      return { data: null, error: null };
    }

    const business = data as Business;
    
    // If business_type is 'Other' and custom_business_type is set, format business_type for UI display
    if (business.business_type === 'Other' && business.custom_business_type) {
      business.business_type = business.custom_business_type;
    }

    return { data: business, error: null };
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
  businessType: BusinessType | string,
  customBusinessType?: string
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

    // Determine primary type to store in database
    const isPredefined = PREDEFINED_TYPES.includes(businessType as BusinessType) && businessType !== 'Other';
    const primaryType = isPredefined ? businessType : 'Other';
    const customType = !isPredefined ? (customBusinessType?.trim() || (businessType !== 'Other' ? String(businessType) : '')) : undefined;

    const insertPayload: any = {
      user_id: userId,
      business_name: businessName,
      business_type: primaryType,
    };

    if (customType) {
      insertPayload.custom_business_type = customType;
    }

    let { data, error } = await supabase
      .from('businesses')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if custom_business_type column is missing from PostgREST schema cache yet
    if (error && (error.message.includes('custom_business_type') || error.message.includes('schema cache'))) {
      console.warn('[createBusinessProfile] custom_business_type column not in PostgREST cache yet, inserting without explicit custom column');
      delete insertPayload.custom_business_type;
      const retryResult = await supabase
        .from('businesses')
        .insert(insertPayload)
        .select()
        .single();

      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const createdBusiness = data as Business;
    if (customType) {
      createdBusiness.custom_business_type = customType;
      createdBusiness.business_type = customType;
    }

    return { data: createdBusiness, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to create business profile') };
  }
}
