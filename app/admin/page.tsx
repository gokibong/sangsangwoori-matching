"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// ── 상수 ──
const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// ── 타입 ──
type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type MatchRow = { senior_id: string; score: number; status: string };

type SeniorRow = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
};

type MatchStatus = "unmatched" | "pending" | "assigned";

type SeniorWithStats = SeniorRow & {
  bestScore: number;
  matchStatus: MatchStatus;
};

type JobForm = {
  title: string;
  region: string;
  job_type: string;
  required_career: string;
};
type JobFormErrors = Partial<Record<keyof JobForm, string>>;

const EMPTY_JOB_FORM: JobForm = {
  title: "",
  region: "",
  job_type: "",
  required_career: "",
};

// ── 헬퍼 ──
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
      {msg}
    </div>
  );
}

function deriveSeniorStats(
  senior: SeniorRow,
  allMatches: MatchRow[]
): SeniorWithStats {
  const ms = allMatches.filter((m) => m.senior_id === senior.id);
  const bestScore = ms.length > 0 ? Math.max(...ms.map((m) => m.score)) : 0;

  let matchStatus: MatchStatus;
  if (bestScore === 0) {
    matchStatus = "unmatched";
  } else if (ms.some((m) => m.status === "assigned" || m.status === "done")) {
    matchStatus = "assigned";
  } else {
    matchStatus = "pending";
  }
  return { ...senior, bestScore, matchStatus };
}

