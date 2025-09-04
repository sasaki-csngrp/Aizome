import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Assuming authOptions are exported here
import { insertReport, getAllReportsFromDb, getReportByIdFromDb, updateReportInDb, deleteReportById, getTrendsFromDb } from "./db";
import { NewReport, Report } from "./models";

export async function createReport(title: string, content: string, type: 'report' | 'trend'): Promise<Report> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const newReport: NewReport = {
    author_id: session.user.id, // Assuming session.user.id exists and is the author_id
    title,
    content,
    type, // Add type
  };

  const report = await insertReport(newReport);
  return report;
}

export async function getAllReports(): Promise<Report[]> {
  try {
    const reports = await getAllReportsFromDb();
    return reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error('Failed to fetch reports.');
  }
}

export async function getTrends(): Promise<Report[]> {
  try {
    const trends = await getTrendsFromDb();
    return trends;
  } catch (error) {
    console.error('Error fetching trends:', error);
    throw new Error('Failed to fetch trends.');
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const report = await getReportByIdFromDb(id);
    return report;
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    throw new Error('Failed to fetch report by ID.');
  }
}

export async function updateReport(report: Report): Promise<Report> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const existingReport = await getReportByIdFromDb(report.id);
  if (!existingReport || existingReport.author_id !== session.user.id) {
    throw new Error("Unauthorized to update this report.");
  }

  try {
    const updatedReport = await updateReportInDb(report);
    return updatedReport;
  } catch (error) {
    console.error('Error updating report:', error);
    throw new Error('Failed to update report.');
  }
}

export async function deleteReport(id: string): Promise<{ message: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const existingReport = await getReportByIdFromDb(id);
  if (!existingReport || existingReport.author_id !== session.user.id) {
    throw new Error("Unauthorized to delete this report or report not found.");
  }

  try {
    await deleteReportById(id);
    return { message: 'Report deleted successfully.' };
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report.');
  }
}