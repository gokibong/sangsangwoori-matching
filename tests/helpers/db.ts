import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.'
  );
}

export const supabase = createClient(url, key);

export async function resetDb() {
  // FK 제약으로 matches → seniors/jobs 순서로 삭제
  await supabase.from('matches').delete().not('id', 'is', null);
  await supabase.from('seniors').delete().not('id', 'is', null);
  await supabase.from('jobs').delete().not('id', 'is', null);
}

export async function insertJob(params: {
  title: string;
  region: string;
  job_type: string;
  required_career: number;
}) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(params)
    .select('id')
    .single();
  if (error) throw new Error(`insertJob 실패: ${error.message}`);
  return data.id as string;
}

export async function getSeniorByName(name: string) {
  const { data } = await supabase
    .from('seniors')
    .select('id')
    .eq('name', name)
    .maybeSingle();
  return data as { id: string } | null;
}

export async function countSeniors() {
  const { count, error } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
