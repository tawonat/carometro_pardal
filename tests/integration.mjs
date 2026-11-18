import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { connect } from '../scripts/shared.mjs';

// Teste real de HTTP + MySQL: usa o mesmo servidor que você abriu no navegador.
// Cria registros com nomes exclusivos e remove SOMENTE seus próprios registros ao terminar.
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const origin = new URL(base).origin;
let cookie = '',
  studentId,
  classId,
  passed = 0;
const marker = String(Date.now()).slice(-10);
const rateEmail = `limite-${marker}@exemplo.invalid`;
const rateHash = createHash('sha256').update(rateEmail).digest('hex');
const classroom = {
  name: `Teste ${marker}`,
  course: 'Teste de integração',
  school_year: 2026,
  shift: 'Noite',
  room: 'Teste',
};
function check(label, callback) {
  callback();
  passed++;
  console.log(`OK ${String(passed).padStart(2, '0')} · ${label}`);
}
async function http(path, method = 'GET', body, customOrigin = origin, authenticated = true) {
  const headers = { Origin: customOrigin };
  if (authenticated && cookie) headers.Cookie = cookie;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch(base + path, { method, headers, body });
  const content = response.headers.get('content-type') || '';
  const payload = content.includes('application/json')
    ? await response.json()
    : Buffer.from(await response.arrayBuffer());
  return { response, status: response.status, payload, data: payload.data };
}
function studentForm(changes = {}, image) {
  const form = new FormData();
  const values = {
    enrollment: marker,
    full_name: `Pessoa Teste ${marker}`,
    preferred_name: '',
    email: '',
    class_id: classId,
    status: 'Ativo',
    bio: 'Registro criado pelo teste automatizado.',
    avatar_key: 1,
    ...changes,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, String(value));
  if (image) form.set('photo', new Blob([image.bytes], { type: image.type }), image.name);
  return form;
}
try {
  const demo = await http('/api/auth/demo', 'POST');
  check('atalho de demonstração respeita a configuração do servidor', () =>
    assert.equal(demo.status, process.env.DEMO_ACCESS === 'true' ? 200 : 404),
  );
  const anonymous = await http('/api/students', 'GET', undefined, origin, false);
  check('API exige autenticação', () => assert.equal(anonymous.status, 401));
  const login = await http('/api/auth/login', 'POST', {
    email: process.env.DEMO_EMAIL || 'professor@elo.local',
    password: process.env.DEMO_PASSWORD || 'Elo@2026!',
  });
  assert.equal(login.status, 200, JSON.stringify(login.payload));
  cookie = login.response.headers.get('set-cookie').split(';')[0];
  check('login cria cookie HttpOnly e SameSite=Strict', () => {
    assert.match(login.response.headers.get('set-cookie'), /httponly/i);
    assert.match(login.response.headers.get('set-cookie'), /samesite=strict/i);
  });
  const cross = await http('/api/classes', 'POST', classroom, 'https://site-externo.invalid');
  check('bloqueia alteração de outro site', () => assert.equal(cross.status, 403));
  const createdClass = await http('/api/classes', 'POST', classroom);
  assert.equal(createdClass.status, 201, JSON.stringify(createdClass.payload));
  classId = createdClass.data.id;
  check('cria turma no banco', () => assert.ok(classId));
  const duplicateClass = await http('/api/classes', 'POST', classroom);
  check('impede turmas duplicadas', () => assert.equal(duplicateClass.status, 409));
  const cRead = await http(`/api/classes/${classId}`);
  check('consulta turma criada', () => assert.equal(cRead.data.name, classroom.name));
  const invalid = await http('/api/students', 'POST', studentForm({ enrollment: 'ABC' }));
  check('valida dados no servidor', () => assert.equal(invalid.status, 422));
  const invalidImage = await http(
    '/api/students',
    'POST',
    studentForm(
      {},
      { bytes: Buffer.from('nao e uma imagem'), type: 'image/jpeg', name: 'falsa.jpg' },
    ),
  );
  check('recusa arquivo falso disfarçado de foto', () => assert.equal(invalidImage.status, 422));
  // Criamos um PNG real em memória, sem depender de arquivos ou serviços externos.
  const png = await sharp({ create: { width: 40, height: 40, channels: 3, background: '#aabbcc' } })
    .png()
    .toBuffer();
  const created = await http(
    '/api/students',
    'POST',
    studentForm({}, { bytes: png, type: 'image/png', name: 'teste.png' }),
  );
  assert.equal(created.status, 201, JSON.stringify(created.payload));
  studentId = created.data.id;
  check('cadastra aluno com foto', () => assert.ok(studentId));
  const image = await http(`/api/students/${studentId}/photo`);
  check('foto é servida como WebP protegido', () => {
    assert.equal(image.status, 200);
    assert.match(image.response.headers.get('content-type'), /image\/webp/);
  });
  const noPhotoAuth = await http(
    `/api/students/${studentId}/photo`,
    'GET',
    undefined,
    origin,
    false,
  );
  check('foto exige sessão', () => assert.equal(noPhotoAuth.status, 401));
  const duplicate = await http('/api/students', 'POST', studentForm());
  check('impede matrícula duplicada', () => assert.equal(duplicate.status, 409));
  const blocked = await http(`/api/classes/${classId}`, 'DELETE');
  check('FK impede excluir turma com aluno', () => assert.equal(blocked.status, 409));
  const found = await http(`/api/students?q=${marker}&classId=${classId}`);
  check('busca encontra o aluno gravado e filtra turma', () => {
    assert.equal(found.data.total, 1);
    assert.equal(found.data.students[0].id, studentId);
  });
  const injection = await http('/api/students?q=' + encodeURIComponent("' OR 1=1 --"));
  check('texto SQL é tratado como texto de busca', () => {
    assert.equal(injection.status, 200);
    assert.equal(injection.data.total, 0);
  });
  const badClass = await http(
    `/api/students/${studentId}`,
    'PUT',
    studentForm({ class_id: 2147483647, full_name: 'Esta alteração deve ser desfeita' }),
  );
  check('FK recusa transferência para turma inexistente', () => assert.equal(badClass.status, 422));
  const unchanged = await http(`/api/students/${studentId}`);
  check('falha na atualização não muda o perfil', () =>
    assert.equal(unchanged.data.full_name, `Pessoa Teste ${marker}`),
  );
  const updated = await http(
    `/api/students/${studentId}`,
    'PUT',
    studentForm({
      full_name: `Pessoa Editada ${marker}`,
      status: 'Trancado',
      remove_photo: 'true',
    }),
  );
  check('edita aluno e remove foto', () => assert.equal(updated.status, 200));
  // Outra conexão ao MySQL prova persistência fora da memória do servidor Next.js.
  const db = await connect();
  const [persisted] = await db.execute('SELECT full_name,status FROM students WHERE id=?', [
    studentId,
  ]);
  const [photoRows] = await db.execute('SELECT student_id FROM student_photos WHERE student_id=?', [
    studentId,
  ]);
  await db.end();
  check('outra conexão lê a edição persistida no MySQL', () => {
    assert.equal(persisted[0].status, 'Trancado');
    assert.equal(persisted[0].full_name, `Pessoa Editada ${marker}`);
    assert.equal(photoRows.length, 0);
  });
  const classUpdate = await http(`/api/classes/${classId}`, 'PUT', {
    ...classroom,
    room: 'Sala atualizada',
  });
  const classAfter = await http(`/api/classes/${classId}`);
  check('edição da turma persiste e pode ser consultada', () => {
    assert.equal(classUpdate.status, 200);
    assert.equal(classAfter.data.room, 'Sala atualizada');
  });
  const photoAgain = await http(
    `/api/students/${studentId}`,
    'PUT',
    studentForm({}, { bytes: png, type: 'image/png', name: 'foto.png' }),
  );
  check('substituição da foto funciona após removê-la', () => assert.equal(photoAgain.status, 200));
  const delStudent = await http(`/api/students/${studentId}`, 'DELETE');
  const dbAfterDelete = await connect();
  const [cascade] = await dbAfterDelete.execute(
    'SELECT student_id FROM student_photos WHERE student_id=?',
    [studentId],
  );
  await dbAfterDelete.end();
  check('CASCADE remove a foto junto com o aluno', () => assert.equal(cascade.length, 0));
  check('exclui aluno', () => assert.equal(delStudent.status, 200));
  const missing = await http(`/api/students/${studentId}`);
  check('aluno excluído retorna 404', () => assert.equal(missing.status, 404));
  studentId = undefined;
  const delClass = await http(`/api/classes/${classId}`, 'DELETE');
  check('turma sem alunos pode ser excluída', () => assert.equal(delClass.status, 200));
  classId = undefined;
  const logout = await http('/api/auth/logout', 'POST');
  const revoked = await http('/api/students');
  check('sair revoga a sessão no banco', () => {
    assert.equal(logout.status, 200);
    assert.equal(revoked.status, 401);
  });
  let attempt;
  for (let i = 0; i < 5; i++) {
    attempt = await http('/api/auth/login', 'POST', {
      email: rateEmail,
      password: 'Senha_incorreta_123',
    });
    assert.equal(attempt.status, 401);
  }
  attempt = await http('/api/auth/login', 'POST', {
    email: rateEmail,
    password: 'Senha_incorreta_123',
  });
  check('sexta tentativa é bloqueada por contador persistente', () =>
    assert.equal(attempt.status, 429),
  );
  console.log(`\n${passed} verificações de integração concluídas com MySQL real.`);
} catch (error) {
  console.error('FALHOU:', error.message);
  process.exitCode = 1;
} finally {
  // Não depende da API continuar acessível para limpar os registros que este teste criou.
  {
    const db = await connect();
    try {
      await db.execute('DELETE FROM login_attempts WHERE email_hash=?', [rateHash]);
      if (studentId) await db.execute('DELETE FROM students WHERE id=?', [studentId]);
      if (classId) await db.execute('DELETE FROM classes WHERE id=?', [classId]);
    } finally {
      await db.end();
    }
  }
}
