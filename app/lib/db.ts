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

export async function getAllReportsFromDb(): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.name, 'Unknown') as authorname,
        r.title,
        r.content,
        r.created_at,
        r.updated_at
      FROM reports r
      JOIN users u ON r.author_id = u.id
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching reports from DB:', error);
    throw new Error('Failed to fetch reports from database.');
  }
}

export async function getReportByIdFromDb(id: string): Promise<Report | null> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.name, 'Unknown') as authorname,
        r.title,
        r.content,
        r.created_at,
        r.updated_at
      FROM reports r
      JOIN users u ON r.author_id = u.id
      WHERE r.id = ${id}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching report by ID from DB:', error);
    throw new Error('Failed to fetch report by ID from database.');
  }
}

export async function updateReportInDb(report: Report): Promise<Report> {
  try {
    const result = await sql<Report>`
      UPDATE reports
      SET title = ${report.title}, content = ${report.content}, updated_at = NOW()
      WHERE id = ${report.id}
      RETURNING id, author_id, title, content, created_at, updated_at;
    `;
    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to update report: No rows returned.');
    }
  } catch (error) {
    console.error('Error updating report in DB:', error);
    throw new Error('Failed to update report in database.');
  }
}