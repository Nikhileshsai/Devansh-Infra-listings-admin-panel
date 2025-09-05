import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase credentials directly.
const supabaseUrl = 'https://rutdmehjrfrdxgnmrvvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dGRtZWhqcmZyZHhnbm1ydnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODc4MzIsImV4cCI6MjA3MjU2MzgzMn0.wQ2CTw656aR6Y4Gi6iBuMTUTERcs9En5vj7NlPft7X0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
