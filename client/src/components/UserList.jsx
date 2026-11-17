// This component displays users and their available actions.
// attributes: users, onEdit, onDelete, busy
export default function UserList({ users, onEdit, onDelete, busy }) {
  if (users.length === 0) return <div className="empty">Todavía no hay usuarios. Crea el primero desde el formulario.</div>;
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Usuario</th><th>Correo electrónico</th><th>Acciones</th></tr></thead>
        <tbody>{users.map((user) => (
          <tr key={user.id}>
            <td><strong>{user.name}</strong><small>ID #{user.id}</small></td>
            <td>{user.email}</td>
            <td><div className="actions">
              <button disabled={busy} onClick={() => onEdit(user)} aria-label={`Editar a ${user.name}`}>Editar</button>
              <button disabled={busy} className="danger" onClick={() => onDelete(user)} aria-label={`Eliminar a ${user.name}`}>Eliminar</button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
