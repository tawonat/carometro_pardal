'use client';
import { useCallback, useEffect, useState } from 'react';
import { UsersRound, Layers3, UserCheck, Camera, Plus, Search, LayoutGrid, List, ArrowUpRight, ChevronLeft, ChevronRight, SlidersHorizontal, Printer, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { photoUrl, request } from '@/lib/client';
import type { Classroom, Stats, Student, StudentPage } from '@/lib/types';
import { statuses } from '@/lib/validation';
import { Badge, Message, Toast } from './ui';
import StudentForm from './student-form';
import StudentProfile from './student-profile';
import ConfirmDelete from './confirm-delete';

export default function Carometro({ initialClass = '' }: { initialClass?: string }) {
  const [classes, setClasses] = useState<Classroom[]>([]), [stats, setStats] = useState<Stats>();
  const [data, setData] = useState<StudentPage>(), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [search, setSearch] = useState(''), [query, setQuery] = useState(''), [classId, setClassId] = useState(initialClass);
  const [status, setStatus] = useState(''), [sort, setSort] = useState('name'), [page, setPage] = useState(1), [view, setView] = useState<'grid' | 'list'>('grid');
  const [revision, setRevision] = useState(0), [toast, setToast] = useState('');
  const [form, setForm] = useState<Student | 'new' | null>(null), [profile, setProfile] = useState<Student | null>(null), [deleting, setDeleting] = useState<Student | null>(null);
  const closeToast = useCallback(() => setToast(''), []);
  // Pequeno debounce evita consultar o banco a cada tecla digitada.
  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    const qs = new URLSearchParams({ q: query, classId, status, sort, page: String(page) });
    request<StudentPage>(`/api/students?${qs}`, { signal: controller.signal }).then(setData).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    // Cancelar respostas antigas evita uma busca lenta sobrescrever uma mais recente.
    return () => controller.abort();
  }, [query, classId, status, sort, page, revision]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([request<Classroom[]>('/api/classes', { signal: controller.signal }), request<Stats>('/api/stats', { signal: controller.signal })]).then(([c, s]) => { setClasses(c); setStats(s); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, [revision]);
  function refreshed(message: string) { setForm(null); setProfile(null); setDeleting(null); setToast(message); setRevision(v => v + 1); }
  function clearFilters() { setSearch(''); setQuery(''); setClassId(''); setStatus(''); setPage(1); }
  const metrics = [{ label: 'Alunos cadastrados', value: stats?.students, icon: UsersRound, color: 'coral' }, { label: 'Turmas conectadas', value: stats?.classes, icon: Layers3, color: 'lavender' }, { label: 'Matrículas ativas', value: stats?.active, icon: UserCheck, color: 'sage' }, { label: 'Fotos adicionadas', value: stats?.photos, icon: Camera, color: 'sand' }];
  const filtered = Boolean(search || classId || status);
  return <>
    <section className="page-heading"><div><span className="eyebrow"><span />NOSSA COMUNIDADE</span><h1>Um rosto. <span>Muitas histórias.</span></h1><p>Conheça quem faz parte da sua escola.</p></div><button className="button primary" onClick={() => setForm('new')} disabled={!classes.length}><Plus size={19} />Cadastrar aluno</button></section>
    <section className="metrics" aria-label="Resumo do carômetro">{metrics.map(({ label, value, icon: Icon, color }) => <div className="metric" key={label}><div className={`metric-icon ${color}`}><Icon size={22} /></div><div><strong>{value ?? '—'}</strong><span>{label}</span></div></div>)}</section>
    <div className="directory-heading"><div><h2>Pessoas da nossa escola<span className="count-pill">{data?.total ?? '—'}</span></h2><p>Encontre um nome, reconheça um rosto.</p></div><button className="button subtle print-button" onClick={() => window.print()}><Printer size={16} />Imprimir página</button></div>
    <section className="directory" aria-label="Alunos"><div className="filterbar"><label className="search-input"><Search size={19} /><input type="search" aria-label="Buscar por nome ou matrícula" placeholder="Buscar por nome ou matrícula..." value={search} onChange={e => setSearch(e.target.value)} /></label><label className="filter-select"><SlidersHorizontal size={16} /><select aria-label="Filtrar por turma" value={classId} onChange={e => { setClassId(e.target.value); setPage(1); }}><option value="">Todas as turmas</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name} · {c.school_year} · {c.shift}</option>)}</select></label><select className="status-filter" aria-label="Filtrar por situação" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Todas as situações</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><div className="view-switch" aria-label="Modo de visualização"><button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Visualização em cartões"><LayoutGrid size={18} /></button><button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="Visualização em lista"><List size={19} /></button></div></div>
      <div className="results-bar"><span role="status">{loading ? 'Buscando alunos...' : `${data?.total ?? 0} ${(data?.total || 0) === 1 ? 'aluno encontrado' : 'alunos encontrados'}`}{filtered && <button className="clear-filters" onClick={clearFilters}><X size={13} />Limpar filtros</button>}</span><label>Ordenar por <select aria-label="Ordenação dos alunos" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="name">Nome A–Z</option><option value="recent">Mais recentes</option><option value="enrollment">Matrícula</option></select></label></div>
      {error ? <div className="load-error"><Message>{error}</Message><button className="button secondary" onClick={() => setRevision(v => v + 1)}>Tentar novamente</button></div> : loading ? <div className="student-grid" aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton-card"><div /><span /><span /></div>)}</div> : !data?.students.length ? <div className="empty-state"><div><UsersRound size={32} /></div><h3>{filtered ? 'Nenhum rosto por aqui ainda.' : 'Sua comunidade começa aqui.'}</h3><p>{filtered ? 'Tente outro nome ou ajuste os filtros da busca.' : 'Cadastre uma turma e adicione seu primeiro aluno.'}</p>{filtered ? <button className="button secondary" onClick={clearFilters}>Limpar filtros</button> : classes.length ? <button className="button primary" onClick={() => setForm('new')}><Plus size={17} />Cadastrar primeiro aluno</button> : <Link className="button primary" href="/turmas">Criar primeira turma</Link>}</div> : view === 'grid' ? <div className="student-grid">{data.students.map(s => <button className="student-card" key={s.id} onClick={() => setProfile(s)} aria-label={`Ver perfil de ${s.full_name}`}><div className="student-portrait"><img src={photoUrl(s)} alt={`Retrato de ${s.full_name}`} loading="lazy" /><span className="class-tag">{s.class_name}</span><span className="open-profile"><ArrowUpRight size={19} /></span></div><div className="student-info"><h3>{s.preferred_name || s.full_name}</h3><p>{s.course}</p><div className="card-bottom"><span>#{s.enrollment}</span><Badge status={s.status} /></div></div></button>)}</div> : <div className="table-scroll"><table className="student-table"><thead><tr><th>Aluno</th><th>Matrícula</th><th>Turma</th><th>Situação</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{data.students.map(s => <tr key={s.id}><td><button className="table-person" onClick={() => setProfile(s)}><img src={photoUrl(s)} alt="" /><span><strong>{s.preferred_name || s.full_name}</strong><small>{s.course}</small></span></button></td><td>#{s.enrollment}</td><td>{s.class_name} · {s.shift}</td><td><Badge status={s.status} /></td><td><button className="icon-button" aria-label={`Ver perfil de ${s.full_name}`} onClick={() => setProfile(s)}><ArrowUpRight size={19} /></button></td></tr>)}</tbody></table></div>}
      {!error && data && data.total > 0 && <div className="pagination"><span>Mostrando {(data.page - 1) * 12 + 1}–{Math.min(data.page * 12, data.total)} de {data.total} alunos</span><div><button className="icon-button" disabled={loading || data.page <= 1} onClick={() => setPage(data.page - 1)} aria-label="Página anterior"><ChevronLeft size={18} /></button><span>Página <strong>{data.page}</strong> de {data.pages}</span><button className="icon-button" disabled={loading || data.page >= data.pages} onClick={() => setPage(data.page + 1)} aria-label="Próxima página"><ChevronRight size={18} /></button></div></div>}
    </section>
    <div className="community-note"><Sparkles size={17} /><span>Mais que uma lista de alunos. Uma comunidade de histórias.</span><span>FEITO PARA CONECTAR</span></div>
    {form && <StudentForm student={form === 'new' ? undefined : form} classes={classes} onClose={() => setForm(null)} onSaved={() => refreshed(form === 'new' ? 'Aluno cadastrado com sucesso.' : 'Perfil atualizado com sucesso.')} />}
    {profile && <StudentProfile student={profile} onClose={() => setProfile(null)} onEdit={() => { setForm(profile); setProfile(null); }} onDelete={() => { setDeleting(profile); setProfile(null); }} />}
    {deleting && <ConfirmDelete name={deleting.full_name} path={`/api/students/${deleting.id}`} description="O cadastro e a foto serão excluídos permanentemente. Esta ação não pode ser desfeita." onClose={() => setDeleting(null)} onDeleted={() => refreshed('Aluno excluído com sucesso.')} />}
    {toast && <Toast text={toast} onClose={closeToast} />}
  </>;
}
