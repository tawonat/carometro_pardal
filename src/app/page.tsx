import { redirect } from 'next/navigation';
// Uma URL inicial única evita duas versões diferentes da mesma tela.
export default function Home() {
  redirect('/carometro');
}
