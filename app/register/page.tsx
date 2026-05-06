"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

type FormState = {
  name: string;
  region: string;
  desired_job: string;
  career_years: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-base font-medium text-red-700">
      {msg}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    region: "",
    desired_job: "",
    career_years: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!form.region) e.region = "지역을 선택해 주세요.";
    if (!form.desired_job) e.desired_job = "희망 직종을 선택해 주세요.";
    return e;
  };

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
      setSuccess(false);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const { data: inserted, error } = await supabase
      .from("seniors")
      .insert({
        name: form.name.trim(),
        region: form.region,
        desired_job: form.desired_job,
        career_years: form.career_years ? Number(form.career_years) : 0,
      })
      .select("id")
      .single();
    setLoading(false);

    if (error) {
      setErrors({ name: `저장 실패: ${error.message}` });
      return;
    }

    // 자동 매칭 재계산 (RPC)
    if (inserted) {
      await supabase.rpc("rematch_senior", { p_senior_id: inserted.id });
    }

    setSuccess(true);
    setForm({ name: "", region: "", desired_job: "", career_years: "" });
    setErrors({});
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        시니어 프로필 등록
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        아래 정보를 입력하시면 맞춤 일자리를 추천해 드립니다.
      </p>

      {success && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-50 px-5 py-4 text-xl font-bold text-green-800">
          등록이 완료되었습니다 ✓
        </div>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
          <CardDescription className="text-base">
            * 표시 항목은 필수 입력 사항입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* 이름 */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-gray-800"
              >
                이름 *
              </label>
              {errors.name && <ErrorBox msg={errors.name} />}
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="홍길동"
                className={inputClass}
              />
            </div>

            {/* 지역 */}
            <div className="space-y-1">
              <label
                htmlFor="region"
                className="block text-lg font-semibold text-gray-800"
              >
                지역 *
              </label>
              {errors.region && <ErrorBox msg={errors.region} />}
              <select
                id="region"
                value={form.region}
                onChange={handleChange("region")}
                className={inputClass}
              >
                <option value="">-- 선택하세요 --</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 희망 직종 */}
            <div className="space-y-1">
              <label
                htmlFor="desired_job"
                className="block text-lg font-semibold text-gray-800"
              >
                희망 직종 *
              </label>
              {errors.desired_job && <ErrorBox msg={errors.desired_job} />}
              <select
                id="desired_job"
                value={form.desired_job}
                onChange={handleChange("desired_job")}
                className={inputClass}
              >
                <option value="">-- 선택하세요 --</option>
                {JOB_TYPES.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* 경력 */}
            <div className="space-y-1">
              <label
                htmlFor="career_years"
                className="block text-lg font-semibold text-gray-800"
              >
                경력 (년)
              </label>
              <input
                id="career_years"
                type="number"
                min={0}
                max={50}
                value={form.career_years}
                onChange={handleChange("career_years")}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "저장 중…" : "등록하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
