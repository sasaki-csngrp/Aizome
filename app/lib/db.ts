import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { NewReport, Report } from './models';

export async function insertReport(report: NewReport): Promise<Report> {
  try {
    const result = await sql<Report>`
      INSERT INTO reports (author_id, title, content, type)
      VALUES (${report.author_id}, ${report.title}, ${report.content}, ${report.type})
      RETURNING id, author_id, title, content, created_at as "createdAt", updated_at as "updatedAt", type;
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
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type
      FROM reports r
      JOIN users u ON r.author_id = u.id
      WHERE r.type = 'report'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reports.');
  }
}

export async function getTrendsFromDb(): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.name, 'Unknown') as authorname,
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type
      FROM reports r
      JOIN users u ON r.author_id = u.id
      WHERE r.type = 'trend'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch trends.');
  }
}

export async function deleteReportById(id: string) {
  noStore();
  try {
    await sql`DELETE FROM reports WHERE id = ${id}`;
    return { message: 'Report deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete report.');
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
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type
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
      SET title = ${report.title}, content = ${report.content}, type = ${report.type}, updated_at = NOW()
      WHERE id = ${report.id}
      RETURNING id, author_id, title, content, created_at as "createdAt", updated_at as "updatedAt", type;
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