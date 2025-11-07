#!/usr/bin/env python3
"""
Script Python para verificación avanzada de salud del sistema AEJ POS
Realiza verificaciones HTTP detalladas y análisis de rendimiento
"""

import requests
import time
import json
import sys
from datetime import datetime

def check_backend_health():
    """Verificar salud del backend con detalles"""
    backend_url = "http://localhost:8000"
    
    print("🔍 Verificando Backend...")
    
    try:
        # Health check endpoint
        start_time = time.time()
        response = requests.get(f"{backend_url}/health", timeout=5)
        response_time = round((time.time() - start_time) * 1000, 2)
        
        if response.status_code == 200:
            data = response.json()
            print(f"    ✅ Backend SALUDABLE")
            print(f"    ⏱️ Tiempo de respuesta: {response_time}ms")
            print(f"    📊 Estado: {data.get('status', 'N/A')}")
            print(f"    🕐 Timestamp: {data.get('timestamp', 'N/A')}")
            print(f"    🏷️ Versión: {data.get('version', 'N/A')}")
            return True, response_time, data
        else:
            print(f"    ⚠️ Backend responde con código: {response.status_code}")
            return False, response_time, None
            
    except requests.exceptions.ConnectionError:
        print(f"    ❌ Backend NO RESPONDE - Conexión rechazada")
        return False, 0, None
    except requests.exceptions.Timeout:
        print(f"    ⏰ Backend TIMEOUT - Respuesta muy lenta")
        return False, 0, None
    except Exception as e:
        print(f"    💥 Error inesperado: {str(e)}")
        return False, 0, None

def check_frontend_health():
    """Verificar salud del frontend"""
    frontend_urls = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    print("\n🔍 Verificando Frontend...")
    
    for url in frontend_urls:
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            response_time = round((time.time() - start_time) * 1000, 2)
            
            if response.status_code == 200:
                print(f"    ✅ Frontend ACTIVO en {url}")
                print(f"    ⏱️ Tiempo de respuesta: {response_time}ms")
                print(f"    📄 Tamaño de respuesta: {len(response.content)} bytes")
                
                # Verificar si es una aplicación React/Vite
                if "vite" in response.text.lower() or "react" in response.text.lower():
                    print(f"    ⚛️ Aplicación React/Vite detectada")
                
                return True, response_time, url
                
        except requests.exceptions.ConnectionError:
            print(f"    ❌ Frontend en {url} NO RESPONDE")
        except requests.exceptions.Timeout:
            print(f"    ⏰ Frontend en {url} TIMEOUT")
        except Exception as e:
            print(f"    💥 Error en {url}: {str(e)}")
    
    return False, 0, None

def check_api_endpoints():
    """Verificar endpoints específicos de la API"""
    endpoints = [
        "/",
        "/api/status", 
        "/docs",
        "/health"
    ]
    
    print("\n🔍 Verificando Endpoints de API...")
    
    working_endpoints = []
    
    for endpoint in endpoints:
        url = f"http://localhost:8000{endpoint}"
        try:
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                print(f"    ✅ {endpoint} - OK")
                working_endpoints.append(endpoint)
            else:
                print(f"    ⚠️ {endpoint} - HTTP {response.status_code}")
        except:
            print(f"    ❌ {endpoint} - No responde")
    
    return working_endpoints

def generate_report():
    """Generar reporte completo de salud"""
    print("=" * 50)
    print("    REPORTE DE SALUD AEJ POS")
    print("=" * 50)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Verificar Backend
    backend_ok, backend_time, backend_data = check_backend_health()
    
    # Verificar Frontend  
    frontend_ok, frontend_time, frontend_url = check_frontend_health()
    
    # Verificar API endpoints si backend está activo
    working_endpoints = []
    if backend_ok:
        working_endpoints = check_api_endpoints()
    
    # Resumen final
    print("\n" + "=" * 50)
    print("    RESUMEN EJECUTIVO")
    print("=" * 50)
    
    if backend_ok and frontend_ok:
        print("🎉 SISTEMA COMPLETAMENTE OPERATIVO")
        print(f"✅ Backend: Activo ({backend_time}ms)")
        print(f"✅ Frontend: Activo en {frontend_url} ({frontend_time}ms)")
        print(f"📊 Endpoints funcionando: {len(working_endpoints)}/4")
        
        print("\n🔗 URLs de acceso:")
        print(f"   🌐 Aplicación: {frontend_url}")
        print(f"   📡 API: http://localhost:8000")
        print(f"   📚 Documentación: http://localhost:8000/docs")
        
    elif backend_ok and not frontend_ok:
        print("⚠️ BACKEND ACTIVO - FRONTEND INACTIVO")
        print(f"✅ Backend: Activo ({backend_time}ms)")
        print("❌ Frontend: No responde")
        print("💡 Acción: Iniciar frontend con 'npm run dev'")
        
    elif not backend_ok and frontend_ok:
        print("⚠️ FRONTEND ACTIVO - BACKEND INACTIVO") 
        print("❌ Backend: No responde")
        print(f"✅ Frontend: Activo en {frontend_url} ({frontend_time}ms)")
        print("💡 Acción: Iniciar backend con 'python main.py'")
        
    else:
        print("🔴 SISTEMA COMPLETAMENTE INACTIVO")
        print("❌ Backend: No responde")
        print("❌ Frontend: No responde")
        print("💡 Acción: Ejecutar 'scripts\\restart-clean.bat'")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    try:
        generate_report()
    except KeyboardInterrupt:
        print("\n\n⚠️ Verificación cancelada por el usuario")
    except Exception as e:
        print(f"\n💥 Error inesperado: {str(e)}")
    
    print("\nPresiona Enter para continuar...")
    input()