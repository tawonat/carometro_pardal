import Carometro from '@/components/carometro';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ turma?: string }>;
}) {
  const { turma } = await searchParams;
  // Parâmetros inválidos não são propagados para a consulta da tela.
  return (
    <Carometro key={turma || 'all'} initialClass={turma && /^\d+$/.test(turma) ? turma : ''} />
  );
}
