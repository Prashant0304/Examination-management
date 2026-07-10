-- ============================================================
-- IA & External Marks System - Initial Schema
-- ============================================================

CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(30)  NOT NULL CHECK (role IN ('ADMIN','HOD','FACULTY','STUDENT')),
    department_id   BIGINT REFERENCES departments(id),
    usn             VARCHAR(30) UNIQUE,          -- only for students
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    department_id   BIGINT NOT NULL REFERENCES departments(id),
    semester        INT NOT NULL,
    credits         INT NOT NULL DEFAULT 0,
    ia_max_marks       NUMERIC(5,2) NOT NULL DEFAULT 50,
    external_max_marks NUMERIC(5,2) NOT NULL DEFAULT 50,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE exam_cycles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,      -- e.g. "Odd Semester 2026"
    semester    INT NOT NULL,
    year        INT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(semester, year)
);

CREATE TABLE faculty_subject_assignment (
    id              BIGSERIAL PRIMARY KEY,
    faculty_id      BIGINT NOT NULL REFERENCES users(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    exam_cycle_id   BIGINT NOT NULL REFERENCES exam_cycles(id),
    UNIQUE(faculty_id, subject_id, exam_cycle_id)
);

CREATE TABLE student_subject_enrollment (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES users(id),
    subject_id      BIGINT NOT NULL REFERENCES subjects(id),
    exam_cycle_id   BIGINT NOT NULL REFERENCES exam_cycles(id),
    UNIQUE(student_id, subject_id, exam_cycle_id)
);

CREATE TABLE marks (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES users(id),
    subject_id          BIGINT NOT NULL REFERENCES subjects(id),
    exam_cycle_id       BIGINT NOT NULL REFERENCES exam_cycles(id),
    ia_marks            NUMERIC(5,2),
    external_marks      NUMERIC(5,2),
    total_marks         NUMERIC(6,2) GENERATED ALWAYS AS (COALESCE(ia_marks,0) + COALESCE(external_marks,0)) STORED,
    status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN ('DRAFT','SUBMITTED','HOD_APPROVED','ADMIN_APPROVED','REJECTED','REOPENED')),
    entered_by          BIGINT REFERENCES users(id),
    hod_reviewed_by     BIGINT REFERENCES users(id),
    hod_reviewed_at     TIMESTAMP,
    admin_reviewed_by   BIGINT REFERENCES users(id),
    admin_reviewed_at   TIMESTAMP,
    rejection_reason    VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    updated_at          TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(student_id, subject_id, exam_cycle_id)
);

CREATE INDEX idx_marks_status ON marks(status);
CREATE INDEX idx_marks_subject_cycle ON marks(subject_id, exam_cycle_id);

-- Immutable audit trail: every change to a mark row is appended here, never updated/deleted
CREATE TABLE mark_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    mark_id         BIGINT NOT NULL REFERENCES marks(id),
    changed_by      BIGINT NOT NULL REFERENCES users(id),
    action          VARCHAR(30) NOT NULL,   -- CREATED, UPDATED, SUBMITTED, HOD_APPROVED, ADMIN_APPROVED, REJECTED, REOPENED
    old_ia_marks    NUMERIC(5,2),
    new_ia_marks    NUMERIC(5,2),
    old_external_marks NUMERIC(5,2),
    new_external_marks NUMERIC(5,2),
    old_status      VARCHAR(30),
    new_status      VARCHAR(30),
    note            VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_mark ON mark_audit_log(mark_id);
