/** Contratos enviados pela API. Tipos são removidos na compilação; não validam JSON. */
export type User = { id: number; name: string; email: string };
export type Classroom = {
  id: number;
  name: string;
  course: string;
  school_year: number;
  shift: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  room: string;
  student_count: number;
};
export type Student = {
  id: number;
  enrollment: string;
  full_name: string;
  preferred_name: string;
  email: string;
  class_id: number;
  status: 'Ativo' | 'Trancado' | 'Concluído';
  bio: string;
  avatar_key: number;
  has_photo: number;
  updated_at: string;
  class_name: string;
  course: string;
  school_year: number;
  shift: string;
};
export type StudentPage = { students: Student[]; total: number; page: number; pages: number };
export type Stats = { students: number; classes: number; active: number; photos: number };
