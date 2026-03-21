# CLAUDE.md — Peruanos por el Cambio: Plataforma de Registro de Personeros

## Contexto del Proyecto

ONG "Peruanos por el Cambio" necesita una plataforma web para registrar voluntarios ("personeros") que supervisarán la legitimidad de los votos en las próximas elecciones presidenciales de Perú. La plataforma debe soportar ~200k registros totales con posibles picos de tráfico concentrados.

**Óptica política:** La organización tiene una postura crítica frente a la izquierda. El tono de la marca y el copy deben reflejar esto de forma profesional — enfocándose en transparencia electoral, democracia y vigilancia ciudadana.

---

## Stack Tecnológico

### Frontend
- **Framework:** React con TypeScript
- **Styling:** Tailwind CSS
- **Deploy:** Vercel (con dominio custom comprado en Vercel)
- **CAPTCHA:** Cloudflare Turnstile (widget embebido en el formulario)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM/DB Driver:** SQLAlchemy 2.0 async + asyncpg
- **Validación:** Pydantic v2
- **Rate Limiting:** slowapi (basado en IP) + Redis como store
- **Deploy:** Railway (contenedor Docker)

### Base de Datos
- **PostgreSQL** en Railway (instancia dedicada, misma red interna que el backend)
- **Connection Pooling:** PgBouncer o el pool nativo de asyncpg (min=10, max=50 conexiones)

### Cache / Rate Limiting
- **Redis** en Railway (para contadores de rate limiting por IP)

---

## Arquitectura de Deploy

```
[Cloudflare DNS + Turnstile]
         │
    [Vercel CDN]
    Frontend React/TS
         │ (API calls)
         ▼
    [Railway]
    ┌─────────────────┐
    │  FastAPI (Docker)│──── Redis (rate limit)
    │  uvicorn workers │
    └────────┬────────┘
             │ (async, internal network)
             ▼
        [PostgreSQL]
        Railway addon
```

---

## Estructura del Formulario

### Campos requeridos:

| Campo                | Tipo         | Validación                                    |
|----------------------|--------------|-----------------------------------------------|
| `nombres`            | string       | Min 2 caracteres, solo letras y espacios      |
| `apellidos`          | string       | Min 2 caracteres, solo letras y espacios      |
| `dni`                | string       | Exactamente 8 dígitos numéricos               |
| `telefono`           | string       | 9 dígitos, empieza con 9 (formato peruano)    |
| `email`              | string       | Formato email válido                           |
| `departamento`       | string       | Select — lista de 25 departamentos de Perú    |
| `provincia`          | string       | Select — dinámico según departamento           |
| `distrito`           | string       | Select — dinámico según provincia              |
| `local_votacion`     | string       | Texto libre o select si se tiene la data ONPE  |
| `turnstile_token`    | string       | Token de Cloudflare Turnstile (hidden field)   |

### Validación de DNI:
- Integrar con la API de consulta de DNI de Perú (apis.net.pe u otro servicio similar)
- Validar que el DNI exista y que el nombre coincida con los datos ingresados
- Si la API externa no responde, permitir el registro pero marcarlo como `dni_verificado = false`

---

## Modelo de Base de Datos

### Tabla `personeros`:

```sql
CREATE TABLE personeros (
    id              SERIAL PRIMARY KEY,
    nombres         VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(100) NOT NULL,
    dni             VARCHAR(8) UNIQUE NOT NULL,
    telefono        VARCHAR(9) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    departamento    VARCHAR(50) NOT NULL,
    provincia       VARCHAR(50) NOT NULL,
    distrito        VARCHAR(50) NOT NULL,
    local_votacion  VARCHAR(255),
    dni_verificado  BOOLEAN DEFAULT FALSE,
    ip_registro     INET NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_dni_length CHECK (LENGTH(dni) = 8),
    CONSTRAINT chk_telefono CHECK (telefono ~ '^9[0-9]{8}$')
);

CREATE INDEX idx_personeros_dni ON personeros(dni);
CREATE INDEX idx_personeros_departamento ON personeros(departamento);
CREATE INDEX idx_personeros_created_at ON personeros(created_at);
```

---

## Endpoints del Backend

### API REST:

```
POST   /api/v1/personeros          → Registrar nuevo personero
GET    /api/v1/departamentos       → Lista de departamentos
GET    /api/v1/provincias/{dep}    → Provincias por departamento
GET    /api/v1/distritos/{prov}    → Distritos por provincia
POST   /api/v1/validar-dni         → Validar DNI contra API externa
```

### Admin (protegido con API key o basic auth):

```
GET    /api/v1/admin/personeros              → Listar registros (paginado)
GET    /api/v1/admin/personeros/export/csv   → Exportar a CSV
GET    /api/v1/admin/stats                   → Estadísticas (total, por departamento, etc.)
```

---

## Seguridad y Rate Limiting

