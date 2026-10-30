import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

if (!ENV.SUPABASE_URL) {
  console.warn('⚠️ Warning: SUPABASE_URL is not set in environment.');
}

const key = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(ENV.SUPABASE_URL, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log(`🔌 Supabase Admin Client initialized for URL: ${ENV.SUPABASE_URL}`);
