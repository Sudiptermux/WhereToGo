import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these with your actual Supabase project credentials.
// For security, in a production environment, these should be handled 
// via environment variables or a secure configuration service.
const SUPABASE_URL = 'https://njjaasptelgqozpnjfxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamFhc3B0ZWxncW96cG5qZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzQ1MTksImV4cCI6MjA5MjExMDUxOX0.FjWvRNLaFeK85kHfqkJp3V6GW-s-bk1pEhzctLGC_rc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
