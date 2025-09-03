"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface DeleteButtonProps {
  reportId: string;
}

export default function DeleteButton({ reportId }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("本当にこのレポートを削除しますか？")) {
      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "レポートの削除に失敗しました。");
        }

        alert("レポートが正常に削除されました。");
        router.refresh(); // ページをリフレッシュして一覧を更新
      } catch (error: unknown) {
        let errorMessage = "レポートの削除に失敗しました。";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        console.error("Error deleting report:", error);
        alert(errorMessage);
      }
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      className="bg-red-200 hover:bg-red-500 text-red-800 hover:text-white"
    >
      削除
    </Button>
  );
}