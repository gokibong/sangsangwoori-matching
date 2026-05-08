import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Senior = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
};

type JobInfo = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type MatchRow = {
  id: string;
  score: number;
  status: string;
  jobs: JobInfo | null;
};

function scoreBadge(score: number): { label: string; cls: string } {
  if (score === 6)
    return { label: `${score}점 · 매우 적합`, cls: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  if (score >= 4)
    return { label: `${score}점 · 적합`, cls: "bg-green-100 text-green-800 border-green-300" };
  return { label: `${score}점 · 보통`, cls: "bg-gray-100 text-gray-700 border-gray-300" };
}

export const metadata = { title: "추천 목록 | 상상우리" };

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id } = await searchParams;

  const { data: seniorsData } = await supabase
    .from("seniors")
    .select("id, name, region, desired_job, career_years")
    .order("name");

  const seniors = (seniorsData ?? []) as Senior[];

  /* ── senior 미선택: 전체 목록 ── */
  if (!senior_id) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">매칭 추천 목록</h1>
        <p className="text-xl text-gray-500 mb-8">
          시니어를 선택하면 맞춤 추천 일자리를 확인할 수 있습니다.
        </p>

        {seniors.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-10 text-center">
            <p className="text-xl text-gray-500">등록된 시니어가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seniors.map((s) => (
              <Link key={s.id} href={`/recommendations?senior_id=${s.id}`}>
                <Card className="h-full border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="py-5 px-5">
                    <p className="text-xl font-bold text-gray-900">{s.name}</p>
                    <p className="text-lg text-gray-500 mt-1">
                      {s.region} · {s.desired_job}
                    </p>
                    <p className="text-base text-gray-400 mt-1">경력 {s.career_years}년</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── senior 선택됨: 사이드바 + 추천 결과 ── */
  const [{ data: senior }, { data: rawMatches }] = await Promise.all([
    supabase
      .from("seniors")
      .select("name, region, desired_job")
      .eq("id", senior_id)
      .single(),
    supabase
      .from("matches")
      .select("id, score, status, jobs(id, title, region, job_type, required_career)")
      .eq("senior_id", senior_id)
      .order("score", { ascending: false }),
  ]);

  const matches = (rawMatches ?? []) as unknown as MatchRow[];
  const validMatches = matches.filter((m) => m.score > 0 && m.jobs !== null);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 왼쪽 사이드바: 시니어 목록 */}
      <aside className="lg:w-56 shrink-0">
        <h2 className="text-lg font-bold text-gray-700 mb-3">시니어 목록</h2>
        <div className="flex flex-row flex-wrap lg:flex-col gap-2">
          {seniors.map((s) => {
            const isActive = s.id === senior_id;
            return (
              <Link
                key={s.id}
                href={`/recommendations?senior_id=${s.id}`}
                className={`rounded-lg border px-4 py-3 transition-all text-left ${
                  isActive
                    ? "border-blue-400 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <p className={`text-base font-semibold ${isActive ? "text-blue-800" : "text-gray-800"}`}>
                  {s.name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {s.region} · {s.desired_job}
                </p>
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          <Link href="/admin" className="text-base font-medium text-blue-600 hover:underline">
            ← 대시보드
          </Link>
        </div>
      </aside>

      {/* 오른쪽: 추천 결과 */}
      <div className="flex-1 min-w-0">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {senior ? `${senior.name} 님께 맞는 일자리` : "매칭 추천 목록"}
        </h1>

        {senior ? (
          <p className="text-xl text-gray-600 mb-8">
            {senior.region} · {senior.desired_job} · 담당자가 선별한 추천 목록입니다.
          </p>
        ) : (
          <p className="mb-8 text-xl text-red-600">시니어 정보를 찾을 수 없습니다.</p>
        )}

        {validMatches.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-10 text-center">
            <p className="text-xl font-semibold text-gray-600">현재 매칭되는 일자리가 없습니다.</p>
            <p className="mt-3 text-lg text-gray-400">담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {validMatches.map((m, i) => {
              const job = m.jobs!;
              const { label, cls } = scoreBadge(m.score);
              return (
                <Card key={m.id} className="border border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl">
                      #{i + 1}&nbsp;{job.title}
                    </CardTitle>
                    <Badge className={`border px-3 py-1 text-base ${cls}`}>{label}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-6 text-lg text-gray-700">
                    <span>📍 {job.region}</span>
                    <span>💼 {job.job_type}</span>
                    <span>경력 {job.required_career}년 이상</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
