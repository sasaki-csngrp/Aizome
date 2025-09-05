import { NewReport, Report, User, Avatar } from "./models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { insertReport, getAllReportsFromDb, getReportByIdFromDb, updateReportInDb, deleteReportById, getTrendsFromDb, getAvatarsFromDb, getUserByIdFromDb, updateUserInDb, getReportsByUserIdFromDb } from "./db";

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

export async function getAvatars(): Promise<Avatar[]> {
  try {
    const avatars = await getAvatarsFromDb();
    return avatars;
  } catch (error) {
    console.error('Error fetching avatars:', error);
    throw new Error('Failed to fetch avatars.');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await getUserByIdFromDb(id);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Failed to fetch user by ID.');
  }
}

export async function updateUser(id: string, data: { nickname?: string | null; bio?: string | null; avatar_id?: number | null; }): Promise<User> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.id !== id) {
    throw new Error("User not authenticated or unauthorized.");
  }

  try {
    const updatedUser = await updateUserInDb(id, data);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user.');
  }
}

export async function getReportsByUserId(userId: string): Promise<Report[]> {
  try {
    const reports = await getReportsByUserIdFromDb(userId);
    return reports;
  } catch (error) {
    console.error('Error fetching reports by user:', error);
    throw new Error('Failed to fetch reports by user.');
  }
}