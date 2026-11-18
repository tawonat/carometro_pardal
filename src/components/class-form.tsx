'use client';
import { useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { classSchema, shifts } from '@/lib/validation';
import { ApiError, jsonBody, request } from '@/lib/client';
import type { Classroom } from '@/lib/types';
import { Field, Message, Modal, Spinner } from './ui';
export default function ClassForm({
  classroom: c,
  onClose,
  onSaved,
}: {
  classroom?: Classroom;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [fields, setFields] = useState<Record<string, string>>({});
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFields({});
    const input = classSchema.safeParse(
      Object.fromEntries(new FormData(e.currentTarget).entries()),
    );
    if (!input.success) {
      setError('Revise os campos indicados.');
      setFields(Object.fromEntries(input.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setBusy(true);
    try {
      await request(c ? `/api/classes/${c.id}` : '/api/classes', {
        method: c ? 'PUT' : 'POST',
        ...jsonBody(input.data),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
      if (e instanceof ApiError) setFields(e.fields);
      setBusy(false);
    }
  }
  return (
    <Modal
      title={c ? 'Editar turma' : 'Uma turma, novas conexões.'}
      subtitle="Organize os alunos por curso, ano e turno."
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit} className="entity-form">
        <fieldset className="form-fieldset" disabled={busy}>
          {error && <Message>{error}</Message>}
          <Field label="Nome da turma *" error={fields.name}>
            <input
              name="name"
              required
              minLength={2}
              maxLength={60}
              defaultValue={c?.name}
              placeholder="Ex.: 3º A"
            />
          </Field>
          <Field label="Curso *" error={fields.course}>
            <input
              name="course"
              required
              minLength={2}
              maxLength={100}
              defaultValue={c?.course}
              placeholder="Ex.: Desenvolvimento de Sistemas"
            />
          </Field>
          <div className="form-grid">
            <Field label="Ano letivo *" error={fields.school_year}>
              <input
                type="number"
                name="school_year"
                min={2000}
                max={2100}
                required
                defaultValue={c?.school_year || new Date().getFullYear()}
              />
            </Field>
            <Field label="Turno *" error={fields.shift}>
              <select name="shift" defaultValue={c?.shift || 'Manhã'}>
                {shifts.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Sala ou laboratório" error={fields.room}>
            <input
              name="room"
              maxLength={30}
              defaultValue={c?.room || ''}
              placeholder="Ex.: Laboratório 01"
            />
          </Field>
          <p className="form-note">
            Nome + ano + turno identificam uma turma e não podem se repetir.
          </p>
        </fieldset>
        <div className="modal-actions">
          <button className="button secondary" type="button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="button primary" disabled={busy}>
            {busy ? <Spinner /> : <Save size={17} />}
            {c ? 'Salvar alterações' : 'Criar turma'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