### Rate Limiting por IP:
- **Registro de personero:** máximo 3 requests por IP cada 10 minutos
- **Validación de DNI:** máximo 10 requests por IP cada 5 minutos
- **Endpoints públicos (departamentos, etc.):** máximo 60 requests por minuto
- Almacenar contadores en Redis con TTL automático

### CAPTCHA — Cloudflare Turnstile:
- El frontend envía el `turnstile_token` junto con el formulario
- El backend valida el token contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Si la validación falla, retornar 403
- **Variables de entorno necesarias:** `TURNSTILE_SITE_KEY` (frontend), `TURNSTILE_SECRET_KEY` (backend)

### Protecciones adicionales:
- CORS configurado solo para el dominio del frontend en Vercel
- Helmet-like headers (via middleware FastAPI)
- Sanitización de inputs contra XSS/SQL injection (Pydantic + SQLAlchemy parameterized queries)
- DNI como UNIQUE constraint previene registros duplicados

---

## Variables de Entorno

### Backend (.env):
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
REDIS_URL=redis://host:port
TURNSTILE_SECRET_KEY=0x...
ADMIN_API_KEY=clave-segura-para-admin
ALLOWED_ORIGINS=https://tudominio.com
DNI_API_URL=https://api.apis.net.pe/v2/reniec/dni
DNI_API_TOKEN=tu-token-apis-net-pe
```

### Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
```

> **Nota:** El frontend es React puro con Vite o CRA, no Next.js. Las variables de entorno usan prefijo `VITE_` si es Vite.

---

## Estructura de Carpetas

### Backend (FastAPI):
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, middleware, CORS
│   ├── config.py               # Settings con pydantic-settings
│   ├── database.py             # Async engine + session factory
│   ├── models/
│   │   └── personero.py        # SQLAlchemy model
│   ├── schemas/
│   │   └── personero.py        # Pydantic schemas (request/response)
│   ├── routers/
│   │   ├── personeros.py       # CRUD endpoints
│   │   ├── ubicacion.py        # Departamentos/Provincias/Distritos
│   │   └── admin.py            # Panel admin endpoints
│   ├── services/
│   │   ├── dni_validator.py    # Integración API DNI
│   │   └── turnstile.py        # Verificación Cloudflare Turnstile
│   ├── middleware/
│   │   └── rate_limiter.py     # Rate limiting con slowapi + Redis
│   └── data/
│       └── ubigeo.json         # Data estática de departamentos/provincias/distritos
├── Dockerfile
├── requirements.txt
├── docker-compose.yml          # Para desarrollo local
└── .env.example
```

### Frontend (React + TypeScript):
```
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── FormularioPersonero.tsx    # Formulario principal
│   │   ├── SelectorUbicacion.tsx      # Cascada departamento>provincia>distrito
│   │   ├── CaptchaWidget.tsx          # Wrapper Cloudflare Turnstile
│   │   └── ui/                        # Componentes reutilizables
│   ├── hooks/
│   │   ├── useFormulario.ts           # Lógica del formulario
│   │   └── useUbicacion.ts            # Fetch cascada ubicaciones
│   ├── services/
│   │   └── api.ts                     # Cliente HTTP (axios/fetch)
│   ├── types/
│   │   └── personero.ts              # TypeScript interfaces
│   └── data/
│       └── departamentos.ts           # Data estática si se necesita
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── .env.example
```

---

## Directrices de Diseño (Frontend)

### Branding "Peruanos por el Cambio":
- **Paleta de colores:** Rojo y blanco (bandera peruana) como primarios, con acentos en azul oscuro para seriedad institucional
- **Tono:** Patriótico, profesional, urgente pero no alarmista
- **Tipografía:** Sans-serif moderna y legible (ej: DM Sans, Outfit, o similar)
- **Hero message:** Enfocarse en defender la democracia, transparencia electoral, y la participación ciudadana
- **CTA principal:** "Inscríbete como Personero" o "Defiende tu Voto"

### UX del formulario:
- Single page, sin pasos — todo visible de una vez
- Validación inline en tiempo real (feedback inmediato por campo)
- Indicador de progreso o completitud
- Mensaje de éxito claro post-envío con número de registro
- Mobile-first (la mayoría de usuarios accederán desde celular)

---

## Notas para el desarrollo

1. **Ubigeo de Perú:** Usar la data oficial de INEI/RENIEC para departamentos, provincias y distritos. Se puede encontrar en formato JSON en repos públicos de GitHub (buscar "ubigeo peru json").

2. **API de DNI:** apis.net.pe ofrece un plan gratuito limitado. Considerar cachear resultados en Redis para evitar llamadas repetidas al mismo DNI.

3. **Escalabilidad:** 200k registros totales + buffer de 50k. PostgreSQL maneja esto sin problema. No se necesitan optimizaciones especiales de base de datos.

4. **Monitoreo:** Railway ofrece logs básicos. Considerar agregar un endpoint `/health` para monitoreo.

5. **Backup:** Configurar backups automáticos de la base de datos en Railway antes de ir a producción.