const STATUS_BADGE: Record<MatchStatus, { label: string; cls: string }> = {
  unmatched: { label: "미매칭",   cls: "bg-red-100    text-red-800    border-red-200"    },
  pending:   { label: "매칭 대기", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  assigned:  { label: "배정 완료", cls: "bg-green-100  text-green-800  border-green-200"  },
};

// ── 컴포넌트 ──
export default function AdminPage() {
  // 대시보드 상태
  const [seniors, setSeniors] = useState<SeniorWithStats[]>([]);
  const [dashLoading, setDashLoading] = useState(true);

  // 일자리 관리 상태
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobForm, setJobForm] = useState<JobForm>(EMPTY_JOB_FORM);
  const [jobErrors, setJobErrors] = useState<JobFormErrors>({});
  const [jobLoading, setJobLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── 데이터 로더 ──
  const loadDashboard = async () => {
    setDashLoading(true);
    const [{ data: sData }, { data: mData }] = await Promise.all([
      supabase
        .from("seniors")
        .select("id, name, region, desired_job, career_years")
        .order("created_at", { ascending: false }),
      supabase.from("matches").select("senior_id, score, status"),
    ]);
    const allMatches = (mData ?? []) as MatchRow[];
    setSeniors(
      ((sData ?? []) as SeniorRow[]).map((s) => deriveSeniorStats(s, allMatches))
    );
    setDashLoading(false);
  };

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { setFetchError(error.message); return; }
    setJobs(data ?? []);
  };

  useEffect(() => {
    loadDashboard();
    loadJobs();
  }, []);

  // ── 집계 ──
  const unmatchedCount = seniors.filter((s) => s.matchStatus === "unmatched").length;
  const pendingCount   = seniors.filter((s) => s.matchStatus === "pending").length;
  const assignedCount  = seniors.filter((s) => s.matchStatus === "assigned").length;

  // ── 일자리 폼 핸들러 ──
  const validateJob = (): JobFormErrors => {
    const e: JobFormErrors = {};
    if (!jobForm.title.trim()) e.title    = "공고명을 입력해 주세요.";
    if (!jobForm.region)       e.region   = "지역을 선택해 주세요.";
    if (!jobForm.job_type)     e.job_type = "직종을 선택해 주세요.";
    return e;
  };

  const handleJobChange =
    (key: keyof JobForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setJobForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (jobErrors[key]) setJobErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleJobAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateJob();
    setJobErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setJobLoading(true);
    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        title: jobForm.title.trim(),
        region: jobForm.region,
        job_type: jobForm.job_type,
        required_career: jobForm.required_career ? Number(jobForm.required_career) : 0,
      })
      .select("id")
      .single();

    if (error) {
      setJobErrors({ title: `저장 실패: ${error.message}` });
      setJobLoading(false);
      return;
    }

    // 자동 매칭 재계산
    if (inserted) {
      await supabase.rpc("rematch_job", { p_job_id: inserted.id });
    }

    setJobLoading(false);
    setJobForm(EMPTY_JOB_FORM);
    setJobErrors({});
    await Promise.all([loadJobs(), loadDashboard()]);
  };

  const handleJobDelete = async (id: string) => {
    await supabase.from("jobs").delete().eq("id", id);
    await Promise.all([loadJobs(), loadDashboard()]);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
      <p className="text-lg text-gray-600 mb-10">
        매칭 현황을 한눈에 확인하고 일자리를 관리합니다.
      </p>

      {/* ── 집계 카드 3개 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "미매칭 시니어", count: unmatchedCount, cardCls: "border-red-200    bg-red-50",    numCls: "text-red-700"    },
          { label: "매칭 대기",     count: pendingCount,   cardCls: "border-yellow-200 bg-yellow-50", numCls: "text-yellow-700" },
          { label: "배정 완료",     count: assignedCount,  cardCls: "border-green-200  bg-green-50",  numCls: "text-green-700"  },
        ].map(({ label, count, cardCls, numCls }) => (
          <Card key={label} className={`border-2 shadow-sm ${cardCls}`}>
            <CardContent className="py-6 text-center">
              <p className="text-xl font-semibold text-gray-700 mb-2">{label}</p>
              <p className={`text-5xl font-bold ${numCls}`}>
                {dashLoading ? "…" : count}
              </p>
              <p className="mt-1 text-base text-gray-500">명</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 시니어 목록 테이블 ── */}
      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">시니어 매칭 현황</h2>
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            {dashLoading ? (
              <p className="py-8 text-center text-lg text-gray-400">불러오는 중…</p>
            ) : seniors.length === 0 ? (
              <p className="py-8 text-center text-lg text-gray-400">
                등록된 시니어가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-lg">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-3 pr-4 font-semibold">이름</th>
                      <th className="py-3 pr-4 font-semibold">지역</th>
                      <th className="py-3 pr-4 font-semibold">희망 직종</th>
                      <th className="py-3 pr-4 font-semibold">최고 점수</th>
                      <th className="py-3 pr-4 font-semibold">상태</th>
                      <th className="py-3 font-semibold">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seniors.map((s) => {
                      const badge = STATUS_BADGE[s.matchStatus];
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 pr-4 font-medium">{s.name}</td>
                          <td className="py-3 pr-4">{s.region}</td>
                          <td className="py-3 pr-4">{s.desired_job}</td>
                          <td className="py-3 pr-4">
                            <span className="font-bold text-blue-700">
                              {s.bestScore}
                            </span>
                            <span className="text-gray-400"> / 6</span>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              className={`border px-3 py-1 text-base ${badge.cls}`}
                            >
                              {badge.label}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Link href={`/recommendations?senior_id=${s.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 px-4 text-base"
                              >
                                상세 보기
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── 일자리 관리 ── */}
      <section>
        <h2 className="mb-5 text-2xl font-bold text-gray-800">일자리 관리</h2>

        {/* 추가 폼 */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">새 일자리 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJobAdd} className="space-y-5" noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="job-title"
                  className="block text-lg font-semibold text-gray-800"
                >
                  공고명 *
                </label>
                {jobErrors.title && <ErrorBox msg={jobErrors.title} />}
                <input
                  id="job-title"
                  type="text"
                  value={jobForm.title}
                  onChange={handleJobChange("title")}
                  placeholder="예) 강남 경비원 모집"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label
                    htmlFor="job-region"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    지역 *
                  </label>
                  {jobErrors.region && <ErrorBox msg={jobErrors.region} />}
                  <select
                    id="job-region"
                    value={jobForm.region}
                    onChange={handleJobChange("region")}
                    className={inputClass}
                  >
                    <option value="">-- 선택 --</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="job-type"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    직종 *
                  </label>
                  {jobErrors.job_type && <ErrorBox msg={jobErrors.job_type} />}
                  <select
                    id="job-type"
                    value={jobForm.job_type}
                    onChange={handleJobChange("job_type")}
                    className={inputClass}
                  >
                    <option value="">-- 선택 --</option>
                    {JOB_TYPES.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="job-career"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    요구 경력 (년)
                  </label>
                  <input
                    id="job-career"
                    type="number"
                    min={0}
                    max={50}
                    value={jobForm.required_career}
                    onChange={handleJobChange("required_career")}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={jobLoading}
                className="h-12 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {jobLoading ? "저장 중…" : "일자리 등록"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 일자리 목록 */}
        {fetchError && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-5 py-3 text-base text-red-700">
            불러오기 실패: {fetchError}
          </div>
        )}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              등록된 일자리
              <Badge className="px-3 py-1 text-base">{jobs.length}건</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="py-10 text-center text-lg text-gray-400">
                등록된 일자리가 없습니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-lg">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-3 pr-4 font-semibold">공고명</th>
                      <th className="py-3 pr-4 font-semibold">지역</th>
                      <th className="py-3 pr-4 font-semibold">직종</th>
                      <th className="py-3 pr-4 font-semibold">요구 경력</th>
                      <th className="py-3 font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 pr-4 font-medium">{job.title}</td>
                        <td className="py-3 pr-4">{job.region}</td>
                        <td className="py-3 pr-4">{job.job_type}</td>
                        <td className="py-3 pr-4">{job.required_career}년</td>
                        <td className="py-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-10 px-4 text-base"
                            onClick={() => handleJobDelete(job.id)}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
