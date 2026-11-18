import type { Student } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
/** Um único ponto para buscar JSON, tratar sessão expirada e traduzir falhas de rede. */
export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...options, cache: 'no-store' });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError('Não foi possível conectar. Confira sua conexão e tente novamente.', 0);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/auth/login')
      window.location.assign('/login?expired=1');
    throw new ApiError(
      payload.error?.message || 'Não foi possível concluir a solicitação.',
      response.status,
      payload.error?.fields,
    );
  }
  return payload.data as T;
}
export const jsonBody = (data: unknown) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
export const photoUrl = (student: Student) =>
  student.has_photo
    ? `/api/students/${student.id}/photo?v=${encodeURIComponent(student.updated_at)}`
    : `/avatars/${student.avatar_key}.svg`;
export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('');
}
