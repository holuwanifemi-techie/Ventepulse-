import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up URL in case extra paths like /rest/v1/ or trailing slashes were pasted
const supabaseUrl = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn(
    '[Supabase Setup] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env.local. Please update your environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
