import postgres from 'postgres';

/**
 * PostgreSQL (Supabase) connection.
 *
 * Serverless functions are recycled constantly, so the client is cached on the
 * global object: without it, every invocation opens a fresh pool and the
 * database runs out of connections under any real load.
 *
 * The connection string must point at Supabase's **transaction pooler**
 * (`...pooler.supabase.com:6543`), not the direct `db.<ref>.supabase.co` host —
 * that one resolves to IPv6 only, which Vercel's functions cannot reach.
 * Transaction pooling does not support prepared statements, hence
 * `prepare: false`.
 */

const URL = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var _mgimstSql: ReturnType<typeof postgres> | undefined;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'DATABASE_URL is not set. Add it to .env.local (or the Vercel project settings) to enable the database.'
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

export function isDatabaseConfigured() {
  return Boolean(URL);
}

export function db() {
  if (!URL) throw new DatabaseNotConfiguredError();

  if (!global._mgimstSql) {
    global._mgimstSql = postgres(URL, {
      // One connection per function instance; the pooler multiplexes the rest.
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
      ssl: 'require',
      onnotice: () => {},
    });
  }
  return global._mgimstSql;
}

/**
 * Schema-qualified table references.
 *
 * The connection pooler ignores the `search_path` startup parameter and can
 * hand back a backend whose search path was set by an unrelated session, so
 * relying on it is not safe. Every query names its schema explicitly instead.
 * `DATABASE_SCHEMA` lets the test suite point the same code at a throwaway
 * schema without changing a single query.
 */
export const SCHEMA = process.env.DATABASE_SCHEMA ?? 'public';

export type Pool = ReturnType<typeof postgres>;

/**
 * A transaction handle builds queries exactly like the pool does, but
 * postgres.js types `TransactionSql` as its own interface rather than a
 * subtype of `Sql`. Inside a transaction, pass `asPool(tx)`.
 */
export const asPool = (tx: unknown) => tx as Pool;

export function tables(sql: Pool) {
  return {
    students: sql`${sql(SCHEMA)}.students`,
    results: sql`${sql(SCHEMA)}.results`,
    admins: sql`${sql(SCHEMA)}.admins`,
  };
}

/* ------------------------------------------------------------------
   Schema
   ------------------------------------------------------------------ */

/**
 * Creates the tables and indexes the app relies on. Safe to run repeatedly.
 *
 * `dob` is text rather than `date` deliberately: it is only ever compared for
 * exact equality against what a student types, and keeping it as a normalised
 * 'YYYY-MM-DD' string removes every timezone conversion between the browser,
 * the server and the database.
 */
export async function ensureSchema() {
  const sql = db();
  const t = tables(sql);

  await sql`
    create table if not exists ${t.students} (
      roll_no      text primary key,
      name         text not null,
      father_name  text not null default '',
      dob          text not null,
      batch        text not null default '',
      class_name   text not null default '',
      branch       text not null default '',
      course_slug  text,
      created_at   timestamptz not null default now(),
      updated_at   timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists ${t.results} (
      id             bigint generated always as identity primary key,
      roll_no        text not null references ${t.students}(roll_no) on delete cascade,
      semester       text not null,
      subjects       jsonb not null default '[]'::jsonb,
      total_marks    integer not null default 0,
      obtained_marks integer not null default 0,
      percentage     numeric(5,2) not null default 0,
      final_result   text not null default 'FAIL',
      published      boolean not null default true,
      created_at     timestamptz not null default now(),
      updated_at     timestamptz not null default now(),
      unique (roll_no, semester)
    )
  `;

  await sql`
    create table if not exists ${t.admins} (
      username      text primary key,
      password_hash text not null,
      name          text not null,
      created_at    timestamptz not null default now(),
      last_login_at timestamptz
    )
  `;

  await sql`create index if not exists students_batch_idx on ${t.students} (batch)`;
  await sql`create index if not exists students_name_idx on ${t.students} (lower(name))`;
  await sql`create index if not exists results_roll_idx on ${t.results} (roll_no)`;
}

