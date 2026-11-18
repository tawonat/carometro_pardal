'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';

export function Spinner() { return <LoaderCircle size={18} className="spin" aria-hidden="true" />; }
export function Message({ children }: { children: ReactNode }) { return <div className="message error" role="alert"><AlertCircle size={18} /><span>{children}</span></div>; }
export function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  useEffect(() => { const timer = setTimeout(onClose, 4500); return () => clearTimeout(timer); }, [onClose]);
  return <div className="toast" role="status"><CheckCircle2 size={20} />{text}<button className="icon-button" onClick={onClose} aria-label="Fechar aviso"><X size={16} /></button></div>;
}
/** dialog nativo oferece foco preso no modal, tecla Esc e semântica acessível. */
export function Modal({ title, subtitle, children, onClose, wide = false, busy = false }: {
  title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean; busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = oldOverflow; };
  }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} aria-labelledby={titleId}
    onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <div className="modal-heading"><div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button type="button" className="icon-button" disabled={busy} onClick={onClose} aria-label="Fechar janela"><X size={22} /></button></div>
    {children}
  </dialog>;
}
export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  // O input fica dentro do label: clicar no texto move o foco para o campo.
  return <label className={`field ${error ? 'invalid' : ''}`}><span>{label}</span>{children}{error ? <small className="field-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}
export function Badge({ status }: { status: string }) { return <span className={`badge ${status === 'Ativo' ? 'active' : status === 'Trancado' ? 'paused' : 'completed'}`}><i />{status}</span>; }
