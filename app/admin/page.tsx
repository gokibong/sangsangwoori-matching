"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
};

type JobForm = {
  title: string;
  region: string;
  job_type: string;
  required_career: string;
};

type Errors = Partial<Record<keyof JobForm, string>>;

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
      {msg}
    </div>
  );
}

const EMPTY_FORM: JobForm = {
  title: "",
  region: "",
  job_type: "",
  required_career: "",
};

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setFetchError(error.message);
      return;
    }
    setJobs(data ?? []);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.title.trim()) e.title = "공고명을 입력해 주세요.";
    if (!form.region) e.region = "지역을 선택해 주세요.";
    if (!form.job_type) e.job_type = "직종을 선택해 주세요.";
    return e;
  };

  const handleChange =
    (key: keyof JobForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const { error } = await supabase.from("jobs").insert({
      title: form.title.trim(),
      region: form.region,
      job_type: form.job_type,
      required_career: form.required_career ? Number(form.required_career) : 0,
    });
    setLoading(false);

    if (error) {
      setErrors({ title: `저장 실패: ${error.message}` });
      return;
    }

    setForm(EMPTY_FORM);
    setErrors({});
    await loadJobs();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (!error) await loadJobs();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        담당자 대시보드
      </h1>
      <p className="text-lg text-gray-600 mb-10">
        일자리를 등록하고 매칭 현황을 관리합니다.
      </p>

      {/* ── 일자리 관리 섹션 ── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">일자리 관리</h2>

        {/* 일자리 추가 폼 */}
        <Card className="shadow-md mb-6">
          <CardHeader>
            <CardTitle className="text-xl">새 일자리 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-5" noValidate>
              {/* 공고명 */}
              <div className="space-y-1">
                <label
                  htmlFor="job-title"
                  className="block text-lg font-semibold text-gray-800"
                >
                  공고명 *
                </label>
                {errors.title && <ErrorBox msg={errors.title} />}
                <input
                  id="job-title"
                  type="text"
                  value={form.title}
                  onChange={handleChange("title")}
                  placeholder="예) 강남 경비원 모집"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 지역 */}
                <div className="space-y-1">
                  <label
                    htmlFor="job-region"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    지역 *
                  </label>
                  {errors.region && <ErrorBox msg={errors.region} />}
                  <select
                    id="job-region"
                    value={form.region}
                    onChange={handleChange("region")}
                    className={inputClass}
                  >
                    <option value="">-- 선택 --</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 직종 */}
                <div className="space-y-1">
                  <label
                    htmlFor="job-type"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    직종 *
                  </label>
                  {errors.job_type && <ErrorBox msg={errors.job_type} />}
                  <select
                    id="job-type"
                    value={form.job_type}
                    onChange={handleChange("job_type")}
                    className={inputClass}
                  >
                    <option value="">-- 선택 --</option>
                    {JOB_TYPES.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 요구 경력 */}
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
                    value={form.required_career}
                    onChange={handleChange("required_career")}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "저장 중…" : "일자리 등록"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 일자리 목록 테이블 */}
        {fetchError && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-5 py-3 text-base text-red-700">
            불러오기 실패: {fetchError}
          </div>
        )}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              등록된 일자리
              <Badge className="text-base px-3 py-1">{jobs.length}건</Badge>
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
                            className="text-base h-10 px-4"
                            onClick={() => handleDelete(job.id)}
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

      {/* ── 매칭 현황 (다음 단계) ── */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">매칭 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: "unmatched",
              label: "미매칭",
              badgeClass: "bg-red-100 text-red-800 border-red-200",
              desc: "아직 매칭되지 않은 시니어",
            },
            {
              id: "pending",
              label: "매칭 대기",
              badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
              desc: "매칭 결과 검토 중",
            },
            {
              id: "assigned",
              label: "배정 완료",
              badgeClass: "bg-green-100 text-green-800 border-green-200",
              desc: "일자리 배정이 확정된 시니어",
            },
          ].map(({ id, label, badgeClass, desc }) => (
            <div key={id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{label}</h3>
                <Badge className={`border text-base px-3 py-1 ${badgeClass}`}>
                  0건
                </Badge>
              </div>
              <Card className="min-h-32 border-2 border-dashed border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="pt-4 text-center text-base font-normal text-gray-400">
                    {desc}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-gray-300">
                    매칭 기능 구현 후 표시
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
