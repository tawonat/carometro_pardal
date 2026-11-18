import { api, HttpError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { rows } from '@/lib/db';
import { parseId } from '@/lib/students';
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    await requireUser();
    const photo = await rows<{ image_data: Buffer }>('SELECT image_data FROM student_photos WHERE student_id=?', [parseId((await context.params).id)]);
    if (!photo[0]) throw new HttpError(404, 'Foto não encontrada.');
    return new Response(new Uint8Array(photo[0].image_data), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  });
}
