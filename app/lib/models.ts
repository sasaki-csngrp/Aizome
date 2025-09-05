export interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: 'report' | 'trend';
  author_id?: string;
  authorname?: string;
  authorImage?: string;
  likeCount?: number;
  likedByCurrentUser?: boolean;
}

/*
export type NewReport = Omit<Report, 'id' | 'createdAt' | 'updatedPated'>;
*/

export interface NewReport {
  author_id: string;
  title: string;
  content: string;
  type: 'report' | 'trend';
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  hashedPassword?: string | null;
  nickname?: string | null;
  bio?: string | null;
  total_points?: number;
  avatar_id?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Avatar {
  id: number;
  name: string;
  image_url: string;
}

export interface Like {
  id: string;
  user_id: string;
  report_id: string;
  created_at: Date;
}

