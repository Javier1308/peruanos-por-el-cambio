# CLAUDE.md — Peruanos por el Cambio

## Contexto del Proyecto

Plataforma web para registrar voluntarios ("personeros") que supervisarán la legitimidad de los votos en las elecciones presidenciales de Perú. Objetivo: ~200k registros totales.

**Óptica política:** Postura crítica frente a la izquierda. Tono patriótico, profesional, enfocado en transparencia electoral y vigilancia ciudadana.

---

## Arquitectura General

```
[Cloudflare Turnstile CAPTCHA]
         │
    [Vercel CDN]
    React 18 + Vite + TypeScript + Tailwind
         │ (axios → /api/v1/*)
         ▼
    [Railway]
    FastAPI (Docker, uvicorn 2 workers)
    Rate limiting: slowapi (in-memory, no Redis)
         │ (asyncpg, NullPool)
         ▼
    [Supabase]
    PostgreSQL — tabla: personeros
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión |
|------------|---------|
| React | 18.3.1 |
| TypeScript | 5.6.3 |
| Vite | 6.0.5 |
| Tailwind CSS | 3.4.17 |
| React Hook Form | 7.54.2 |
| Zod (validación) | 3.24.1 |
| Axios | 1.7.9 |
| @marsidev/react-turnstile | 1.0.0 |

### Backend
| Tecnología | Versión |
|------------|---------|
| Python | 3.11+ |
| FastAPI | 0.115.5 |
| Uvicorn | 0.32.1 |
| SQLAlchemy (async) | 2.0.36 |
| asyncpg | 0.30.0 |
| Pydantic v2 | 2.10.3 |
| pydantic-settings | 2.6.1 |
| httpx | 0.28.1 |
| slowapi | 0.1.9 |
| openpyxl | 3.1.5 |

### Infraestructura
- **Frontend:** Vercel (SPA con rewrite en `vercel.json`)
- **Backend:** Railway (contenedor Docker)
- **Base de datos:** Supabase (PostgreSQL)
- **CAPTCHA:** Cloudflare Turnstile

---

## Estructura de Carpetas

```
peruanos-por-el-cambio/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                       # Página principal (hero, form, secciones)
│   │   ├── main.tsx                      # Entry point — rutea a App o AdminPage
│   │   ├── index.css                     # Tailwind imports + .btn-primary
│   │   ├── vite-env.d.ts                 # Tipos de variables de entorno Vite
│   │   ├── components/
│   │   │   ├── FormularioPersonero.tsx   # Formulario principal (Zod + progress bar)
│   │   │   ├── SelectorUbicacion.tsx     # Selects cascada departamento > provincia > distrito
│   │   │   ├── CaptchaWidget.tsx         # Wrapper Turnstile (locale es, theme light)
│   │   │   └── AdminPage.tsx             # Panel admin (stats + export Excel)
│   │   ├── hooks/
│   │   │   └── useUbicacion.ts           # Lógica fetch y estado de la cascada de ubicaciones
│   │   ├── services/
│   │   │   └── api.ts                    # Cliente Axios — todas las llamadas al backend
│   │   └── types/
│   │       └── personero.ts              # Interfaces TypeScript
│   ├── package.json
│   ├── vite.config.ts                    # Dev proxy: /api/* → localhost:8000
│   ├── tsconfig.json                     # strict mode habilitado
│   ├── tailwind.config.js                # Brand colors + fuente DM Sans + animaciones
│   ├── postcss.config.js
│   └── vercel.json                       # Rewrite: /* → /index.html (SPA)
│
├── backend/
│   ├── app/
│   │   ├── main.py                       # FastAPI app, CORS, security headers, lifespan
│   │   ├── config.py                     # Settings con pydantic-settings (@lru_cache)
│   │   ├── database.py                   # Engine async NullPool + get_db dependency
│   │   ├── models/
│   │   │   └── personero.py              # SQLAlchemy ORM — tabla personeros
│   │   ├── schemas/
│   │   │   └── personero.py              # Pydantic schemas request/response/admin
│   │   ├── routers/
│   │   │   ├── personeros.py             # POST /personeros, POST /validar-dni
│   │   │   ├── ubicacion.py              # GET /departamentos, /provincias, /distritos
│   │   │   └── admin.py                  # GET /stats, /personeros, /export/csv, /export/excel
│   │   ├── services/
│   │   │   ├── turnstile.py              # Verifica token con Cloudflare API
│   │   │   └── dni_validator.py          # Validación heurística local de DNI
│   │   ├── middleware/
│   │   │   └── rate_limiter.py           # slowapi + handler 429
│   │   └── data/
│   │       └── ubigeo.json               # 8829 líneas: 25 departamentos, provincias, distritos
│   ├── Dockerfile                        # python:3.11-slim, user no-root, 2 workers
│   ├── docker-compose.yml                # Desarrollo local con hot reload
│   ├── requirements.txt
│   └── scripts/
│       └── generar_ubigeo.py             # Script generador de ubigeo.json
│
└── CLAUDE.md
```

---

## Base de Datos

### Tabla `personeros` (Supabase PostgreSQL)

```sql
CREATE TABLE personeros (
    id               SERIAL PRIMARY KEY,
    codigo_registro  UUID UNIQUE DEFAULT gen_random_uuid(),
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    dni              VARCHAR(8) UNIQUE NOT NULL,
    telefono         VARCHAR(9) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    departamento     VARCHAR(50) NOT NULL,
    provincia        VARCHAR(50) NOT NULL,
    distrito         VARCHAR(50) NOT NULL,
    local_votacion   VARCHAR(255),
    dni_verificado   BOOLEAN DEFAULT FALSE NOT NULL,
    ip_registro      INET NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_personeros_dni ON personeros(dni);
CREATE INDEX idx_personeros_departamento ON personeros(departamento);
CREATE INDEX idx_personeros_created_at ON personeros(created_at);
CREATE INDEX idx_personeros_codigo_registro ON personeros(codigo_registro);
```

**Notas de conexión Supabase:**
- `NullPool` en SQLAlchemy (el pooler de Supabase maneja las conexiones)
- `statement_cache_size=0` en connect_args (requerido por el pooler de Supabase)
- UUID `codigo_registro` es lo que se muestra al usuario como confirmación

---

## API Endpoints

### Públicos (prefijo `/api/v1`)

| Método | Ruta | Rate Limit | Descripción |
|--------|------|------------|-------------|
| POST | `/personeros` | 5/10min por IP | Registrar personero |
| POST | `/validar-dni` | 10/5min por IP | Validar DNI heurísticamente |
| GET | `/departamentos` | 60/min | Lista de 25 departamentos |
| GET | `/provincias/{dep_id}` | 60/min | Provincias de un departamento |
| GET | `/distritos/{prov_id}` | 60/min | Distritos de una provincia |
| GET | `/health` | sin límite | Health check |

### Admin (prefijo `/api/v1/admin`, header `X-API-Key` requerido)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/personeros` | Listar paginado (filtros: departamento, dni_verificado) |
| GET | `/personeros/export/csv` | Exportar CSV (filtro: departamento) |
| GET | `/personeros/export/excel` | Exportar Excel estilizado (header rojo #C8102E) |
| GET | `/stats` | Total registros, verificados, breakdown por departamento |

---

## Validaciones

### Frontend (Zod)
```typescript
const LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙñÑüÜ\s]+$/
// nombres/apellidos: LETRAS, mín 2 chars
// dni: exactamente 8 dígitos
// telefono: 9 dígitos, empieza con 9
// email: formato válido (zod email)
// departamento/provincia/distrito: requerido (no vacío)
```

### Backend (Pydantic v2)
Mismas reglas que frontend, más:
- Turnstile token no vacío en `PersoneroCreate`
- `ip_registro` extraída del request (no viene del cliente)

### Validación de DNI (heurística local)
El servicio `dni_validator.py` rechaza DNIs con patrones sospechosos:
1. Todos los dígitos iguales (00000000, 11111111...)
2. Secuencia ascendente estricta (12345678)
3. Secuencia descendente estricta (98765432)
4. Primera mitad repetida (12341234)
5. Patrón alternado (12121212)
6. 6 o más dígitos iguales
7. Valor < 1,000,000
8. Valor > 87,000,000

**No hay integración con API externa de RENIEC.** `dni_verificado` queda `false` en todos los registros.

---

## Seguridad

### Cloudflare Turnstile
- Frontend: widget embebido en el formulario, token enviado con el POST
- Backend: `turnstile.py` verifica contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Si falla la verificación → 403

### Rate Limiting
- `slowapi` con key_func = IP remota
- Almacenamiento **en memoria** (no Redis) — no escala horizontalmente
- Límite global default: 200/min

### Otras protecciones
- Security headers vía middleware: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- CORS configurado con `ALLOWED_ORIGINS` (solo dominio Vercel en prod)
- DNI con UNIQUE constraint → previene duplicados a nivel DB
- Queries con parámetros (SQLAlchemy ORM) → sin riesgo de SQL injection
- Docs de FastAPI (`/docs`) deshabilitadas en producción (`DEBUG=false`)

---

## Variables de Entorno

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@db.xxxx.supabase.co:5432/postgres
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
ADMIN_API_KEY=cambia-esto-en-produccion
ALLOWED_ORIGINS=http://localhost:5173
DEBUG=false
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:8000
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

> En producción: `VITE_API_URL` apunta al backend en Railway, `VITE_TURNSTILE_SITE_KEY` es la clave real de Cloudflare.

---

## Branding y Diseño

### Paleta de colores (tailwind.config.js)
```javascript
colors: {
  'brand-red':        '#C8102E',
  'brand-red-dark':   '#9B0D22',
  'brand-red-light':  '#E8314F',
  'brand-navy':       '#1E3A5F',
  'brand-navy-dark':  '#122440',
  'brand-navy-light': '#2B5080',
}
```

### Tipografía
DM Sans (Google Fonts, importada en `index.css`)

### Estructura de App.tsx
1. **Header/Navbar** — Logo Peru flag + "Defiende Tu Voto"
2. **Hero Section** — Fondo navy, CTA, 3 bullets patrióticos
3. **Wave SVG** — Transición suave entre hero y formulario
4. **Sección Formulario** — `<FormularioPersonero />`
5. **Sección "¿Quiénes somos?"** — Con imagen Runa Chay
6. **Quote Vallejo** — Fondo navy, mensaje patriótico
7. **Barra de estadísticas** — 25 departamentos / meta 90,000 / 1 Perú
8. **Footer** — Copyright + aviso de privacidad

### Ruteo (main.tsx)
```typescript
// Si window.location.pathname === '/admin' → <AdminPage />
// De lo contrario → <App />
// Sin React Router; ruteo manual por pathname
```

---

## Desarrollo Local

### Levantar backend
```bash
cd backend
cp .env.example .env  # Editar DATABASE_URL con tu Supabase
docker-compose up     # Hot reload habilitado
# O sin Docker:
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Levantar frontend
```bash
cd frontend
cp .env.example .env.local  # Editar si es necesario
npm install
npm run dev  # Proxy a localhost:8000 ya configurado en vite.config.ts
```

### Acceder al admin local
```
http://localhost:5173/admin
# Ingresar ADMIN_API_KEY del .env
```

---

## Estado del Deploy (al 2026-03-25)

| Componente | Estado |
|------------|--------|
| Código | Completo en GitHub |
| Supabase DB | Pendiente configurar DATABASE_URL real |
| Railway (backend) | Pendiente deploy |
| Vercel (frontend) | Pendiente deploy |
| Cloudflare Turnstile | Usando test keys — pendiente keys reales |
| RENIEC API | No integrada — solo validación heurística local |

### Pasos pendientes para producción
1. Crear proyecto en Railway → obtener variables de entorno
2. Configurar DATABASE_URL real de Supabase en Railway
3. Conectar repo en Vercel, configurar `VITE_API_URL` y `VITE_TURNSTILE_SITE_KEY`
4. Actualizar `ALLOWED_ORIGINS` en Railway con el dominio Vercel final
5. Crear site en Cloudflare Turnstile → obtener site key y secret key reales
6. Crear schema en Supabase (correr SQL de la sección "Base de Datos")

---

## Decisiones de Arquitectura

| Decisión | Motivo |
|----------|--------|
| Supabase en vez de Railway PostgreSQL | Free tier generoso + dashboard visual |
| Rate limiting in-memory (sin Redis) | Suficiente para una sola instancia Railway |
| Validación DNI heurística local | Evita costos y rate limits de API externa |
| NullPool en SQLAlchemy | El pooler de Supabase gestiona las conexiones |
| Sin React Router | Solo dos rutas (`/` y `/admin`), no justifica dependencia |
| openpyxl para export | Headers con color de marca en Excel (#C8102E) |
