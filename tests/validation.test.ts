import test from 'node:test';
import assert from 'node:assert/strict';
import { classSchema, studentSchema, listSchema, loginSchema } from '../src/lib/validation';

const valid = {
  enrollment: '2026001',
  full_name: 'Ana Martins',
  preferred_name: '',
  email: '',
  class_id: 1,
  status: 'Ativo',
  bio: '',
  avatar_key: 1,
};
// Testes de regras de negócio: cada caso protege um comportamento observável do sistema.
test('normaliza espaços e e-mail sem alterar a matrícula', () => {
  const s = studentSchema.parse({
    ...valid,
    full_name: '  Ana Martins  ',
    email: 'ANA@EXEMPLO.COM',
  });
  assert.equal(s.full_name, 'Ana Martins');
  assert.equal(s.email, 'ana@exemplo.com');
});
test('não aceita matrícula com letras, curta ou grande demais', () => {
  for (const enrollment of ['123', 'ABC1234', '1234567890123', '12 34'])
    assert.equal(studentSchema.safeParse({ ...valid, enrollment }).success, false);
});
test('aluno precisa apontar para um id de turma inteiro positivo', () => {
  for (const class_id of [0, -1, 1.5, '', 'abc'])
    assert.equal(studentSchema.safeParse({ ...valid, class_id }).success, false);
});
test('rejeita situação e ilustração fora das opções', () => {
  assert.equal(studentSchema.safeParse({ ...valid, status: 'Não existe' }).success, false);
  assert.equal(studentSchema.safeParse({ ...valid, avatar_key: 13 }).success, false);
});
test('e-mail opcional aceita vazio e recusa texto sem formato de e-mail', () => {
  assert.equal(studentSchema.safeParse(valid).success, true);
  assert.equal(studentSchema.safeParse({ ...valid, email: 'invalido' }).success, false);
});
test('limita a apresentação a 280 caracteres', () => {
  assert.equal(studentSchema.safeParse({ ...valid, bio: 'a'.repeat(280) }).success, true);
  assert.equal(studentSchema.safeParse({ ...valid, bio: 'a'.repeat(281) }).success, false);
});
test('turma valida ano e turno', () => {
  const base = { name: '3º A', course: 'Informática', school_year: 2026, shift: 'Manhã', room: '' };
  assert.equal(classSchema.safeParse(base).success, true);
  for (const school_year of [1999, 2101, 2026.5])
    assert.equal(classSchema.safeParse({ ...base, school_year }).success, false);
  assert.equal(classSchema.safeParse({ ...base, shift: 'Madrugada' }).success, false);
});
test('consulta só aceita ordenações da lista fixa e paginação válida', () => {
  assert.equal(listSchema.parse({}).sort, 'name');
  assert.equal(listSchema.safeParse({ sort: 'name;DROP TABLE students' }).success, false);
  assert.equal(listSchema.safeParse({ page: -1 }).success, false);
  assert.equal(listSchema.safeParse({ q: 'a'.repeat(121) }).success, false);
});

test('nome somente com espaços não é um cadastro válido', () => {
  assert.equal(studentSchema.safeParse({ ...valid, full_name: '   ' }).success, false);
});
test('login normaliza e-mail antes de validar seu formato', () => {
  const value = loginSchema.parse({ email: '  PROFESSOR@ELO.LOCAL  ', password: 'exemplo' });
  assert.equal(value.email, 'professor@elo.local');
});
