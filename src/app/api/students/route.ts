import { api, success } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { checkOrigin } from '@/lib/http';
import { listSchema, studentSorts } from '@/lib/validation';
import { rows } from '@/lib/db';
import { parseStudent, saveStudent, studentSelect } from '@/lib/students';
import type { Student } from '@/lib/types';

export async function GET(request: Request) {
  return api(async () => {
    await requireUser();
    const query = listSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const filters: string[] = [],
      values: (string | number)[] = [];
    if (query.q) {
      // LOCATE trata % e _ como texto comum; collate do banco ignora caixa e acentos.
      filters.push(
        '(LOCATE(?,s.full_name)>0 OR LOCATE(?,s.preferred_name)>0 OR LOCATE(?,s.enrollment)>0)',
      );
      values.push(query.q, query.q, query.q);
    }
    if (query.classId) {
      filters.push('s.class_id=?');
      values.push(query.classId);
    }
    if (query.status) {
      filters.push('s.status=?');
      values.push(query.status);
    }
    const where = filters.length ? ' WHERE ' + filters.join(' AND ') : '';
    const count = await rows<{ total: number }>(
      'SELECT COUNT(*) AS total FROM students s' + where,
      values,
    );
    const total = Number(count[0].total),
      pages = Math.max(1, Math.ceil(total / 12));
    const page = Math.min(query.page, pages);
    // Só números inteiros validados entram em LIMIT/OFFSET; a ordenação vem da lista fixa.
    const students = await rows<Student>(
      `${studentSelect}${where} ORDER BY ${studentSorts[query.sort]} LIMIT 12 OFFSET ${(page - 1) * 12}`,
      values,
    );
    return success({ students, total, pages, page });
  });
}
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    await requireUser();
    const { input, photo, removePhoto } = await parseStudent(request);
    return success({ id: await saveStudent(input, photo, removePhoto) }, 201);
  });
}
