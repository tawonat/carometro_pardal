import { pathToFileURL } from 'node:url';
import { connect, hashPassword } from './shared.mjs';

// Nomes, matrículas e retratos são fictícios. Os SVGs acompanham o projeto.
const names = [
  'Ana Beatriz Martins',
  'Bruno Henrique Lima',
  'Camila Oliveira Santos',
  'Daniel Ferreira Costa',
  'Elisa Rodrigues Alves',
  'Felipe Gomes Souza',
  'Gabriela Rocha Mendes',
  'Heitor Carvalho Dias',
  'Isabela Fernandes Melo',
  'João Pedro Almeida',
  'Luiza Ribeiro Castro',
  'Mateus Araújo Silva',
  'Marina Teixeira Lopes',
  'Nicolas Barbosa Reis',
  'Olívia Nunes Freitas',
  'Pedro Lucas Azevedo',
  'Rafaela Moreira Pinto',
  'Samuel Vieira Cunha',
  'Sofia Cardoso Barros',
  'Tiago Correia Ramos',
  'Valentina Duarte Paiva',
  'Vinícius Moraes Leal',
  'Yasmin Batista Campos',
  'Enzo Henrique Prado',
];
export async function seed() {
  const db = await connect();
  try {
    // A transação impede deixar metade da demonstração gravada se ocorrer algum erro.
    await db.beginTransaction();
    const email = (process.env.DEMO_EMAIL || 'professor@elo.local').toLowerCase();
    const password = process.env.DEMO_PASSWORD || 'Elo@2026!';
    if (password.length < 8)
      throw new Error('A senha de demonstração precisa ter ao menos 8 caracteres.');
    const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (!users.length)
      await db.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)', [
        'Professor(a)',
        email,
        await hashPassword(password),
      ]);
    const [existing] = await db.execute('SELECT COUNT(*) AS total FROM classes');
    // Popular somente uma base sem turmas evita recriar pessoas já excluídas pelo docente.
    if (existing[0].total === 0) {
      const groups = [
        ['3º A', 'Desenvolvimento de Sistemas', 'Manhã', 'Laboratório 01'],
        ['3º B', 'Desenvolvimento de Sistemas', 'Tarde', 'Laboratório 02'],
        ['2º A', 'Informática', 'Manhã', 'Sala 12'],
        ['2º B', 'Administração', 'Noite', 'Sala 08'],
      ];
      const ids = [];
      for (const [name, course, shift, room] of groups) {
        const [result] = await db.execute(
          'INSERT INTO classes (name,course,school_year,shift,room) VALUES (?,?,?,?,?)',
          [name, course, 2026, shift, room],
        );
        ids.push(result.insertId);
      }
      for (const [i, name] of names.entries()) {
        await db.execute(
          'INSERT INTO students (enrollment,full_name,preferred_name,email,class_id,status,bio,avatar_key) VALUES (?,?,?,?,?,?,?,?)',
          [
            String(2026001 + i),
            name,
            '',
            `aluno${i + 1}@exemplo.invalid`,
            ids[Math.floor(i / 6)],
            i === 17 ? 'Trancado' : i === 22 ? 'Concluído' : 'Ativo',
            [
              'Gosto de tecnologia, música e de aprender coisas novas.',
              'Sempre pronto(a) para um novo projeto em equipe.',
              'Curioso(a) por natureza. Entre livros, ideias e descobertas.',
            ][i % 3],
            (i % 12) + 1,
          ],
        );
      }
    }
    await db.commit();
    console.log('Demonstração disponível: 4 turmas e 24 alunos na instalação inicial.');
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed().catch(() => {
    console.error(
      'Não foi possível preparar os dados. Verifique o .env e execute npm run db:setup primeiro.',
    );
    process.exitCode = 1;
  });
}