/* ------------------------------------------------------------------
   Row types
   ------------------------------------------------------------------ */

export type Student = {
  rollNo: string;
  name: string;
  fatherName: string;
  dob: string;
  batch: string;
  className: string;
  branch: string;
  courseSlug?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubjectMark = {
  subjectCode: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
};

export type Result = {
  id?: string;
  rollNo: string;
  semester: string;
  subjects: SubjectMark[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  finalResult: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Admin = {
  username: string;
  passwordHash: string;
  name: string;
};

/* snake_case in the database, camelCase in the app. */

type StudentRow = {
  roll_no: string;
  name: string;
  father_name: string;
  dob: string;
  batch: string;
  class_name: string;
  branch: string;
  course_slug: string | null;
  created_at?: Date;
  updated_at?: Date;
};

export const toStudent = (r: StudentRow): Student => ({
  rollNo: r.roll_no,
  name: r.name,
  fatherName: r.father_name,
  dob: r.dob,
  batch: r.batch,
  className: r.class_name,
  branch: r.branch,
  courseSlug: r.course_slug,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

type ResultRow = {
  id: string;
  roll_no: string;
  semester: string;
  subjects: SubjectMark[];
  total_marks: number;
  obtained_marks: number;
  percentage: string | number;
  final_result: string;
  published: boolean;
  created_at?: Date;
  updated_at?: Date;
  student_name?: string | null;
};

export const toResult = (r: ResultRow): Result & { studentName?: string | null } => ({
  id: String(r.id),
  rollNo: r.roll_no,
  semester: r.semester,
  subjects: r.subjects ?? [],
  totalMarks: Number(r.total_marks),
  obtainedMarks: Number(r.obtained_marks),
  // numeric() comes back as a string, so it keeps its precision in transit.
  percentage: Number(r.percentage),
  finalResult: r.final_result,
  published: r.published,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  ...(r.student_name !== undefined ? { studentName: r.student_name } : {}),
});

/* ------------------------------------------------------------------
   Shared helpers
   ------------------------------------------------------------------ */

export const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

export const normaliseRollNo = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toUpperCase();

/** Accepts DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or an Excel date cell. */
export function normaliseDob(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const dmy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);

  return null;
}

/** Normalises "sem 3", "III", "3" to the canonical roman numeral. */
export function normaliseSemester(value: unknown): string | null {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/^SEM(ESTER)?\s*/, '');
  if (!raw) return null;

  if ((SEMESTERS as readonly string[]).includes(raw)) return raw;

  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1 && n <= 8) return SEMESTERS[n - 1];

  return null;
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
  'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/** Marks are printed in words on the statement, so the number is spelled out. */
export function numberToWords(input: number): string {
  const n = Math.round(input);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n === 0) return 'Zero';

  const under1000 = (v: number): string => {
    if (v < 20) return ONES[v];
    if (v < 100) {
      const t = TENS[Math.floor(v / 10)];
      const o = ONES[v % 10];
      return o ? `${t} ${o}` : t;
    }
    const h = `${ONES[Math.floor(v / 100)]} Hundred`;
    const rest = v % 100;
    return rest ? `${h} and ${under1000(rest)}` : h;
  };

  if (n < 1000) return under1000(n);
  if (n < 100000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    return `${under1000(th)} Thousand${rest ? ` ${under1000(rest)}` : ''}`;
  }
  return String(n);
}

/** Totals, percentage and pass/fail derived from the subject rows. */
export function summarise(subjects: SubjectMark[]) {
  const totalMarks = subjects.reduce((a, s) => a + (s.totalMarks || 0), 0);
  const obtainedMarks = subjects.reduce((a, s) => a + (s.obtainedMarks || 0), 0);
  const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;

  // A subject scoring under 35% fails the semester.
  const failed = subjects.some((s) => s.totalMarks > 0 && s.obtainedMarks / s.totalMarks < 0.35);

  return {
    totalMarks,
    obtainedMarks,
    percentage,
    finalResult: failed ? 'FAIL' : percentage >= 35 ? 'PASS' : 'FAIL',
  };
}
