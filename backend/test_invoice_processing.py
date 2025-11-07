"""
Test script for invoice processing functionality
"""
import asyncio
import json
from database import SessionLocal
from models import User
from invoice_processor import InvoiceProcessor

async def test_invoice_processing():
    """Test the invoice processing workflow"""
    
    # Load invoice data
    with open('../extracted_invoice_data.json', 'r', encoding='utf-8') as f:
        invoice_data = json.load(f)
    
    print('=' * 60)
    print('🧪 Testing Invoice Processing System')
    print('=' * 60)
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Get a test user (admin or superuser)
        user = db.query(User).filter(User.username == 'admin').first()
        if not user:
            user = db.query(User).first()
        
        print(f'\n👤 Processing as user: {user.username} ({user.rol})')
        
        # Create processor
        processor = InvoiceProcessor(db, user)
        
        print('\n📋 Invoice Details:')
        print(f'   Supplier: {invoice_data["proveedor"]["razon_social"]}')
        print(f'   NIT: {invoice_data["proveedor"]["nit"]}')
        print(f'   Invoice #: {invoice_data["factura"]["numero"]}')
        print(f'   Date: {invoice_data["factura"]["fecha"]}')
        print(f'   Products: {len(invoice_data["productos"])}')
        print(f'   Subtotal: ${invoice_data["totales"]["subtotal"]:,.0f}')
        print(f'   IVA: ${invoice_data["totales"]["iva"]:,.0f}')
        print(f'   Total: ${invoice_data["totales"]["total"]:,.0f}')
        
        print('\n⚙️ Processing invoice...')
        
        # Process invoice
        purchase_invoice = await processor.process_invoice(invoice_data, None)
        
        print('\n✅ Invoice processed successfully!')
        print(f'   Invoice ID: {purchase_invoice.id}')
        print(f'   Status: {purchase_invoice.status}')
        print(f'   Supplier ID: {purchase_invoice.supplier_id}')
        print(f'   Items created: {len(purchase_invoice.items)}')
        
        print('\n📦 Products created/updated:')
        for item in purchase_invoice.items:
            print(f'   - {item.product.nombre} (x{item.cantidad}) - ${item.subtotal:,.0f}')
            print(f'     Stock: {item.product.stock_actual} units')
        
        print('\n' + '=' * 60)
        print('🎉 Test completed successfully!')
        print('=' * 60)
        
    except Exception as e:
        print(f'\n❌ Error during test: {e}')
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    asyncio.run(test_invoice_processing())