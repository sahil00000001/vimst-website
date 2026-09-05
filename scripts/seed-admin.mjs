import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

/**
 * Creates (or resets) an admin account and the indexes the app needs.
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
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? 'mgimst';

if (!URI) {
  console.error(
    '\nMONGODB_URI is not set.\n\n' +
      'Create web/.env.local with your connection string, for example:\n' +
      '  MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority"\n' +
      '  MONGODB_DB="mgimst"\n'
  );
  process.exit(1);
}

const username = (arg('username') ?? 'admin').trim().toLowerCase();
const name = arg('name') ?? 'Administrator';
const generated = !arg('password');
const password = arg('password') ?? randomBytes(9).toString('base64url');

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const db = client.db(DB_NAME);

  console.log(`Connected to "${DB_NAME}".`);

  const admins = db.collection('admins');
  const existing = await admins.findOne({ username });

  if (existing && generated) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `Admin "${username}" already exists. Reset its password? (y/N) `
    );
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Left unchanged.');
      process.exit(0);
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await admins.updateOne(
    { username },
    {
      $set: { username, name, passwordHash },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  await Promise.all([
    db.collection('students').createIndex({ rollNo: 1 }, { unique: true }),
    db.collection('students').createIndex({ batch: 1 }),
    db.collection('results').createIndex({ rollNo: 1, semester: 1 }, { unique: true }),
    db.collection('results').createIndex({ rollNo: 1 }),
    admins.createIndex({ username: 1 }, { unique: true }),
  ]);

  console.log('\nIndexes created.');
  console.log(`\n  Admin portal:  /admin/login`);
  console.log(`  Username:      ${username}`);
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
  await client.close();
}
