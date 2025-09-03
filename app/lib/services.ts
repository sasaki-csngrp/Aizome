import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Assuming authOptions are exported here
import { insertReport } from "./db";
import { NewReport, Report } from "./models";

export async function createReport(title: string, content: string): Promise<Report> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const newReport: NewReport = {
    author_id: session.user.id, // Assuming session.user.id exists and is the author_id
    title,
    content,
  };

  const report = await insertReport(newReport);
  return report;
}
