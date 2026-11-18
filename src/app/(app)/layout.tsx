import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import Shell from '@/components/shell';
// Proteção das páginas. A API também verifica a sessão em cada endpoint.
export const dynamic = 'force-dynamic';
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user;
  try { user = await currentUser(); } catch { redirect('/login?database=1'); }
  if (!user) redirect('/login');
  return <Shell user={user}>{children}</Shell>;
}
