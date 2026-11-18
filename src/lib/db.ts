import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';

// Pool reaproveita conexões. No modo dev, globalThis impede criar um pool a cada reload.
const globalDb = globalThis as unknown as { eloPool?: Pool };
export function getDb() {
  if (!globalDb.eloPool) {
    if (!process.env.DB_USER || !process.env.DB_PASSWORD) throw new Error('DB_NOT_CONFIGURED');
    globalDb.eloPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'elo_carometro',
      charset: 'utf8mb4',
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 100,
      dateStrings: true,
      timezone: 'Z',
    });
  }
  return globalDb.eloPool;
}
// execute envia valores separados do comando SQL (prepared statement).
export async function rows<T>(sql: string, values: (string | number)[] = []): Promise<T[]> {
  const [result] = await getDb().execute<RowDataPacket[]>(sql, values);
  return result as T[];
}
