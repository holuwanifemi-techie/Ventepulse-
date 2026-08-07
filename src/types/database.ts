export type BusinessType =
  | 'Real Estate'
  | 'Car Dealership'
  | 'High-Ticket Closer'
  | 'Insurance'
  | 'Financial Services'
  | 'Other';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  created_at: string;
  updated_at: string;
}

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Negotiating'
  | 'Closed Won'
  | 'Closed Lost';

export interface Lead {
  id: string;
  user_id: string;
  business_id: string;
  full_name: string;
  whatsapp_number: string;
  email?: string;
  company?: string;
  lead_source?: string;
  stage: LeadStage;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export interface Followup {
  id: string;
  lead_id: string;
  user_id: string;
  sequence_day: 1 | 3 | 7;
  scheduled_for: string;
  status: FollowupStatus;
  ai_message_draft?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  totalLeads: number;
  registrationsToday: number;
  businessTypeBreakdown: Record<string, number>;
  recentUsers: {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
    business_name?: string;
    business_type?: string;
    leads_count: number;
  }[];
}
