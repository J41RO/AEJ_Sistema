# 🚀 Guía de Deployment - AEJ Sistema POS

Este documento describe cómo desplegar el Sistema POS AEJ en producción usando Railway (backend) y Vercel (frontend).

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Deployment del Backend en Railway](#deployment-del-backend-en-railway)
3. [Deployment del Frontend en Vercel](#deployment-del-frontend-en-vercel)
4. [Configuración Post-Deployment](#configuración-post-deployment)
5. [Verificación y Testing](#verificación-y-testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### Cuentas Necesarias
- ✅ Cuenta de GitHub (para el repositorio)
- ✅ Cuenta de Railway (https://railway.app)
- ✅ Cuenta de Vercel (https://vercel.com)

### Repositorio Git
Asegúrate de tener tu código en un repositorio de GitHub:

```bash
# Si aún no has hecho push al repositorio
git add .
git commit -m "feat: preparar proyecto para deployment"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/AEJ_Sistema.git
git push -u origin main
```

---

## 🔵 Deployment del Backend en Railway

### Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app y haz login
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `AEJ_Sistema`

### Paso 2: Configurar el Servicio

1. Railway detectará automáticamente que es un proyecto Python
2. Configura el **Root Directory** como `backend/`
3. Railway usará automáticamente:
   - `runtime.txt` para la versión de Python
   - `requirements.txt` para las dependencias
   - `Procfile` para el comando de inicio

### Paso 3: Agregar Base de Datos PostgreSQL

1. En tu proyecto Railway, click en "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente una base de datos y la variable `DATABASE_URL`

### Paso 4: Configurar Variables de Entorno

En la configuración de tu servicio Railway, agrega las siguientes variables de entorno:

#### Variables Requeridas

```bash
# Database (Auto-generada por Railway)
DATABASE_URL=postgresql://...  # Ya está configurada automáticamente

# Security - IMPORTANTE: Genera una nueva SECRET_KEY
SECRET_KEY=tu-secret-key-super-segura-aqui-min-32-caracteres

# Algorithm
ALGORITHM=HS256

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production

# CORS - Reemplaza con tu URL de Vercel
ALLOWED_ORIGINS=https://tu-frontend.vercel.app,https://www.tu-dominio.com
```

#### Generar SECRET_KEY Segura

```bash
# Opción 1: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Opción 2: OpenSSL
openssl rand -hex 32
```

### Paso 5: Deploy

1. Railway desplegará automáticamente
2. Espera a que el build termine
3. Copia la URL del backend (ej: `https://aej-backend.up.railway.app`)

### Paso 6: Ejecutar Migraciones (Si usas Alembic)

```bash
# Conecta via Railway CLI
railway login
railway link
railway run python seed.py  # Para datos iniciales
```

---

## 🟢 Deployment del Frontend en Vercel

### Paso 1: Crear Proyecto en Vercel

1. Ve a https://vercel.com y haz login
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub `AEJ_Sistema`
4. Vercel detectará automáticamente que es un proyecto Vite

### Paso 2: Configurar el Proyecto

#### Framework Preset
- **Framework**: Vite
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Paso 3: Configurar Variables de Entorno

En la configuración del proyecto Vercel, agrega:

#### Variables Requeridas

```bash
# Backend API URL - USA LA URL DE RAILWAY
VITE_API_URL=https://tu-backend.up.railway.app
```

⚠️ **IMPORTANTE**: No incluyas la barra final `/` en la URL

### Paso 4: Deploy

1. Click en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. Copia la URL del frontend (ej: `https://aej-sistema.vercel.app`)

---

## ⚙️ Configuración Post-Deployment

### 1. Actualizar CORS en Railway

Vuelve a Railway y actualiza la variable `ALLOWED_ORIGINS` con la URL real de Vercel:

```bash
ALLOWED_ORIGINS=https://aej-sistema.vercel.app,https://www.tu-dominio.com
```

### 2. Configurar Dominio Personalizado (Opcional)

#### En Railway (Backend):
1. Ve a Settings → Domains
2. Agrega tu dominio personalizado (ej: `api.tudominio.com`)
3. Configura los registros DNS según las instrucciones

#### En Vercel (Frontend):
1. Ve a Settings → Domains
2. Agrega tu dominio personalizado (ej: `www.tudominio.com`)
3. Configura los registros DNS según las instrucciones

### 3. Configurar SSL/TLS

Railway y Vercel proporcionan SSL automáticamente. No se requiere configuración adicional.

---

## ✅ Verificación y Testing

### Verificar Backend

```bash
# Health check
curl https://tu-backend.up.railway.app/health

# Respuesta esperada:
{
  "status": "healthy",
  "timestamp": "...",
  "service": "AEJ POS Backend",
  "version": "1.0.0",
  "network": "accessible"
}
```

### Verificar Frontend

1. Abre `https://tu-frontend.vercel.app`
2. Debería cargar la página de login
3. Verifica en DevTools → Network que las peticiones al backend funcionan

### Probar Flujo Completo

1. Intenta hacer login
2. Verifica que el dashboard cargue
3. Prueba crear un producto, cliente, etc.

---

## 🐛 Troubleshooting

### Error de CORS

**Síntoma**: Error "CORS policy" en la consola del navegador

**Solución**:
1. Verifica que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel
2. Asegúrate de NO incluir la barra final `/`
3. Redeploy el backend después de cambiar variables de entorno

### Error de Conexión a Base de Datos

**Síntoma**: Error 500 al intentar operaciones de BD

**Solución**:
1. Verifica que `DATABASE_URL` esté configurada en Railway
2. Asegúrate de que la base de datos PostgreSQL esté corriendo
3. Revisa los logs de Railway: `railway logs`

### Frontend no se conecta al Backend

**Síntoma**: Peticiones a `http://localhost:8000`

**Solución**:
1. Verifica que `VITE_API_URL` esté configurada en Vercel
2. Redeploy el frontend después de configurar la variable
3. Limpia caché del navegador

### Error de Build en Vercel

**Síntoma**: Build falla en Vercel

**Solución**:
1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build en Vercel
3. Asegúrate de que `npm run build` funcione localmente

### Secretos Expuestos

**Síntoma**: Aparecen credenciales en el código

**Solución**:
1. Revisa `.gitignore` y asegúrate de que `.env` esté excluido
2. Rota todas las credenciales expuestas
3. Usa variables de entorno en Railway y Vercel

---

## 📊 Monitoreo

### Railway
- Logs en tiempo real: Dashboard → Logs
- Métricas: Dashboard → Metrics
- Usar Railway CLI: `railway logs --follow`

### Vercel
- Logs: Dashboard → Deployments → Logs
- Analytics: Dashboard → Analytics
- Real-time logs: Vercel CLI `vercel logs`

---

## 🔄 Re-Deployment

### Backend (Railway)
```bash
# Push a main y Railway redesplegará automáticamente
git push origin main

# O fuerza un redeploy en el dashboard de Railway
```

### Frontend (Vercel)
```bash
# Push a main y Vercel redesplegará automáticamente
git push origin main

# O redeploy desde el dashboard de Vercel
```

---

## 📝 Checklist de Deployment

### Antes del Deployment

- [ ] `.gitignore` configurado correctamente
- [ ] `.env.example` creados para backend y frontend
- [ ] Código en repositorio de GitHub
- [ ] SECRET_KEY generada de forma segura
- [ ] URLs de producción decididas

### Backend (Railway)

- [ ] Proyecto creado en Railway
- [ ] Root directory configurado como `backend/`
- [ ] Base de datos PostgreSQL creada
- [ ] `DATABASE_URL` configurada automáticamente
- [ ] `SECRET_KEY` configurada (segura, no default)
- [ ] `ALLOWED_ORIGINS` configurada con URL de Vercel
- [ ] `ENVIRONMENT=production` configurada
- [ ] Deploy exitoso
- [ ] Health check respondiendo

### Frontend (Vercel)

- [ ] Proyecto creado en Vercel
- [ ] Framework detectado como Vite
- [ ] `VITE_API_URL` configurada con URL de Railway
- [ ] Build exitoso
- [ ] Deploy exitoso
- [ ] Aplicación carga correctamente

### Post-Deployment

- [ ] CORS funcionando correctamente
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Operaciones CRUD funcionan
- [ ] (Opcional) Dominios personalizados configurados
- [ ] (Opcional) DNS configurado
- [ ] Monitoreo activado

---

## 🔗 URLs de Producción

Una vez desplegado, actualiza estos placeholders:

```bash
# Backend
Backend URL: https://[tu-backend].up.railway.app
Backend Health: https://[tu-backend].up.railway.app/health
API Docs: https://[tu-backend].up.railway.app/docs

# Frontend
Frontend URL: https://[tu-frontend].vercel.app

# Dominios Personalizados (si aplica)
API: https://api.tudominio.com
Web: https://www.tudominio.com
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Railway y Vercel
2. Verifica las variables de entorno
3. Consulta la documentación:
   - Railway: https://docs.railway.app
   - Vercel: https://vercel.com/docs
4. Revisa el código en el repositorio

---

**Última actualización**: 2025-11-06
**Versión**: 1.0.0
