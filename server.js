/* ==========================================================================
   Novatech Solutions - Backend Servidor Vulnerable (Node.js + SQLite)
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = 8080;
const DB_FILE = path.join(__dirname, 'database.db');

// Eliminar base de datos previa si existe para asegurar estado fresco
if (fs.existsSync(DB_FILE)) {
  try { fs.unlinkSync(DB_FILE); } catch (e) {}
}

const db = new DatabaseSync(DB_FILE);

// Inicializar tabla de usuarios sin sanitización
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    email TEXT,
    telefono TEXT,
    bio TEXT,
    password TEXT,
    rol TEXT
  );
`);

// Insertar datos del sujeto objetivo (Carlos Mendoza) y usuarios iniciales
db.exec(`
  INSERT INTO users (nombre, email, telefono, bio, password, rol) VALUES
  ('Carlos Mendoza Silva', 'cmendoza@novatech.com', '+506 8888-1111', 'Jefe de TI. Fanático del Barcelona (1985) y dueño de mi perro Rocky.', 'Rocky1985', 'Administrador de TI'),
  ('Ana María López', 'alopez@novatech.com', '+506 8888-2222', 'Gerente de Proyectos Corporativos.', 'password123', 'Gerente de Proyectos');
`);

console.log('✅ Base de datos SQLite inicializada con datos corporativos.');

// Servidor HTTP Nativo
const server = http.createServer((req, res) => {
  // Configurar CORS y Encabezados de Respuesta (Exponiendo servidor sin seguridad)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Server', 'Apache/2.4.41 (Ubuntu) PHP/7.4.3 NovatechServer/1.0');
  res.setHeader('Set-Cookie', 'session_id=NOVATECH_SECURE_TOKEN_9988; Path=/');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. ROUTE: API LOGIN (Vulnerable a SQL Injection y Enumeración)
  if (pathname === '/api/login' && req.method === 'POST') {
    parseRequestBody(req, (body) => {
      const email = body.email || '';
      const password = body.password || '';

      console.log(`[LOGIN ATTEMPT] Email: "${email}", Password: "${password}"`);

      // VULNERABILIDAD CRÍTICA: Concatenación directa en consulta SQL (Sin Prepared Statements)
      const sqlQuery = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

      try {
        const stmt = db.prepare(sqlQuery);
        const usersFound = stmt.all();

        if (usersFound.length > 0) {
          const user = usersFound[0];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: `Bienvenido de nuevo, ${user.nombre}`,
            user: {
              id: user.id,
              nombre: user.nombre,
              email: user.email,
              telefono: user.telefono,
              bio: user.bio,
              rol: user.rol || 'Empleado'
            }
          }));
        } else {
          // VULNERABILIDAD: Fuga de información por enumeración de usuarios
          const checkUserSql = `SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}'`;
          const checkStmt = db.prepare(checkUserSql);
          const userExists = checkStmt.all();

          res.writeHead(401, { 'Content-Type': 'application/json' });
          if (userExists.length > 0) {
            res.end(JSON.stringify({
              success: false,
              message: `La contraseña ingresada es incorrecta para la cuenta '${email}'.`
            }));
          } else {
            res.end(JSON.stringify({
              success: false,
              message: `El correo electrónico '${email}' no se encuentra registrado en el sistema.`
            }));
          }
        }
      } catch (err) {
        // En caso de error de sintaxis SQL inyectada (ej: comillas mal cerradas)
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: `Error interno de Base de Datos SQL: ${err.message}`,
          sqlError: err.message
        }));
      }
    });
    return;
  }

  // 2. ROUTE: API REGISTRO (Vulnerable a Inserción SQL, Sin Validaciones de QA)
  if (pathname === '/api/register' && req.method === 'POST') {
    parseRequestBody(req, (body) => {
      const nombre = body.nombre || '';
      const email = body.email || '';
      const telefono = body.telefono || '';
      const bio = body.bio || '';
      const password = body.password || '';

      console.log(`[REGISTER ATTEMPT] Nombre: "${nombre}", Email: "${email}"`);

      // VULNERABILIDAD: Inserción directa sin validación de longitud, tipo de dato ni sanitización
      const insertSql = `INSERT INTO users (nombre, email, telefono, bio, password, rol) VALUES ('${nombre}', '${email}', '${telefono}', '${bio}', '${password}', 'Empleado Nuevo')`;

      try {
        db.exec(insertSql);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Registro de empleado completado exitosamente.',
          user: { nombre, email, telefono, bio, rol: 'Empleado Nuevo' }
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: `Error al registrar en Base de Datos: ${err.message}`
        }));
      }
    });
    return;
  }

  // 3. ROUTE: SERVIR ARCHIVOS ESTÁTICOS (HTML, CSS, JS)
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);

  let contentType = 'text/html';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.js') contentType = 'text/javascript';
  if (ext === '.json') contentType = 'application/json';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (error, defaultIndex) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(defaultIndex);
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback({});
    }
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Servidor Novatech Solutions ejecutándose en http://localhost:${PORT}`);
});
