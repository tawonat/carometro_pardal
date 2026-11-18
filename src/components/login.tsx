'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, UsersRound } from 'lucide-react';
import { Logo } from '@/components/shell';
import { Field, Message, Spinner } from '@/components/ui';
import { request, jsonBody } from '@/lib/client';

export default function Login({ quickDemo = false }: { quickDemo?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState('');
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/login', { method: 'POST', ...jsonBody({ email, password }) });
      router.replace('/carometro');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function enterDemo() {
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/demo', { method: 'POST' });
      router.replace('/carometro');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <main className="login-page" id="main-content">
      <section className="login-story">
        <Logo />
        <div className="story-main">
          <span className="eyebrow light">UM NOVO OLHAR PARA SUA TURMA</span>
          <h1>
            Cada rosto,
            <br />
            uma <em>história.</em>
          </h1>
          <p>
            Conheça as pessoas que fazem parte
            <br />
            da sua comunidade escolar.
          </p>
          <div className="portrait-stack">
            {[1, 4, 3, 8, 5].map((i) => (
              <img key={i} src={`/avatars/${i}.svg`} alt="Retrato ilustrado fictício" />
            ))}
            <span>
              <UsersRound size={23} />
            </span>
          </div>
          <small>Conectando pessoas. Aproximando histórias.</small>
        </div>
        <span className="story-footer">elo. — Pessoas, antes de números.</span>
        <span className="story-orbit orbit-one" />
        <span className="story-orbit orbit-two" />
      </section>
      <section className="login-form-area">
        <div className="login-mobile-logo">
          <Logo />
        </div>
        <form className="login-form" onSubmit={submit}>
          <div className="login-lock">
            <LockKeyhole size={23} />
          </div>
          <span className="eyebrow">SEU ESPAÇO ACADÊMICO</span>
          <h2>Bom ter você por aqui.</h2>
          <p>Entre para cuidar das suas turmas e alunos.</p>
          {error && <Message>{error}</Message>}
          <Field label="E-mail">
            <input
              type="email"
              autoComplete="username"
              maxLength={160}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
          <Field label="Senha">
            <div className="password-input">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
              <button
                className="icon-button"
                type="button"
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <button className="button primary login-submit" disabled={busy}>
            {busy ? (
              <Spinner />
            ) : (
              <>
                Entrar no Elo <ArrowRight size={19} />
              </>
            )}
          </button>
          <div className="demo-box">
            <strong>{quickDemo ? 'Ambiente de demonstração' : 'Primeiro acesso?'}</strong>
            <p>
              {quickDemo
                ? 'Dados fictícios. Acesso completo para testar o projeto.'
                : 'Use a conta de demonstração informada no README do projeto.'}
            </p>
            {quickDemo && (
              <button type="button" className="text-button" disabled={busy} onClick={enterDemo}>
                Acessar demonstração <ArrowRight size={15} />
              </button>
            )}
          </div>
          <small className="login-caption">Acesso reservado à gestão acadêmica.</small>
        </form>
      </section>
    </main>
  );
}
