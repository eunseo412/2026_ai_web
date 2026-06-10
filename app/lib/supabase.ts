import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
// 환경변수 미설정 시 빌드는 통과하되, 런타임에 오류 메시지를 출력합니다.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdinvpuamgfpygyotjts.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nC7QKD5OkNaLzDrXMkk8Pg_yr2bihaX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
