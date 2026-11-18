import {
  ArrowUpRight,
  UsersRound,
  Database,
  ShieldCheck,
  Code2,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';
export default function About() {
  return (
    <>
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            <span />
            POR TRÁS DAS CONEXÕES
          </span>
          <h1>
            Pessoas, <span>antes de números.</span>
          </h1>
          <p>Um projeto escolar sobre tecnologia, organização e comunidade.</p>
        </div>
      </section>
      <section className="about-hero">
        <HeartHandshake size={46} />
        <h2>Uma escola é feita de gente.</h2>
        <p>
          O Elo é um carômetro digital que aproxima nomes, rostos e turmas. Um jeito simples de
          conhecer a comunidade escolar e manter os cadastros organizados.
        </p>
        <Link className="button primary" href="/carometro">
          Conhecer nossa comunidade <ArrowUpRight size={18} />
        </Link>
      </section>
      <div className="about-grid">
        {[
          {
            icon: UsersRound,
            title: 'Alunos e turmas',
            text: 'Cadastro, consulta, edição e exclusão, com busca por nome ou matrícula, filtros e visualização em cartões ou lista.',
          },
          {
            icon: Database,
            title: 'Dados que permanecem',
            text: 'MySQL guarda alunos, turmas, contas, sessões e fotos. Matrículas únicas e chaves estrangeiras preservam a consistência.',
          },
          {
            icon: ShieldCheck,
            title: 'Cuidado em cada etapa',
            text: 'Login, senhas protegidas, validação no servidor e confirmação antes de excluir. Use apenas fotos e dados autorizados.',
          },
          {
            icon: Code2,
            title: 'Feito para aprender',
            text: 'Next.js, React e TypeScript na aplicação. SQL explícito e código comentado para acompanhar o caminho de cada informação.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="about-note">
        <strong>Demonstração acadêmica</strong>
        <p>
          Os 24 alunos iniciais, seus e-mails e retratos ilustrados são fictícios. A documentação do
          projeto inclui instalação, modelo do banco, guia do código, testes e roteiro de
          apresentação.
        </p>
      </div>
    </>
  );
}
