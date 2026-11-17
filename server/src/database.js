import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

// This method opens the database and creates the users table.
// attributes: databasePath
export function openDatabase(databasePath = process.env.DB_PATH || './server/data/users.sqlite') {
  const location = databasePath === ':memory:' ? databasePath : resolve(projectRoot, databasePath);
  if (location !== ':memory:') mkdirSync(dirname(location), { recursive: true });
  const db = new DatabaseSync(location);
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  return db;
}
