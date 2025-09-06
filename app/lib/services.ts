import { NewReport, Report, User, Avatar, LearningContent, NewLearningContent } from "./models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { insertReport, getAllReportsFromDb, getReportByIdFromDb, updateReportInDb, deleteReportById, getTrendsFromDb, getAvatarsFromDb, getUserByIdFromDb, updateUserInDb, getReportsByUserIdFromDb, addLikeToDb, removeLikeFromDb, isReportLikedByUserFromDb, getLikeCountFromDb, insertLearningContent, getAllLearningContentsFromDb, getLearningContentByIdFromDb, updateLearningContentInDb, deleteLearningContentById, getUserLearnedContentIdsFromDb, insertUserLearnedContentToDb, getAvailableLearningContentsFromDb } from "./db";

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

export async function isReportLikedByCurrentUser(reportId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return false;
  return isReportLikedByUserFromDb(reportId, session.user.id);
}

export async function likeReport(reportId: string): Promise<{ likeCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) throw new Error("User not authenticated.");
  await addLikeToDb(reportId, session.user.id);
  const likeCount = await getLikeCountFromDb(reportId);
  return { likeCount };
}

export async function unlikeReport(reportId: string): Promise<{ likeCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) throw new Error("User not authenticated.");
  await removeLikeFromDb(reportId, session.user.id);
  const likeCount = await getLikeCountFromDb(reportId);
  return { likeCount };
}

export async function toggleLike(reportId: string): Promise<{ liked: boolean; likeCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) throw new Error("User not authenticated.");
  const currentlyLiked = await isReportLikedByUserFromDb(reportId, session.user.id);
  if (currentlyLiked) {
    await removeLikeFromDb(reportId, session.user.id);
  } else {
    await addLikeToDb(reportId, session.user.id);
  }
  const likeCount = await getLikeCountFromDb(reportId);
  return { liked: !currentlyLiked, likeCount };
}

// Learning Content Services
export async function createLearningContent(title: string, content: string, question: string, answer: string, difficulty: number, prerequisite_content_id?: string | null, is_public: boolean = false): Promise<LearningContent> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const newLearningContent: NewLearningContent = {
    author_id: session.user.id,
    title,
    content,
    question,
    answer,
    difficulty,
    prerequisite_content_id,
    is_public,
  };

  const learningContent = await insertLearningContent(newLearningContent);
  return learningContent;
}

export async function getAllLearningContents(): Promise<LearningContent[]> {
  try {
    const learningContents = await getAllLearningContentsFromDb();
    return learningContents;
  } catch (error) {
    console.error('Error fetching learning contents:', error);
    throw new Error('Failed to fetch learning contents.');
  }
}

export async function getLearningContentById(id: string): Promise<LearningContent | null> {
  try {
    const learningContent = await getLearningContentByIdFromDb(id);
    return learningContent;
  } catch (error) {
    console.error('Error fetching learning content by ID:', error);
    throw new Error('Failed to fetch learning content by ID.');
  }
}

export async function updateLearningContent(learningContent: LearningContent): Promise<LearningContent> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const existingLearningContent = await getLearningContentByIdFromDb(learningContent.id);
  if (!existingLearningContent || existingLearningContent.author_id !== session.user.id) {
    throw new Error("Unauthorized to update this learning content.");
  }

  try {
    const updatedLearningContent = await updateLearningContentInDb(learningContent);
    return updatedLearningContent;
  } catch (error) {
    console.error('Error updating learning content:', error);
    throw new Error('Failed to update learning content.');
  }
}

export async function deleteLearningContent(id: string): Promise<{ message: string }> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  const existingLearningContent = await getLearningContentByIdFromDb(id);
  if (!existingLearningContent || existingLearningContent.author_id !== session.user.id) {
    throw new Error("Unauthorized to delete this learning content or learning content not found.");
  }

  try {
    await deleteLearningContentById(id);
    return { message: 'Learning content deleted successfully.' };
  } catch (error) {
    console.error('Error deleting learning content:', error);
    throw new Error('Failed to delete learning content.');
  }
}

// User Learning Content Services
export async function getUserLearnedContentIds(userId: string): Promise<string[]> {
  try {
    const learnedContentIds = await getUserLearnedContentIdsFromDb(userId);
    return learnedContentIds;
  } catch (error) {
    console.error('Error fetching user learned content IDs:', error);
    throw new Error('Failed to fetch user learned content IDs.');
  }
}

export async function markLearningContentAsLearned(contentId: string): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  try {
    await insertUserLearnedContentToDb(session.user.id, contentId);
  } catch (error) {
    console.error('Error marking learning content as learned:', error);
    throw new Error('Failed to mark learning content as learned.');
  }
}

export async function getAvailableLearningContents(): Promise<LearningContent[]> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  try {
    const availableContents = await getAvailableLearningContentsFromDb(session.user.id);
    return availableContents;
  } catch (error) {
    console.error('Error fetching available learning contents:', error);
    throw new Error('Failed to fetch available learning contents.');
  }
}

export async function getLearningContentsForUser(): Promise<LearningContent[]> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated.");
  }

  // 管理者の場合は全コンテンツを表示、ユーザーの場合は学習可能なコンテンツのみ
  if (session.user.role === 'admin') {
    return getAllLearningContents();
  } else {
    return getAvailableLearningContents();
  }
}