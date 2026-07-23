import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

let userPromise: Promise<any> | null = null;

export const getUserSafe = async () => {
  if (!userPromise) {
    userPromise = supabase.auth.getUser().catch(err => {
      userPromise = null;
      return { data: { user: null }, error: err };
    });
  }
  return userPromise;
};

supabase.auth.onAuthStateChange(() => {
  userPromise = null;
});
