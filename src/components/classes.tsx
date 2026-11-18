'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Layers3,
  UsersRound,
  MapPin,
  Sun,
  ArrowUpRight,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import type { Classroom } from '@/lib/types';
import { request } from '@/lib/client';
import { Message, Toast } from './ui';
import ClassForm from './class-form';
import ConfirmDelete from './confirm-delete';
export default function Classes() {
  const [classes, setClasses] = useState<Classroom[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const [query, setQuery] = useState(''),
    [revision, setRevision] = useState(0),
    [toast, setToast] = useState('');
  const [form, setForm] = useState<Classroom | 'new' | null>(null),
    [deleting, setDeleting] = useState<Classroom | null>(null);
  const closeToast = useCallback(() => setToast(''), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    request<Classroom[]>('/api/classes', { signal: controller.signal })
      .then(setClasses)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  // O volume pequeno de turmas permite filtrar localmente; alunos são paginados no servidor.
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const filtered = classes.filter((c) =>
    `${c.name} ${c.course} ${c.school_year} ${c.shift} ${c.room}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes(normalized),
  );
  function refreshed(message: string) {
    setForm(null);
    setDeleting(null);
    setToast(message);
    setRevision((v) => v + 1);
  }
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            <span />
            ORGANIZAÇÃO QUE APROXIMA
          </span>
          <h1>
            Cada turma, <span>um encontro.</span>
          </h1>
          <p>Um espaço para cada grupo. Uma conexão para cada aluno.</p>
        </div>
        <button className="button primary" onClick={() => setForm('new')}>
          <Plus size={19} />
          Criar turma
        </button>
      </section>
      <div className="classes-banner">
        <div className="classes-banner-icon">
          <Layers3 size={35} />
        </div>
        <div>
          <span className="eyebrow">APRENDER É COLETIVO</span>
          <h2>É aqui que as histórias se cruzam.</h2>
          <p>Organize as turmas e acompanhe quem faz parte de cada uma.</p>
        </div>
        <span className="banner-total">
          <strong>{classes.length}</strong>turmas
        </span>
      </div>
      <div className="directory-heading">
        <div>
          <h2>
            Turmas da escola<span className="count-pill">{filtered.length}</span>
          </h2>
          <p>Encontre seu grupo e conheça os alunos.</p>
        </div>
        <label className="search-input class-search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Buscar turmas"
            placeholder="Buscar turma, curso, ano..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {error ? (
        <div className="load-error">
          <Message>{error}</Message>
          <button className="button secondary" onClick={() => setRevision((v) => v + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : loading ? (
        <div className="class-grid">
          {[1, 2, 3, 4].map((i) => (
            <div className="skeleton-card" key={i}>
              <div />
              <span />
            </div>
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="empty-state">
          <div>
            <Layers3 size={32} />
          </div>
          <h3>{query ? 'Nenhuma turma encontrada.' : 'A primeira turma começa com você.'}</h3>
          <p>
            {query
              ? 'Tente outro nome ou curso.'
              : 'Crie uma turma para começar a cadastrar os alunos.'}
          </p>
          <button
            className="button primary"
            onClick={() => (query ? setQuery('') : setForm('new'))}
          >
            {query ? 'Limpar busca' : 'Criar primeira turma'}
          </button>
        </div>
      ) : (
        <div className="class-grid">
          {filtered.map((c, i) => (
            <article key={c.id} className={`class-card class-color-${i % 4}`}>
              <div className="class-card-top">
                <span className="class-icon">
                  <Layers3 size={23} />
                </span>
                <span className="class-year">
                  <CalendarDays size={14} />
                  {c.school_year}
                </span>
                <div>
                  <button
                    className="icon-button"
                    onClick={() => setForm(c)}
                    aria-label={`Editar turma ${c.name}`}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => setDeleting(c)}
                    aria-label={`Excluir turma ${c.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <h3>{c.name}</h3>
              <p className="class-course">{c.course}</p>
              <div className="class-details">
                <span>
                  <Sun size={16} />
                  {c.shift}
                </span>
                <span>
                  <MapPin size={16} />
                  {c.room || 'Sala não informada'}
                </span>
              </div>
              <div className="class-card-footer">
                <span>
                  <UsersRound size={17} />
                  <strong>{c.student_count}</strong>{' '}
                  {Number(c.student_count) === 1 ? 'aluno' : 'alunos'}
                </span>
                <Link href={`/carometro?turma=${c.id}`}>
                  Ver turma <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="class-tip">
        <Layers3 size={19} />
        <p>
          <strong>Organização com integridade.</strong> Turmas com alunos só podem ser excluídas
          depois que os alunos forem transferidos ou removidos.
        </p>
      </div>
      {form && (
        <ClassForm
          classroom={form === 'new' ? undefined : form}
          onClose={() => setForm(null)}
          onSaved={() =>
            refreshed(
              form === 'new' ? 'Turma criada com sucesso.' : 'Turma atualizada com sucesso.',
            )
          }
        />
      )}
      {deleting && (
        <ConfirmDelete
          name={`${deleting.name} · ${deleting.school_year} · ${deleting.shift}`}
          path={`/api/classes/${deleting.id}`}
          description={
            Number(deleting.student_count)
              ? `Esta turma possui ${deleting.student_count} aluno(s). O banco impedirá a exclusão enquanto houver vínculos. Transfira ou exclua os alunos primeiro.`
              : 'A turma será excluída permanentemente. Esta ação não pode ser desfeita.'
          }
          onClose={() => setDeleting(null)}
          onDeleted={() => refreshed('Turma excluída com sucesso.')}
        />
      )}
      {toast && <Toast text={toast} onClose={closeToast} />}
    </>
  );
}
