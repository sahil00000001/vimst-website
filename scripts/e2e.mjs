import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * End-to-end check of the admin backend against the real database.
 *
 * Everything is created inside a scratch Postgres **schema** that is dropped
 * at the end, so the test never touches live student data. The production
 * server is started against that schema and driven over real HTTP: sign in,
 * bulk upload a workbook with deliberately malformed rows, re-upload to prove
 * idempotency, read back through the admin endpoints, then look a result up
 * exactly the way a student would — including the cases that must be refused.
 *
 *   npm run build && npm run e2e
 */

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const [, key, rawValue] = m;
      if (process.env[key]) continue;
      process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const PORT = Number(process.env.E2E_PORT ?? 3399);
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = randomBytes(32).toString('hex');
const SCHEMA = `e2e_${randomBytes(4).toString('hex')}`;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env.local first.');
  process.exit(1);
}

/* The app reads DATABASE_SCHEMA, so the test points it at a scratch schema
   without changing the connection string or the code path under test. */

let passed = 0;
let failed = 0;

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

let cookie = '';
async function call(pathname, init = {}) {
  const res = await fetch(BASE + pathname, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(cookie ? { cookie } : {}) },
    redirect: 'manual',
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(';');
    if (pair.startsWith('mgimst_admin=')) cookie = pair;
  }
  return res;
}

async function buildWorkbook() {
  const wb = new ExcelJS.Workbook();

  const students = wb.addWorksheet('Students');
  students.columns = [
    { header: 'rollNo', key: 'rollNo' },
    { header: 'name', key: 'name' },
    { header: 'fatherName', key: 'fatherName' },
    { header: 'dob', key: 'dob' },
    { header: 'batch', key: 'batch' },
    { header: 'class', key: 'class' },
    { header: 'branch', key: 'branch' },
  ];
  students.addRows([
    { rollNo: 'mg2024001', name: 'Asha Rao', fatherName: 'Venkat Rao', dob: '2004-03-08', batch: '2024-2028', class: 'B.E. First Year', branch: 'Computer Engineering' },
    { rollNo: 'MG2024002', name: 'Imran Khan', fatherName: 'Salim Khan', dob: '15/07/2003', batch: '2024-2028', class: 'B.E. First Year', branch: 'Mechanical Engineering' },
    // Deliberately broken rows -- the importer should report and skip these.
    { rollNo: '', name: 'No Roll', dob: '2004-01-01' },
    { rollNo: 'MG2024003', name: 'No DOB', dob: '' },
  ]);

  const marks = wb.addWorksheet('Marks');
  marks.columns = [
    { header: 'rollNo', key: 'rollNo' },
    { header: 'semester', key: 'semester' },
    { header: 'subjectCode', key: 'subjectCode' },
    { header: 'subject', key: 'subject' },
    { header: 'totalMarks', key: 'totalMarks' },
    { header: 'obtainedMarks', key: 'obtainedMarks' },
  ];
  marks.addRows([
    { rollNo: 'MG2024001', semester: 'I', subjectCode: 'CS101', subject: 'Programming', totalMarks: 100, obtainedMarks: 78 },
    { rollNo: 'MG2024001', semester: 1, subjectCode: 'MA101', subject: 'Mathematics I', totalMarks: 100, obtainedMarks: 82 },
    { rollNo: 'MG2024001', semester: 'sem 1', subjectCode: 'PH101', subject: 'Physics', totalMarks: 100, obtainedMarks: 65 },
    { rollNo: 'MG2024002', semester: 'II', subjectCode: 'ME201', subject: 'Thermodynamics', totalMarks: 100, obtainedMarks: 30 },
    // obtained > total, must be rejected
    { rollNo: 'MG2024002', semester: 'II', subjectCode: 'ME202', subject: 'Bad Row', totalMarks: 50, obtainedMarks: 90 },
    // no such student, must be skipped on commit
    { rollNo: 'MG9999999', semester: 'I', subjectCode: 'XX101', subject: 'Orphan', totalMarks: 100, obtainedMarks: 50 },
  ]);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

const admin = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: 'require',
  connect_timeout: 20,
  onnotice: () => {},
});
let server;

