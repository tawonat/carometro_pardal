import { getDb, rows } from './db';
import { positiveId, studentSchema, type StudentInput } from './validation';
import { HttpError, limitBody } from './http';
import sharp from 'sharp';
import type { Student } from './types';
import type { ResultSetHeader } from 'mysql2';

// A mesma projeção é usada para consultar um perfil ou listar vários.
export const studentSelect = `SELECT s.*,c.name AS class_name,c.course,c.school_year,c.shift,
  EXISTS(SELECT 1 FROM student_photos p WHERE p.student_id=s.id) AS has_photo
  FROM students s JOIN classes c ON c.id=s.class_id`;
export async function findStudent(id: number) {
  const result = await rows<Student>(`${studentSelect} WHERE s.id=?`, [id]);
  if (!result[0]) throw new HttpError(404, 'Aluno não encontrado.');
  return result[0];
}
export async function parseStudent(request: Request) {
  limitBody(request, 3 * 1024 * 1024 + 32_768);
  const form = await request.formData();
  const input = studentSchema.parse(Object.fromEntries(form.entries()));
  const removePhoto = form.get('remove_photo') === 'true';
  const file = form.get('photo');
  let photo: Buffer | undefined;
  if (file instanceof File && file.size) {
    if (file.size > 3 * 1024 * 1024) throw new HttpError(413, 'A foto deve ter no máximo 3 MB.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw new HttpError(422, 'Use uma foto JPG, PNG ou WebP.');
    try {
      // O decoder confere o conteúdo real, limita pixels e remove metadados (incluindo GPS).
      const buffer = Buffer.from(await file.arrayBuffer());
      const image = sharp(buffer, { limitInputPixels: 20_000_000, animated: false });
      const meta = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(meta.format || '')) throw new Error('Formato inválido');
      photo = await image
        .rotate()
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new HttpError(
        422,
        'Não foi possível abrir essa foto. Escolha outra imagem JPG, PNG ou WebP.',
      );
    }
  }
  return { input, removePhoto, photo };
}
export async function saveStudent(
  input: StudentInput,
  photo?: Buffer,
  removePhoto = false,
  id?: number,
) {
  const db = await getDb().getConnection();
  try {
    await db.beginTransaction();
    const values = [
      input.enrollment,
      input.full_name,
      input.preferred_name,
      input.email,
      input.class_id,
      input.status,
      input.bio,
      input.avatar_key,
    ];
    let studentId = id;
    if (id) {
      const [exists] = await db.execute<import('mysql2').RowDataPacket[]>(
        'SELECT id FROM students WHERE id=? FOR UPDATE',
        [id],
      );
      if (!exists.length) throw new HttpError(404, 'Aluno não encontrado.');
      await db.execute(
        'UPDATE students SET enrollment=?,full_name=?,preferred_name=?,email=?,class_id=?,status=?,bio=?,avatar_key=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
        [...values, id],
      );
    } else {
      const [result] = await db.execute<ResultSetHeader>(
        'INSERT INTO students (enrollment,full_name,preferred_name,email,class_id,status,bio,avatar_key) VALUES (?,?,?,?,?,?,?,?)',
        values,
      );
      studentId = result.insertId;
    }
    if (studentId === undefined) throw new Error('STUDENT_ID_MISSING');
    // Dados e foto são confirmados juntos: se a imagem falhar, desfazemos tudo.
    if (photo)
      await db.execute(
        'INSERT INTO student_photos (student_id,image_data) VALUES (?,?) ON DUPLICATE KEY UPDATE image_data=?',
        [studentId, photo, photo],
      );
    else if (removePhoto)
      await db.execute('DELETE FROM student_photos WHERE student_id=?', [studentId]);
    await db.commit();
    return studentId!;
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    db.release();
  }
}
export const parseId = (value: string) => positiveId.parse(value);
