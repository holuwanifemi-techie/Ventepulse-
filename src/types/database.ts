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
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
}

export type UserProfile = Profile;

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType | string;
  custom_business_type?: string;
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
  lead_source?: string;
  stage: LeadStage;
  next_followup_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export interface Followup {
  id: string;
  lead_id: string;
  user_id: string;
  due_date?: string;
  scheduled_for?: string;
  status: FollowupStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminPlatformStats {
  totalUsers: number;
  totalBusinesses: number;
  totalLeads: number;
  registrationsToday: number;
  recentUsers: Array<{
    id: string;
    email: string;
    full_name?: string;
    business_name?: string;
    business_type?: string;
    created_at: string;
    leads_count: number;
  }>;
}
