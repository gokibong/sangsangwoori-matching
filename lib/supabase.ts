import { createClient } from "@supabase/supabase-js";

// || 로 빈 문자열("")도 fallback 처리 (?? 는 빈 문자열 통과)
// .trim() 으로 개행·공백 제거 (Headers Invalid value 방지)
export const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key").trim()
);
