import { supabase } from './supabase';
import { Lead, LeadStage } from '../types/database';

export interface CreateLeadPayload {
  user_id: string;
  business_id: string;
  full_name: string;
  whatsapp_number: string;
  email?: string;
  lead_source?: string;
  stage: LeadStage;
  next_followup_date?: string;
  notes?: string;
}

export interface UpdateLeadPayload {
  full_name?: string;
  whatsapp_number?: string;
  email?: string;
  lead_source?: string;
  stage?: LeadStage;
  next_followup_date?: string;
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
      query = query.or(`full_name.ilike.${q},whatsapp_number.ilike.${q},email.ilike.${q}`);
    }

    const { data: leadsData, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    // Also fetch matching followups to merge next_followup_date if schema column is absent on leads
    let followupMap = new Map<string, string>();
    try {
      const { data: followups } = await supabase
        .from('followups')
        .select('lead_id, scheduled_for')
        .eq('user_id', userId);

      if (followups) {
        followups.forEach((f: any) => {
          if (f.lead_id && f.scheduled_for) {
            followupMap.set(f.lead_id, f.scheduled_for);
          }
        });
      }
    } catch (fErr) {
      console.warn('Could not fetch followups map:', fErr);
    }

    const mergedLeads: Lead[] = ((leadsData as Lead[]) || []).map(lead => ({
      ...lead,
      next_followup_date: lead.next_followup_date || followupMap.get(lead.id),
    }));

    return { data: mergedLeads, error: null };
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

    const leadObj = data as Lead;

    if (!leadObj.next_followup_date) {
      try {
        const { data: fData } = await supabase
          .from('followups')
          .select('scheduled_for')
          .eq('lead_id', leadId)
          .maybeSingle();

        if (fData?.scheduled_for) {
          leadObj.next_followup_date = fData.scheduled_for;
        }
      } catch {
        // ignore
      }
    }

    return { data: leadObj, error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to fetch lead details') };
  }
}

/**
 * Create a new lead in Supabase.
 */
export async function createLead(payload: CreateLeadPayload): Promise<{ data: Lead | null; error: Error | null }> {
  try {
    const insertPayload: any = {
      user_id: payload.user_id,
      business_id: payload.business_id,
      full_name: payload.full_name,
      whatsapp_number: payload.whatsapp_number,
      email: payload.email || null,
      lead_source: payload.lead_source || 'Direct',
      stage: payload.stage,
      notes: payload.notes || null,
    };

    if (payload.next_followup_date) {
      insertPayload.next_followup_date = payload.next_followup_date;
    }

    let { data, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if next_followup_date column isn't in PostgREST schema cache yet
    if (error && (error.message.includes('next_followup_date') || error.message.includes('schema cache'))) {
      console.warn('[createLead] next_followup_date column missing in PostgREST schema cache. Inserting lead without column.');
      delete insertPayload.next_followup_date;
      const retryResult = await supabase
        .from('leads')
        .insert(insertPayload)
        .select()
        .single();

      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const createdLead = data as Lead;

    // Save corresponding follow-up record if next_followup_date is provided
    if (payload.next_followup_date) {
      createdLead.next_followup_date = payload.next_followup_date;
      try {
        await supabase.from('followups').insert({
          lead_id: createdLead.id,
          user_id: payload.user_id,
          sequence_day: 1,
          scheduled_for: payload.next_followup_date,
          status: 'pending',
        });
      } catch (fErr) {
        console.warn('Failed to insert followup record:', fErr);
      }
    }

    return { data: createdLead, error: null };
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
    const updatePayload: any = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)
      .select()
      .single();

    // Fallback if next_followup_date column isn't in PostgREST schema cache yet
    if (error && (error.message.includes('next_followup_date') || error.message.includes('schema cache'))) {
      console.warn('[updateLead] next_followup_date column missing in PostgREST schema cache. Updating lead without column.');
      delete updatePayload.next_followup_date;
      const retryResult = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)
        .select()
        .single();

      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const updatedLead = data as Lead;

    // Sync followup record if next_followup_date is updated
    if (payload.next_followup_date) {
      updatedLead.next_followup_date = payload.next_followup_date;
      try {
        const { data: existingFollowup } = await supabase
          .from('followups')
          .select('id')
          .eq('lead_id', leadId)
          .maybeSingle();

        if (existingFollowup) {
          await supabase
            .from('followups')
            .update({ scheduled_for: payload.next_followup_date, status: 'pending' })
            .eq('id', existingFollowup.id);
        } else {
          await supabase.from('followups').insert({
            lead_id: leadId,
            user_id: updatedLead.user_id,
            sequence_day: 1,
            scheduled_for: payload.next_followup_date,
            status: 'pending',
          });
        }
      } catch (fErr) {
        console.warn('Failed to update followup record:', fErr);
      }
    }

    return { data: updatedLead, error: null };
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
