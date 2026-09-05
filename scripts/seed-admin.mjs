import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

/**
 * Creates the schema and an admin account.
 *
 *   node scripts/seed-admin.mjs
 *   node scripts/seed-admin.mjs --username principal --password "..."
 *
 * With no --password, one is generated and printed once.
 */

/* .env.local is not loaded automatically outside Next, so parse it here. */
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

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const URL_STRING = process.env.DATABASE_URL;

if (!URL_STRING) {
  console.error(
    '\nDATABASE_URL is not set.\n\n' +
      'Create web/.env.local with your Supabase connection string, for example:\n' +
      '  DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"\n\n' +
      'Use the *transaction pooler* host, not db.<ref>.supabase.co — the direct host\n' +
      'is IPv6-only and unreachable from most networks and from Vercel.\n' +
      'URL-encode special characters in the password (@ becomes %40).\n'
  );
  process.exit(1);
}

const username = (arg('username') ?? 'admin').trim().toLowerCase();
const name = arg('name') ?? 'Administrator';
// Seeded accounts are management: this is the account that then creates the rest.
const role = arg('role') === 'teacher' ? 'teacher' : 'management';
const generated = !arg('password');
const password = arg('password') ?? randomBytes(9).toString('base64url');

const sql = postgres(URL_STRING, {
  max: 1,
  prepare: false,
  ssl: 'require',
  connect_timeout: 20,
  // Pooled connections arrive with an empty search_path.
  connection: { search_path: process.env.DATABASE_SCHEMA ?? 'public' },
  onnotice: () => {},
});

try {
  const [{ db: dbName }] = await sql`select current_database() as db`;
  console.log(`Connected to "${dbName}".`);

  await sql`
    create table if not exists students (
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
    create table if not exists results (
      id             bigint generated always as identity primary key,
      roll_no        text not null references students(roll_no) on delete cascade,
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
    create table if not exists admins (
      username      text primary key,
      password_hash text not null,
      name          text not null,
      role          text not null default 'teacher',
      created_at    timestamptz not null default now(),
      last_login_at timestamptz
    )
  `;
  await sql`alter table admins add column if not exists role text not null default 'teacher'`;
  await sql`create index if not exists students_batch_idx on students (batch)`;
  await sql`create index if not exists students_name_idx on students (lower(name))`;
  await sql`create index if not exists results_roll_idx on results (roll_no)`;

  console.log('Schema ready: students, results, admins.');

  const existing = await sql`select username from admins where username = ${username}`;
  if (existing.length > 0 && generated) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `Admin "${username}" already exists. Reset its password? (y/N) `
    );
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Left unchanged.');
      await sql.end({ timeout: 5 });
      process.exit(0);
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await sql`
    insert into admins (username, name, role, password_hash)
    values (${username}, ${name}, ${role}, ${passwordHash})
    on conflict (username) do update set
      name = excluded.name,
      role = excluded.role,
      password_hash = excluded.password_hash
  `;

  console.log(`\n  Admin portal:  /admin/login`);
  console.log(`  Username:      ${username}`);
  console.log(`  Role:          ${role}`);
  console.log(`  Password:      ${password}`);
  if (generated) console.log('\n  This password is shown once. Store it somewhere safe.');

  if (!process.env.ADMIN_SESSION_SECRET) {
    console.log(
      `\nADMIN_SESSION_SECRET is not set. Add this to .env.local and to Vercel:\n` +
        `  ADMIN_SESSION_SECRET="${randomBytes(32).toString('hex')}"`
    );
  }
  console.log('');
} catch (error) {
  console.error('\nFailed:', error.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
