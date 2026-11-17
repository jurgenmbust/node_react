import { openDatabase } from './database.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe estar entre 1 y 65535.');
const db = openDatabase();
const server = createApp(db).listen(port, '127.0.0.1', () => {
  console.log(`API y aplicación: http://localhost:${port}`);
});

// This method closes the server and database when the process stops.
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
