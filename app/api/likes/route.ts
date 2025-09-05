import { NextRequest, NextResponse } from "next/server";
import { likeReport, unlikeReport, toggleLike } from "@/app/lib/services";

export async function POST(req: NextRequest) {
  try {
    const { reportId, action } = await req.json();
    if (!reportId) return NextResponse.json({ error: "reportId is required" }, { status: 400 });

    if (action === "like") {
      const { likeCount } = await likeReport(reportId);
      return NextResponse.json({ liked: true, likeCount });
    }
    if (action === "unlike") {
      const { likeCount } = await unlikeReport(reportId);
      return NextResponse.json({ liked: false, likeCount });
    }

    const result = await toggleLike(reportId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


