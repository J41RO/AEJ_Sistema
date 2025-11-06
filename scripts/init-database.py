#!/usr/bin/env python3
"""
Script to initialize the AEJ POS database with tables and seed data
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.seed import seed_database

if __name__ == "__main__":
    print("🚀 Initializing AEJ POS Database...")
    print("=" * 50)
    
    try:
        seed_database()
        print("\n✅ Database initialized successfully!")
        print("\n👥 Default users created:")
        print("   - superadmin / admin123 (SUPERUSUARIO)")
        print("   - admin / admin123 (ADMIN)")
        print("   - vendedor1 / vendedor123 (VENDEDOR)")
        print("   - almacen1 / almacen123 (ALMACÉN)")
        print("   - contador1 / contador123 (CONTADOR)")
        print("\n🎯 You can now start the backend and login with any of these users.")
        
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
        sys.exit(1)