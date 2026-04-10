# AdminExpress — Gestor de Tareas tipo Jira

Sistema de gestión de tareas con autenticación JWT, tablero Kanban y CRUD completo. Construido con el stack MERN y arquitectura MVC.

---

## 🗂 Estructura del Proyecto

```
jira-clone/
├── server/                  ← BACKEND (Node + Express + MongoDB)
│   ├── config/
│   │   └── db.js            ← Conexión a MongoDB
│   ├── models/              ← MODELOS (capa M del MVC)
│   │   ├── User.js          ← Esquema de usuario con bcrypt
│   │   └── Task.js          ← Esquema de tarea
│   ├── controllers/         ← CONTROLADORES (capa C del MVC)
│   │   ├── authController.js  ← register, login, getMe
│   │   └── taskController.js  ← CRUD completo de tareas
│   ├── routes/              ← RUTAS (conectan URL con controladores)
│   │   ├── auth.js          ← /api/auth/*
│   │   └── tasks.js         ← /api/tasks/* (todas protegidas)
│   ├── middleware/
│   │   └── auth.js          ← protect + adminOnly ← AQUÍ VA EL MIDDLEWARE JWT
│   └── index.js             ← Servidor Express principal
│
├── client/                  ← FRONTEND (React)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js   ← Estado global del usuario (React Context)
│       ├── components/
│       │   └── PrivateRoute.js  ← Protege rutas del frontend
│       ├── pages/
│       │   ├── Login.js         ← Vista de inicio de sesión
│       │   ├── Register.js      ← Vista de registro
│       │   └── Dashboard.js     ← Tablero Kanban (protegido)
│       ├── styles/
│       │   ├── auth.css
│       │   └── dashboard.css
│       ├── App.js               ← Router principal
│       └── index.js
│
├── .env.example             ← Variables de entorno de ejemplo
├── .gitignore
└── package.json             ← Scripts de instalación y arranque
```

---

## 🚀 Instalación y Arranque

### 1. Requisitos previos
- Node.js v18+
- MongoDB local (o MongoDB Atlas)

### 2. Clonar y configurar
```bash
# Crear el archivo .env en la raíz del proyecto
cp .env.example .env
# Editar .env con tu URI de MongoDB y un JWT_SECRET seguro
```

### 3. Instalar dependencias
```bash
# Instala todo de una vez (raíz + cliente)
npm run install-all
```

### 4. Modo desarrollo (backend + frontend por separado)
```bash
# Terminal 1 — Backend (puerto 5000)
npm run dev

# Terminal 2 — Frontend React (puerto 3000, con proxy al 5000)
cd client && npm start
```

### 5. Producción (todo en un solo puerto)
```bash
# Construye React y lo sirve desde Express en el puerto 5000
npm run setup    # instala + build
npm start        # levanta el servidor
```
Visita: **http://localhost:5000**

---

## 🔐 API Endpoints

### Autenticación (públicas)
| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión → devuelve JWT |
| GET  | `/api/auth/me` | Perfil del usuario actual **(protegida)** |

### Tareas (todas protegidas con JWT)
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | `/api/tasks` | Listar tareas (soporta ?status=&priority=) |
| POST   | `/api/tasks` | Crear tarea |
| GET    | `/api/tasks/:id` | Ver tarea por ID |
| PUT    | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

---

## 🛡 Cómo usar el Middleware JWT

El middleware `protect` vive en `server/middleware/auth.js`. Para proteger cualquier ruta nueva:

```js
const { protect, adminOnly } = require('../middleware/auth');

// Ruta protegida para cualquier usuario autenticado
router.get('/mis-proyectos', protect, miController);

// Ruta solo para Admins
router.delete('/usuario/:id', protect, adminOnly, eliminarUsuario);
```

El token JWT debe enviarse en el header HTTP:
```
Authorization: Bearer <token>
```

---

## 📐 Patrón MVC aplicado

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Model** | `server/models/` | Esquemas de Mongoose, validaciones, hash de contraseña |
| **View** | `client/src/pages/` | Componentes React (Login, Register, Dashboard) |
| **Controller** | `server/controllers/` | Lógica de negocio: auth y CRUD de tareas |

---

## 🔑 Variables de entorno (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jira-clone
JWT_SECRET=cambia_esto_por_algo_muy_seguro
NODE_ENV=production
```
