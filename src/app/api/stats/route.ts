import { api, success } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { rows } from '@/lib/db';
export async function GET() {
  return api(async () => {
    await requireUser();
    const [stats] = await rows(`SELECT (SELECT COUNT(*) FROM students) AS students,
      (SELECT COUNT(*) FROM classes) AS classes,
      (SELECT COUNT(*) FROM students WHERE status='Ativo') AS active,
      (SELECT COUNT(*) FROM student_photos) AS photos`);
    return success(stats);
  });
}
