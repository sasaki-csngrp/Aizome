import { getTrendsPaginated } from "@/app/lib/services";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import TrendLoadMoreList from "@/app/components/TrendLoadMoreList";

const PAGE_SIZE = 9;

export default async function TrendsPage() {
  const [{ rows: initialTrends, total }, session] = await Promise.all([
    getTrendsPaginated(PAGE_SIZE, 0),
    getServerSession(authOptions),
  ]);
  const currentUserId = session?.user?.id;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Trends</h1>
          <p className="text-left">Trendsの目的は、外部の最新情報を、広く<span className="font-bold">「発信」</span>していく事です。</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/reports/new?type=trend">新しいトレンドを作成</Link>
        </Button>
      </div>
      <TrendLoadMoreList
        initialItems={initialTrends}
        total={total}
        currentUserId={currentUserId}
      />
    </div>
  );
}
