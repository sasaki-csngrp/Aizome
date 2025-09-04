import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { NewReport, Report, User, Avatar } from './models';

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

export async function getAvatarsFromDb(): Promise<Avatar[]> {
  noStore(); // Prevent caching
  try {
    const { rows } = await sql<Avatar>`
      SELECT id, name, image_url FROM avatars ORDER BY id ASC;
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch avatars.');
  }
}

export async function getUserByIdFromDb(id: string): Promise<User | null> {
  noStore(); // Prevent caching
  try {
    const { rows } = await sql<User>`
      SELECT
        id,
        name,
        email,
        "emailVerified",
        image,
        "hashedPassword",
        nickname,
        bio,
        total_points,
        avatar_id,
        created_at,
        updated_at
      FROM users
      WHERE id = ${id};
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user by ID.');
  }
}

export async function updateUserInDb(id: string, data: Partial<User>): Promise<User> {
  noStore(); // Prevent caching
  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`);
      values.push(data.nickname);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.avatar_id !== undefined) {
      updates.push(`avatar_id = $${paramIndex++}`);
      values.push(data.avatar_id);
    }
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      throw new Error("No fields to update.");
    }

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, "emailVerified", image, "hashedPassword", nickname, bio, total_points, avatar_id, created_at, updated_at;
    `;

    values.push(id); // Add id as the last parameter

    const result = await sql.query<User>(query, values);

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      throw new Error('Failed to update user: No rows returned.');
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update user in database.');
  }
}