'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Camera, Upload, Save } from 'lucide-react';
import { studentSchema, statuses } from '@/lib/validation';
import { ApiError, photoUrl, request } from '@/lib/client';
import type { Classroom, Student } from '@/lib/types';
import { Field, Message, Modal, Spinner } from './ui';

export default function StudentForm({ student, classes, onClose, onSaved }: { student?: Student; classes: Classroom[]; onClose: () => void; onSaved: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [fields, setFields] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState(student?.avatar_key || 1), [photo, setPhoto] = useState<File>(), [remove, setRemove] = useState(false), [preview, setPreview] = useState('');
  // URLs temporárias precisam ser revogadas para não acumular imagens na memória.
  useEffect(() => { if (!photo) { setPreview(''); return; } const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url); }, [photo]);
  const image = preview || (!remove && student?.has_photo ? photoUrl(student) : `/avatars/${avatar}.svg`);
  function choosePhoto(file?: File) {
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) { setError('Escolha uma foto JPG, PNG ou WebP com até 3 MB.'); return; }
    setPhoto(file); setRemove(false);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(''); setFields({});
    const form = new FormData(e.currentTarget);
    form.set('avatar_key', String(avatar)); form.set('remove_photo', String(remove));
    const parsed = studentSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) { setFields(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); setError('Revise os campos indicados.'); return; }
    if (photo) form.set('photo', photo); else form.delete('photo');
    setBusy(true);
    try { await request(student ? `/api/students/${student.id}` : '/api/students', { method: student ? 'PUT' : 'POST', body: form }); onSaved(); }
    catch (e) { setError((e as Error).message); if (e instanceof ApiError) setFields(e.fields); setBusy(false); }
  }
  return <Modal title={student ? 'Editar aluno' : 'Uma nova história por aqui.'} subtitle={student ? 'Atualize os dados e mantenha tudo em dia.' : 'Cadastre um aluno para fazer parte do carômetro.'} onClose={onClose} wide busy={busy}>
    <form onSubmit={submit} className="entity-form"><fieldset disabled={busy} className="form-fieldset">{error && <Message>{error}</Message>}
      <div className="photo-picker"><img src={image} alt="Prévia do retrato" /><div><strong>Rosto que faz parte.</strong><p>Adicione uma foto ou escolha uma ilustração.</p><label className="button secondary upload-button"><Upload size={16} /> Escolher foto<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={e => { choosePhoto(e.target.files?.[0]); e.target.value = ''; }} /></label>{(photo || (student?.has_photo && !remove)) && <button type="button" className="text-button" onClick={() => { setPhoto(undefined); setRemove(true); }}>Remover foto</button>}<small>JPG, PNG ou WebP · até 3 MB</small></div></div>
      <div className="avatar-options" aria-label="Escolher ilustração">{Array.from({ length: 12 }, (_, i) => i + 1).map(i => <button type="button" key={i} className={avatar === i && !photo && (!student?.has_photo || remove) ? 'chosen' : ''} aria-label={`Usar ilustração ${i}`} aria-pressed={avatar === i && !photo && (!student?.has_photo || remove)} onClick={() => { setAvatar(i); setPhoto(undefined); setRemove(true); }}><img src={`/avatars/${i}.svg`} alt="" /></button>)}</div>
      <div className="form-grid"><Field label="Nome completo *" error={fields.full_name}><input name="full_name" required minLength={2} maxLength={120} defaultValue={student?.full_name} placeholder="Ex.: Ana Beatriz Martins" autoComplete="name" /></Field><Field label="Nome de preferência" error={fields.preferred_name}><input name="preferred_name" maxLength={60} defaultValue={student?.preferred_name || ''} placeholder="Como prefere ser chamado(a)?" /></Field>
      <Field label="Matrícula *" error={fields.enrollment} hint="De 4 a 12 números. Não pode se repetir."><input name="enrollment" inputMode="numeric" pattern="[0-9]{4,12}" required minLength={4} maxLength={12} defaultValue={student?.enrollment} placeholder="Ex.: 2026025" /></Field><Field label="E-mail" error={fields.email}><input name="email" type="email" maxLength={160} defaultValue={student?.email || ''} placeholder="aluno@exemplo.com" /></Field>
      <Field label="Turma *" error={fields.class_id}><select name="class_id" required defaultValue={student?.class_id || ''}><option value="" disabled>Selecione a turma</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.school_year} · {c.shift}</option>)}</select></Field><Field label="Situação *" error={fields.status}><select name="status" defaultValue={student?.status || 'Ativo'}>{statuses.map(s => <option key={s}>{s}</option>)}</select></Field></div>
      <Field label="Uma breve apresentação" error={fields.bio} hint="Opcional · até 280 caracteres."><textarea name="bio" rows={3} maxLength={280} defaultValue={student?.bio || ''} placeholder="Interesses, projetos e um pouco da sua história..." /></Field>
      <p className="form-note"><Camera size={15} /> Use fotos com autorização. Os dados iniciais são fictícios.</p>
      </fieldset><div className="modal-actions"><span>* Campos obrigatórios</span><button type="button" className="button secondary" onClick={onClose} disabled={busy}>Cancelar</button><button className="button primary" disabled={busy}>{busy ? <Spinner /> : <Save size={17} />}{student ? 'Salvar alterações' : 'Cadastrar aluno'}</button></div>
    </form>
  </Modal>;
}
