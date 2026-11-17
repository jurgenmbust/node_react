import { useEffect, useState } from 'react';

const emptyForm = { name: '', email: '' };

// This component displays the form for creating or editing a user.
// attributes: selectedUser, onSave, onCancel, busy
export default function UserForm({ selectedUser, onSave, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);
  useEffect(() => {
    setForm(selectedUser ? { name: selectedUser.name, email: selectedUser.email } : emptyForm);
  }, [selectedUser]);

  // This method updates the field stored in React state.
  // attributes: event
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  // This method submits the form without reloading the page.
  // attributes: event
  async function handleSubmit(event) {
    event.preventDefault();
    const saved = await onSave(form);
    if (saved) setForm(emptyForm);
  }

  return (
    <section className="card form-card" aria-labelledby="form-title">
      <span className="eyebrow">01 / FORMULARIO</span>
      <h2 id="form-title">{selectedUser ? 'Editar usuario' : 'Nuevo usuario'}</h2>
      <p>Completa los datos para guardar un usuario en SQLite.</p>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={busy}>
          <label htmlFor="name">Nombre completo</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required minLength={2} maxLength={80} placeholder="Ej. Ana Rodríguez" autoComplete="name" />
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required maxLength={254} placeholder="ana@ejemplo.com" autoComplete="email" />
          <button className="primary" type="submit">{busy ? 'Guardando…' : selectedUser ? 'Guardar cambios' : 'Crear usuario'}</button>
          {selectedUser && <button type="button" className="secondary" onClick={onCancel}>Cancelar edición</button>}
        </fieldset>
      </form>
    </section>
  );
}
