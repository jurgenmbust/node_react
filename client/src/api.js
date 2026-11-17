// This method sends a request and reads the API response.
// attributes: path, options
export async function request(path = '', options = {}) {
  const response = await fetch(`/api/users${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud.');
  return data;
}
