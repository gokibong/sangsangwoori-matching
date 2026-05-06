import { createClient } from "@supabase/supabase-js";

// .trim(): Vercel 환경변수 붙여넣기 시 섞이는 개행·공백 제거 (Headers Invalid value 방지)
// fallback: 빌드 타임에 env 미설정 시 createClient throw 방지
export const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key").trim()
);
