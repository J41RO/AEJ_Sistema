from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
import sqlite3
import os

app = FastAPI(
    title="AEJ POS Backend",
    description="Backend API para Sistema POS AEJ Cosmetic & More",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de salud para verificar estado del backend
@app.get("/health")
async def health_check():
    """Endpoint para verificar el estado del backend"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AEJ POS Backend",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "AEJ POS Backend API",
        "status": "running",
        "docs": "/docs"
    }

# Endpoints de ejemplo para futuras integraciones
@app.get("/api/status")
async def api_status():
    """Estado de la API"""
    return {
        "api_status": "online",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/products")
async def get_products():
    """Obtener productos (ejemplo)"""
    return {
        "products": [],
        "message": "Endpoint preparado para integración futura"
    }

@app.get("/api/sales")
async def get_sales():
    """Obtener ventas (ejemplo)"""
    return {
        "sales": [],
        "message": "Endpoint preparado para integración futura"
    }

if __name__ == "__main__":
    print("🚀 Iniciando AEJ POS Backend...")
    print("📡 Backend disponible en: http://localhost:8000")
    print("📚 Documentación API en: http://localhost:8000/docs")
    print("❤️ Health check en: http://localhost:8000/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )