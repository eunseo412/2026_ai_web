import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdinvpuamgfpygyotjts.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nC7QKD5OkNaLzDrXMkk8Pg_yr2bihaX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
