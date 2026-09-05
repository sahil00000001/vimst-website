import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

/**
 * End-to-end check of the admin backend against a throwaway MongoDB.
 *
 * Boots an in-memory mongod, seeds an admin, starts the production server
 * pointed at it, then drives the real HTTP API: sign in, bulk upload a
 * generated workbook, read it back through the admin endpoints, and finally
 * look the result up through the public verification endpoint the way a
 * student would.
 *
 *   npm run build && node scripts/e2e.mjs
 */

const PORT = Number(process.env.E2E_PORT ?? 3399);
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = randomBytes(32).toString('hex');

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

/* Cookie jar, so the session survives between requests. */
let cookie = '';
async function call(path, init = {}) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(cookie ? { cookie } : {}) },
    redirect: 'manual',
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
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
    {
      rollNo: 'mg2024001',
      name: 'Asha Rao',
      fatherName: 'Venkat Rao',
      dob: '2004-03-08',
      batch: '2024-2028',
      class: 'B.E. First Year',
      branch: 'Computer Engineering',
    },
    {
      rollNo: 'MG2024002',
      name: 'Imran Khan',
      fatherName: 'Salim Khan',
      dob: '15/07/2003',
      batch: '2024-2028',
      class: 'B.E. First Year',
      branch: 'Mechanical Engineering',
    },
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

let mongo;
let server;

