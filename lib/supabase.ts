
import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
// In development: values from .env.local
// In production (Vercel): values from Vercel Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyagurflukbuawgbcuil.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YWd1cmZsdWtidWF3Z2JjdWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjg3OTEsImV4cCI6MjA3ODgwNDc5MX0.KK8bvBL_EDILPIRZQNdW3reSOXvnyEZzZ0fkVgCiw4I';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check .env.local or Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