try {
  console.log(`\nCreating scratch schema ${SCHEMA}…`);
  await admin`create schema ${admin(SCHEMA)}`;
  await admin.unsafe(`
    create table ${SCHEMA}.students (
      roll_no text primary key, name text not null, father_name text not null default '',
      dob text not null, batch text not null default '', class_name text not null default '',
      branch text not null default '', course_slug text,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table ${SCHEMA}.results (
      id bigint generated always as identity primary key,
      roll_no text not null references ${SCHEMA}.students(roll_no) on delete cascade,
      semester text not null, subjects jsonb not null default '[]'::jsonb,
      total_marks integer not null default 0, obtained_marks integer not null default 0,
      percentage numeric(5,2) not null default 0, final_result text not null default 'FAIL',
      published boolean not null default true,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
      unique (roll_no, semester)
    );
    create table ${SCHEMA}.admins (
      username text primary key, password_hash text not null, name text not null,
      created_at timestamptz not null default now(), last_login_at timestamptz
    );
  `);
  await admin.unsafe(
    `insert into ${SCHEMA}.admins (username, name, password_hash) values ($1, $2, $3)`,
    ['tester', 'Tester', await bcrypt.hash('correct-horse', 12)]
  );

  console.log('Starting the production server…');
  // Spawned through node directly rather than `npx ... shell:true`: a shell
  // wrapper survives kill() and leaves the server holding a database
  // connection, which exhausts the connection pooler on the next run.
  server = spawn(
    process.execPath,
    [path.join('node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', String(PORT)],
    {
      env: { ...process.env, DATABASE_SCHEMA: SCHEMA, ADMIN_SESSION_SECRET: SECRET },
      stdio: 'pipe',
    }
  );
  server.stderr.on('data', (d) => {
    const line = String(d);
    if (/error/i.test(line)) process.stderr.write(`  [server] ${line}`);
  });

  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE + '/api/admin/session');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log('\nAUTH');
  check('session is empty before signing in', (await (await call('/api/admin/session')).json()).ok === false);
  check('admin API rejects an unauthenticated request', (await call('/api/admin/students')).status === 401);
  {
    const res = await call('/admin/students');
    check(
      'middleware redirects an unauthenticated page request to the login',
      res.status === 307 && (res.headers.get('location') ?? '').includes('/admin/login'),
      `got ${res.status}`
    );
  }
  {
    const res = await call('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tester', password: 'wrong-password' }),
    });
    check('a wrong password is rejected', res.status === 401, `got ${res.status}`);
  }
  {
    const res = await call('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TESTER', password: 'correct-horse' }),
    });
    check('correct credentials sign in (username case-insensitive)', (await res.json()).ok === true);
    check('a session cookie is issued', cookie.startsWith('mgimst_admin='));
  }

  console.log('\nBULK UPLOAD');
  const workbook = await buildWorkbook();
  {
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'preview');
    const json = await (await call('/api/admin/import', { method: 'POST', body })).json();

    check('preview succeeds', json.ok === true, json.error);
    check('preview finds 2 valid students', json.summary?.studentsNew === 2, JSON.stringify(json.summary));
    check('preview finds 3 result groups (including the orphan)', json.summary?.resultsInFile === 3);
    check('preview reports the 2 bad student rows and 1 bad marks row', json.issues?.length === 3, JSON.stringify(json.issues));
    check('preview flags the orphan roll number', json.summary?.orphanRollNos?.includes('MG9999999'));
    check(
      'semester aliases (1, "sem 1") group with "I"',
      json.results?.find((r) => r.rollNo === 'MG2024001')?.subjectCount === 3
    );
  }
  {
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'commit');
    const json = await (await call('/api/admin/import', { method: 'POST', body })).json();

    check('commit succeeds', json.ok === true, json.error);
    check('2 students written', json.summary?.studentsWritten === 2, JSON.stringify(json.summary));
    check('2 results written', json.summary?.resultsWritten === 2);
    check('the orphan result is skipped', json.summary?.skippedResults?.length === 1);
  }
  {
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'commit');
    await call('/api/admin/import', { method: 'POST', body });

    const json = await (await call('/api/admin/students')).json();
    check('re-uploading does not duplicate students', json.total === 2, `total ${json.total}`);
  }

  console.log('\nADMIN READS');
  {
    const json = await (await call('/api/admin/stats')).json();
    check('stats report 2 students and 2 results', json.stats?.studentCount === 2 && json.stats?.resultCount === 2);
  }
  {
    const json = await (await call('/api/admin/students?q=asha')).json();
    check('student search matches by name', json.items?.[0]?.rollNo === 'MG2024001');
  }
  {
    const json = await (await call('/api/admin/students/MG2024001')).json();
    check('a lowercase roll number in the sheet is stored uppercase', json.student?.rollNo === 'MG2024001');
    check('DD/MM/YYYY dates are normalised', json.student?.dob === '2004-03-08', json.student?.dob);
    check('the student carries their results', json.results?.length === 1);
  }
  {
    const json = await (await call('/api/admin/results?semester=II')).json();
    check('results filter by semester', json.items?.length === 1 && json.items[0].rollNo === 'MG2024002');
    check('a subject under 35% fails the semester', json.items?.[0]?.finalResult === 'FAIL');
    check('the student name is joined onto the result', json.items?.[0]?.studentName === 'Imran Khan');
  }

  console.log('\nPUBLIC VERIFICATION');
  const lookup = (params) =>
    fetch(`${BASE}/api/verify-enrollment?${new URLSearchParams(params)}`);
  {
    const res = await lookup({ name: 'Asha Rao', rollNo: 'MG2024001', dob: '2004-03-08', semester: 'I' });
    const json = await res.json();
    check('a student can look up their own result', json.ok === true, json.error);
    check('the marksheet lists all 3 subjects', json.data?.result?.length === 3);
    check('the percentage is computed', json.data?.percentage === '75%', json.data?.percentage);
    check('marks are spelled out in words', json.data?.totalMarksInWord === 'Two Hundred and Twenty Five', json.data?.totalMarksInWord);
    check('the final result is PASS', json.data?.finalResult === 'PASS');
  }
  check(
    'a mismatched name is refused',
    (await lookup({ name: 'Imran Khan', rollNo: 'MG2024001', dob: '2004-03-08', semester: 'I' })).status === 404
  );
  check(
    'a wrong date of birth is refused',
    (await lookup({ name: 'Asha Rao', rollNo: 'MG2024001', dob: '1999-01-01', semester: 'I' })).status === 404
  );
  {
    const res = await lookup({ name: 'Asha Rao', rollNo: 'MG2024001', dob: '2004-03-08', semester: 'VIII' });
    const json = await res.json();
    check('a semester with nothing published says so', res.status === 404 && /published/i.test(json.error ?? ''), json.error);
  }

  console.log('\nHIDDEN RESULTS');
  {
    const list = await (await call('/api/admin/results?q=MG2024001')).json();
    const id = list.items[0]._id;
    const put = await call(`/api/admin/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNo: 'MG2024001', semester: 'I', published: false, subjects: list.items[0].subjects }),
    });
    check('a result can be marked hidden', (await put.json()).ok === true);
    check(
      'a hidden result is not served publicly',
      (await lookup({ name: 'Asha Rao', rollNo: 'MG2024001', dob: '2004-03-08', semester: 'I' })).status === 404
    );
  }

  console.log('\nCASCADE');
  {
    const del = await call('/api/admin/students/MG2024002', { method: 'DELETE' });
    const json = await del.json();
    check('deleting a student reports their removed results', json.ok === true && json.removedResults === 1, JSON.stringify(json));
    const results = await (await call('/api/admin/results?q=MG2024002')).json();
    check('the results are gone with the student', results.total === 0, `total ${results.total}`);
  }

  console.log('\nTEMPLATE');
  {
    const res = await call('/api/admin/template');
    const buf = Buffer.from(await res.arrayBuffer());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    check('the template downloads as a readable workbook', res.ok && buf.length > 1000);
    check('the template has Students and Marks sheets', Boolean(wb.getWorksheet('Students') && wb.getWorksheet('Marks')));
  }

  console.log('\nSIGN OUT');
  {
    await call('/api/admin/logout', { method: 'POST' });
    cookie = '';
    check('the API rejects requests after signing out', (await call('/api/admin/students')).status === 401);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exitCode = failed === 0 ? 0 : 1;
} catch (error) {
  console.error('\nE2E run failed:', error);
  process.exitCode = 1;
} finally {
  server?.kill();
  try {
    await admin.unsafe(`drop schema if exists ${SCHEMA} cascade`);
    console.log(`Dropped scratch schema ${SCHEMA}.`);
  } catch (e) {
    console.error(`Could not drop ${SCHEMA}:`, e.message);
  }
  await admin.end({ timeout: 5 });
  setTimeout(() => process.exit(process.exitCode ?? 0), 1500).unref();
}
