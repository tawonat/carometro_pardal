import { api, checkOrigin, limitBody, success } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { getDb, rows } from '@/lib/db';
import { classSchema } from '@/lib/validation';
import type { Classroom } from '@/lib/types';
import type { ResultSetHeader } from 'mysql2';
export async function GET() {
  return api(async () => {
    await requireUser();
    return success(await rows<Classroom>(`SELECT c.*,COUNT(s.id) AS student_count FROM classes c
      LEFT JOIN students s ON s.class_id=c.id GROUP BY c.id ORDER BY c.school_year DESC,c.name,c.shift`));
  });
}
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request); await requireUser(); limitBody(request);
    const v = classSchema.parse(await request.json());
    const [result] = await getDb().execute<ResultSetHeader>('INSERT INTO classes (name,course,school_year,shift,room) VALUES (?,?,?,?,?)', [v.name, v.course, v.school_year, v.shift, v.room]);
    return success({ id: result.insertId }, 201);
  });
}
