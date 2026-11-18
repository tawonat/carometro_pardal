-- Estrutura MySQL 8.0.16+ / 8.4. O script de setup escolhe a base antes de executar.
-- IF NOT EXISTS torna a instalação repetível sem apagar registros existentes.
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS classes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  course VARCHAR(100) NOT NULL,
  school_year SMALLINT UNSIGNED NOT NULL,
  shift ENUM('Manhã', 'Tarde', 'Noite', 'Integral') NOT NULL,
  room VARCHAR(30) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_class_year_shift UNIQUE (name, school_year, shift),
  CONSTRAINT ck_class_year CHECK (school_year BETWEEN 2000 AND 2100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  enrollment VARCHAR(12) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  preferred_name VARCHAR(60) NOT NULL DEFAULT '',
  email VARCHAR(160) NOT NULL DEFAULT '',
  class_id INT UNSIGNED NOT NULL,
  status ENUM('Ativo', 'Trancado', 'Concluído') NOT NULL DEFAULT 'Ativo',
  bio VARCHAR(280) NOT NULL DEFAULT '',
  avatar_key TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- RESTRICT impede deixar um aluno apontando para uma turma inexistente.
  CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
  CONSTRAINT ck_student_avatar CHECK (avatar_key BETWEEN 1 AND 12),
  INDEX idx_students_name (full_name),
  INDEX idx_students_class_status (class_id, status)
) ENGINE=InnoDB;

-- A foto fica em tabela própria: a listagem não carrega todos os bytes das imagens.
-- Relação 1:0..1. Ao excluir um aluno, a foto desaparece na mesma operação (CASCADE).
CREATE TABLE IF NOT EXISTS student_photos (
  student_id INT UNSIGNED PRIMARY KEY,
  image_data MEDIUMBLOB NOT NULL,
  CONSTRAINT fk_photo_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- O navegador recebe um token aleatório. Só seu hash é armazenado aqui.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB;

-- Contador persistente para limitar tentativas de login mesmo após reiniciar o Node.
CREATE TABLE IF NOT EXISTS login_attempts (
  email_hash CHAR(64) PRIMARY KEY,
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  window_start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
