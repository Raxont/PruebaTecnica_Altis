# Issue Tracker Kanban

Sistema de gestión de tickets con tablero Kanban, filtros avanzados, comentarios y seguimiento de actividades.

![Tech Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20Next.js%20%7C%20Express%20%7C%20Prisma%20%7C%20PostgreSQL-blue)

## 📋 Características

### Backend
- ✅ Autenticación JWT con httpOnly cookies
- ✅ CRUD completo de Issues con validaciones
- ✅ Sistema de comentarios (solo autor puede editar/eliminar)
- ✅ Historial de actividad (cambios en issues y comentarios)
- ✅ Filtros combinables: status, priority, assignee, búsqueda por texto
- ✅ Paginación server-side
- ✅ Rate limiting y CORS configurado
- ✅ Manejo de errores centralizado

### Frontend
- ✅ Tablero Kanban con drag & drop funcional
- ✅ Filtros dinámicos con indicadores visuales
- ✅ Renderizado de Markdown en descripciones
- ✅ Comentarios en tiempo real
- ✅ Diseño con Tailwind CSS
- ✅ Animaciones y transiciones suaves
- ✅ React Query para gestión de estado

---

## 🚀 Instalación y Ejecución

### Requisitos Previos
- Node.js 18+ 
- PostgreSQL 14+
- npm o pnpm

### Ejecución Manual

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Raxont/PruebaTecnica_Altis
cd issue-tracker-kanban
```

#### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar `.env` con tu configuración:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/issue_tracker"
JWT_SECRET="tu-super-secreto-jwt-2024"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Dirigirse a la carpeta del prisma
cd /src/prisma

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Volver a la carpeta del backend
cd ../../

# Cargar datos de prueba (semilla)
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend correrá en `http://localhost:3001`

#### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```bash
# Iniciar servidor de desarrollo
npm run dev
```

El frontend correrá en `http://localhost:3000`

---

## 🔐 Credenciales de Prueba

El seed crea los siguientes usuarios en la organización "Acme":

| Email | Password | Rol |
|-------|----------|-----|
| admin@acme.com | password123 | Admin User |
| member1@acme.com | password123 | Member One |
| member2@acme.com | password123 | Member Two |

**Nota**: También se crean 30 issues de prueba con diferentes status, prioridades y asignaciones.

---

## 🏗️ Arquitectura y Estructura

```
issue-tracker-kanban/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts           # Cliente de Prisma
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts     # Verificación JWT
│   │   │   ├── corsConfig.ts         # Configuración CORS
│   │   │   ├── rateLimit.ts          # Rate limiting
│   │   │   └── errorHandler.ts       # Manejo de errores
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # Login, Register, Logout
│   │   │   ├── userRoutes.ts         # Usuarios de org
│   │   │   ├── issueRoutes.ts        # CRUD Issues
│   │   │   └── commentRoutes.ts      # CRUD Comentarios
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── issueController.ts
│   │   │   └── commentController.ts
│   │   ├── utils/
│   │   │   └── jwt.ts                # Generación y verificación
│   │   ├── types/
│   │   │   └── index.ts              # Interfaces TypeScript
│   │   └── index.ts                  # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma             # Modelos de BD
│   │   └── seed.ts                   # Datos iniciales
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── login/                    # Página de login
    │   ├── register/                 # Página de registro
    │   ├── dashboard/
    │   │   ├── page.tsx              # Listado de issues
    │   │   ├── board/
    │   │   │   └── page.tsx          # Tablero Kanban
    │   │   └── issue/
    │   │       ├── new/
    │   │       │   └── page.tsx      # Crear issue
    │   │       └── [id]/
    │   │           ├── page.tsx      # Detalle del issue
    │   │           └── edit/
    │   │               └── page.tsx  # Editar issue
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── providers.tsx             # React Query Provider
    │   └── globals.css               # Estilos Tailwind
    ├── lib/
    │   └── api.ts                    # Cliente Axios con interceptores
    ├── components/
    │   ├── Navbar.tsx
    │   ├── IssueFilters.tsx
    │   ├── IssueCard.tsx
    │   ├── KanbanColumn.tsx
    │   ├── KanbanCard.tsx
    │   └── CommentSection.tsx
    ├── hooks/
    │   ├── useAuth.ts                # Hook de autenticación
    │   └── useUsers.ts               # Hook para usuarios
    ├── types/
    │   └── index.ts                  # Tipos TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── next.config.js
    └── .env.example
```

---

## 📊 Modelo de Datos

```prisma
model Organization {
  id        Int      @id @default(autoincrement())
  name      String
  users     User[]
  issues    Issue[]
}

model User {
  id             Int      @id @default(autoincrement())
  email          String   @unique
  password       String
  name           String
  organizationId Int
  organization   Organization
  assignedIssues Issue[]  @relation("AssignedIssues")
  createdIssues  Issue[]  @relation("CreatedIssues")
  comments       Comment[]
}

model Issue {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      Status   @default(TODO)
  priority    Priority @default(MED)
  labels      String[]
  assigneeId  Int?
  creatorId   Int
  orgId       Int
  assignee    User?    @relation("AssignedIssues")
  creator     User     @relation("CreatedIssues")
  organization Organization
  comments    Comment[]
  activities  Activity[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  issueId   Int
  authorId  Int
  issue     Issue
  author    User
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Activity {
  id        Int      @id @default(autoincrement())
  issueId   Int
  action    String
  field     String?
  oldValue  String?
  newValue  String?
  issue     Issue
  createdAt DateTime @default(now())
}

enum Status {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MED
  HIGH
}
```

---

## 🔌 API Endpoints

