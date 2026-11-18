import { api, checkOrigin, HttpError, limitBody, success } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { getDb, rows } from '@/lib/db';
import { classSchema, positiveId } from '@/lib/validation';
import type { Classroom } from '@/lib/types';
import type { ResultSetHeader } from 'mysql2';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, ctx: Context) {
  return api(async () => {
    await requireUser();
    const result = await rows<Classroom>(
      'SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id=c.id) AS student_count FROM classes c WHERE c.id=?',
      [positiveId.parse((await ctx.params).id)],
    );
    if (!result[0]) throw new HttpError(404, 'Turma não encontrada.');
    return success(result[0]);
  });
}
export async function PUT(request: Request, ctx: Context) {
  return api(async () => {
    checkOrigin(request);
    await requireUser();
    limitBody(request);
    const id = positiveId.parse((await ctx.params).id),
      v = classSchema.parse(await request.json());
    // Verifica existência separadamente porque uma atualização sem mudanças pode afetar 0 linhas.
    const exists = await rows<{ id: number }>('SELECT id FROM classes WHERE id=?', [id]);
    if (!exists.length) throw new HttpError(404, 'Turma não encontrada.');
    await getDb().execute(
      'UPDATE classes SET name=?,course=?,school_year=?,shift=?,room=? WHERE id=?',
      [v.name, v.course, v.school_year, v.shift, v.room, id],
    );
    return success({ id });
  });
}
export async function DELETE(request: Request, ctx: Context) {
  return api(async () => {
    checkOrigin(request);
    await requireUser();
    // A FK no MySQL é a garantia final, inclusive se houver cadastros concorrentes.
    const [result] = await getDb().execute<ResultSetHeader>('DELETE FROM classes WHERE id=?', [
      positiveId.parse((await ctx.params).id),
    ]);
    if (!result.affectedRows) throw new HttpError(404, 'Turma não encontrada.');
    return success({ deleted: true });
  });
}
