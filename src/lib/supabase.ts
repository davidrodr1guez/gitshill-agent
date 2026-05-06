import { createClient } from '@supabase/supabase-js';

const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
const keyEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = (urlEnv && urlEnv.length > 5 && urlEnv !== "undefined") ? urlEnv : 'https://placeholder.supabase.co';
const supabaseServiceKey = (keyEnv && keyEnv.length > 5 && keyEnv !== "undefined") ? keyEnv : 'placeholder';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  }
});
