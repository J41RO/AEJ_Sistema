# Sistema POS AEJ Cosmetic & More

[![Tests](https://github.com/YOUR_USERNAME/AEJ_Sistema/actions/workflows/tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/AEJ_Sistema/actions/workflows/tests.yml)
[![Backend Coverage](https://img.shields.io/codecov/c/github/YOUR_USERNAME/AEJ_Sistema?flag=backend&label=Backend%20Coverage)](https://codecov.io/gh/YOUR_USERNAME/AEJ_Sistema)
[![Frontend Coverage](https://img.shields.io/codecov/c/github/YOUR_USERNAME/AEJ_Sistema?flag=frontend&label=Frontend%20Coverage)](https://codecov.io/gh/YOUR_USERNAME/AEJ_Sistema)
[![Python Version](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![Node Version](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Sistema completo de Punto de Venta (POS) para AEJ Cosmetic & More con gestión de inventario, clientes, proveedores, facturación y reportes.

## 🚀 Características Principales

- **Punto de Venta (POS)** completo con cálculo automático de impuestos
- **Gestión de Inventario** con alertas de stock bajo y kardex
- **Gestión de Clientes** con cumplimiento Ley 1581 de 2012
- **Gestión de Proveedores** con sistema de evaluación
- **Facturación Electrónica** preparada para DIAN
- **Reportes Avanzados** con analytics y exportación
- **Sistema de Usuarios** con permisos granulares
- **Configuración Completa** del sistema
- **Indicador de Estado** del backend en tiempo real

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- Shadcn/UI Components
- Lucide React Icons

### Backend (Preparado)
- Python FastAPI
- SQLite Database
- Pydantic Models
- CORS Middleware

## 🧪 Testing & Quality Assurance

### Test Coverage: **181 tests**
- ✅ **Backend**: 168 tests (pytest)
  - 156 unit tests
  - 12 integration tests
  - Coverage: >80%
- ✅ **Frontend**: 13 integration tests (vitest)
  - Real HTTP calls to backend
  - Coverage: >70%

### Running Tests

**Backend Tests:**
```bash
cd backend
pytest tests/ -v                    # All tests
pytest tests/unit/ -v               # Unit tests only
pytest tests/integration/ -v        # Integration tests only
pytest tests/ --cov --cov-report=html  # With coverage report
```

**Frontend Tests:**
```bash
npm test                           # Watch mode
npm run test:integration          # Run once
npm run test:coverage             # With coverage report
npm run test:ui                   # UI interface
```

**CI/CD:**
- Automated tests run on every push/PR via GitHub Actions
- Coverage reports uploaded to Codecov
- Combined coverage reports available as artifacts

📖 **Full testing documentation:** [TESTING.md](TESTING.md)

## 📋 Requisitos del Sistema

### Para Windows:
- Node.js 18+ ([Descargar aquí](https://nodejs.org/))
- Python 3.8+ ([Descargar aquí](https://www.python.org/downloads/))
- Git ([Descargar aquí](https://git-scm.com/download/win))

### Para Linux/Ubuntu:
```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip git
```

## ⚡ INICIO RÁPIDO (Windows)

### 🎯 Opción 1: Script de Inicio Rápido (RECOMENDADO)
```bash
# Ejecutar desde la raíz del proyecto
scripts\quick-start.bat

# Seleccionar opción:
# 1 = Iniciar normalmente
# 2 = Reiniciar limpio (recomendado si hay problemas)
# 3 = Solo verificar estado
```

### 🎯 Opción 2: Comandos Manuales
```bash
# Backend
cd backend
python main.py

# Frontend (nueva terminal)
cd frontend
npm run dev
```

## 🔧 Scripts de Gestión Incluidos

### 📜 Scripts Principales:
- **`quick-start.bat`** - Menú interactivo para todas las opciones
- **`restart-clean.bat`** - Reinicio limpio del sistema completo
- **`kill-services.bat`** - Mata agresivamente todos los servicios
- **`check-ports.bat`** - Verifica estado de puertos y servicios
- **`start-services-persistent.bat`** - Servicios que se reinician automáticamente

### 🚨 Scripts de Solución de Problemas:
- **`fix-requirements.bat`** - Repara dependencias Python
- **`install-windows.bat`** - Instalador completo automático
- **`start-system.bat`** - Iniciador básico

### 💡 Uso de Scripts:

#### Para Problemas de Puertos Ocupados:
```bash
scripts\kill-services.bat
```

#### Para Reiniciar Todo Limpio:
```bash
scripts\restart-clean.bat
```

#### Para Verificar Estado:
```bash
scripts\check-ports.bat
```

#### Para Servicios Permanentes:
```bash
scripts\start-services-persistent.bat
```

## 🔧 Instalación Completa

### 1. Descargar el Proyecto
```bash
# Descargar ZIP del proyecto desde MGX
# Extraer en: C:\Users\TuUsuario\Documents\AEJ_Sistema\
```

### 2. Instalación Automática
```bash
# Ejecutar instalador (como administrador)
scripts\install-windows.bat
```

### 3. Reparar Dependencias (si es necesario)
```bash
scripts\fix-requirements.bat
```

## 👥 Usuarios de Prueba

| Usuario | Contraseña | Rol | Permisos |
|---------|------------|-----|----------|
| `superadmin` | `admin123` | SUPERUSUARIO | Acceso total al sistema |
| `admin` | `admin123` | ADMIN | Gestión completa excepto usuarios |
| `vendedor1` | `vendedor123` | VENDEDOR | POS, clientes básico |
| `almacen1` | `almacen123` | ALMACÉN | Inventario y productos |
| `contador1` | `contador123` | CONTADOR | Reportes y facturación |

## 🌐 URLs del Sistema

Una vez iniciado el sistema:
- **🌐 Frontend (Aplicación)**: http://localhost:5173
- **🖥️ Backend (API)**: http://localhost:8000
- **📚 Documentación API**: http://localhost:8000/docs
- **❤️ Health Check**: http://localhost:8000/health

## 🚨 Solución de Problemas Comunes

### ❌ Error: "Puerto ya en uso"
```bash
# Solución rápida
scripts\kill-services.bat
scripts\restart-clean.bat
```

### ❌ Error: "requirements.txt no encontrado"
```bash
# Reparar dependencias
scripts\fix-requirements.bat
```

### ❌ Error: "sqlite3 no se puede instalar"
```bash
# Normal - sqlite3 viene con Python
# Continuar con la instalación
```

### ❌ Error: "Node.js no encontrado"
```bash
# Instalar Node.js desde: https://nodejs.org/
# Reiniciar terminal después de instalar
```

### ❌ Servicios no inician automáticamente
```bash
# Usar servicios persistentes
scripts\start-services-persistent.bat
```

## 📁 Estructura del Proyecto

```
AEJ_Sistema/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas del sistema
│   │   ├── lib/            # Utilidades y configuración
│   │   └── App.tsx         # Componente principal
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias del frontend
│   └── dist/              # Archivos compilados
├── backend/                # API FastAPI
│   ├── main.py            # Servidor principal
│   ├── requirements.txt   # Dependencias de Python
│   └── .env.example       # Configuración de ejemplo
├── scripts/              # Scripts de gestión
│   ├── quick-start.bat    # Menú principal
│   ├── restart-clean.bat  # Reinicio limpio
│   ├── kill-services.bat  # Matar servicios
│   ├── check-ports.bat    # Verificar estado
│   └── ...               # Otros scripts útiles
└── README.md             # Esta documentación
```

## 🔄 Gestión de Base de Datos

### 📊 Para Datos Reales en Producción:
1. **Backup antes de actualizar**:
   ```bash
   # Copiar carpeta completa antes de actualizar
   copy /E AEJ_Sistema AEJ_Sistema_Backup
   ```

2. **Actualizar solo código**:
   ```bash
   # Subir solo carpetas: frontend/src, backend (excepto .db)
   # Mantener archivos .db existentes
   ```

3. **Migración de datos**:
   ```bash
   # Los datos se mantienen en localStorage (frontend)
   # Para backend real, usar migraciones SQL
   ```

## 🌐 Instalación en Servidor (MEGA Colombia)

### 1. Preparar Servidor Ubuntu
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install nodejs npm python3 python3-pip nginx git -y

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2
```

### 2. Subir y Configurar Proyecto
```bash
# Crear directorio
sudo mkdir -p /var/www/aej-pos
sudo chown $USER:$USER /var/www/aej-pos

# Subir archivos (SCP, FTP, Git)
cd /var/www/aej-pos
# Copiar todos los archivos aquí

# Dar permisos a scripts
chmod +x scripts/*.sh
```

### 3. Instalar Dependencias
```bash
# Ejecutar instalador Linux
./scripts/install-linux.sh
```

### 4. Configurar Nginx
```bash
# Crear configuración
sudo nano /etc/nginx/sites-available/aej-pos

# Contenido del archivo:
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        root /var/www/aej-pos/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/aej-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Iniciar con PM2
```bash
# Backend
cd /var/www/aej-pos/backend
pm2 start main.py --name aej-backend --interpreter python3

# Guardar configuración
pm2 save
pm2 startup
```

## 📞 Soporte Técnico

### 🆘 Comandos de Emergencia:
```bash
# Reiniciar todo agresivamente
scripts\kill-services.bat
scripts\restart-clean.bat

# Verificar estado completo
scripts\check-ports.bat

# Reparar dependencias
scripts\fix-requirements.bat
```

### 📧 Contacto:
- Email: soporte@aejcosmetic.com
- Teléfono: +57 1 234 5678
- WhatsApp: +57 300 123 4567

## 📄 Licencia

© 2024 AEJ Cosmetic & More. Todos los derechos reservados.

---

**⚠️ IMPORTANTE**: 
- Ejecutar scripts como **Administrador** en Windows
- Los servicios pueden mantenerse corriendo permanentemente
- Usar `kill-services.bat` para limpiar procesos zombi
- El sistema detecta automáticamente el estado del backend

**🎯 RECOMENDACIÓN**: Usar `quick-start.bat` para acceso rápido a todas las funciones.