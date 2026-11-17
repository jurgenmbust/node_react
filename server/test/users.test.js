import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';

// This test checks the complete CRUD flow and common API errors.
test('users API validates and completes CRUD requests', async (t) => {
  const db = openDatabase(':memory:');
  const server = createApp(db).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  const base = `http://127.0.0.1:${server.address().port}/api/users`;

  // This helper sends JSON to the running test server.
  // attributes: path, method, body
  const send = (path = '', method = 'GET', body) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  assert.deepEqual(await (await send()).json(), []);
  assert.equal((await send('', 'POST', { name: 'A', email: 'wrong' })).status, 400);
  assert.equal((await send('', 'POST', { name: 'Ana', email: 'wrong' })).status, 400);
  const created = await send('', 'POST', { name: ' Ana ', email: ' ANA@example.com ' });
  assert.equal(created.status, 201);
  const user = await created.json();
  assert.equal(user.name, 'Ana');
  assert.equal(user.email, 'ana@example.com');
  assert.ok(user.createdAt);
  assert.equal((await send('', 'POST', { name: 'Ana', email: 'ANA@example.com' })).status, 409);
  assert.equal((await (await send(`/${user.id}`)).json()).name, 'Ana');
  assert.equal((await (await send()).json()).length, 1);
  const second = await (await send('', 'POST', { name: 'Luis', email: 'luis@example.com' })).json();
  assert.equal((await send(`/${second.id}`, 'PUT', { name: 'Luis', email: 'ana@example.com' })).status, 409);
  const updated = await send(`/${user.id}`, 'PUT', { name: 'Ana Maria', email: 'new@example.com' });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).name, 'Ana Maria');
  assert.equal((await send('/abc')).status, 400);
  assert.equal((await send('/0')).status, 400);
  assert.equal((await send('/999999')).status, 404);
  assert.equal((await send('/999999', 'PUT', { name: 'Ana', email: 'ana@example.com' })).status, 404);
  assert.equal((await send('/999999', 'DELETE')).status, 404);
  const malformed = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await send(`/${user.id}`, 'DELETE')).status, 204);
  assert.equal((await send(`/${user.id}`)).status, 404);
  assert.equal((await send(`/${second.id}`, 'DELETE')).status, 204);
  assert.deepEqual(await (await send()).json(), []);
});

// This test verifies that SQLite keeps records after reopening the file.
test('SQLite persists users between connections', () => {
  const directory = mkdtempSync(join(tmpdir(), 'node-react-'));
  const location = join(directory, 'test.sqlite');
  let db;
  try {
    db = openDatabase(location);
    db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('Persisted user', 'persist@example.com');
    db.close();
    db = openDatabase(location);
    assert.equal(db.prepare('SELECT name FROM users').get().name, 'Persisted user');
  } finally {
    if (db?.isOpen) db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
