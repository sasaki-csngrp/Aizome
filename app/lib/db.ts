import { sql } from '@vercel/postgres';
import { NewReport, Report } from './models';

export async function insertReport(report: NewReport): Promise<Report> {
  try {
    const result = await sql<Report>`
      INSERT INTO reports (author_id, title, content)
      VALUES (${report.author_id}, ${report.title}, ${report.content})
      RETURNING id, author_id, title, content, created_at, updated_at;
    `;
    // The `sql` function returns an object with a `rows` array.
    // We expect only one row to be returned for an INSERT with RETURNING.
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to insert report: No rows returned.');
    }
  } catch (error) {
    console.error('Error inserting report:', error);
    throw new Error('Failed to insert report into database.');
  }
}
