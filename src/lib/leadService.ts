import { supabase } from './supabase';
import { Lead, LeadStage } from '../types/database';

export interface CreateLeadPayload {
  user_id: string;
  business_id: string;
  full_name: string;
  whatsapp_number: string;
  email?: string;
  company?: string;
  lead_source?: string;
  stage: LeadStage;
  notes?: string;
}

export interface UpdateLeadPayload {
  full_name?: string;
  whatsapp_number?: string;
  email?: string;
  company?: string;
  lead_source?: string;
  stage?: LeadStage;
  notes?: string;
}

/**
 * Fetch all leads for a specific user, sorted by recently added (created_at desc).
 */
export async function getLeads(
  userId: string,
  searchQuery?: string,
  stageFilter?: string
): Promise<{ data: Lead[]; error: Error | null }> {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (stageFilter && stageFilter !== 'All') {
      query = query.eq('stage', stageFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      query = query.or(`full_name.ilike.${q},whatsapp_number.ilike.${q},company.ilike.${q},email.ilike.${q}`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data as Lead[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Failed to fetch leads') };
  }
}

/**
 * Fetch a single lead by ID.
 */
export async function getLeadById(leadId: string): Promise<{ data: Lead | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Lead, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch lead details') };
  }
}

/**
 * Create a new lead in Supabase.
 */
export async function createLead(payload: CreateLeadPayload): Promise<{ data: Lead | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: payload.user_id,
        business_id: payload.business_id,
        full_name: payload.full_name,
        whatsapp_number: payload.whatsapp_number,
        email: payload.email || null,
        company: payload.company || null,
        lead_source: payload.lead_source || 'Direct',
        stage: payload.stage,
        notes: payload.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Lead, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to create lead') };
  }
}

/**
 * Update an existing lead.
 */
export async function updateLead(
  leadId: string,
  payload: UpdateLeadPayload
): Promise<{ data: Lead | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Lead, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to update lead') };
  }
}

/**
 * Delete a lead.
 */
export async function deleteLead(leadId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete lead') };
  }
}
