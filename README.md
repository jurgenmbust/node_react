# CRUD de usuarios con Node.js, React y SQLite

Proyecto de aprendizaje para crear, consultar, editar y eliminar usuarios. Cada usuario tiene `id`, `name`, `email` y `createdAt`. La interfaz y los mensajes están en español; los comentarios del código son breves y están en inglés.

## Requisitos

- Node.js **22.20 o superior** (recomendado: una versión LTS compatible). Incluye npm.
- Una terminal y un navegador. No necesitas instalar SQLite por separado.
- Verifica tu instalación con `node --version` y `npm --version`.

Usamos `node:sqlite`, incluido en Node. En algunas versiones aparece una advertencia experimental; no impide ejecutar el proyecto. Esta API síncrona es adecuada para este ejemplo pequeño; bloquea el proceso mientras ejecuta consultas.

## Instalación y desarrollo

Abre PowerShell y entra en esta carpeta:

```powershell
cd C:\Users\t0qh00\Documents\Study\node_react
npm ci
Copy-Item .env.example .env
npm run dev
```

El `.env` local ya se entrega configurado. El comando de copia permite recrearlo después de clonar el repositorio y reemplaza su contenido si ya existe.

- Abre **http://localhost:5173** para usar React.
- La API escucha en **http://localhost:3001/api/users**.
- `npm run dev` ejecuta los dos servidores y recarga los cambios automáticamente.
- Para detenerlos usa `Ctrl+C` en la terminal.
- Vite envía las llamadas `/api` a Node mediante un proxy; por eso no necesitamos CORS en este proyecto.
- Ambos servidores se ejecutan solo para acceso local.

La base de datos se crea automáticamente en `server/data/users.sqlite` al iniciar la API. Comienza vacía y conserva los usuarios después de reiniciar. Usa datos ficticios para practicar.

## Variables de entorno y GitHub

```dotenv
PORT=3001
DB_PATH=./server/data/users.sqlite
```

`DB_PATH` se interpreta desde la raíz `node_react`, independientemente del directorio de ejecución. Puedes usar una ruta absoluta. Si cambias `PORT`, reinicia `npm run dev` para que el proxy use el nuevo valor.

`.env` contiene configuración del servidor. SQLite no necesita usuario ni contraseña, así que este proyecto no contiene credenciales. `.env.example` muestra valores de ejemplo y sí debe subirse a GitHub. `.gitignore` excluye `.env`, dependencias, bases de datos y compilaciones. **Sube `package-lock.json`** para reproducir las versiones instaladas.

No pongas secretos en el código de React ni en variables `VITE_*`: lo que llega al navegador es público. `.gitignore` no elimina secretos que ya se hayan publicado; si ocurre, debes revocarlos y limpiar el historial.

## Cómo usar el CRUD

1. Escribe un nombre y correo y pulsa **Crear usuario**.
2. La lista muestra los usuarios guardados.
3. Pulsa **Editar**, cambia los datos y selecciona **Guardar cambios**. **Cancelar edición** descarta la edición.
4. Pulsa **Eliminar** y confirma para borrar el registro.
5. Recarga la página o reinicia el servidor para comprobar la persistencia.

La API valida nombres de 2 a 80 caracteres y correos con formato básico de hasta 254 caracteres. El correo es único, sin distinguir mayúsculas. La interfaz muestra estados de carga, errores y confirmaciones. La validación del navegador ayuda al usuario; la validación del servidor protege los datos.

## Comandos

| Comando | Función |
| --- | --- |
| `npm ci` | Instala las versiones del archivo lock |
| `npm run dev` | Inicia Node y Vite en desarrollo |
| `npm test` | Prueba CRUD, validación, duplicados y persistencia |
| `npm run build` | Compila React en `client/dist` |
| `npm start` | Inicia Node y sirve React si ya está compilado |

Para probar la aplicación compilada, detén desarrollo y ejecuta:

```powershell
npm run build
npm start
```

Abre **http://localhost:3001**. Node sirve tanto los archivos de React como la API. `npm start` no compila automáticamente: vuelve a ejecutar `npm run build` después de cambiar el frontend. El comando `preview` de Vite es solo para inspeccionar archivos compilados; para probar el CRUD compilado usa `npm start`.

