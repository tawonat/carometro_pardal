import { cookies } from 'next/headers';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getDb, rows } from './db';
import { HttpError } from './http';
import type { User } from './types';

const scrypt = promisify(scryptCallback);
export const cookieName = 'elo_session';
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export async function verifyPassword(password: string, saved: string) {
  const [salt, hex] = saved.split(':');
  if (!salt || !hex || hex.length !== 128) return false;
  const candidate = await scrypt(password, salt, 64) as Buffer;
  // Comparação em tempo constante evita revelar onde os hashes diferem.
  return timingSafeEqual(candidate, Buffer.from(hex, 'hex'));
}
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await rows<User>(`SELECT u.id,u.name,u.email FROM sessions se
    JOIN users u ON u.id=se.user_id WHERE se.token_hash=? AND se.expires_at > UTC_TIMESTAMP()`, [digest(token)]);
  return result[0] || null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, 'Sua sessão terminou. Entre novamente.');
  return user;
}
export async function createSession(userId: number) {
  // O token é imprevisível; não contém nome, e-mail ou senha do usuário.
  const token = randomBytes(32).toString('hex');
  await getDb().execute('DELETE FROM sessions WHERE expires_at <= UTC_TIMESTAMP()');
  await getDb().execute('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR))', [digest(token), userId]);
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true', path: '/', maxAge: 8 * 60 * 60 });
}
export async function revokeSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await getDb().execute('DELETE FROM sessions WHERE token_hash=?', [digest(token)]);
  jar.delete(cookieName);
}
