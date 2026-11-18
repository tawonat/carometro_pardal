import Login from '@/components/login';
// A opção sem senha só aparece quando o responsável ativa explicitamente o modo demo.
export const dynamic = 'force-dynamic';
export default function Page() {
  return <Login quickDemo={process.env.DEMO_ACCESS === 'true'} />;
}