## Estructura

```text
node_react/
├── client/
│   ├── src/
│   │   ├── components/UserForm.jsx  # Formulario y campos
│   │   ├── components/UserList.jsx  # Tabla y acciones
│   │   ├── App.jsx                  # Estado compartido y CRUD
│   │   ├── api.js                   # Comunicación HTTP
│   │   ├── main.jsx                 # Entrada de React
│   │   └── styles.css               # Estilos y diseño adaptable
│   ├── index.html                   # HTML base
│   └── vite.config.js               # Vite y proxy de la API
├── server/
│   ├── src/app.js                   # Rutas, validación y errores
│   ├── src/database.js              # Conexión y tabla SQLite
│   ├── src/index.js                 # Inicio del servidor
│   ├── test/users.test.js           # Pruebas automatizadas
│   └── data/                       # Base de datos local, ignorada
├── .env                            # Configuración local, ignorada
├── .env.example                    # Ejemplo público
├── .gitignore
├── package.json                    # Comandos y workspaces
└── package-lock.json                # Versiones instaladas
```

Los workspaces permiten instalar frontend y backend con un único `npm ci` desde la raíz. No necesitas instalar en cada subcarpeta.

## Cómo se conectan las tecnologías

```text
Navegador / React --HTTP con JSON--> Node.js / Express --SQL--> archivo SQLite
                 <--respuesta JSON--                 <--datos--
```

**Node.js** ejecuta JavaScript fuera del navegador. Aquí recibe solicitudes HTTP, valida información y accede a la base de datos. **Express** simplifica la definición de esas rutas. **SQLite** guarda los datos en un archivo local. **React** es una biblioteca de interfaces: ejecuta componentes en el navegador y actualiza la pantalla cuando cambian sus datos. **Vite** prepara React para desarrollo y compila sus archivos para distribución.

Al crear un usuario:

1. `UserForm` captura lo que escribes en su estado.
2. El evento `onSubmit` evita la recarga con `preventDefault()` y llama a `onSave`.
3. `App.saveUser` usa `request` para enviar un `POST` con JSON a `/api/users`.
4. Express valida el contenido y ejecuta un `INSERT` con parámetros SQL.
5. SQLite guarda el registro y la API devuelve el usuario con su ID.
6. `setUsers` actualiza el estado y React vuelve a mostrar la lista.

El navegador nunca abre directamente el archivo SQLite.

## Bases de React para empezar

### Componentes y JSX

Un componente es una función que devuelve la interfaz que quieres mostrar. `UserForm` y `UserList` son componentes que utiliza `App`. JSX permite escribir etiquetas dentro de JavaScript; Vite las transforma para que el navegador pueda ejecutarlas. Las llaves `{}` insertan expresiones de JavaScript en JSX. Los componentes propios empiezan con mayúscula.

### Props

Las props son datos o funciones que el padre entrega a un hijo:

```jsx
<UserList users={users} onEdit={setSelectedUser} />
```

Este es un ejemplo abreviado; en el código también pasamos `onDelete` y `busy`. El hijo lee las props y llama a las funciones recibidas cuando necesita comunicar una acción al padre.

### Estado: useState

```jsx
const [users, setUsers] = useState([]);
```

`users` es el valor actual y `setUsers` lo actualiza. Al cambiarlo, React vuelve a ejecutar el componente para calcular la interfaz. No modifiques el arreglo directamente con `push`: crea otro arreglo. El proyecto usa `map` para actualizar, `filter` para eliminar y `[saved, ...current]` para agregar.

### Efectos: useEffect

`useEffect` permite sincronizar un componente con sistemas externos. `App` lo usa para obtener los usuarios de la API al cargar y al reintentar. La limpieza aborta la petición si el componente se desmonta. `UserForm` usa otro efecto para cargar los datos del usuario elegido para editar.

`StrictMode` ayuda a detectar problemas durante desarrollo; puede iniciar y limpiar un efecto adicionalmente. Por eso podrías ver una petición cancelada en las herramientas del navegador.