### Autenticación

#### POST `/api/auth/register`
Registrar nuevo usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@acme.com",
    "password": "password123",
    "name": "Test User",
    "organizationId": 1
  }'
```

#### POST `/api/auth/login`
Iniciar sesión

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@acme.com",
    "password": "password123"
  }'
```

#### GET `/api/auth/me`
Obtener usuario actual (requiere autenticación)

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt
```

#### POST `/api/auth/logout`
Cerrar sesión

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

### Usuarios

#### GET `/api/users`
Obtener todos los usuarios de la organización

```bash
curl -X GET http://localhost:3001/api/users \
  -b cookies.txt
```

---

### Issues

#### GET `/api/issues`
Listar issues con filtros y paginación

```bash
# Todos los issues
curl -X GET "http://localhost:3001/api/issues?page=1&limit=10" \
  -b cookies.txt

# Filtrar por status
curl -X GET "http://localhost:3001/api/issues?status=IN_PROGRESS" \
  -b cookies.txt

# Filtrar por priority
curl -X GET "http://localhost:3001/api/issues?priority=HIGH" \
  -b cookies.txt

# Filtrar por assignee
curl -X GET "http://localhost:3001/api/issues?assigneeId=1" \
  -b cookies.txt

# Búsqueda por texto
curl -X GET "http://localhost:3001/api/issues?search=bug" \
  -b cookies.txt

# Combinar filtros
curl -X GET "http://localhost:3001/api/issues?status=TODO&priority=HIGH&search=login" \
  -b cookies.txt
```

#### GET `/api/issues/:id`
Obtener detalle de un issue

```bash
curl -X GET http://localhost:3001/api/issues/1 \
  -b cookies.txt
```

#### POST `/api/issues`
Crear nuevo issue

```bash
curl -X POST http://localhost:3001/api/issues \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Fix login bug",
    "description": "Users cannot login with special characters in password",
    "status": "TODO",
    "priority": "HIGH",
    "assigneeId": 2,
    "labels": ["bug", "urgent"]
  }'
```

#### PUT `/api/issues/:id`
Actualizar issue

```bash
curl -X PUT http://localhost:3001/api/issues/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "IN_PROGRESS",
    "assigneeId": 3
  }'
```

#### DELETE `/api/issues/:id`
Eliminar issue

```bash
curl -X DELETE http://localhost:3001/api/issues/1 \
  -b cookies.txt
```

---

### Comentarios

#### GET `/api/comments/issue/:issueId`
Obtener comentarios de un issue

```bash
curl -X GET http://localhost:3001/api/comments/issue/1 \
  -b cookies.txt
```

#### POST `/api/comments`
Crear comentario

```bash
curl -X POST http://localhost:3001/api/comments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "content": "This is a test comment",
    "issueId": 1
  }'
```

#### PUT `/api/comments/:id`
Actualizar comentario (solo el autor)

```bash
curl -X PUT http://localhost:3001/api/comments/5 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "content": "Updated comment text"
  }'
```

#### DELETE `/api/comments/:id`
Eliminar comentario (solo el autor)

```bash
curl -X DELETE http://localhost:3001/api/comments/5 \
  -b cookies.txt
```

---

## 🎯 Decisiones Técnicas y Trade-offs

### Backend

#### 1. **JWT en httpOnly Cookies**
- Mayor seguridad contra XSS, el frontend no puede acceder al token

#### 2. **Re-login **
- Implementación más simple, menos complejidad al hacer que el usuario tenga que loguearse nuevamente

#### 3. **Prisma ORM**
- Type-safety, migraciones automáticas, queries optimizadas

#### 4. **IDs Auto-incrementales **
- Más simple, índices más pequeños, mejor performance

#### 5. **Validaciones en Controller**
- Respuestas rápidas de error, menos acoplamiento

#### 6. **Rate Limiting Global**
- Protección contra ataques DDoS, fácil de implementar

---

### Frontend

#### 1. **Next.js App Router **
- Server Components, mejor performance, futuro de Next.js

#### 2. **React Query**
- Cache automático, sincronización con servidor

#### 3. **dnd-kit**
- Más moderno, mejor performance, mantenimiento activo

#### 4. **Tailwind CSS **
- Desarrollo rápido, diseño consistente, no CSS muerto

#### 5. **React Markdown **
- Simple, liviano, sin dependencias pesadas

---

### Database

#### 1. **PostgreSQL**
- Relaciones fuertes, mejor para datos estructurados

#### 2. **Activity Log en DB**
- Fácil de implementar, queries simples

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Express.js** - Framework web minimalista
- **TypeScript** - Tipado estático
- **Prisma ORM** - ORM moderno con type-safety
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Hash de contraseñas
- **express-rate-limit** - Rate limiting
- **cookie-parser** - Manejo de cookies

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **React Query** - Gestión de estado de servidor
- **Tailwind CSS** - Framework CSS utility-first
- **dnd-kit** - Drag and drop accesible
- **react-markdown** - Renderizado de Markdown
- **date-fns** - Formateo de fechas

---

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev          # Servidor desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Servidor producción
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:migrate    # Ejecutar migraciones
npm run prisma:seed       # Cargar datos de prueba
```

### Frontend
```bash
npm run dev          # Servidor desarrollo
npm run build        # Build para producción
npm run start        # Servidor producción
npm run lint         # Linter ESLint
```

---

## 📄 Licencia

Este proyecto fue creado como prueba técnica y es de uso libre para fines educativos.

---

## 👤 Autor

**Camilo Navas**

- GitHub: [@Raxont](https://github.com/Raxont)
- Email: raxonti@gmail.com

