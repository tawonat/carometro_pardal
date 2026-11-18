import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function success(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status, headers: { 'Cache-Control': 'no-store' } });
}
// Centralizar os erros mantém o mesmo formato em toda a API e evita vazar SQL/senhas.
export async function api(action: () => Promise<Response>): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    let status = 500,
      message = 'Não foi possível concluir. Tente novamente em instantes.';
    let fields: Record<string, string> | undefined;
    if (error instanceof HttpError) {
      status = error.status;
      message = error.message;
    } else if (error instanceof ZodError) {
      status = 422;
      message = 'Revise os campos indicados.';
      fields = Object.fromEntries(
        error.issues.map((issue) => [String(issue.path[0] || 'form'), issue.message]),
      );
    } else {
      const code = (error as { code?: string })?.code;
      if (code === 'ER_DUP_ENTRY') {
        status = 409;
        message = 'Essa matrícula ou identificação de turma já está cadastrada.';
      } else if (code === 'ER_ROW_IS_REFERENCED_2') {
        status = 409;
        message = 'Esta turma tem alunos. Transfira ou exclua os alunos antes de excluir a turma.';
      } else if (code === 'ER_NO_REFERENCED_ROW_2') {
        status = 422;
        message = 'A turma selecionada não existe mais. Atualize a página e selecione outra.';
      } else if (error instanceof SyntaxError) {
        status = 400;
        message = 'O conteúdo enviado não é válido.';
      } else {
        // Log deliberadamente reduzido: não imprime mensagem do driver nem dados pessoais.
        console.error('[Elo] Operação indisponível:', code || 'INTERNAL_ERROR');
        if (
          ['ECONNREFUSED', 'ETIMEDOUT', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(
            code || '',
          )
        ) {
          status = 503;
          message =
            'Não foi possível acessar o banco de dados. Verifique se o MySQL foi iniciado e configurado.';
        }
      }
    }
    return NextResponse.json(
      { error: { message, fields } },
      { status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
export function checkOrigin(request: Request) {
  // Navegadores enviam Origin nos POST/PUT/DELETE. Impede que outro site use o cookie.
  const origin = request.headers.get('origin');
  // Host conserva o endereço usado pelo navegador, mesmo quando Next normaliza request.url.
  const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get('host')}`;
  if (!origin || origin !== expectedOrigin)
    throw new HttpError(
      403,
      'Origem da solicitação não permitida. Abra o sistema pelo endereço correto.',
    );
}
export function limitBody(request: Request, bytes = 16_384) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > bytes) throw new HttpError(413, 'O conteúdo enviado é grande demais.');
}