### Formularios controlados, eventos y listas

Un campo controlado recibe su `value` desde el estado y lo actualiza con `onChange`. `onSubmit` y `onClick` conectan interacciones con funciones. `users.map(...)` transforma los registros en filas; `key={user.id}` permite a React identificar cada fila. Las expresiones condicionales muestran carga, listas vacías o botones de edición según el estado.

### async/await y fetch

`fetch` envía solicitudes HTTP y devuelve una promesa. `await` espera su resultado sin bloquear la interfaz. `try/catch` maneja los errores y `finally` restablece el estado de carga. `api.js` centraliza el envío, la lectura de JSON y los errores de respuesta.

## Rutas de la API

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/users` | Lista de usuarios |
| GET | `/api/users/:id` | Un usuario |
| POST | `/api/users` | Crea un usuario, responde 201 |
| PUT | `/api/users/:id` | Actualiza nombre y correo |
| DELETE | `/api/users/:id` | Elimina, responde 204 sin contenido |

POST y PUT reciben:

```json
{"name": "Ana Rodríguez", "email": "ana@example.com"}
```

Códigos de error: `400` datos inválidos, `404` usuario inexistente, `409` correo duplicado, `413` cuerpo demasiado grande y `500` error interno. Las consultas parametrizadas evitan insertar el texto recibido directamente en SQL.

Ejemplo desde PowerShell con el servidor encendido:

```powershell
$body = @{ name = 'Ana Rodríguez'; email = 'ana@example.com' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/users -ContentType 'application/json' -Body $body
Invoke-RestMethod -Uri http://localhost:3001/api/users
```

## Orden recomendado para estudiar

1. Lee `main.jsx` para ubicar dónde comienza React.
2. Revisa `App.jsx` y sigue `users`, `selectedUser` y `saveUser`.
3. Abre los componentes y observa cómo se pasan props y eventos.
4. Sigue la petición en `api.js`, luego la ruta en `server/src/app.js`.
5. Revisa la creación de la tabla en `database.js`.
6. Ejecuta `npm test` y lee los casos para entender los resultados esperados.
7. Como ejercicio, agrega un campo `phone`: deberás cambiar tabla, validación, formulario y lista. Cambiar `CREATE TABLE IF NOT EXISTS` no modifica una tabla existente; necesitarás una migración o recrear solo tu base local de práctica, perdiendo sus datos.

## Solución de problemas y alcance

- **Puerto ocupado:** detén el proceso anterior o cambia `PORT` en `.env`. Para Vite, cambia `server.port` en su configuración.
- **Error de conexión:** confirma que `npm run dev` siga abierto y que el puerto del proxy coincida con la API.
- **Falta `.env`:** cópialo desde `.env.example` en la raíz.
- **No existe `node:sqlite`:** comprueba la versión de Node.
- La tipografía usa Google Fonts y tiene fuentes locales de respaldo si no hay internet.
- Este es un CRUD educativo local, sin autenticación ni autorización. Todos los usuarios de la aplicación pueden modificar todos los registros. Antes de publicarlo como servicio necesita controles de acceso y configuración de despliegue. Publicar su código en GitHub no equivale a desplegar el servicio.

Documentación oficial: [React](https://react.dev/learn), [Node SQLite](https://nodejs.org/api/sqlite.html), [Express](https://expressjs.com/) y [Vite](https://vite.dev/guide/).

## Verificación de dependencias

En la instalación inicial, `npm audit` reportó 4 alertas altas relacionadas con una misma vulnerabilidad de `picomatch` (dependencia indirecta de Vite, también propagada a `fdir` y `tinyglobby`). La versión más reciente disponible de `picomatch`, 4.0.7, figura afectada; no hay parche disponible en el registro consultado. Estas herramientas se usan en desarrollo y compilación; Express no depende de ellas. Los servidores de desarrollo solo escuchan localmente. Consulta `npm audit` antes de desplegar y actualiza cuando haya una corrección compatible. No ejecutes `npm audit fix --force` sin revisar sus cambios: actualmente propone una versión mayor anterior de Vite.

Referencia: [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf).
