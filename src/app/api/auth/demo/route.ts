import { api, checkOrigin, HttpError, success } from '@/lib/http';
import { rows } from '@/lib/db';
import { createSession } from '@/lib/auth';
// Recurso de apresentação, DESATIVADO por padrão. Nunca ativar com dados reais.
// Não recebe e-mail nem id do cliente: só entra na conta fictícia definida pelo servidor.
export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    if (process.env.DEMO_ACCESS !== 'true') throw new HttpError(404, 'Recurso não disponível.');
    const [user] = await rows<{ id: number }>('SELECT id FROM users WHERE email=?', [
      (process.env.DEMO_EMAIL || 'professor@elo.local').toLowerCase(),
    ]);
    if (!user) throw new HttpError(503, 'Prepare os dados de demonstração antes de continuar.');
    await createSession(user.id);
    return success({ demo: true });
  });
}
