export interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: 'report' | 'trend';
  authorname?: string;
  author_id?: string; // Add author_id
}

/*
export type NewReport = Omit<Report, 'id' | 'createdAt' | 'updatedAt'>;
*/

export interface NewReport {
  author_id: string;
  title: string;
  content: string;
  type: 'report' | 'trend';
}
