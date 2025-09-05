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
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
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
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
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
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
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

    if (updates.length === 0) {
      // 更新するフィールドがない場合は、データベースにアクセスせずにユーザー情報を返します。
      const user = await getUserByIdFromDb(id);
      if (!user) throw new Error("User not found after attempting an empty update.");
      return user;
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, "emailVerified", image, "hashedPassword", nickname, bio,
total_points, avatar_id, created_at, updated_at;
    `;

    values.push(id);

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

export async function getReportsByUserIdFromDb(userId: string): Promise<Report[]> {
  try {
    const { rows } = await sql<Report>`
      SELECT
        r.id,
        r.author_id,
        COALESCE(u.nickname, u.name, 'Unknown') as authorname,
        COALESCE(a.image_url, u.image) as "authorImage",
        r.title,
        r.content,
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        r.type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.report_id = r.id) AS "likeCount"
      FROM reports r
      JOIN users u ON r.author_id = u.id
      LEFT JOIN avatars a ON u.avatar_id = a.id
      WHERE r.author_id = ${userId} AND r.type = 'report'
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reports by user.');
  }
}

export async function getLikeCountFromDb(reportId: string): Promise<number> {
  try {
    const { rows } = await sql<{ likeCount: number }>`
      SELECT COUNT(*)::int as "likeCount" FROM likes WHERE report_id = ${reportId}
    `;
    return rows[0]?.likeCount ?? 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch like count.');
  }
}

export async function isReportLikedByUserFromDb(reportId: string, userId: string): Promise<boolean> {
  try {
    const { rows } = await sql<{ exists: boolean }>`
      SELECT EXISTS (
        SELECT 1 FROM likes WHERE report_id = ${reportId} AND user_id = ${userId}
      ) as exists
    `;
    return rows[0]?.exists ?? false;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check like status.');
  }
}

export async function addLikeToDb(reportId: string, userId: string): Promise<void> {
  try {
    await sql`INSERT INTO likes (report_id, user_id) VALUES (${reportId}, ${userId}) ON CONFLICT (user_id, report_id) DO NOTHING`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add like.');
  }
}

export async function removeLikeFromDb(reportId: string, userId: string): Promise<void> {
  try {
    await sql`DELETE FROM likes WHERE report_id = ${reportId} AND user_id = ${userId}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to remove like.');
  }
}