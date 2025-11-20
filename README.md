# Issue Tracker Kanban

Mini-proyecto: app para gestionar tickets con tablero kanban, filtros y comentarios.

## Estructura

```
issue-tracker-kanban/
├── backend/                    # Express + TypeScript + Prisma + PostgreSQL
│   ├── src/
│   │   ├── config/            # Configuración (DB, etc)
│   │   ├── middleware/        # Auth, errorHandler
│   │   ├── routes/            # Rutas (auth, issues, comments)
│   │   ├── controllers/       # Lógica de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── utils/             # JWT, validación
│   │   ├── types/             # Tipos TypeScript
│   │   └── index.ts           # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de BD
│   │   └── seed.ts            # Datos iniciales
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/                   # Next.js + React + TypeScript + Tailwind
    ├── app/
    │   ├── login/
    │   ├── register/
    │   ├── dashboard/
    │   │   ├── board/         # Kanban
    │   │   └── issue/         # Detalle
    │   ├── layout.tsx
    │   └── page.tsx
    ├── lib/                   # API client, React Query, tipos
    ├── components/            # Componentes reutilizables
    ├── hooks/                 # Custom hooks (useAuth, useIssues)
    ├── context/               # AuthContext
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    └── .env.example
```

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar DATABASE_URL en .env
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

El backend correrá en `http://localhost:3001`
El frontend correrá en `http://localhost:3000`

## Tecnologías

**Backend:**
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (autenticación)
- bcryptjs (hash passwords)

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- React Query (@tanstack/react-query)
- Tailwind CSS
- dnd-kit (drag & drop)
- react-markdown
- date-fns