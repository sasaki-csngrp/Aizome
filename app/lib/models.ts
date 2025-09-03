export interface Report {
  id: string;
  author_id: string;
  authorname?: string; // Corrected to lowercase to match DB response
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface NewReport {
  author_id: string;
  title: string;
  content: string;
}
