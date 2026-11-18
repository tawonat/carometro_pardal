import mysql from 'mysql2/promise';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);

// Este módulo é compartilhado apenas pelos scripts de terminal, nunca pelo navegador.
export function databaseOptions(admin = false) {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: admin ? process.env.DB_ADMIN_USER || 'root' : process.env.DB_USER,
    password: admin ? process.env.DB_ADMIN_PASSWORD || '' : process.env.DB_PASSWORD,
    charset: 'utf8mb4',
  };
}
export const dbName = process.env.DB_NAME || 'elo_carometro';
export async function connect() {
  return mysql.createConnection({ ...databaseOptions(), database: dbName });
}
export async function hashPassword(password) {
  // Cada senha ganha um sal diferente; scrypt dificulta tentativas de força bruta.
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
