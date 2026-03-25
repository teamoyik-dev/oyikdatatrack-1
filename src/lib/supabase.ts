import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Missing Supabase credentials in .env file. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
