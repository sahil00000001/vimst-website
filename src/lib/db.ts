import { MongoClient, type Db, type Collection } from 'mongodb';

/**
 * MongoDB connection.
 *
 * Serverless functions are recycled constantly, so the client is cached on the
 * global object: without that, every invocation opens a fresh connection pool
 * and the cluster runs out of connections under any real load.
 */

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? 'mgimst';

declare global {
  // eslint-disable-next-line no-var
  var _mgimstMongo: { client: MongoClient; promise: Promise<MongoClient> } | undefined;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'MONGODB_URI is not set. Add it to .env.local (or the Vercel project settings) to enable the database.'
    );
    this.name = 'DatabaseNotConfiguredError';
  }
}

export function isDatabaseConfigured() {
  return Boolean(URI);
}

function getClientPromise(): Promise<MongoClient> {
  if (!URI) throw new DatabaseNotConfiguredError();

  if (!global._mgimstMongo) {
    const client = new MongoClient(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    });
    global._mgimstMongo = { client, promise: client.connect() };
  }
  return global._mgimstMongo.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

/* ------------------------------------------------------------------
   Documents
   ------------------------------------------------------------------ */

export type Student = {
  rollNo: string;
  name: string;
  fatherName: string;
  /** Stored as YYYY-MM-DD so it compares and sorts as a plain string. */
  dob: string;
  batch: string;
  className: string;
  branch: string;
  /** Optional link to a course slug in the site catalogue. */
  courseSlug?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubjectMark = {
  subjectCode: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
};

export type Result = {
  rollNo: string;
  semester: string;
  subjects: SubjectMark[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  finalResult: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Admin = {
  username: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  lastLoginAt?: Date;
};

export async function students(): Promise<Collection<Student>> {
  return (await getDb()).collection<Student>('students');
}

export async function results(): Promise<Collection<Result>> {
  return (await getDb()).collection<Result>('results');
}

export async function admins(): Promise<Collection<Admin>> {
  return (await getDb()).collection<Admin>('admins');
}

/**
 * Creates the indexes the app relies on. Safe to call repeatedly -- Mongo
 * ignores a createIndex for an index that already exists.
 */
export async function ensureIndexes() {
  const [s, r, a] = await Promise.all([students(), results(), admins()]);
  await Promise.all([
    s.createIndex({ rollNo: 1 }, { unique: true }),
    s.createIndex({ name: 'text', rollNo: 'text' }),
    s.createIndex({ batch: 1 }),
    r.createIndex({ rollNo: 1, semester: 1 }, { unique: true }),
    r.createIndex({ rollNo: 1 }),
    a.createIndex({ username: 1 }, { unique: true }),
  ]);
}

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
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
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
  const failed = subjects.some(
    (s) => s.totalMarks > 0 && s.obtainedMarks / s.totalMarks < 0.35
  );

  return {
    totalMarks,
    obtainedMarks,
    percentage,
    finalResult: failed ? 'FAIL' : percentage >= 35 ? 'PASS' : 'FAIL',
  };
}
