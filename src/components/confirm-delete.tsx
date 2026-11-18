'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { request } from '@/lib/client';
import { Message, Modal, Spinner } from './ui';
export default function ConfirmDelete({ name, path, description, onClose, onDeleted }: { name: string; path: string; description: string; onClose: () => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function remove() { setBusy(true); setError(''); try { await request(path, { method: 'DELETE' }); onDeleted(); } catch (e) { setError((e as Error).message); setBusy(false); } }
  return <Modal title="Excluir este registro?" onClose={onClose} busy={busy}><div className="delete-content"><div className="delete-icon"><Trash2 size={24} /></div><h3>{name}</h3><p>{description}</p>{error && <Message>{error}</Message>}</div><div className="modal-actions"><button className="button secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="button danger" disabled={busy} onClick={remove}>{busy ? <Spinner /> : <Trash2 size={17} />}Confirmar exclusão</button></div></Modal>;
}
