import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Elo — Carômetro escolar', description: 'Pessoas, antes de números. Carômetro escolar para organizar alunos e turmas.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><a href="#main-content" className="skip-link">Pular para o conteúdo</a>{children}</body></html>;
}
