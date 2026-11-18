import { api, checkOrigin, HttpError, success } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { findStudent, parseId, parseStudent, saveStudent } from '@/lib/students';
import { getDb } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  return api(async () => { await requireUser(); return success(await findStudent(parseId((await context.params).id))); });
}
export async function PUT(request: Request, context: Context) {
  return api(async () => {
    checkOrigin(request); await requireUser();
    const id = parseId((await context.params).id);
    const { input, photo, removePhoto } = await parseStudent(request);
    await saveStudent(input, photo, removePhoto, id);
    return success({ id });
  });
}
export async function DELETE(request: Request, context: Context) {
  return api(async () => {
    checkOrigin(request); await requireUser();
    const [result] = await getDb().execute<ResultSetHeader>('DELETE FROM students WHERE id=?', [parseId((await context.params).id)]);
    if (!result.affectedRows) throw new HttpError(404, 'Aluno não encontrado.');
    return success({ deleted: true });
  });
}
