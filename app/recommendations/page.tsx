import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "추천 목록 | 상상우리",
};

const placeholderItems = [
  { rank: 1, score: 95 },
  { rank: 2, score: 82 },
  { rank: 3, score: 71 },
];

export default function RecommendationsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">매칭 추천 목록</h1>
      <p className="text-lg text-gray-600 mb-8">
        점수 높은 순으로 일자리를 추천합니다. (기능 구현 예정)
      </p>

      {/* 추천 카드 목록 자리 */}
      <div className="space-y-4">
        {placeholderItems.map(({ rank, score }) => (
          <Card key={rank} className="shadow-sm border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl text-gray-400">
                추천 #{rank} — 일자리 정보가 여기에 표시됩니다
              </CardTitle>
              <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200">
                점수 {score}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-400">
                직종 · 지역 · 필요 경력 정보 (데이터 연동 후 표시)
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
