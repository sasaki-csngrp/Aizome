import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { markLearningContentAsLearned } from "@/app/lib/services";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await markLearningContentAsLearned(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking learning content as learned:", error);
    return NextResponse.json(
      { error: "Failed to mark learning content as learned" },
      { status: 500 }
    );
  }
}
