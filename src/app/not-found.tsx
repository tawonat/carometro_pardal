import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone-state" id="main-content">
      <span className="eyebrow">404</span>
      <h1>Esta página não está por aqui.</h1>
      <Link href="/carometro" className="button primary">
        Voltar ao carômetro
      </Link>
    </main>
  );
}
