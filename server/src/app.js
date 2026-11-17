import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectRoot } from './database.js';

// This method creates the API and serves the compiled React app.
// attributes: db
export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  const findUser = db.prepare('SELECT * FROM users WHERE id = ?');

  // This middleware validates the user ID.
  // attributes: req, res, next, value
  app.param('id', (req, res, next, value) => {
    const id = Number(value);
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) {
      return res.status(400).json({ message: 'El ID debe ser un entero positivo.' });
    }
    req.userId = id;
    next();
  });

  // This middleware validates the submitted user information.
  // attributes: req, res, next
  function validateUser(req, res, next) {
    const { name, email } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
      return res.status(400).json({ message: 'El nombre debe tener entre 2 y 80 caracteres.' });
    }
    if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Ingresa un correo válido.' });
    }
    req.userData = { name: name.trim(), email: email.trim().toLowerCase() };
    next();
  }

  // This route retrieves all users.
  app.get('/api/users', (req, res) => {
    res.json(db.prepare('SELECT * FROM users ORDER BY id DESC').all());
  });

  // This route retrieves one user.
  // attributes: id
  app.get('/api/users/:id', (req, res) => {
    const user = findUser.get(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(user);
  });

  // This route creates a user. Placeholders protect the SQL query.
  // attributes: name, email
  app.post('/api/users', validateUser, (req, res) => {
    const { name, email } = req.userData;
    const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
    res.status(201).location(`/api/users/${result.lastInsertRowid}`).json(findUser.get(result.lastInsertRowid));
  });

  // This route updates a user.
  // attributes: id, name, email
  app.put('/api/users/:id', validateUser, (req, res) => {
    const { name, email } = req.userData;
    const result = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, req.userId);
    if (!result.changes) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(findUser.get(req.userId));
  });

  // This route deletes a user.
  // attributes: id
  app.delete('/api/users/:id', (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
    if (!result.changes) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.sendStatus(204);
  });

  app.use('/api', (req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));
  const clientPath = join(projectRoot, 'client/dist');
  if (existsSync(join(clientPath, 'index.html'))) app.use(express.static(clientPath));

  // This middleware returns readable errors without exposing internal details.
  // attributes: error, req, res, next
  app.use((error, req, res, next) => {
    if (error.code === 'ERR_SQLITE_ERROR' && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo.' });
    }
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'El JSON no es válido.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'La solicitud es demasiado grande.' });
    console.error(error);
    res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  });
  return app;
}
