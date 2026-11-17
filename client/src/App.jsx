import { useEffect, useState } from 'react';
import { request } from './api.js';
import UserForm from './components/UserForm.jsx';
import UserList from './components/UserList.jsx';

// This component stores shared state and connects React to the API.
export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  // This effect retrieves users when the component mounts or retries.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    request('', { signal: controller.signal })
      .then(setUsers)
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  // This method creates or updates a user and refreshes local state.
  // attributes: form
  async function saveUser(form) {
    setBusy(true); setError(''); setMessage('');
    try {
      const saved = await request(selectedUser ? `/${selectedUser.id}` : '', {
        method: selectedUser ? 'PUT' : 'POST', body: JSON.stringify(form),
      });
      setUsers((current) => selectedUser ? current.map((user) => user.id === saved.id ? saved : user) : [saved, ...current]);
      setSelectedUser(null);
      setMessage(selectedUser ? 'Usuario actualizado.' : 'Usuario creado.');
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setBusy(false); }
  }

  // This method confirms deletion and removes a user.
  // attributes: user
  async function deleteUser(user) {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await request(`/${user.id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      setMessage('Usuario eliminado.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main>
      <header><a className="brand" href="/">n/r <span>LEARNING LAB</span></a><span className="tech">NODE.JS + REACT + SQLITE</span></header>
      <section className="intro"><span className="eyebrow">PROJECT NODE.JS AND REACT</span><h1>Personas, datos<br /><em>y un poco de React.</em></h1><p>Crea, consulta, edita y elimina usuarios. Una aplicación sencilla para entender cómo se conectan la interfaz, el servidor y la base de datos.</p></section>
      {error && <div className="notice error" role="alert">{error} <button onClick={() => setReload((value) => value + 1)} disabled={busy || loading}>Reintentar carga</button></div>}
      {message && <div className="notice success" role="status">{message}</div>}
      <div className="workspace">
        <UserForm selectedUser={selectedUser} onSave={saveUser} onCancel={() => setSelectedUser(null)} busy={busy || loading} />
        <section className="card list-card" aria-labelledby="list-title"><div className="list-heading"><div><span className="eyebrow">02 / DIRECTORIO</span><h2 id="list-title">Usuarios registrados</h2></div><span className="count">{users.length}</span></div>
          {loading ? <p role="status">Cargando usuarios…</p> : <UserList users={users} onEdit={setSelectedUser} onDelete={deleteUser} busy={busy} />}
        </section>
      </div>
      <footer><span>React → API Node.js → SQLite</span><span>Aprende construyendo.</span></footer>
    </main>
  );
}
