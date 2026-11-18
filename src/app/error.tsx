'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone-state" id="main-content">
      <h1>Não foi possível abrir esta página.</h1>
      <p>Tente novamente. Se continuar, confira se o MySQL está em execução.</p>
      <button className="button primary" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
