import { z } from 'zod';

// Zod verifica os VALORES em execução. Usamos as mesmas regras no cliente e servidor.
// O servidor sempre valida novamente: qualquer pessoa consegue contornar o formulário.
const requiredText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label}: use ao menos 2 caracteres.`)
    .max(max, `${label}: máximo de ${max} caracteres.`);
export const positiveId = z.coerce.number().int().positive().max(2147483647);
export const statuses = ['Ativo', 'Trancado', 'Concluído'] as const;
export const shifts = ['Manhã', 'Tarde', 'Noite', 'Integral'] as const;
export const studentSchema = z.object({
  enrollment: z
    .string()
    .trim()
    .regex(/^\d{4,12}$/, 'Matrícula: informe de 4 a 12 números.'),
  full_name: requiredText(120, 'Nome completo'),
  preferred_name: z.string().trim().max(60, 'Nome de preferência: máximo de 60 caracteres.'),
  email: z
    .union([z.literal(''), z.email('Informe um e-mail válido.').max(160)])
    .transform((v) => v.toLowerCase()),
  class_id: positiveId,
  status: z.enum(statuses, { error: 'Selecione uma situação válida.' }),
  bio: z.string().trim().max(280, 'Apresentação: máximo de 280 caracteres.'),
  avatar_key: z.coerce.number().int().min(1).max(12),
});
export const classSchema = z.object({
  name: requiredText(60, 'Nome da turma'),
  course: requiredText(100, 'Curso'),
  school_year: z.coerce
    .number()
    .int()
    .min(2000, 'O ano deve ser entre 2000 e 2100.')
    .max(2100, 'O ano deve ser entre 2000 e 2100.'),
  shift: z.enum(shifts, { error: 'Selecione um turno válido.' }),
  room: z.string().trim().max(30, 'Sala: máximo de 30 caracteres.'),
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Informe um e-mail válido.').max(160)),
  password: z.string().min(1, 'Informe sua senha.').max(128),
});
export type StudentInput = z.infer<typeof studentSchema>;
export type ClassInput = z.infer<typeof classSchema>;

// As chaves vindas da URL nunca são interpoladas diretamente no ORDER BY.
export const studentSorts = {
  name: 's.full_name ASC, s.id ASC',
  recent: 's.created_at DESC, s.id DESC',
  enrollment: 's.enrollment ASC, s.id ASC',
} as const;
export const listSchema = z.object({
  q: z.string().trim().max(120).default(''),
  classId: z.union([z.literal(''), positiveId]).default(''),
  status: z.union([z.literal(''), z.enum(statuses)]).default(''),
  sort: z.enum(['name', 'recent', 'enrollment']).default('name'),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
