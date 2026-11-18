import { api, checkOrigin, limitBody, HttpError, success } from '@/lib/http';
import { loginSchema } from '@/lib/validation';
import { createSession, digest, verifyPassword } from '@/lib/auth';
import { getDb, rows } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  return api(async () => {
    checkOrigin(request);
    limitBody(request);
    const input = loginSchema.parse(await request.json());
    const key = digest(input.email);
    // A transação + FOR UPDATE serializa tentativas concorrentes para o mesmo e-mail.
    const db = await getDb().getConnection();
    try {
      await db.beginTransaction();
      await db.execute('INSERT IGNORE INTO login_attempts (email_hash) VALUES (?)', [key]);
      const [attempts] = await db.execute<import('mysql2').RowDataPacket[]>(
        'SELECT attempts, window_start > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE) AS recent FROM login_attempts WHERE email_hash=? FOR UPDATE',
        [key],
      );
      const count = attempts[0].recent ? Number(attempts[0].attempts) : 0;
      if (count >= 5)
        throw new HttpError(429, 'Muitas tentativas. Aguarde 15 minutos e tente novamente.');
      await db.execute(
        'UPDATE login_attempts SET attempts=?, window_start=IF(?,window_start,UTC_TIMESTAMP()) WHERE email_hash=?',
        [count + 1, Number(attempts[0].recent), key],
      );
      await db.commit();
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
    }
    const users = await rows<User & { password_hash: string }>(
      'SELECT id,name,email,password_hash FROM users WHERE email=?',
      [input.email],
    );
    // Mesmo custo criptográfico quando o e-mail não existe; mensagem é sempre genérica.
    const dummy = '0'.repeat(32) + ':' + '0'.repeat(128);
    const valid = await verifyPassword(input.password, users[0]?.password_hash || dummy);
    if (!users[0] || !valid) throw new HttpError(401, 'E-mail ou senha incorretos.');
    await getDb().execute('DELETE FROM login_attempts WHERE email_hash=?', [key]);
    await createSession(users[0].id);
    return success({ name: users[0].name });
  });
}
