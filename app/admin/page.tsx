import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "담당자 대시보드 | 상상우리",
};

const columns = [
  {
    id: "unmatched",
    label: "미매칭",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    count: 0,
    description: "아직 매칭되지 않은 시니어",
  },
  {
    id: "pending",
    label: "매칭 대기",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    count: 0,
    description: "매칭 결과 검토 중",
  },
  {
    id: "assigned",
    label: "배정 완료",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    count: 0,
    description: "일자리 배정이 확정된 시니어",
  },
];

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        담당자 대시보드
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        매칭 현황을 한눈에 확인하고 관리합니다. (기능 구현 예정)
      </p>

      {/* 3단 상태 컬럼 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(({ id, label, badgeClass, count, description }) => (
          <div key={id} className="flex flex-col gap-4">
            {/* 컬럼 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{label}</h2>
              <Badge className={`text-base px-3 py-1 border ${badgeClass}`}>
                {count}건
              </Badge>
            </div>

            {/* 빈 카드 자리 */}
            <Card className="border-2 border-dashed border-gray-200 bg-gray-50 min-h-48">
              <CardHeader>
                <CardTitle className="text-base text-gray-400 font-normal text-center pt-8">
                  {description}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 text-center">
                  데이터 연동 후 목록이 표시됩니다
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
