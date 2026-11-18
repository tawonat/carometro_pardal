'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UsersRound, Layers3, BookOpen, LogOut, ArrowUpRight, Network } from 'lucide-react';
import { useState } from 'react';
import { request, initials } from '@/lib/client';
import type { User } from '@/lib/types';
import { Message } from './ui';

export function Logo() {
  return (
    <span className="logo">
      <span className="logo-symbol">
        <Network size={25} strokeWidth={2.4} />
      </span>
      elo<span className="logo-dot">.</span>
    </span>
  );
}
export default function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  const [error, setError] = useState(''),
    [leaving, setLeaving] = useState(false);
  const navigation = [
    { href: '/carometro', label: 'Carômetro', icon: UsersRound },
    { href: '/turmas', label: 'Turmas', icon: Layers3 },
    { href: '/sobre', label: 'Sobre o projeto', icon: BookOpen },
  ];
  async function logout() {
    setLeaving(true);
    try {
      await request('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setLeaving(false);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/carometro" aria-label="Elo, início">
          <Logo />
        </Link>
        <div className="workspace-name">CARÔMETRO ESCOLAR</div>
        <span className="nav-heading">ESPAÇO ACADÊMICO</span>
        <nav aria-label="Navegação principal">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'nav-link selected' : 'nav-link'}
              aria-current={pathname === href ? 'page' : undefined}
            >
              <Icon size={20} />
              {label}
              {pathname === href && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="note-icon">✦</div>
          <strong>
            Conexões começam
            <br />
            com um rosto.
          </strong>
          <p>
            Um lugar para conhecer
            <br />
            quem aprende com você.
          </p>
          <Link href="/sobre">
            Conheça o projeto <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <span className="local-dot" /> Ambiente escolar <span>v1.0</span>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            Espaço acadêmico <span>/</span>{' '}
            <strong>{navigation.find((n) => n.href === pathname)?.label}</strong>
          </div>
          <div className="user-area">
            <span className="user-avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <small>Gestão acadêmica</small>
            </div>
            <button
              type="button"
              title="Sair"
              aria-label="Sair da conta"
              className="icon-button"
              disabled={leaving}
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {error && <Message>{error}</Message>}
          {children}
        </main>
        <footer className="footer">
          <span>
            elo. <span>Pessoas, antes de números.</span>
          </span>
          <span>Projeto acadêmico · Next.js + MySQL</span>
        </footer>
      </div>
    </div>
  );
}
