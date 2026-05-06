import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "프로필 등록 | 상상우리",
};

export default function RegisterPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        시니어 프로필 등록
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        아래 정보를 입력하시면 맞춤 일자리를 추천해 드립니다.
      </p>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">기본 정보 입력</CardTitle>
          <CardDescription className="text-base">
            * 표시 항목은 필수 입력 사항입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 폼 — 기능 구현은 다음 단계 */}
          <form className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-gray-800"
              >
                이름 *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                disabled
                placeholder="홍길동"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="region"
                className="block text-lg font-semibold text-gray-800"
              >
                지역 *
              </label>
              <input
                id="region"
                name="region"
                type="text"
                disabled
                placeholder="서울 강남구"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="desired_job"
                className="block text-lg font-semibold text-gray-800"
              >
                희망 직종 *
              </label>
              <input
                id="desired_job"
                name="desired_job"
                type="text"
                disabled
                placeholder="경비, 청소, 요양보호 등"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="career_years"
                className="block text-lg font-semibold text-gray-800"
              >
                경력 (년) *
              </label>
              <input
                id="career_years"
                name="career_years"
                type="number"
                disabled
                placeholder="5"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled
              className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              등록하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
