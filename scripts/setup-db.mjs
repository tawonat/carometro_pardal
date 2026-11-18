import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { dbName, databaseOptions } from './shared.mjs';
import { seed } from './seed.mjs';

// Um nome de banco é um identificador SQL, não um valor substituível por '?'.
// A lista permitida evita injetar SQL pelo nome configurado no .env.
let connection;
try {
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(dbName))
    throw new Error('DB_NAME aceita apenas letras, números e sublinhado.');
  if (!/^[a-zA-Z0-9_]{1,32}$/.test(process.env.DB_USER || ''))
    throw new Error('Preencha DB_USER com letras, números e sublinhado.');
  if ((process.env.DB_PASSWORD || '').length < 8)
    throw new Error('DB_PASSWORD precisa ter ao menos 8 caracteres.');
  connection = await mysql.createConnection(databaseOptions(true));
  const [version] = await connection.query('SELECT VERSION() AS version');
  const v = version[0].version;
  if (
    v.includes('MariaDB') ||
    Number(v.split('.')[0]) < 8 ||
    (/^8\.0\./.test(v) && Number(v.split('.')[2]) < 16)
  ) {
    throw new Error('Use MySQL 8.0.16 ou superior; recomendado MySQL 8.4.');
  }
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  );
  // mysql.escape faz o escape dos valores no DDL; as demais consultas usam execute + '?'.
  const account = `${mysql.escape(process.env.DB_USER)}@'%'`;
  await connection.query(
    `CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${mysql.escape(process.env.DB_PASSWORD)}`,
  );
  // Conta da aplicação não recebe CREATE, DROP ou GRANT. Reexecutar não redefine senhas.
  await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${dbName}\`.* TO ${account}`);
  await connection.changeUser({ database: dbName });
  const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
  // A separação é segura aqui porque o SQL é um arquivo controlado do próprio projeto.
  const withoutComments = schema.replace(/--[^\n]*/g, '');
  for (const statement of withoutComments.split(';').filter((s) => s.trim()))
    await connection.query(statement);
  await connection.end();
  connection = undefined;
  await seed();
  console.log('Banco e dados de demonstração prontos. Execute npm run dev.');
} catch (error) {
  // Não exibimos objetos de conexão, senhas ou consultas SQL no terminal.
  const code = error?.code;
  console.error(
    code === 'ER_ACCESS_DENIED_ERROR'
      ? 'Acesso negado. Confira as credenciais MySQL no .env. Se a conta já existe, use sua senha atual.'
      : code === 'ECONNREFUSED'
        ? 'MySQL indisponível. Inicie o serviço e confira DB_HOST/DB_PORT.'
        : code
          ? 'Não foi possível configurar o banco. Confira a versão do MySQL e as permissões da conta administrativa.'
          : error.message,
  );
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
