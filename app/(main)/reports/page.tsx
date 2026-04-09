import { getReportsPaginated } from "@/app/lib/services";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import ReportLoadMoreList from "@/app/components/ReportLoadMoreList";

const PAGE_SIZE = 9;

export default async function ReportsPage() {
  const [{ rows: initialReports, total }, session] = await Promise.all([
    getReportsPaginated(PAGE_SIZE, 0),
    getServerSession(authOptions),
  ]);
  const currentUserId = session?.user?.id;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-left">Reportsの目的は、ユーザー自身の経験や学びを<span className="font-bold">「蓄積」</span>していき、広く <span className="font-bold">「共有」</span> する事です。</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/reports/new?type=report">新しいレポートを作成</Link>
        </Button>
      </div>
      <ReportLoadMoreList
        initialItems={initialReports}
        total={total}
        currentUserId={currentUserId}
      />
    </div>
  );
}
