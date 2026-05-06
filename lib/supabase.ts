import { createClient } from "@supabase/supabase-js";

// 빌드 타임에 env 변수가 없어도 createClient 가 throw 하지 않도록 fallback 사용.
// 실제 요청은 Vercel 대시보드에 설정된 실값으로 처리됨.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
);
