#!/usr/bin/env python3
"""
Script de verificación de salud avanzada para AEJ POS
Verifica la salud HTTP de backend y frontend
"""

import requests
import time
import sys
import json
from datetime import datetime

def check_backend_health():
    """Verifica la salud del backend"""
    try:
        start_time = time.time()
        response = requests.get('http://localhost:8000/health', timeout=5)
        response_time = int((time.time() - start_time) * 1000)
        
        if response.status_code == 200:
            try:
                data = response.json()
                return {
                    'status': 'healthy',
                    'response_time': response_time,
                    'data': data,
                    'message': f'✅ SALUDABLE ({response_time}ms)'
                }
            except:
                return {
                    'status': 'responding',
                    'response_time': response_time,
                    'message': f'⚠️ RESPONDE SIN JSON ({response_time}ms)'
                }
        else:
            return {
                'status': 'error',
                'response_time': response_time,
                'message': f'❌ ERROR HTTP {response.status_code} ({response_time}ms)'
            }
    except requests.exceptions.ConnectRefused:
        return {
            'status': 'refused',
            'message': '❌ CONEXIÓN RECHAZADA (Puerto cerrado)'
        }
    except requests.exceptions.Timeout:
        return {
            'status': 'timeout',
            'message': '⏱️ TIMEOUT (Servicio lento o zombi)'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'❌ ERROR: {str(e)}'
        }

def check_frontend_health():
    """Verifica la salud del frontend"""
    ports = [5173, 3000]
    
    for port in ports:
        try:
            start_time = time.time()
            response = requests.get(f'http://localhost:{port}', timeout=3)
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                return {
                    'status': 'healthy',
                    'port': port,
                    'response_time': response_time,
                    'message': f'✅ ACTIVO en puerto {port} ({response_time}ms)'
                }
        except:
            continue
    
    return {
        'status': 'inactive',
        'message': '❌ FRONTEND NO RESPONDE en puertos 5173/3000'
    }

def check_api_endpoints():
    """Verifica endpoints específicos de la API"""
    endpoints = [
        '/health',
        '/docs',
        '/api/v1/auth/status'
    ]
    
    results = {}
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f'http://localhost:8000{endpoint}', timeout=3)
            response_time = int((time.time() - start_time) * 1000)
            
            results[endpoint] = {
                'status_code': response.status_code,
                'response_time': response_time,
                'healthy': response.status_code in [200, 404]  # 404 is OK for some endpoints
            }
        except Exception as e:
            results[endpoint] = {
                'error': str(e),
                'healthy': False
            }
    
    return results

def main():
    print("=" * 50)
    print("   VERIFICACIÓN DE SALUD AVANZADA AEJ POS")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Verificar Backend
    print("🔍 VERIFICANDO BACKEND...")
    backend_health = check_backend_health()
    print(f"Estado: {backend_health['message']}")
    
    if backend_health['status'] == 'healthy':
        print("📊 VERIFICANDO ENDPOINTS...")
        endpoints = check_api_endpoints()
        for endpoint, result in endpoints.items():
            if 'error' in result:
                print(f"  {endpoint}: ❌ ERROR")
            else:
                status_icon = "✅" if result['healthy'] else "❌"
                print(f"  {endpoint}: {status_icon} HTTP {result['status_code']} ({result['response_time']}ms)")
    
    print()
    
    # Verificar Frontend
    print("🔍 VERIFICANDO FRONTEND...")
    frontend_health = check_frontend_health()
    print(f"Estado: {frontend_health['message']}")
    
    print()
    
    # Resumen
    print("=" * 50)
    print("   RESUMEN DE SALUD")
    print("=" * 50)
    
    backend_ok = backend_health['status'] in ['healthy', 'responding']
    frontend_ok = frontend_health['status'] == 'healthy'
    
    if backend_ok and frontend_ok:
        print("🎉 SISTEMA COMPLETAMENTE SALUDABLE")
        print(f"   Backend: http://localhost:8000 ✅")
        if 'port' in frontend_health:
            print(f"   Frontend: http://localhost:{frontend_health['port']} ✅")
    elif backend_ok:
        print("⚠️ BACKEND OK, FRONTEND CON PROBLEMAS")
        print("   Sugerencia: npm run dev")
    elif frontend_ok:
        print("⚠️ FRONTEND OK, BACKEND CON PROBLEMAS")
        print("   Sugerencia: python main.py")
    else:
        print("🚨 AMBOS SERVICIOS CON PROBLEMAS")
        print("   Sugerencia: restart-clean.bat")
    
    print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Verificación interrumpida por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")