try {
  console.log('\nStarting in-memory MongoDB…');
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Seed an admin directly, the way `npm run seed:admin` would.
  const client = new MongoClient(uri);
  await client.connect();
  await client
    .db('mgimst_e2e')
    .collection('admins')
    .insertOne({
      username: 'tester',
      name: 'Tester',
      passwordHash: await bcrypt.hash('correct-horse', 12),
      createdAt: new Date(),
    });
  await client.close();

  console.log('Starting the production server…');
  server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    env: {
      ...process.env,
      MONGODB_URI: uri,
      MONGODB_DB: 'mgimst_e2e',
      ADMIN_SESSION_SECRET: SECRET,
    },
    stdio: 'pipe',
    shell: true,
  });
  server.stderr.on('data', (d) => {
    const line = String(d);
    if (/error/i.test(line)) process.stderr.write(`  [server] ${line}`);
  });

  // Wait for the port to answer.
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE + '/api/admin/session');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log('\nAUTH');
  {
    const res = await call('/api/admin/session');
    const json = await res.json();
    check('session is empty before signing in', json.ok === false);
  }
  {
    const res = await call('/api/admin/students');
    check('admin API rejects an unauthenticated request', res.status === 401, `got ${res.status}`);
  }
  {
    const res = await call('/admin/students');
    check(
      'middleware redirects an unauthenticated page request to the login',
      res.status === 307 && (res.headers.get('location') ?? '').includes('/admin/login'),
      `got ${res.status} ${res.headers.get('location')}`
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
    const json = await res.json();
    check('correct credentials sign in (username case-insensitive)', json.ok === true);
    check('a session cookie is issued', cookie.startsWith('mgimst_admin='));
  }

  console.log('\nBULK UPLOAD');
  const workbook = await buildWorkbook();
  {
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'preview');
    const res = await call('/api/admin/import', { method: 'POST', body });
    const json = await res.json();

    check('preview succeeds', json.ok === true, json.error);
    check('preview finds 2 valid students', json.summary?.studentsNew === 2, JSON.stringify(json.summary));
    check(
      'preview finds 3 result groups (including the orphan)',
      json.summary?.resultsInFile === 3,
      JSON.stringify(json.summary)
    );
    check(
      'preview reports the 2 bad student rows and 1 bad marks row',
      json.issues?.length === 3,
      JSON.stringify(json.issues)
    );
    check(
      'preview flags the orphan roll number',
      json.summary?.orphanRollNos?.includes('MG9999999')
    );
    check(
      'semester aliases (1, "sem 1") group with "I"',
      json.results?.find((r) => r.rollNo === 'MG2024001')?.subjectCount === 3,
      JSON.stringify(json.results)
    );
  }
  {
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'commit');
    const res = await call('/api/admin/import', { method: 'POST', body });
    const json = await res.json();

    check('commit succeeds', json.ok === true, json.error);
    check('2 students written', json.summary?.studentsWritten === 2);
    check('2 results written', json.summary?.resultsWritten === 2);
    check('the orphan result is skipped', json.summary?.skippedResults?.length === 1);
  }
  {
    // Re-uploading must update, not duplicate.
    const body = new FormData();
    body.append('file', new Blob([workbook]), 'marks.xlsx');
    body.append('mode', 'commit');
    await call('/api/admin/import', { method: 'POST', body });

    const res = await call('/api/admin/students');
    const json = await res.json();
    check('re-uploading does not duplicate students', json.total === 2, `total ${json.total}`);
  }

  console.log('\nADMIN READS');
  {
    const res = await call('/api/admin/stats');
    const json = await res.json();
    check('stats report 2 students and 2 results', json.stats?.studentCount === 2 && json.stats?.resultCount === 2);
  }
  {
    const res = await call('/api/admin/students?q=asha');
    const json = await res.json();
    check('student search matches by name', json.items?.[0]?.rollNo === 'MG2024001');
  }
  {
    const res = await call('/api/admin/students/MG2024001');
    const json = await res.json();
    check('a lowercase roll number in the sheet is stored uppercase', json.student?.rollNo === 'MG2024001');
    check('DD/MM/YYYY dates are normalised', json.student?.dob === '2004-03-08');
    check('the student carries their results', json.results?.length === 1);
  }
  {
    const res = await call('/api/admin/results?semester=II');
    const json = await res.json();
    check('results filter by semester', json.items?.length === 1 && json.items[0].rollNo === 'MG2024002');
    check(
      'a subject under 35% fails the semester',
      json.items?.[0]?.finalResult === 'FAIL',
      json.items?.[0]?.finalResult
    );
  }

  console.log('\nPUBLIC VERIFICATION');
  {
    const q = new URLSearchParams({
      name: 'Asha Rao',
      rollNo: 'MG2024001',
      dob: '2004-03-08',
      semester: 'I',
    });
    const res = await fetch(`${BASE}/api/verify-enrollment?${q}`);
    const json = await res.json();
    check('a student can look up their own result', json.ok === true, json.error);
    check('the marksheet lists all 3 subjects', json.data?.result?.length === 3);
    check('the percentage is computed', json.data?.percentage === '75%', json.data?.percentage);
    check('marks are spelled out in words', json.data?.totalMarksInWord === 'Two Hundred and Twenty Five', json.data?.totalMarksInWord);
    check('the final result is PASS', json.data?.finalResult === 'PASS');
  }
  {
    const q = new URLSearchParams({
      name: 'Imran Khan',
      rollNo: 'MG2024001',
      dob: '2004-03-08',
      semester: 'I',
    });
    const res = await fetch(`${BASE}/api/verify-enrollment?${q}`);
    check('a mismatched name is refused', res.status === 404, `got ${res.status}`);
  }
  {
    const q = new URLSearchParams({
      name: 'Asha Rao',
      rollNo: 'MG2024001',
      dob: '1999-01-01',
      semester: 'I',
    });
    const res = await fetch(`${BASE}/api/verify-enrollment?${q}`);
    check('a wrong date of birth is refused', res.status === 404, `got ${res.status}`);
  }
  {
    const q = new URLSearchParams({
      name: 'Asha Rao',
      rollNo: 'MG2024001',
      dob: '2004-03-08',
      semester: 'VIII',
    });
    const res = await fetch(`${BASE}/api/verify-enrollment?${q}`);
    const json = await res.json();
    check(
      'a semester with nothing published says so',
      res.status === 404 && /published/i.test(json.error ?? ''),
      json.error
    );
  }

  console.log('\nHIDDEN RESULTS');
  {
    const list = await (await call('/api/admin/results?q=MG2024001')).json();
    const id = list.items[0]._id;
    const put = await call(`/api/admin/results/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rollNo: 'MG2024001',
        semester: 'I',
        published: false,
        subjects: list.items[0].subjects,
      }),
    });
    check('a result can be marked hidden', (await put.json()).ok === true);

    const q = new URLSearchParams({
      name: 'Asha Rao',
      rollNo: 'MG2024001',
      dob: '2004-03-08',
      semester: 'I',
    });
    const res = await fetch(`${BASE}/api/verify-enrollment?${q}`);
    check('a hidden result is not served publicly', res.status === 404, `got ${res.status}`);
  }

  console.log('\nTEMPLATE');
  {
    const res = await call('/api/admin/template');
    const buf = Buffer.from(await res.arrayBuffer());
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    check('the template downloads as a readable workbook', res.ok && buf.length > 1000);
    check(
      'the template has Students and Marks sheets',
      Boolean(wb.getWorksheet('Students') && wb.getWorksheet('Marks'))
    );
  }

  console.log('\nSIGN OUT');
  {
    await call('/api/admin/logout', { method: 'POST' });
    cookie = '';
    const res = await call('/api/admin/students');
    check('the API rejects requests after signing out', res.status === 401, `got ${res.status}`);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exitCode = failed === 0 ? 0 : 1;
} catch (error) {
  console.error('\nE2E run failed:', error);
  process.exitCode = 1;
} finally {
  server?.kill();
  await mongo?.stop();
  // The spawned shell can hold the event loop open.
  setTimeout(() => process.exit(process.exitCode ?? 0), 1500).unref();
}
