import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center py-12">
      {/* 히어로 */}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
        상상우리
      </h1>
      <p className="text-2xl text-gray-600 mb-2">시니어 일자리 매칭 서비스</p>
      <p className="text-xl text-gray-400 mb-16">
        맞춤 일자리를 찾아 드립니다. 아래에서 원하시는 메뉴를 선택해 주세요.
      </p>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* 시니어용 */}
        <Link href="/register" className="group">
          <Card className="h-full border-2 border-blue-200 bg-blue-50 shadow-md hover:shadow-lg hover:border-blue-400 transition-all">
            <CardContent className="flex flex-col items-center justify-center py-12 px-8 gap-4">
              <span className="text-6xl">📋</span>
              <p className="text-2xl font-bold text-blue-800">일자리 신청하기</p>
              <p className="text-lg text-blue-600">
                이름·지역·희망 직종을 입력하면<br />맞춤 일자리를 추천해 드립니다.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 담당자용 */}
        <Link href="/admin" className="group">
          <Card className="h-full border-2 border-green-200 bg-green-50 shadow-md hover:shadow-lg hover:border-green-400 transition-all">
            <CardContent className="flex flex-col items-center justify-center py-12 px-8 gap-4">
              <span className="text-6xl">🗂️</span>
              <p className="text-2xl font-bold text-green-800">담당자 대시보드</p>
              <p className="text-lg text-green-600">
                매칭 현황 확인 및<br />일자리 등록·관리
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 부연 안내 */}
      <p className="mt-16 text-lg text-gray-400">
        문의: 상상우리 담당자에게 연락해 주세요.
      </p>
    </div>
  );
}
